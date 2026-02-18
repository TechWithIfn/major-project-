import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings & Features',
  description: 'Configure ShikshaSahayak: theme, progress tracking, and admin dashboard.',
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
