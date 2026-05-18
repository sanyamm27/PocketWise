/**
 * AuthContext.jsx — PocketWise
 * Firebase Authentication context: Google, Email/Password, and Firestore profile creation.
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { auth, googleProvider, db } from '../firebase'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Check if user profile is complete (has college set) ───────────────────
  const checkUserExists = async (uid) => {
    const ref  = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    return snap.exists() && snap.data().college !== ''
  }

  // ── Google Login ────────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    const result   = await signInWithPopup(auth, googleProvider)
    const isExisting = await checkUserExists(result.user.uid)
    await createUserProfile(result.user)   // idempotent — no-op if already exists
    return { user: result.user, isExisting }
  }

  // ── Email Signup ────────────────────────────────────────────────────────────
  const signupWithEmail = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: name })
    await createUserProfile(result.user, name)
    return result.user
  }

  // ── Email Login ─────────────────────────────────────────────────────────────
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth)
  }

  // ── Create User Profile in Firestore ────────────────────────────────────────
  // Only writes if the document doesn't already exist (idempotent).
  const createUserProfile = async (user, name) => {
    const ref  = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:           user.uid,
        name:          name || user.displayName,
        email:         user.email,
        college:       '',
        monthlyBudget: 5000,
        createdAt:     new Date().toISOString(),
      })
    }
  }

  // ── Auth State Listener ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsub
  }, [])

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    checkUserExists,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
