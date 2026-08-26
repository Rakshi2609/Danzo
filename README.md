# ⚡ Danzo - Modern Full-Stack Task & Workflow Intelligence Platform

**Danzo** is a production-grade, full-stack task and workflow management ecosystem built with the MERN stack (MongoDB, Express.js, React 19, Node.js), featuring Firebase Google Authentication, automated recurring schedule engines, daily streak tracking, WhatsApp bot dispatching, and enterprise-grade security hardening.

---

## 🚀 Key Features

### 🔐 1. Authentication & Security Hardening
- **Firebase OAuth + 7-Day JWT**: Seamless Google Sign-In with cryptographically verified ID tokens and fast 7-day signed JWT sessions.
- **DDoS & Brute-Force Rate Limiting**: Tiered rate limiters (`express-rate-limit`) protecting authentication (`/api/auth/login`), batch task mutations, cron endpoints, and global API traffic.
- **Strict Role-Based Access Control (RBAC)**: `Admin`, `Manager`, and `Member` permission layers.
- **IDOR & Data Isolation**: Comprehensive middleware verifying task ownership before edits, deletions, or status transitions.
- **Security Headers & Payload Limits**: Hardened HTTP headers via `helmet`, CORS policy isolation, and 1MB request payload guardrails.

### 🔁 2. Smart Recurring Task Automation
- **Multi-Frequency Scheduling**: Define recurring blueprints (*Daily, Weekly, Monthly*) with custom start dates, end dates, subtasks, priorities, and time slots.
- **Automated Sunday-Exclusion Engine**: Automatically skips Sundays and distributes instances forward seamlessly.
- **Template-Linked Tasks**: All generated tasks remain linked to their parent template (`recurringTaskId`) with interactive filter toggles and one-click manual generator triggers.

### 🎯 3. Task Management & Reassignment Audit Trail
- **My Tasks vs. Follow-Ups**: Dedicated workspaces for tasks assigned to you versus tasks you assigned to team members.
- **Smart Reassignment**: Reassign open tasks to any team member with an automated audit log entry appended in the task history.
- **Follow-up Subtasks & Checklists**: Interactive subtask progress tracker; prevents task completion until all required subtasks are checked.
- **Time Tracking**: Log actual start times and finish times for precise execution metrics.

### 👤 4. Profile Hub, Login Streaks & Dynamic Wallpapers
- **Daily Login Streak Counter**: Gamified attendance tracker calculating consecutive logins and all-time record streaks with interactive monthly calendar heatmaps.
- **WhatsApp Integration**: Save user contact numbers in standard E.164 format for WhatsApp bot task dispatching.
- **Dynamic Background Randomizer & Shuffle**: Randomizes aesthetic GIF/visual themes on every refresh or visit, with an instant 🎲 **Shuffle Wallpaper** button.

### 🔍 5. Real-Time Filtering & Search
- **Instant Keyword Search**: Live filtering across task titles, descriptions, assignees, creators, and tags.
- **Multi-Dimensional Filters**: Filter by Status, Priority (*Urgent, High, Medium, Low*), Type (*Regular vs. Recurring*), and Date range.
- **Timezone-Safe Moment Date Picker**: High z-index portal dropdowns ensuring zero clipping or overlay issues across all viewports.
- **Quick Pills**: One-click toggles for "Today" and "⚠️ Overdue" tasks.

### 🤖 6. Bot & External Automation API
- Secure `/api/bot` endpoints protected by `x-bot-key` for WhatsApp bot / AI assistant integrations (e.g. daily briefings, due reminders, user lookups).
- Protected `/cron/run` endpoint secured by `x-cron-secret` for serverless cron workflows.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons, React DatePicker, React Hot Toast, Canvas Confetti |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), Firebase Admin SDK, JSON Web Token (JWT) |
| **Security** | Express Rate Limit, Helmet, CORS, Token Signature Verification, RBAC |
| **PWA** | Vite PWA Plugin, Service Worker offline readiness |

---

## 📁 Project Structure

```
Danzo/
├── client/                     # React Frontend (Vite)
│   ├── public/
│   │   ├── profile/            # Animated GIF & Wallpaper collection
│   │   └── manifest.webmanifest# Progressive Web App configuration
│   ├── src/
│   │   ├── components/         # Modals, Navigation, ThemeToggle, Pagination
│   │   ├── contexts/           # AuthContext & ThemeContext
│   │   ├── pages/              # Dashboard, MyTasks, FollowUps, Profile, AdminPanel, EditTask
│   │   ├── services/           # Axios API services & Firebase Client SDK
│   │   └── index.css           # Design tokens, Dark Mode, DatePicker styles
│   └── package.json
│
└── server/                     # Express Backend API
    ├── src/
    │   ├── config/             # MongoDB, Firebase Admin, Agenda
    │   ├── controllers/        # Auth, Tasks, RecurringTasks, Users, Dashboard
    │   ├── middleware/         # Auth, TaskPermissions, RateLimiter, ErrorHandler
    │   ├── models/             # User, Task, RecurringTask, TaskUpdate
    │   ├── routes/             # REST API routes & Webhooks
    │   └── utils/              # Cron summaries & seeders
    ├── server.js               # Application Entrypoint & Middleware Pipeline
    └── package.json
```

