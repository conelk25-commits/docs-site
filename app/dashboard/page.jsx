'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [docs, setDocs] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
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
      .insert([{ title: newTitle, slug, position, user_id: user.id, content: '' }])
      .select()

    if (!error && data) {
      setDocs([...docs, data[0]])
      setNewTitle('')
    }
  }

  const handleSaveContent = async (id) => {
    const { error } = await supabase
      .from('documents')
      .update({ content: editContent })
      .eq('id', id)

    if (!error) {
      setDocs(docs.map(doc => doc.id === id ? { ...doc, content: editContent } : doc))
      setEditingId(null)
    }
  }

  const handleDeleteDoc = async (id) => {
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (!error) {
      setDocs(docs.filter(doc => doc.id !== id))
    }
  }

  const handleDragStart = (index) => setDraggedIndex(index)
  const handleDragOver = (e) => e.preventDefault()
  
  const handleDrop = async (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return
    const updatedDocs = [...docs]
    const [draggedItem] = updatedDocs.splice(draggedIndex, 1)
    updatedDocs.splice(dropIndex, 0, draggedItem)

    const reordered = updatedDocs.map((doc, idx) => ({ ...doc, position: idx }))
    setDocs(reordered)
    setDraggedIndex(null)

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

      <form onSubmit={handleCreateDoc} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="New document title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg">
          Add Doc
        </button>
      </form>

      <div className="space-y-4">
        {docs.map((doc, index) => (
          <div
            key={doc.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-mono text-sm cursor-move">⣿</span>
                <Link 
                  href={`/docs/${doc.slug}`}
                  className="text-white font-medium hover:text-indigo-400 flex items-center gap-2"
                >
                  {doc.title}
                  <span className="text-xs text-slate-500">↗</span>
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingId(editingId === doc.id ? null : doc.id)
                    setEditContent(doc.content || '')
                  }}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded border border-slate-700"
                >
                  {editingId === doc.id ? 'Cancel' : 'Edit Content'}
                </button>
                <button
                  onClick={() => handleDeleteDoc(doc.id)}
                  className="text-slate-500 hover:text-red-400 p-1 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Editing Panel */}
            {editingId === doc.id && (
              <div className="mt-2 flex flex-col gap-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write document content..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleSaveContent(doc.id)}
                  className="self-end bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
