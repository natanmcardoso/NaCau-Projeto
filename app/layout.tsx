import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NaCau — Gestão Financeira',
  description: 'Sistema de gestão financeira para casais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-white font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
