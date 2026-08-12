'use client'

import { useState, useEffect } from 'react'

export type Variant = 'a' | 'b' | 'c' | 'd'

const STORAGE_KEY = 'auth_variant'

export function getLoginUrl(variant: Variant, returnTo = '/dashboard'): string {
  if (variant === 'd') return '/login/native'
  const base = variant === 'a' ? '/api/auth' : `/api/auth-${variant}`
  return `${base}/login?returnTo=${encodeURIComponent(returnTo)}`
}

export function useAuthVariant() {
  const [variant, setVariantState] = useState<Variant>('a')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Variant | null
    if (stored === 'a' || stored === 'b' || stored === 'c' || stored === 'd') {
      setVariantState(stored)
    }
  }, [])

  const setVariant = (v: Variant) => {
    localStorage.setItem(STORAGE_KEY, v)
    setVariantState(v)
  }

  return { variant, setVariant }
}
