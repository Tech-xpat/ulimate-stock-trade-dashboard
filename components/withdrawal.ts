import type { NextApiRequest, NextApiResponse } from "next"
import admin from "firebase-admin"

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    } as any),
  })
}
const db = admin.firestore()
const auth = admin.auth()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" })

  const { userId, username, amount, payoutMethod, walletAddress, bankDetails, autoApprove } = req.body
  // verify Authorization bearer token
  const authHeader = (req.headers.authorization || "") as string
  let uidFromToken: string | null = null
  try {
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]
      const decoded = await auth.verifyIdToken(token)
      uidFromToken = decoded.uid
    }
  } catch (err) {
    // invalid token -> reject
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  if (!uidFromToken || uidFromToken !== userId) {
    return res.status(403).json({ success: false, message: "User mismatch or unauthorized" })
  }

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount" })
  }

  const userRef = db.collection("users").doc(userId)
  const withdrawalsRef = db.collection("withdrawals")

  try {
    let approved = false
    let withdrawalDoc: admin.firestore.DocumentReference

    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef)
      if (!userSnap.exists) throw new Error("User not found")
      const userData = userSnap.data() || {}
      const balance = Number(userData.balance || 0)

      if (autoApprove && balance >= amount) {
        // deduct balance and create approved withdrawal
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
        withdrawalDoc = docRef
      } else {
        // create pending withdrawal (admin will approve later)
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
        withdrawalDoc = docRef
      }
    })

    return res.status(200).json({ success: true, approved })
  } catch (err: any) {
    console.error("withdrawals api error:", err)
    return res.status(500).json({ success: false, message: err.message || "Server error" })
  }
}
