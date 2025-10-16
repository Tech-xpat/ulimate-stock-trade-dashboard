import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

export interface UserProfile {
  uid: string
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  currency: string
  country: string
  balance: number
  createdAt: string
  emailVerified: boolean
}

export interface Transaction {
  id: string
  type: "deposit" | "withdraw" | "buy" | "sell"
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  timestamp: string
  description: string
}

// Create user profile in Firestore
export async function createUserProfile(
  user: User,
  profileData: Omit<UserProfile, "uid" | "createdAt" | "emailVerified">,
) {
  const userProfile: UserProfile = {
    uid: user.uid,
    ...profileData,
    balance: 0, // Default balance is $0
    createdAt: new Date().toISOString(),
    emailVerified: user.emailVerified,
  }

  await setDoc(doc(db, "users", user.uid), userProfile)
  return userProfile
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile
  }
  return null
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  profileData: Omit<UserProfile, "uid" | "email" | "balance" | "createdAt" | "emailVerified">,
) {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Send email verification
    await sendEmailVerification(user)

    // Create user profile in Firestore
    const userProfile = await createUserProfile(user, {
      ...profileData,
      email,
    })

    return { success: true, user, userProfile, message: "Account created! Please verify your email before logging in." }
  } catch (error: any) {
    console.error("[v0] Sign up error:", error)
    return { success: false, error: error.message }
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Check if email is verified
    if (!user.emailVerified) {
      await signOut(auth)
      return {
        success: false,
        error: "Please verify your email before logging in. Check your inbox for the verification link.",
      }
    }

    // Get user profile
    const userProfile = await getUserProfile(user.uid)

    if (!userProfile) {
      return { success: false, error: "User profile not found" }
    }

    return { success: true, user, userProfile }
  } catch (error: any) {
    console.error("[v0] Sign in error:", error)
    let errorMessage = "Invalid email or password"
    if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email"
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password"
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Too many failed attempts. Please try again later"
    }
    return { success: false, error: errorMessage }
  }
}

// Sign out
export async function signOutUser() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Sign out error:", error)
    return { success: false, error: error.message }
  }
}

// Update user balance
export async function updateUserBalance(uid: string, newBalance: number) {
  try {
    await setDoc(doc(db, "users", uid), { balance: newBalance }, { merge: true })
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Update balance error:", error)
    return { success: false, error: error.message }
  }
}

// Add transaction
export async function addTransaction(uid: string, transaction: Omit<Transaction, "id">) {
  try {
    const transactionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const transactionData: Transaction = {
      id: transactionId,
      ...transaction,
    }

    await setDoc(doc(db, "users", uid, "transactions", transactionId), transactionData)
    return { success: true, transaction: transactionData }
  } catch (error: any) {
    console.error("[v0] Add transaction error:", error)
    return { success: false, error: error.message }
  }
}

// Get user transactions
export async function getUserTransactions(uid: string): Promise<Transaction[]> {
  try {
    const { collection, query, orderBy, getDocs } = await import("firebase/firestore")
    const transactionsRef = collection(db, "users", uid, "transactions")
    const q = query(transactionsRef, orderBy("timestamp", "desc"))
    const querySnapshot = await getDocs(q)

    const transactions: Transaction[] = []
    querySnapshot.forEach((doc) => {
      transactions.push(doc.data() as Transaction)
    })

    return transactions
  } catch (error) {
    console.error("[v0] Get transactions error:", error)
    return []
  }
}
