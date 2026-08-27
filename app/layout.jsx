import './globals.css'
import { Inter } from 'next/font/google'

// Use Next.js optimized Inter font
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Docs Platform',
  description: 'A modern, multi-tenant documentation platform.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200`}>
        {children}
      </body>
    </html>
  )
}
