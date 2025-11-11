import { AppBackground } from '@/components/layout/AppBackground'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppBackground>
      {children}
    </AppBackground>
  )
}
