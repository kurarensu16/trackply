# Trackply: The Ultimate Career Growth & Job Search Tracker

Trackply is a premium, AI-powered job application tracker designed to streamline your career search. Built with a focus on high-performance aesthetics and developer-grade functionality, it helps you organize your pipeline, optimize your profile with AI, and prepare for interviews—all in one place.

## Key Features

### Professional Pipeline Management
* Kanban Board: A fluid, drag-and-drop pipeline to track status from "Saved" to "Offer".
* Mobile-First Design: A fully responsive interface with a dedicated tabbed mobile view for the pipeline.
* Activity Timeline: Automatically log dates, stage changes, and notes for every application.

### AI-Powered Insights (Powered by Groq)
* Smart JD Summarizer: Instantly extract key responsibilities and required skills from job URLs or descriptions.
* Skill Gap Analysis: Compare your profile against job requirements to see exactly where you stand.
* AI Interview Coach: Generate tailored interview questions, rationales, and suggested talking points based on the specific job and your resume.
* Custom AI Personas: Tune the AI's "Strictness" and "Tone" to match your preferred interview prep style.

### Integrated Resume Builder
* Live Preview: Edit your profile and watch your resume update in real-time with professional templates (Modern, Harvard).
* PDF Export: High-fidelity print support to download your resumes instantly.
* Profile-Aware AI: Your AI insights are automatically contextualized by your stored profile data.

### Proactive Notifications & Alerts
* Daily Reminders: Automatic notifications for upcoming interviews.
* Staleness Tracking: Nudges for applications that haven't been updated in 14 days.
* Integrated Dropdown: A sleek, interactive notification drawer in the TopBar.

### Premium Aesthetics & Customization
* Dark Mode & Glassmorphism: A stunning, modern interface with real-time theme switching.
* Custom Accent Colors: Personalize the entire app's primary color via Settings.
* Ultra-Responsive: Optimized for everything from ultrawide monitors to smartphones.

### Data Privacy & Management
* Full Data Export: Download your entire workspace in JSON or CSV format at any time.
* Permanent Erasure: One-click workspace scrubbing for total user control over data.

## Tech Stack

* Frontend: React, TypeScript, Vite, Tailwind CSS
* Backend & DB: Convex (Real-time database, File Storage, Crons)
* Authentication: Clerk / Convex Auth
* AI Engine: Groq API (Llama3-70b/8b)
* Icons & UI: Lucide React, Framer Motion

---

### Getting Started

1. Clone the repo: `git clone https://github.com/your-username/trackply.git`
2. Install dependencies: `npm install`
3. Environment Setup: Create a `.env.local` with your `CONVEX_DEPLOYMENT` and `GROQ_API_KEY`.
4. Run Dev Server: `npm run dev` and `npx convex dev` in parallel.

---

*Built for job seekers who want a competitive edge.*
