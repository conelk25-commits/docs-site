import { createClient } from '@/lib/supabaseClient'
import Link from 'next/link'

export default async function DocViewer({ params }) {
  // Await params to get docSlug properly
  const { docSlug } = await params
  const supabase = createClient()

  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('slug', docSlug)
    .single()

  if (!doc) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <h1 className="text-2xl font-bold mb-4">404 - Document Not Found</h1>
        <p className="text-sm text-slate-500 mb-4">Looking for slug: "{docSlug}"</p>
        <Link href="/dashboard" className="text-indigo-400 hover:underline">Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-4xl mx-auto">
      <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white mb-6 inline-block">
        ← Back to Dashboard
      </Link>
      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-extrabold text-white mb-4">{doc.title}</h1>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl whitespace-pre-wrap">
          {doc.content || 'This document has no content yet.'}
        </div>
      </article>
    </div>
  )
}
