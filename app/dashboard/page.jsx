'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [docs, setDocs] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [draggedIndex, setDraggedIndex] = useState(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      setUser(session.user)
      fetchDocs(session.user.id)
    }
    init()
  }, [router, supabase])

  const fetchDocs = async (userId) => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true })
    if (data) setDocs(data)
  }

  const handleCreateDoc = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    const position = docs.length

    const { data, error } = await supabase
      .from('documents')
      .insert([{ title: newTitle, slug, position, user_id: user.id }])
      .select()

    if (!error && data) {
      setDocs([...docs, data[0]])
      setNewTitle('')
    }
  }

  const handleDeleteDoc = async (id) => {
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (!error) {
      setDocs(docs.filter(doc => doc.id !== id))
    }
  }

  // Drag and drop handlers
  const handleDragStart = (index) => setDraggedIndex(index)

  const handleDragOver = (e) => e.preventDefault()

  const handleDrop = async (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const updatedDocs = [...docs]
    const [draggedItem] = updatedDocs.splice(draggedIndex, 1)
    updatedDocs.splice(dropIndex, 0, draggedItem)

    // Update local positions
    const reordered = updatedDocs.map((doc, idx) => ({ ...doc, position: idx }))
    setDocs(reordered)
    setDraggedIndex(null)

    // Sync positions to Supabase
    for (const item of reordered) {
      await supabase.from('documents').update({ position: item.position }).eq('id', item.id)
    }
  }

  if (!user) return <div className="p-8 text-center text-slate-400">Loading workspace...</div>

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Document Manager</h1>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/auth') }}
          className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-sm font-medium border border-slate-700"
        >
          Sign Out
        </button>
      </div>

      {/* Create New Doc Form */}
      <form onSubmit={handleCreateDoc} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="New document title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg">
          Add Doc
        </button>
      </form>

      {/* Drag & Drop List */}
      <div className="space-y-3">
        {docs.map((doc, index) => (
          <div
            key={doc.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl cursor-move hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-mono text-sm">⣿</span>
              <Link 
                href={`/docs/${doc.slug}`}
                className="text-white font-medium hover:text-indigo-400 flex items-center gap-2 group"
              >
                {doc.title}
                <span className="text-xs text-slate-500 group-hover:text-indigo-400">↗</span>
              </Link>
            </div>
            
            <button
              onClick={() => handleDeleteDoc(doc.id)}
              className="text-slate-500 hover:text-red-400 p-1 text-sm transition-colors"
              title="Delete Document"
            >
              ✕
            </button>
          </div>
        ))}
        {docs.length === 0 && (
          <p className="text-center text-slate-500 py-8">No documents created yet.</p>
        )}
      </div>
    </main>
  )
}
