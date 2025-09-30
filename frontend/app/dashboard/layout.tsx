import type React from "react"

// import { useEffect } from "react"
// import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
// import { useAuth } from "@/lib/auth"
// import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const { user, loading } = useAuth()
  // const router = useRouter()

  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push("/login")
  //   }
  // }, [user, loading, router])

  // if (loading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //     </div>
  //   )
  // }

  // if (!user) {
  //   return null
  // }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-6">{children}</main>
      </div>
    </div>
  )
}
