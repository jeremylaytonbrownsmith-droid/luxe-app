// Lightweight auth for DEMO MODE: pick a role and you're in.
// To go live, replace login()/logout() with Firebase Auth (signInWithEmailAndPassword,
// onAuthStateChanged) and map the auth user to a User record in Firestore.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Role, User } from './types'

const DEMO_USERS: Record<Role, User> = {
  owner: {
    id: 'owner-1',
    name: 'Margaret Ellison',
    email: 'owner@demo.com',
    role: 'owner',
    propertyId: 'prop-1',
  },
  pro: { id: 'pro-1', name: 'Local Luxe Team', email: 'team@demo.com', role: 'pro' },
}

const SESSION_KEY = 'luxe.session'

interface AuthCtx {
  user: User | null
  loginAs: (role: Role) => void
  logout: () => void
}

const Ctx = createContext<AuthCtx>({ user: null, loginAs: () => {}, logout: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) setUser(JSON.parse(raw) as User)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loginAs: (role) => {
        const u = DEMO_USERS[role]
        localStorage.setItem(SESSION_KEY, JSON.stringify(u))
        setUser(u)
      },
      logout: () => {
        localStorage.removeItem(SESSION_KEY)
        setUser(null)
      },
    }),
    [user]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
