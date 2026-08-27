'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
      } else {
        setUser(session.user)
      }
    }
    checkUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading workspace...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-lg tracking-tight text-white">Docs Platform</span>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-medium">Pro</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-400 hidden sm:inline">{user.email}</span>
          <button 
            onClick={handleSignOut}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 lg:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Overview</h1>
          <p className="text-slate-400 mt-1">Manage your documentation projects and team spaces.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Projects</h3>
            <p className="text-3xl font-bold text-white mt-2">0</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Documents</h3>
            <p className="text-3xl font-bold text-white mt-2">0</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Workspace Status</h3>
            <p className="text-sm font-semibold text-emerald-400 mt-3 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-2 animate-pulse"></span>
              Operational
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
