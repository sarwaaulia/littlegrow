import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import {prisma} from '@/lib/prisma'
import Navbar from "@/app/components/Navbar";

export default async function CustomerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  })

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <Navbar user={dbUser} />
      <main className="p-8">
        <h1 className="text-2xl font-bold">Dashboard customer</h1>
        <p className="text-gray-600">Welcome back, {dbUser?.role}!</p>
        
        {/* Konten dashboard nanti di sini */}
      </main>
    </div>
  )
}