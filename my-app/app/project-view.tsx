"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { FileText, Users, LinkIcon, Check, X, Bell } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface MeetingNote {
  week: number
  content: string
}

interface ProjectMember {
  /** IMPORTANT: Use DB’s unique id as a stable key. */
  id: number
  name: string
  role: string
  attendance: Record<number, boolean>
}

interface SupabaseProject {
  id: number
  project_name: string
  description?: string
}

export default function ProjectView({ selectedProject }: { selectedProject: string }) {
  // Fetched from Supabase
  const [dbProject, setDbProject] = useState<SupabaseProject | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])

  // Existing local states
  const [selectedWeek, setSelectedWeek] = useState<string>("1")
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([
    { week: 1, content: "Initial project planning and team introductions." },
  ])

  // Generate an array of 10 weeks
  const weeks = Array.from({ length: 10 }, (_, i) => i + 1)

  // 1) --- Fetch project + members from Supabase ---
  useEffect(() => {
    if (!selectedProject) return

    async function loadProjectData() {
      try {
        const supabase = createClient()

        // A) Fetch the matching project by exact name
        const { data: projectData, error: projectError } = await supabase
          .from("Projects")
          .select("*")
          .eq("project_name", selectedProject)
          .single()

        if (projectError || !projectData) {
          console.error("Error fetching project:", projectError)
          return
        }
        setDbProject(projectData)

        // B) Fetch users referencing this project's ID
        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select("*")
          // The foreign key column is "Project" (capital P)
          .eq("Project", projectData.id)

        if (userError) {
          console.error("Error fetching users:", userError)
          return
        }

        if (userData) {
          // Shape each user row into your local structure
          const shapedMembers: ProjectMember[] = userData.map((u: any) => ({
            // Use the DB’s auto-increment PK or unique ID as a stable React key
            id: u.id,
            // Match the exact column casing from the DB
            name:
              u["First"] && u["Last"]
                ? `${u["First"]} ${u["Last"]}`
                : u["Uniqname"] || "Unknown",
            role: u["Role"] || "Member",
            attendance: {}, // Start empty; can be updated via toggle
          }))
          setMembers(shapedMembers)
        }
      } catch (err) {
        console.error("Caught error:", err)
      }
    }

    loadProjectData()
  }, [selectedProject])

  // 2) --- Meeting notes logic ---
  const updateMeetingNotes = (content: string) => {
    const week = Number.parseInt(selectedWeek)
    const existingNoteIndex = meetingNotes.findIndex((note) => note.week === week)

    if (existingNoteIndex !== -1) {
      const updatedNotes = [...meetingNotes]
      updatedNotes[existingNoteIndex].content = content
      setMeetingNotes(updatedNotes)
    } else {
      setMeetingNotes([...meetingNotes, { week, content }])
    }
  }

  // 3) --- Toggle attendance by member + week ---
  const toggleAttendance = (memberId: number, week: number) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === memberId
          ? {
              ...member,
              attendance: {
                ...member.attendance,
                [week]: !member.attendance[week],
              },
            }
          : member
      )
    )
  }

  const getCurrentNotes = () => {
    const week = Number.parseInt(selectedWeek)
    return meetingNotes.find((note) => note.week === week)?.content || ""
  }

  // 4) --- Render ---
  return (
    <div className="bg-neutral-900 text-gray-100 min-h-screen flex flex-col">
      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Project Info Section */}
          <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {dbProject?.project_name ?? "Selected Project"}
            </h2>

            <div className="space-y-6">
              {/* Project Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-200">Project Description</h3>
                <p className="text-gray-400">
                  {dbProject?.description ?? "No description found."}
                </p>
              </div>

              {/* Project Members */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-200 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Project Members
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {members.length === 0 ? (
                    <p className="text-gray-400">No members found.</p>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.id} // Unique key for each user
                        className="flex items-center justify-between py-2 border-b border-neutral-700"
                      >
                        <div>
                          <p className="font-medium text-gray-200">{member.name}</p>
                          <p className="text-sm text-gray-400">{member.role}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Project Resources (still hard-coded) */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-200 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Project Resources
                </h3>
                <div className="space-y-2">
                  <a href="https://github.com/MichiganDataScienceTeam/W25-MDSTDashboard" className="block text-blue-400 hover:text-blue-300 transition-colors">
                    GitHub Repository
                  </a>
                  <a href="https://drive.google.com/drive/folders/1sPjjBTP57PBuo0R5UiaK2dD0Ypj8zmYj?usp=drive_link" className="block text-blue-400 hover:text-blue-300 transition-colors">
                    Google Drive
                  </a>
                  <a href="#" className="block text-blue-400 hover:text-blue-300 transition-colors">
                    Project Demo
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Notes & Attendance Section */}
          <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700">
            <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Meeting Notes & Attendance
            </h2>

            <div className="space-y-8">
              {/* Week Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Select Week</label>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="w-[180px] bg-neutral-700 border-neutral-600 text-gray-200">
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    {weeks.map((week) => (
                      <SelectItem
                        key={week}
                        value={week.toString()}
                        className="text-gray-200 focus:bg-neutral-700 focus:text-gray-200"
                      >
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meeting Notes */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-200">Meeting Notes</h3>
                <Textarea
                  value={getCurrentNotes()}
                  onChange={(e) => updateMeetingNotes(e.target.value)}
                  placeholder="Enter meeting notes for this week..."
                  className="min-h-[200px] bg-neutral-700 border-neutral-600 text-gray-200 placeholder:text-gray-400 focus:ring-offset-neutral-800"
                />
              </div>

              {/* Attendance */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold mb-3 text-gray-200">Attendance</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-neutral-700 text-sm text-gray-400">
                        <th className="py-2 px-4 text-left font-medium">Member</th>
                        <th className="py-2 px-4 text-left font-medium">Status</th>
                        <th className="py-2 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => {
                        const attending = member.attendance[Number(selectedWeek)] || false
                        return (
                          <tr
                            key={member.id} // Unique key for each row
                            className="border-b border-neutral-700 hover:bg-neutral-700/50 transition-colors"
                          >
                            <td className="py-2 px-4 text-gray-200">{member.name}</td>
                            <td className="py-2 px-4">
                              {attending ? (
                                <span className="text-green-500 flex items-center gap-1">
                                  <Check className="h-4 w-4" /> Attending
                                </span>
                              ) : (
                                <span className="text-red-500 flex items-center gap-1">
                                  <X className="h-4 w-4" /> Not Attending
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={attending}
                                  onCheckedChange={() => toggleAttendance(member.id, Number(selectedWeek))}
                                  className="border-neutral-600"
                                />
                                <span className="text-sm text-gray-400">Mark as attending</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
