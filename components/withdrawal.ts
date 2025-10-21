import type { NextApiRequest, NextApiResponse } from "next"
import admin from "firebase-admin"
import fs from "fs"
import path from "path"

const tryInitAdmin = () => {
  if (admin.apps.length) return

  // Prefer explicit JSON file in project root if present
  const candidate = path.join(process.cwd(), "ultimatestcktrader-firebase-adminsdk-fbsvc-4ffb9b0ffb.json")
  let serviceAccount: any = undefined

  if (fs.existsSync(candidate)) {
    serviceAccount = JSON.parse(fs.readFileSync(candidate, "utf8"))
  } else if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON)
    } catch (err) {
      console.error("Invalid FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON")
    }
  } else if (process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    serviceAccount = {
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      private_key: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }
  }

  if (!serviceAccount) {
    console.error("No Firebase admin service account configured. Set file in project root or FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON env.")
    return
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

tryInitAdmin()
const db = admin.firestore()
const auth = admin.auth()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" })

  const { userId, username, amount, payoutMethod, walletAddress, bankDetails, autoApprove } = req.body

  // Verify bearer token
  const authHeader = (req.headers.authorization || "") as string
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]
  let decoded: admin.auth.DecodedIdToken
  try {
    decoded = await auth.verifyIdToken(token)
  } catch (err) {
    console.error("verifyIdToken failed:", err)
    return res.status(401).json({ success: false, message: "Invalid token" })
  }

  if (decoded.uid !== userId) {
    return res.status(403).json({ success: false, message: "User mismatch" })
  }

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount" })
  }

  const userRef = db.collection("users").doc(userId)
  const withdrawalsRef = db.collection("withdrawals")

  try {
    let approved = false

    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef)
      if (!userSnap.exists) throw new Error("User not found")
      const userData = userSnap.data() || {}
      const balance = Number(userData.balance || 0)

      if (autoApprove && balance >= amount) {
        const newBalance = +(balance - amount)
        tx.update(userRef, { balance: newBalance })
        const docRef = withdrawalsRef.doc()
        tx.set(docRef, {
          userId,
          username,
          amount,
          payoutMethod,
          walletAddress: walletAddress || null,
          bankDetails: bankDetails || null,
          status: "approved",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        approved = true
      } else {
        const docRef = withdrawalsRef.doc()
        tx.set(docRef, {
          userId,
          username,
          amount,
          payoutMethod,
          walletAddress: walletAddress || null,
          bankDetails: bankDetails || null,
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        approved = false
      }
    })

    return res.status(200).json({ success: true, approved })
  } catch (err: any) {
    console.error("withdrawals api error:", err)
    return res.status(500).json({ success: false, message: err.message || "Server error" })
  }
}
