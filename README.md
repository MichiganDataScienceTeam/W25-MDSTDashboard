# MDST Dashboard

**A comprehensive dashboard for managing Michigan Data Science Team (MDST) projects, members, and resources. Built with Next.js and Supabase for real-time collaboration and streamlined club/project management.**

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Development & Scripts](#development--scripts)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Credits](#credits)

---

## Project Overview

This dashboard supports different user views (Member, Project Lead, E-Board) for the MDST club. Features include project timelines, meeting notes, attendance tracking, organization overviews, and more—all driven by a Next.js app interfacing with a Supabase backend.

---

## Features

- **User Roles:** Member, Lead, and E-Board Dashboards with custom views.
- **Project Management:** Create/view projects, see participants, update progress.
- **Collaboration:** Track attendance, log meeting notes by week, manage team resources.
- **Real-time Updates:** Supabase integration for live data storage and sync.
- **UI/UX:** Tailwind CSS for responsive modern UI. Multiple UI components (Select, Checkbox, etc).
- **Demo Data:** Includes mock team, member, and project data in components for local development.

---

## Getting Started

First, clone the repository and install dependencies inside `my-app`:

cd my-app
npm install # or yarn install / pnpm install / bun install

text

Then, run the development server:

npm run dev # or yarn dev / pnpm dev / bun dev

text

The app will be available at [http://localhost:3000](http://localhost:3000/).

> You can start editing the page by modifying `app/page.tsx`. Hot reload is enabled.

---

## Project Structure

- **/my-app**
  - **/app**
    - `page.tsx` — Main dashboard logic and tabbed interface; renders Member/Lead/EBoard views
    - `layout.tsx` — Root layout and global styles
    - `project-view.tsx` — Project-level features: members, notes, attendance, resources
  - **/components**
    - `ui/checkbox.tsx`, `ui/select.tsx`, `ui/textarea.tsx` — Custom UI controls
  - **/lib**
    - `utils.ts` — Utility functions (expandable for future logic)
  - **/public**
    - Static images and svgs (e.g., logos, icons)
  - **/utils**
    - **/supabase**
      - `client.ts`, `middleware.ts`, `server.ts` — Supabase configuration and helpers
  - `.env.local` — Contains **Supabase** URL and Anon Key for API access

---

## Tech Stack

- **Next.js** (React 19)
- **TypeScript**
- **Supabase** (for authentication and real-time database)
- **Tailwind CSS** (UI)
- **Lucide React** (Icons)
- **Radix UI** (Accessible UI Primitives)

---

## Development & Scripts

Common scripts (see `my-app/package.json`):

"scripts": {
"dev": "next dev --turbopack",
"build": "next build",
"start": "next start",
"lint": "next lint"
}

text

- **Run in dev mode:** `npm run dev`
- **Production build:** `npm run build && npm run start`
- **Linting:** `npm run lint`

---

## Configuration

- Required environment variables (see `.env.local`):

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

text

---

## Contributing

Pull requests and issues are welcome! Please fork the repo and create a branch for your feature or bugfix.

---

## Credits

- Created by the [Michigan Data Science Team](https://github.com/MichiganDataScienceTeam).
- Primary contributors: [shivachandran04](https://github.com/shivachandran04), [Vatsal2006350](https://github.com/Vatsal2006350), [danielwanggit](https://github.com/danielwanggit).