---

## 🛡️ API & Security Matrix

### Rate Limiting Rules
- **Global API (`/api/*`)**: Max `300` requests / 15 minutes per IP.
- **Auth Endpoint (`/api/auth/login`)**: Max `30` authentication requests / 15 minutes per IP.
- **Mutations & Creations (`POST/PUT/DELETE`)**: Max `100` mutation requests / 15 minutes per IP.
- **Batch Triggers & Cron (`/cron/run`, `/api/recurring-tasks/trigger-now`)**: Max `15` requests / 15 minutes.

### Endpoints Overview

#### 🔐 Authentication & Users
- `POST /api/auth/login` - Authenticate via Firebase ID token, calculate streak, return 7-day JWT. *(Rate Limited)*
- `GET /api/auth/me` - Fetch authenticated user session.
- `GET /api/users` - List all active workspace members.
- `PATCH /api/users/profile` - Update display name and WhatsApp phone number.
- `PATCH /api/users/:id/role` - Update user permission role (*Admin only*).

#### 📋 Tasks
- `GET /api/tasks` - List tasks created by or assigned to current user.
- `GET /api/tasks/my-tasks` - Get tasks assigned to current user.
- `GET /api/tasks/follow-ups` - Get tasks created by current user for team members.
- `GET /api/tasks/:id` - Fetch single task details with creator/assignee privacy check.
- `POST /api/tasks` - Create new task. *(Rate Limited)*
- `PUT /api/tasks/:id` - Update task details (*Creator or Admin/Manager only*).
- `PATCH /api/tasks/:id/reassign` - Reassign task and append audit note.
- `PATCH /api/tasks/:id/status` - Update progress status (*Assignee only*).
- `PATCH /api/tasks/complete` - Mark complete with actual execution timestamps.
- `DELETE /api/tasks/:id` - Remove task (*Creator or Admin/Manager only*).
- `GET /api/tasks/:taskId/updates` - Fetch discussion comments and audit timeline.
- `POST /api/tasks/:taskId/updates` - Add comment (*Creator or Assignee only*).
- `POST /api/tasks/:taskId/subtasks` - Add checklist subtask.
- `PATCH /api/tasks/:taskId/subtasks/:subtaskId` - Toggle subtask completion status.
- `DELETE /api/tasks/:taskId/subtasks/:subtaskId` - Delete subtask.

#### 🔁 Recurring Tasks
- `GET /api/recurring-tasks` - List recurring templates.
- `POST /api/recurring-tasks` - Create recurring template and trigger instance generation.
- `POST /api/recurring-tasks/trigger-now` - Manually trigger batch task generation. *(Rate Limited)*
- `PUT /api/recurring-tasks/:id` - Update recurring template (*Creator or Admin only*).
- `PATCH /api/recurring-tasks/:id/toggle` - Toggle active/paused state.
- `DELETE /api/recurring-tasks/:id` - Delete recurring template.

#### 🤖 Bot & Automated Cron
- `POST /cron/run` - Trigger batch recurring tasks and daily summary digests *(Requires `x-cron-secret`)*.
- `GET /api/bot/tasks/due` - Fetch upcoming tasks within N hours *(Requires `x-bot-key`)*.
- `GET /api/bot/tasks/today` - Fetch tasks scheduled for today *(Requires `x-bot-key`)*.
- `GET /api/bot/tasks/for?phone=...` - Fetch open tasks for a user by phone *(Requires `x-bot-key`)*.

---

## ⚡ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- MongoDB instance (Local or MongoDB Atlas)
- Firebase Project with Google Authentication enabled

### 2. Environment Configuration

#### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

#### Server (`server/.env` or root `.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your_super_secret_jwt_key
CRON_SECRET=your_secure_cron_secret
BOT_API_KEY=your_hermes_or_whatsapp_bot_key

# Firebase Admin Credentials
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 3. Run Locally

```bash
# Backend
cd server
npm install
npm run dev

# Frontend (in a separate terminal)
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License
Licensed under the [MIT License](LICENSE). Built with ❤️ by [Rakshith Ganjimut](https://github.com/Rakshi2609).