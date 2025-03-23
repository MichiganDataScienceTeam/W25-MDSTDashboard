// app/dashboard/page.tsx or any page in your Next.js app
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient()

      // Get currently signed in user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        console.log('No user logged in')
        return
      }

      // Get user info from your "Users" table using uid or email
      const { data: userInfo, error } = await supabase
        .from('Users')
        .select('*')
        .eq('uid', user.id) // or use .eq('email', user.email)
        .single()

      if (error) {
        console.error('Error fetching user info:', error)
        return
      }

      setUserData(userInfo)
    }

    fetchUserData()
  }, [])

  if (!userData) return <p>Loading user info...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Welcome, {userData.First} {userData.Last}</h1>
      <p>Uniqname: {userData.Uniqname}</p>
      <p>Email: {userData.email}</p>
      <p>Role: {userData.Role}</p>
      <p>Project ID: {userData.Project}</p>
    </div>
  )
}
