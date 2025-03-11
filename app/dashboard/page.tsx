import ClientWrapper from './client-wrapper'

// This is a server component that safely renders the client component
export default function Dashboard() {
  return (
    <main className="min-h-screen p-8 bg-bw">
      <ClientWrapper />
    </main>
  )
}
