"use client";

import { useEffect, useState } from "react"
import { Bell, Calendar, Layout, Users, Settings } from "lucide-react"
import { createClient } from "@/utils/supabase/client";

import ProjectView from "./project-view";
import OneTapComponent from "@/components/ui/sign_in";
import GoogleCalendarComponent from "@/components/GoogleCalendarComponent";

export default function MDSTDashboard() {
  const [activeTab, setActiveTab] = useState("member")
  
  // Track which project is selected; empty string = no project (show home)
  const [selectedProject, setSelectedProject] = useState("");
  const [showOneTap, setShowOneTap] = useState(false)
  // Add state for user data
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  
  // Add calendar state
  const [showCalendar, setShowCalendar] = useState(false)
  
  // Default profile image
  const defaultProfileImage = "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";
  
  // Function to handle sign out
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserData(null)
    setShowOneTap(false)
    setProfileMenuOpen(false)
  }

  // Add useEffect to check session and fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const supabase = createClient();
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
  
      if (session) {
        console.log(session);
        console.log('User is logged in');
  
        const { data: userInfo, error: userError } = await supabase
          .from('Users')
          .select('*')
          .eq('email', session.user.email)
          .single();
  
        if (userError) {
          console.error('Error fetching user info:', userError);
          setLoading(false);
          return;
        }
  
        // Fetch the project name using the project ID from the userInfo
        let projectName = null;
        if (userInfo?.Project) {
          const { data: projectData, error: projectError } = await supabase
            .from('Projects')
            .select('project_name')
            .eq('id', userInfo.Project)
            .single();
  
          if (projectError) {
            console.error('Error fetching project name:', projectError);
          } else {
            projectName = projectData.project_name;
          }
        }

        console.log(projectName)
        const googlePhotoURL = session.user?.user_metadata?.avatar_url || null;
        const profileUrl = userInfo.profileUrl || googlePhotoURL || defaultProfileImage;
  
        setUserData({
          ...userInfo,
          email: session.user.email,
          photoURL: googlePhotoURL,
          profileUrl: profileUrl,
          projectName: projectName // <-- add project name to userData
        });
      } else {
        console.log('No active session');
      }
  
      setLoading(false);
    };
  
    fetchUserData();
  }, []);
  

  // Handler for dropdown change
  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  return (
    <div className="bg-neutral-900 text-gray-100 min-h-screen flex flex-col">
      <script src="https://accounts.google.com/gsi/client" async></script>
      {/* TOP BAR (Improved) */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Logo + Title */}
          <div className="flex items-center space-x-3">
            <img
              src="/mdst-logo.png"
              alt="MDST Logo"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold tracking-wide text-white">
              MDST Dashboard
            </span>
          </div>

          {/* Right: Auth Status + Icons */}
          <div className="flex items-center space-x-4">
            {userData ? (
              /* User is logged in */
              <>
                <span className="text-sm text-gray-200">
                  Signed in with Google
                </span>
                <button
                  type="button"
                  className="rounded-full p-1 text-gray-200 hover:text-white transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-6 w-6" />
                </button>

                {/* Un comment to re add calendar toggle button  */}
                {/* Calendar toggle button
                <button
                  type="button"
                  className={`rounded-full p-1 transition-colors ${
                    showCalendar ? "text-white bg-indigo-600" : "text-gray-200 hover:text-white"
                  }`}
                  title="Calendar"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar className="h-6 w-6" />
                </button> */}
                <div className="relative">
                  <button
                    type="button"
                    className="rounded-full w-8 h-8 overflow-hidden bg-gray-800 hover:ring-2 hover:ring-white focus:outline-none focus:ring-2 focus:ring-white"
                    title={`${userData.First} ${userData.Last}`}
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  >
                    {userData.profileUrl ? (
                      <img
                        src={userData.profileUrl}
                        alt="User Avatar"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          console.log("Image failed to load, falling back to default");
                          e.target.onerror = null;
                          e.target.src = defaultProfileImage;
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-indigo-600 text-white font-medium text-sm">
                        {userData.First?.charAt(0)}{userData.Last?.charAt(0)}
                      </div>
                    )}
                  </button>
                  {/* Dropdown menu with click toggle instead of hover */}
                  {profileMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-10"
                      onMouseLeave={() => {
                        // Add a small delay before closing to make it more user-friendly
                        setTimeout(() => setProfileMenuOpen(false), 300);
                      }}
                    >
                      <div className="px-4 py-2 text-sm text-gray-200 border-b border-gray-700">
                        <p className="font-medium">{userData.First} {userData.Last}</p>
                        <p className="text-xs text-gray-400 truncate">{userData.email}</p>
                      </div>
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">Profile</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">Settings</a>
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
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
            {showOneTap && <OneTapComponent/>}
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
                  {userData.Project && userData.Role ? 
                    ` | Project Name: ${userData.projectName} | Role: ${userData.Role}` : 
                    userData.Role ? ` | Role: ${userData.Role}` : ''}
                </p>
              ) : (
                <p className="text-gray-400 text-sm mt-1">Not logged in</p>
              )}
            </div>

            {/* PROJECT SWITCHER DROPDOWN */}
            <div className="flex items-center space-x-2">
              <label htmlFor="project-switcher" className="text-sm">
                Select Project:
              </label>
              <select
                id="project-switcher"
                value={selectedProject}
                onChange={handleProjectChange}
                className="bg-neutral-800 text-gray-100 p-2 rounded"
              >
                <option value="">Home View</option>
                <option value="Fruit Nutrition Information App">Fruit Nutrition Information App</option>
                <option value="Mini AlphaGo">Mini AlphaGo</option>
                <option value="Image Style Transfer">Image Style Transfer</option>
                <option value="Breast Cancer Detection">Breast Cancer Detection</option>
                <option value="Minecraft Clip Summarizer">Minecraft Clip Summarizer</option>
                <option value="Election Voting Analysis">Election Voting Analysis</option>
                <option value="JARVIS">JARVIS</option>
                <option value="MDST Dashboard">MDST Dashboard</option>
                <option value="Building & Breaking a Resume Screener">Building & Breaking a Resume Screener</option>
                <option value="Traffic Accident Prediction">Traffic Accident Prediction</option>
                <option value="Car brand Classification">Car brand Classification</option>
                <option value="LLM App Development">LLM App Development</option>
                <option value="Criminal Risk Analysis">Criminal Risk Analysis</option>
                <option value="Flight Price Prediction">Flight Price Prediction</option>
              </select>
            </div>
          </div>
        </div>

        {/* RENDER HOME VIEW OR PROJECT VIEW */}
        {selectedProject === "" ? (
          <>
            {/* TAB CONTROLS */}
            <div className="flex space-x-4 mb-6">
              <TabButton
                active={activeTab === "member"}
                onClick={() => setActiveTab("member")}
              >
                Member View
              </TabButton>
              <TabButton
                active={activeTab === "lead"}
                onClick={() => setActiveTab("lead")}
              >
                Project Lead View
              </TabButton>
              <TabButton
                active={activeTab === "eboard"}
                onClick={() => setActiveTab("eboard")}
              >
                E-Board View
              </TabButton>
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-8">
              {activeTab === "member" && (
                <MemberView />
              )}
              {activeTab === "lead" && (
                <LeadView />
              )}
              {activeTab === "eboard" && (
                <EBoardView />
              )}
            </div>
          </>
        ) : (
          <ProjectView selectedProject={selectedProject} />
        )}
        {/* GOOGLE CALENDAR SECTION */}
                {(
          <GoogleCalendarComponent />
        )}
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------
 * TAB BUTTON
 * ----------------------------------------------------------------*/
function TabButton({ active, onClick, children }) {
  return (
    <button
      className={`px-4 py-2 rounded-md font-medium focus:outline-none
        ${
          active
            ? "bg-neutral-800 text-white border border-neutral-700"
            : "bg-neutral-800/60 text-gray-400 hover:bg-neutral-800 hover:text-gray-100"
        }`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------
 * MEMBER VIEW
 * ----------------------------------------------------------------*/
function MemberView() {
  return (
    <section className="space-y-6">
      {/* Example 4-Column Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Projects"
          value="12"
          subLabel="+2 from last semester"
          icon={<Layout className="h-6 w-6" />}
        />
        <StatCard
          title="Team Members"
          value="120"
          subLabel="+15 new this semester"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Pull Requests"
          value="24"
          subLabel="+10 in the last week"
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard
          title="Completion Rate"
          value="60%"
          subLabel="+5% from last week"
          icon={<Settings className="h-6 w-6" />}
        />
      </div>

      {/* Project Timeline */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Project Timeline</h2>
        <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
          <Timeline />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------
 * LEAD VIEW
 * ----------------------------------------------------------------*/
function LeadView() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Project Lead Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          icon={<Users className="h-6 w-6 text-indigo-500" />}
          title="Team Members"
          content="Manage (10)"
        />
        <DashboardCard
          icon={<Calendar className="h-6 w-6 text-green-500" />}
          title="Attendance"
          content="View & Update"
        />
        <DashboardCard
          icon={<Layout className="h-6 w-6 text-blue-500" />}
          title="Project Progress"
          content="75% Complete"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Team Overview</h3>
        <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
          <TeamOverview />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------
 * E-BOARD VIEW
 * ----------------------------------------------------------------*/
function EBoardView() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">E-Board Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          icon={<Users className="h-6 w-6 text-indigo-500" />}
          title="Total Members"
          content="150 Active"
        />
        <DashboardCard
          icon={<Layout className="h-6 w-6 text-green-500" />}
          title="Active Projects"
          content="8 Projects"
        />
        <DashboardCard
          icon={<Users className="h-6 w-6 text-blue-500" />}
          title="Alumni Network"
          content="500+ Members"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Organization Overview</h3>
        <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
          <OrganizationOverview />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Projects List</h3>
        <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
          <ProjectsList />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------
 * DASHBOARD CARD (Generic)
 * ----------------------------------------------------------------*/
function DashboardCard({ icon, title, content }) {
  return (
    <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:bg-neutral-700 transition-colors">
      <div className="flex items-center space-x-4">
        {icon && <div>{icon}</div>}
        <div>
          <div className="text-sm text-gray-400">{title}</div>
          <div className="text-xl font-semibold">{content}</div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
 * STAT CARD (4-up example)
 * ----------------------------------------------------------------*/
function StatCard({ title, value, subLabel, icon }) {
  return (
    <div className="p-5 bg-neutral-800 rounded-lg border border-neutral-700 flex items-center space-x-4 hover:bg-neutral-700 transition-colors">
      <div className="flex-shrink-0 text-gray-400">{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-400">{title}</div>
        <div className="text-xs text-gray-500 mt-1">{subLabel}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
 * TIMELINE (Week 1, 2, 5, 7, 10)
 * ----------------------------------------------------------------*/
function Timeline() {
  const events = [
    { week: 1, description: "Team formation and project kickoff" },
    { week: 3, description: "Design phase completion" },
    { week: 5, description: "Mid-semester demo preparation" },
    { week: 7, description: "Core feature implementation" },
    { week: 10, description: "Final project presentation" },
  ]

  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold shrink-0">
            {event.week}
          </div>
          <div>
            <p className="text-sm font-bold">Week {event.week}</p>
            <p className="text-sm text-gray-300">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------
 * TEAM OVERVIEW TABLE
 * ----------------------------------------------------------------*/
function TeamOverview() {
  const members = [
    { name: "Alice Johnson", role: "Frontend Dev", attendance: "90%" },
    { name: "Bob Smith", role: "Backend Dev", attendance: "85%" },
    { name: "Charlie Brown", role: "UI/UX", attendance: "95%" },
    { name: "Diana Ross", role: "Data Scientist", attendance: "80%" },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-neutral-700 text-sm text-gray-400">
            <th className="py-2 px-4 text-left font-medium">Name</th>
            <th className="py-2 px-4 text-left font-medium">Role</th>
            <th className="py-2 px-4 text-left font-medium">Attendance</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, idx) => (
            <tr
              key={idx}
              className="border-b border-neutral-800 hover:bg-neutral-700/50 transition-colors"
            >
              <td className="py-2 px-4">{m.name}</td>
              <td className="py-2 px-4 text-gray-400">{m.role}</td>
              <td className="py-2 px-4 text-gray-400">{m.attendance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------
 * ORGANIZATION OVERVIEW TABLE
 * ----------------------------------------------------------------*/
function OrganizationOverview() {

  const projects = [
    { name: "MDST Dashboard", members: 9, progress: 75 },
    { name: "Data Viz", members: 8, progress: 60 },
    { name: "ML Model", members: 12, progress: 80 },
    { name: "NLP Project", members: 9, progress: 50 },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-neutral-700 text-sm text-gray-400">
            <th className="py-2 px-4 text-left font-medium">Project</th>
            <th className="py-2 px-4 text-left font-medium">Members</th>
            <th className="py-2 px-4 text-left font-medium">Progress</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, idx) => (
            <tr
              key={idx}
              className="border-b border-neutral-800 hover:bg-neutral-700/50 transition-colors"
            >
              <td className="py-2 px-4">{p.name}</td>
              <td className="py-2 px-4 text-gray-400">{p.members}</td>
              <td className="py-2 px-4 flex items-center space-x-2">
                <div className="w-full bg-neutral-700 h-2 rounded-full">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400">
                  {p.progress}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface Project {
  id: number;
  project_name: string;
  num_participants: number;
}

function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);

  // useEffect(() => {
    console.log("useEffect triggered"); // Debug point 1

    async function fetchProjects() {
      console.log("fetchProjects started"); // Debug point 2
      try {
        const supabase = await createClient();
        console.log("Supabase client created"); // Debug point 3
        
        const { data, error } = await supabase.from("Projects").select("*");
        console.log("Query executed"); // Debug point 4

        if (error) {
          console.error("Error fetching projects:", error);
        } else {
          console.log("Raw data:", data); // Debug point 5
          setProjects(data as Project[]);
        }
      } catch (e) {
        console.error("Caught error:", e); // Debug point 6
      }
    }

    fetchProjects();
  // }, []);

  console.log("Current projects state:", projects); // Debug point 7

  return (
    <div>
      <h2>Projects</h2>
      <ul>
        {projects?.length === 0 && <p>No projects found</p>}
        {projects?.map((project) => (
          <li key={project.id}>
            {project.project_name} - {project.num_participants} members
          </li>
        ))}
      </ul>
    </div>
  );
}
