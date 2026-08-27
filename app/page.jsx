import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Welcome to Docs Platform</h1>
      <p>Manage and publish your documentation easily.</p>
      <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <Link href="/auth">Sign In / Sign Up</Link>
        <Link href="/dashboard">Go to Dashboard</Link>
      </div>
    </main>
  )
}
