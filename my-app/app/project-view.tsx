"use client"

import { useState } from "react"
import { FileText, Users, LinkIcon, Check, X, Bell } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface MeetingNote {
  week: number
  content: string
}

interface ProjectMember {
  id: number
  name: string
  role: string
  attendance: Record<number, boolean>
}

export default function ProjectView() {
  const [selectedWeek, setSelectedWeek] = useState<string>("1")
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([
    { week: 1, content: "Initial project planning and team introductions." },
  ])
  const [members, setMembers] = useState<ProjectMember[]>([
    {
      id: 1,
      name: "Alice Johnson",
      role: "Frontend Developer",
      attendance: { 1: true },
    },
    {
      id: 2,
      name: "Bob Smith",
      role: "Data Scientist",
      attendance: { 1: false },
    },
  ])

  const weeks = Array.from({ length: 10 }, (_, i) => i + 1)

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

  const toggleAttendance = (memberId: number, week: number) => {
    setMembers(
      members.map((member) => {
        if (member.id === memberId) {
          return {
            ...member,
            attendance: {
              ...member.attendance,
              [week]: !member.attendance[week],
            },
          }
        }
        return member
      }),
    )
  }

  const getCurrentNotes = () => {
    const week = Number.parseInt(selectedWeek)
    return meetingNotes.find((note) => note.week === week)?.content || ""
  }

  return (
    <div className="bg-neutral-900 text-gray-100 min-h-screen flex flex-col">
      {/* TOP BAR (Minimal) */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Logo + Title */}
          <div className="flex items-center space-x-3">
            <img src="/placeholder.svg?height=32&width=32" alt="MDST Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold tracking-wide text-white">MDST Dashboard</span>
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
              className="rounded-full w-8 h-8 overflow-hidden bg-gray-800 hover:ring-2 hover:ring-white"
              title="User Menu"
            >
              <img src="/placeholder.svg?height=32&width=32" alt="User Avatar" className="object-cover w-full h-full" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Project Info Section */}
          <div className="p-6 bg-neutral-800 rounded-lg border border-neutral-700">
            <h2 className="text-xl font-semibold mb-4 text-white">MDST Dashboard Project</h2>

            <div className="space-y-6">
              {/* Project Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-200">Project Description</h3>
                <p className="text-gray-400">
                  A comprehensive dashboard for managing MDST projects, members, and resources. Built with Next.js and
                  Supabase for real-time updates and collaboration.
                </p>
              </div>

              {/* Project Members */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-200 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Project Members
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-2 border-b border-neutral-700">
                      <div>
                        <p className="font-medium text-gray-200">{member.name}</p>
                        <p className="text-sm text-gray-400">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Resources */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-200 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Project Resources
                </h3>
                <div className="space-y-2">
                  <a href="#" className="block text-blue-400 hover:text-blue-300 transition-colors">
                    GitHub Repository
                  </a>
                  <a href="#" className="block text-blue-400 hover:text-blue-300 transition-colors">
                    Project Documentation
                  </a>
                  <a href="#" className="block text-blue-400 hover:text-blue-300 transition-colors">
                    Design Files
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
                      {members.map((member) => (
                        <tr
                          key={member.id}
                          className="border-b border-neutral-700 hover:bg-neutral-700/50 transition-colors"
                        >
                          <td className="py-2 px-4 text-gray-200">{member.name}</td>
                          <td className="py-2 px-4">
                            {member.attendance[Number.parseInt(selectedWeek)] ? (
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
                                checked={member.attendance[Number.parseInt(selectedWeek)] || false}
                                onCheckedChange={() => toggleAttendance(member.id, Number.parseInt(selectedWeek))}
                                className="border-neutral-600"
                              />
                              <span className="text-sm text-gray-400">Mark as attending</span>
                            </div>
                          </td>
                        </tr>
                      ))}
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

