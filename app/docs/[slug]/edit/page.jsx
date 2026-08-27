'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FullPageEditor({ params }) {
  const { slug } = use(params)
  const [doc, setDoc] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [fontStyle, setFontStyle] = useState('font-sans')
  const [animation, setAnimation] = useState('animate-fade-in')
  const [draggedBlockIndex, setDraggedBlockIndex] = useState(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadDoc() {
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('slug', slug)
        .single()

      if (data) {
        setDoc(data)
        // Parse content blocks or default to a single card block
        try {
          const parsed = JSON.parse(data.content)
          setBlocks(Array.isArray(parsed) ? parsed : [{ id: '1', type: 'card', text: data.content }])
        } catch {
          setBlocks([{ id: '1', type: 'card', text: data.content || '' }])
        }
      }
    }
    loadDoc()
  }, [slug, supabase])

  const addCardBlock = () => {
    setBlocks([...blocks, { id: Date.now().toString(), type: 'card', text: '' }])
  }

  const addPageBreak = () => {
    setBlocks([...blocks, { id: Date.now().toString(), type: 'break' }])
  }

  const updateBlockText = (id, text) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, text } : b))
  }

  const deleteBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id))
  }

  // Drag and drop block reordering
  const handleDragStart = (index) => setDraggedBlockIndex(index)
  const handleDragOver = (e) => e.preventDefault()
  const handleDrop = (dropIndex) => {
    if (draggedBlockIndex === null || draggedBlockIndex === dropIndex) return
    const updated = [...blocks]
    const [moved] = updated.splice(draggedBlockIndex, 1)
    updated.splice(dropIndex, 0, moved)
    setBlocks(updated)
    setDraggedBlockIndex(null)
  }

  const handleSave = async () => {
    await supabase
      .from('documents')
      .update({ content: JSON.stringify(blocks) })
      .eq('id', doc.id)
    router.push(`/docs/${slug}`)
  }

  if (!doc) return <div className="p-8 text-center text-slate-400">Loading editor...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Editor Toolbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 p-4 sticky top-0 z-20 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">← Dashboard</Link>
          <h1 className="font-semibold text-white">{doc.title}</h1>
        </div>

        {/* Styling Controls */}
        <div className="flex items-center gap-3">
          <select 
            value={fontStyle} 
            onChange={(e) => setFontStyle(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200"
          >
            <option value="font-sans">Sans-Serif</option>
            <option value="font-serif">Serif</option>
            <option value="font-mono">Monospace</option>
          </select>

          <select 
            value={animation} 
            onChange={(e) => setAnimation(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200"
          >
            <option value="transition-all duration-300">Fade In</option>
            <option value="transition-transform duration-500 hover:scale-[1.01]">Hover Zoom</option>
          </select>

          <button onClick={addCardBlock} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1 rounded border border-slate-700">
            + Add Card
          </button>
          <button onClick={addPageBreak} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1 rounded border border-slate-700">
            + Page Break
          </button>
          <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-xs font-medium px-4 py-1 rounded">
            Save Document
          </button>
        </div>
      </header>

      {/* Editor Canvas */}
      <main className={`flex-1 max-w-3xl w-full mx-auto p-8 space-y-6 ${fontStyle}`}>
        {blocks.map((block, index) => (
          <div
            key={block.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className={`relative group ${animation}`}
          >
            {block.type === 'card' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <div className="flex justify-between items-center mb-2 text-slate-500 text-xs">
                  <span className="cursor-move">⣿ Drag Card</span>
                  <button onClick={() => deleteBlock(block.id)} className="hover:text-red-400">Delete</button>
                </div>
                <textarea
                  value={block.text}
                  onChange={(e) => updateBlockText(block.id, e.target.value)}
                  placeholder="Enter block content..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <div className="my-8 flex items-center justify-between border-b-2 border-dashed border-indigo-500/40 py-2">
                <span className="text-xs font-mono text-indigo-400">--- PAGE BREAK ---</span>
                <button onClick={() => deleteBlock(block.id)} className="text-xs text-slate-500 hover:text-red-400">Remove</button>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}
