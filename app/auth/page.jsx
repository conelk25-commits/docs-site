'use client'

import { useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-slate-900 rounded-xl shadow-lg text-white">
      <h2 className="text-2xl font-bold text-center mb-6">Docs Platform</h2>
      
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        providers={['github', 'google']}
        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`}
      />
    </div>
  )
}
