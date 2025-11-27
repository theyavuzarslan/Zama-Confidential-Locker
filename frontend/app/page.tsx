import DashboardLayout from '@/components/dashboard-layout'
import { LockerDashboard } from '@/components/locker-dashboard'

export default function Home() {
  return (
    <DashboardLayout>
      <LockerDashboard />
    </DashboardLayout>
  )
}
