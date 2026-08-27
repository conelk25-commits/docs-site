export const metadata = {
  title: 'Docs Platform',
  description: 'Host your documentation effortlessly',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif', backgroundColor: '#fafafa' }}>
        {children}
      </body>
    </html>
  )
}
