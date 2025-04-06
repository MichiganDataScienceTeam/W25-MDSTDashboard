"use client"

import { useEffect, useState } from "react"
import { Bell, Calendar, Layout, Users, Settings } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

import OneTapComponent from "@/components/ui/sign_in"
import GoogleCalendarComponent from "@/components/GoogleCalendarComponent"

export default function MDSTDashboard() {
  // State management
  const [showOneTap, setShowOneTap] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  // Default profile image
  const defaultProfileImage =
    "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="

  // Function to handle sign out
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserData(null)
    setShowOneTap(false)
    setProfileMenuOpen(false)
  }

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const supabase = createClient()
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        setLoading(false)
        return
      }

      if (session) {
        console.log("User is logged in")

        // Get user info from your "Users" table using email
        const { data: userInfo, error: userError } = await supabase
          .from("Users")
          .select("*")
          .eq("email", session.user.email)
          .single()

        if (userError) {
          console.error("Error fetching user info:", userError)
        } else {
          // Get the Google photo URL from provider details if available
          const googlePhotoURL = session.user?.user_metadata?.avatar_url || null

          // Use profileUrl from database or fall back to Google photo or default
          const profileUrl = userInfo.profileUrl || googlePhotoURL || defaultProfileImage

          // Combine Supabase user data with authentication metadata
          setUserData({
            ...userInfo,
            email: session.user.email,
            photoURL: googlePhotoURL,
            profileUrl: profileUrl,
          })
        }
      } else {
        console.log("No active session")
      }

      setLoading(false)
    }

    fetchUserData()
  }, [])

  return (
    <div className="bg-neutral-900 text-gray-100 min-h-screen flex flex-col">
      <script src="https://accounts.google.com/gsi/client" async></script>

      {/* TOP BAR */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Logo + Title */}
          <div className="flex items-center space-x-3">
            <img src="/mdst-logo.png" alt="MDST Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold tracking-wide text-white">MDST Dashboard</span>
          </div>

          {/* Right: Auth Status + Icons */}
          <div className="flex items-center space-x-4">
            {userData ? (
              /* User is logged in */
              <>
                <span className="text-sm text-gray-200">Signed in with Google</span>
                <button
                  type="button"
                  className="rounded-full p-1 text-gray-200 hover:text-white transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-6 w-6" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    className="rounded-full w-8 h-8 overflow-hidden bg-gray-800 hover:ring-2 hover:ring-white focus:outline-none focus:ring-2 focus:ring-white"
                    title={`${userData.First} ${userData.Last}`}
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  >
                    {userData.profileUrl ? (
                      <img
                        src={userData.profileUrl || "/placeholder.svg"}
                        alt="User Avatar"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          console.log("Image failed to load, falling back to default")
                          e.target.onerror = null
                          e.target.src = defaultProfileImage
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-indigo-600 text-white font-medium text-sm">
                        {userData.First?.charAt(0)}
                        {userData.Last?.charAt(0)}
                      </div>
                    )}
                  </button>
                  {/* Dropdown menu */}
                  {profileMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-10"
                      onMouseLeave={() => {
                        setTimeout(() => setProfileMenuOpen(false), 300)
                      }}
                    >
                      <div className="px-4 py-2 text-sm text-gray-200 border-b border-gray-700">
                        <p className="font-medium">
                          {userData.First} {userData.Last}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{userData.email}</p>
                      </div>
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">
                        Profile
                      </a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">
                        Settings
                      </a>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* User is not logged in - show sign in button */
              <button
                onClick={() => setShowOneTap(true)}
                className="flex items-center space-x-2 bg-white text-gray-800 hover:bg-gray-100 py-1 px-3 rounded-md text-sm font-medium transition-colors"
              >
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
            {showOneTap && <OneTapComponent />}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {/* DASHBOARD HEADING WITH USER WELCOME */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              {loading ? (
                <p className="text-gray-400 text-sm mt-1">Loading user information...</p>
              ) : userData ? (
                <p className="text-gray-300 mt-1">
                  Welcome, {userData.First} {userData.Last}
                  {userData.Project && userData.Role
                    ? ` | Project ID: ${userData.Project} | Role: ${userData.Role}`
                    : userData.Role
                      ? ` | Role: ${userData.Role}`
                      : ""}
                </p>
              ) : (
                <p className="text-gray-400 text-sm mt-1">Not logged in</p>
              )}
            </div>
          </div>
        </div>

        {/* CONDITIONAL RENDERING BASED ON LOGIN STATUS */}
        {!userData ? (
          // User is not logged in - show home page
          <HomePage />
        ) : (
          // User is logged in - show project page
          <ProjectPage userData={userData} />
        )}
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------
 * HOME PAGE (for non-logged in users)
 * ----------------------------------------------------------------*/
function HomePage() {
  return (
    <div className="space-y-8">
      <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700">
        <h2 className="text-2xl font-bold mb-4">Welcome to MDST Dashboard</h2>
        <p className="text-gray-300 mb-6">
          The Michigan Data Science Team (MDST) is a student organization at the University of Michigan dedicated to
          helping students learn about data science and machine learning through educational initiatives and
          data-focused projects.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <FeatureCard
            title="Projects"
            description="Join exciting data science projects across various domains"
            icon={<Layout className="h-8 w-8 text-blue-500" />}
          />
          <FeatureCard
            title="Community"
            description="Connect with fellow data science enthusiasts"
            icon={<Users className="h-8 w-8 text-green-500" />}
          />
          <FeatureCard
            title="Learning"
            description="Enhance your skills through workshops and collaborative work"
            icon={<Calendar className="h-8 w-8 text-purple-500" />}
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Sign in to access your project dashboard and team information</p>
        </div>
      </div>

      <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700">
        <h2 className="text-xl font-bold mb-4">About MDST</h2>
        <p className="text-gray-300">
          Founded in 2015, the Michigan Data Science Team is one of the premier data science organizations at the
          University of Michigan. We work on a variety of projects ranging from machine learning competitions to
          research collaborations with faculty and industry partners.
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
 * FEATURE CARD (for home page)
 * ----------------------------------------------------------------*/
function FeatureCard({ title, description, icon }) {
  return (
    <div className="p-4 bg-neutral-700 rounded-lg flex flex-col items-center text-center">
      <div className="mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  )
}

/* ------------------------------------------------------------------
 * PROJECT PAGE (for logged in users)
 * ----------------------------------------------------------------*/
function ProjectPage({ userData }) {
  const [projectData, setProjectData] = useState(null)
  const [meetingNotes, setMeetingNotes] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!userData || !userData.Project) {
        setLoading(false)
        return
      }

      setLoading(true)
      const supabase = createClient()

      try {
        // Fetch project details
        const { data: project, error: projectError } = await supabase
          .from("Projects")
          .select("*")
          .eq("id", userData.Project)
          .single()

        if (projectError) throw projectError
        setProjectData(project)

        // Fetch meeting notes for this project
        const { data: notes, error: notesError } = await supabase
          .from("MeetingNotes")
          .select("*")
          .eq("project_id", userData.Project)

        if (notesError) throw notesError
        setMeetingNotes(notes || [])

        // Fetch attendance based on role
        if (userData.Role === "Lead") {
          // For leads, fetch attendance for all team members
          const { data: allAttendance, error: attendanceError } = await supabase
            .from("Attendance")
            .select("*")
            .eq("project_id", userData.Project)

          if (attendanceError) throw attendanceError
          setAttendance(allAttendance || [])
        } else {
          // For regular members, fetch only their own attendance
          const { data: memberAttendance, error: attendanceError } = await supabase
            .from("Attendance")
            .select("*")
            .eq("project_id", userData.Project)
            .eq("email", userData.email)

          if (attendanceError) throw attendanceError
          setAttendance(memberAttendance || [])
        }
      } catch (error) {
        console.error("Error fetching project data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [userData])

  if (loading) {
    return <div className="text-center py-10">Loading project information...</div>
  }

  if (!userData.Project) {
    return (
      <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700">
        <h2 className="text-xl font-bold mb-4">No Project Assigned</h2>
        <p className="text-gray-300">
          You are not currently assigned to any project. Please contact your team lead or administrator.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Project Information */}
      <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700">
        <h2 className="text-xl font-bold mb-4">Project Information</h2>
        {projectData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Project Name"
                value={projectData.project_name || "N/A"}
                icon={<Layout className="h-6 w-6" />}
              />
              <StatCard
                title="Team Members"
                value={projectData.num_participants || "0"}
                icon={<Users className="h-6 w-6" />}
              />
              <StatCard
                title="Progress"
                value={`${projectData.progress || 0}%`}
                icon={<Settings className="h-6 w-6" />}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-300">{projectData.description || "No project description available."}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Project information not available.</p>
        )}
      </div>

      {/* Meeting Notes */}
      <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700">
        <h2 className="text-xl font-bold mb-4">Meeting Notes</h2>
        {meetingNotes.length > 0 ? (
          <div className="space-y-4">
            {meetingNotes.map((note, index) => (
              <div key={index} className="p-4 bg-neutral-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{note.meeting_date}</h3>
                  <span className="text-sm text-gray-400">{note.created_by}</span>
                </div>
                <p className="text-gray-300">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No meeting notes available for this project.</p>
        )}
      </div>

      {/* Attendance */}
      <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700">
        <h2 className="text-xl font-bold mb-4">{userData.Role === "Lead" ? "Team Attendance" : "Your Attendance"}</h2>
        {attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-neutral-700 text-sm text-gray-400">
                  <th className="py-2 px-4 text-left font-medium">Date</th>
                  {userData.Role === "Lead" && <th className="py-2 px-4 text-left font-medium">Member</th>}
                  <th className="py-2 px-4 text-left font-medium">Status</th>
                  <th className="py-2 px-4 text-left font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record, idx) => (
                  <tr key={idx} className="border-b border-neutral-800 hover:bg-neutral-700/50 transition-colors">
                    <td className="py-2 px-4">{record.meeting_date}</td>
                    {userData.Role === "Lead" && <td className="py-2 px-4">{record.member_name || record.email}</td>}
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          record.status === "Present"
                            ? "bg-green-800 text-green-200"
                            : record.status === "Excused"
                              ? "bg-yellow-800 text-yellow-200"
                              : "bg-red-800 text-red-200"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-gray-400">{record.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">No attendance records available.</p>
        )}
      </div>

      {/* Google Calendar Component */}
      <div className="mt-8">
        <GoogleCalendarComponent />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
 * STAT CARD
 * ----------------------------------------------------------------*/
function StatCard({ title, value, icon }) {
  return (
    <div className="p-5 bg-neutral-700 rounded-lg flex items-center space-x-4">
      <div className="flex-shrink-0 text-gray-400">{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-400">{title}</div>
      </div>
    </div>
  )
}

