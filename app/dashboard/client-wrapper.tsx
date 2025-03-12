"use client"

import dynamic from 'next/dynamic'


const DashboardClient = dynamic(
  () => import('./components/dashboard-client'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full animate-pulse">
        <div className="h-20 bg-gray-200 mb-4 rounded-md"></div>
        <div className="h-[600px] bg-gray-200 rounded-md"></div>
      </div>
    )
  }
)

export default function ClientWrapper() {
  return <DashboardClient />
}
