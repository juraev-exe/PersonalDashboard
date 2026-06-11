Build a complete personal productivity dashboard web application called "LifeOS".



Goal:

Create a modern, fast, responsive dashboard that acts as my personal operating system. It should track my study sessions, Pomodoro history, habits, prayers, projects, goals, tasks, and productivity analytics. The design should feel similar to GitHub, Linear, Notion, and modern SaaS dashboards.



Tech Stack:



React

TypeScript

Vite

Tailwind CSS

shadcn/ui

React Router

Recharts

react-calendar-heatmap

Supabase (database and authentication)

TanStack Query

Framer Motion

Lucide Icons



Design Requirements:



Modern dark theme by default

Responsive desktop and mobile layout

Smooth animations

Glassmorphism and clean card-based UI

Fast loading

Sidebar navigation

Dashboard overview page

Accessibility support

Keyboard shortcuts



Main Layout:



Left Sidebar:



Dashboard

Pomodoro

Tasks

Habits

Prayers

Projects

Calendar

Notes

Analytics

Settings



Top Navigation:



Current date

Current time

Search bar

Notifications

User profile



Dashboard Home:



Display:



Welcome section

Daily quote

Today's progress

Focus hours today

Pomodoro sessions completed

Tasks completed

Current streak

Habit completion percentage

Prayer completion percentage



Show cards for:



Today's tasks

Active projects

Upcoming deadlines

Calendar events

Recent notes



Pomodoro System:



Features:



Start

Pause

Resume

Stop

Skip break

Auto-start breaks

Auto-start focus sessions

Sound notifications



Timer Modes:



25/5

50/10

90/20

Custom mode



Each completed session must store:



Date

Start time

End time

Duration

Category

Notes



Categories:



Cybersecurity

Programming

University

IELTS

Reading

Research

Personal



Pomodoro Analytics:



Daily sessions

Weekly sessions

Monthly sessions

Total focus hours

Average focus duration

Longest streak



GitHub Style Heatmap:



Create a full-year contribution graph similar to GitHub.



Track:



Pomodoro sessions

Tasks completed

Habits completed

Prayers completed

Study hours



Color Levels:



Level 0 = No activity

Level 1 = Light activity

Level 2 = Medium activity

Level 3 = High activity

Level 4 = Very high activity



When clicking a day:

Show:



Date

Focus time

Tasks completed

Habits completed

Prayers completed

Notes

Productivity score



Tasks Module:



Task Features:



Create task

Edit task

Delete task

Complete task

Priority levels

Due dates

Categories

Recurring tasks



Task Categories:



Study

University

Cybersecurity

Programming

Business

Personal



Task Status:



Todo

In Progress

Completed



Support:



Kanban board

List view

Calendar view



Habit Tracker:



Create habits with:



Name

Icon

Frequency

Daily target



Default Habits:



Read

Exercise

Water

Sleep

Study



Track:



Streaks

Completion percentage

Weekly trends

Monthly trends



Prayer Tracker:



Five Daily Prayers:



Fajr

Dhuhr

Asr

Maghrib

Isha



Features:



Mark completed

Daily completion percentage

Weekly reports

Monthly reports

Prayer streaks



Optional:



Automatic prayer times based on location

Notifications before prayer



Projects Module:



Each project contains:



Title

Description

Progress percentage

Deadline

Status

Technologies used

GitHub repository link



Statuses:



Planning

Active

Completed

Archived



Show:



Project progress bars

Recent commits

Activity timeline



Calendar Module:



Display:



Monthly calendar

Weekly calendar

Daily agenda



Include:



Tasks

Exams

Deadlines

Events

Study plans



Notes Module:



Features:



Rich text editor

Markdown support

Tags

Search

Pin notes

Archive notes



Analytics Page:



Charts:



Daily focus hours

Weekly focus hours

Monthly focus hours

Task completion trends

Habit completion trends

Prayer completion trends



Show:



Total focus hours

Total completed tasks

Longest productivity streak

Most productive day

Most productive category



Gamification:



Experience System:



Earn XP for completed Pomodoros

Earn XP for completed tasks

Earn XP for completed habits

Earn XP for completed prayers



Levels:



Display current level

Display XP progress bar

Unlock achievements



Achievements Examples:



First Pomodoro

7 Day Streak

30 Day Streak

100 Hours Focused

100 Tasks Completed



Settings:



Allow users to:



Change theme

Change timer durations

Configure notifications

Export data

Import data

Backup data



Database Schema:



Create complete Supabase tables for:



users

pomodoro\_sessions

tasks

habits

habit\_logs

prayers

prayer\_logs

projects

notes

calendar\_events

achievements

user\_statistics



Additional Requirements:



Use clean architecture

Use reusable components

Use TypeScript types everywhere

Use modern React patterns

Create loading states

Create empty states

Create error handling

Create responsive design

Create production-ready code

Include Supabase migrations

Include authentication

Include dashboard seed data

Include full documentation

Include installation instructions

Include deployment instructions



Generate the entire application structure, folder hierarchy, database schema, components, pages, hooks, services, API integration, and implementation code needed for a production-ready application.

