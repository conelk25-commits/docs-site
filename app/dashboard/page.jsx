'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [docs, setDocs] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isDark, setIsDark] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
      } else {
        setUser(session.user)
        fetchDocs(session.user.id)
      }
    }
    loadData()
  }, [router, supabase])

  const fetchDocs = async (userId) => {
    const { data } = await supabase
      .from('docs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setDocs(data)
  }

  const handleCreateDoc = async (e) => {
    e.preventDefault()
    if (!title || !content) return
    setLoading(true)

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const { error } = await supabase.from('docs').insert([
      {
        user_id: user.id,
        title,
        slug,
        content
      }
    ])

    if (!error) {
      setTitle('')
      setContent('')
      fetchDocs(user.id)
    }
    setLoading(false)
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (!user) return <div className="p-10 text-center text-slate-500">Loading workspace...</div>

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur sticky top-0 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-lg">Docs Workspace</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold"
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button 
            onClick={handleSignOut}
            className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Document Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-4">New Document</h2>
          <form onSubmit={handleCreateDoc} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Getting Started"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Content (Markdown)</label>
              <textarea 
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your doc content here..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-sm"
            >
              {loading ? 'Publishing...' : 'Publish Document'}
            </button>
          </form>
        </div>

        {/* Existing Documents List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Your Published Docs ({docs.length})</h2>
          {docs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-slate-500">
              No documents created yet. Use the form to publish your first doc!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {docs.map((doc) => (
                <div key={doc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
                  <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{doc.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">Slug: /{doc.slug}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{doc.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
