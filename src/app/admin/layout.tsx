import { auth } from '@/lib/auth'
import { AdminSidebar } from '@/components/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-dark-900">
      {session ? (
        <div className="flex">
          <AdminSidebar user={session.user} />
          <main className="flex-1 min-w-0 pt-20 lg:pt-0 px-4 py-6 lg:p-8">
            {children}
          </main>
        </div>
      ) : (
        <>{children}</>
      )}
    </div>
  )
}
