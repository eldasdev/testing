import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function AdminNewJobPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect to the main job creation page
  // Admins and super admins can create jobs from there
  redirect('/jobs/new')
}
