import { MDXRemote } from 'next-mdx-remote/rsc'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function PublicDocPage({ params }) {
  const { projectSlug, docSlug } = params

  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('slug', projectSlug)
    .single()

  if (!project) notFound()

  const { data: doc } = await supabase
    .from('docs_pages')
    .select('title, content_mdx')
    .eq('project_id', project.id)
    .eq('slug', docSlug)
    .single()

  if (!doc) notFound()

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', background: '#fff', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <header style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', paddingTop: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#0070f3', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{project.name}</small>
        <h1 style={{ marginTop: '5px', marginBottom: 0 }}>{doc.title}</h1>
      </header>

      <article style={{ lineHeight: '1.7', color: '#333' }}>
        <MDXRemote source={doc.content_mdx} />
      </article>
    </main>
  )
}
