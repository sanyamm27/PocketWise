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
  const [user,        setUser]        = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading,     setLoading]     = useState(true)

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
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })
      await createUserProfile(result.user, name)
      return result.user
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') throw new Error('Account already exists. Please login.')
      if (error.code === 'auth/weak-password')        throw new Error('Password must be at least 6 characters.')
      if (error.code === 'auth/invalid-email')        throw new Error('Invalid email address.')
      throw new Error(error.message)
    }
  }

  // ── Email Login ─────────────────────────────────────────────────────────────
  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error) {
      if (error.code === 'auth/user-not-found')     throw new Error('No account found with this email.')
      if (error.code === 'auth/wrong-password')     throw new Error('Incorrect password.')
      if (error.code === 'auth/invalid-email')      throw new Error('Invalid email address.')
      if (error.code === 'auth/invalid-credential') throw new Error('Invalid email or password.')
      if (error.code === 'auth/too-many-requests')  throw new Error('Too many attempts. Please wait a moment.')
      throw new Error(error.message)
    }
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

  // ── Auth State Listener ──────────────────────────────────────────────────────────
  // Fetches fresh Firestore profile on every login; clears on logout.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Always fetch fresh from Firestore so every user sees their own data
        const ref  = doc(db, 'users', firebaseUser.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setUserProfile(snap.data())
        } else {
          // First-time user — create profile document
          const newProfile = {
            uid:           firebaseUser.uid,
            name:          firebaseUser.displayName || '',
            email:         firebaseUser.email,
            college:       '',
            monthlyBudget: 5000,
            createdAt:     new Date().toISOString(),
          }
          await setDoc(ref, newProfile)
          setUserProfile(newProfile)
        }
      } else {
        // Logged out — clear both user and profile so next user starts fresh
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const value = {
    user,
    userProfile,
    setUserProfile,
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
