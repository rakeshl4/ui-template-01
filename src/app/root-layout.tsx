import { Outlet, useMatch } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'

export function RootLayout() {
  // The Schedule of Assessments grids need the full width available.
  const wide = Boolean(useMatch('/requests/:id/soa'))

  return (
    <AppShell wide={wide}>
      <Outlet />
    </AppShell>
  )
}
