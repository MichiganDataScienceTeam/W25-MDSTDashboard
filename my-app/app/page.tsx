"use client";

import { useEffect, useState } from "react"
import { Bell, Calendar, Layout, Users, Settings } from "lucide-react"
import { createClient } from "@/utils/supabase/client";

import ProjectView from "./project-view";
import OneTapComponent from "@/components/ui/sign_in";

export default function MDSTDashboard() {
  const [activeTab, setActiveTab] = useState("member")
  
  // Track which project is selected; empty string = no project (show home)
  const [selectedProject, setSelectedProject] = useState("");
  const [showOneTap, setShowOneTap] = useState(false)

  // Handler for dropdown change
  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  // sign in handler
  // async function handleSignInWithGoogle(response) {
  //   const { data, error } = await supabase.auth.signInWithIdToken({
  //     provider: 'google',
  //     token: response.credential,
  //   })
  // }

  return (
    <div className="bg-neutral-900 text-gray-100 min-h-screen flex flex-col">
      <script src="https://accounts.google.com/gsi/client" async></script>
      {/* TOP BAR (Minimal) */}
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

          {/* Right: Icons */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="rounded-full p-1 text-gray-200 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => setShowOneTap(true)}
              className="rounded-full w-8 h-8 overflow-hidden bg-gray-800 hover:ring-2 hover:ring-white"
              title="User Menu"

            >
              <img
                src="/placeholder-user.jpg"
                alt="User Avatar"
                className="object-cover w-full h-full"
              />
            </button>
            {showOneTap && <OneTapComponent/>}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {/* DASHBOARD HEADING */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          {/* PROJECT SWITCHER DROPDOWN (UPDATED: All DB project names) */}
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
