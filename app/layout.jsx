import './globals.css'

export const metadata = {
  title: 'Docs Platform',
  description: 'Multi-tenant documentation platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  )
}
