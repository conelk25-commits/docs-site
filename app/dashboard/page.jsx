'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectName, setProjectName] = useState('')
  const [projectSlug, setProjectSlug] = useState('')
  
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [docTitle, setDocTitle] = useState('')
  const [docSlug, setDocSlug] = useState('')
  const [docContent, setDocContent] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth')
      setUser(user)

      const { data } = await supabase.from('projects').select('*')
      if (data) setProjects(data)
    }
    loadData()
  }, [])

  async function createProject(e) {
    e.preventDefault()
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name: projectName, slug: projectSlug, user_id: user.id }])
      .select()

    if (!error && data) {
      setProjects([...projects, data[0]])
      setProjectName('')
      setProjectSlug('')
    }
  }

  async function saveDoc(e) {
    e.preventDefault()
    if (!selectedProjectId) return alert('Select a project first')

    const { error } = await supabase.from('docs_pages').insert([{
      project_id: selectedProjectId,
      title: docTitle,
      slug: docSlug,
      content_mdx: docContent
    }])

    if (!error) {
      alert('Document saved successfully!')
      setDocTitle('')
      setDocSlug('')
      setDocContent('')
    } else {
      alert(error.message)
    }
  }

  if (!user) return <p style={{ padding: '20px' }}>Loading workspace...</p>

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      <div style={{ width: '300px', borderRight: '1px solid #eee', padding: '20px', background: '#f9f9f9' }}>
        <h3>Your Projects</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {projects.map((p) => (
            <li key={p.id} style={{ marginBottom: '8px' }}>
              <button 
                onClick={() => setSelectedProjectId(p.id)}
                style={{
                  width: '100%', 
                  textAlign: 'left', 
                  padding: '8px',
                  background: selectedProjectId === p.id ? '#e6f0ff' : '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <strong>{p.name}</strong> <small>(/{p.slug})</small>
              </button>
            </li>
          ))}
        </ul>

        <h4 style={{ marginTop: '30px' }}>Create New Project</h4>
        <form onSubmit={createProject} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input 
            placeholder="Project Name" 
            value={projectName} 
            onChange={(e) => setProjectName(e.target.value)} 
            style={{ padding: '6px' }}
            required 
          />
          <input 
            placeholder="URL Slug (e.g. my-docs)" 
            value={projectSlug} 
            onChange={(e) => setProjectSlug(e.target.value)} 
            style={{ padding: '6px' }}
            required 
          />
          <button type="submit" style={{ padding: '8px', cursor: 'pointer' }}>Create Project</button>
        </form>
      </div>

      <div style={{ flex: 1, padding: '30px' }}>
        <h2>Create / Edit Page</h2>
        {selectedProjectId ? (
          <form onSubmit={saveDoc} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '700px' }}>
            <input 
              placeholder="Page Title (e.g. Getting Started)" 
              value={docTitle} 
              onChange={(e) => setDocTitle(e.target.value)} 
              style={{ padding: '8px', fontSize: '16px' }}
              required 
            />
            <input 
              placeholder="Page Slug (e.g. getting-started)" 
              value={docSlug} 
              onChange={(e) => setDocSlug(e.target.value)} 
              style={{ padding: '8px' }}
              required 
            />
            <textarea 
              rows={14} 
              placeholder="Write Markdown content here..." 
              value={docContent} 
              onChange={(e) => setDocContent(e.target.value)} 
              style={{ padding: '10px', fontFamily: 'monospace', fontSize: '14px' }}
              required 
            />
            <button type="submit" style={{ padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '150px' }}>
              Publish Page
            </button>
          </form>
        ) : (
          <p style={{ color: '#666' }}>Select or create a project on the left sidebar to add documentation pages.</p>
        )}
      </div>
    </div>
  )
}
