# WorkFlowX

### Smart Field Service & Task Management Platform

A full-stack, production-style mobile application for managing field service teams - built with React Native, Express, TypeScript, PostgreSQL, and Prisma.

---

## Problem

Companies with field workers (AC repair, electrical services, cleaning, delivery, maintenance) often rely on WhatsApp, Excel spreadsheets, and phone calls to coordinate their teams. This leads to lost information, poor accountability, and no visibility into real-time operations.

**WorkFlowX centralizes the entire workflow** - task assignment, employee tracking, customer management, attendance, and reporting - into one platform.

---

## Features

### Authentication & Authorization
- JWT-based authentication with access + refresh token rotation
- Role-based access control (Admin, Manager, Employee)
- Secure password hashing (bcrypt)
- Persistent sessions with secure token storage

### Employee Management
- Full CRUD for employees with role assignment
- Deactivation (soft delete) preserving historical data

### Customer Management
- Full CRUD with GPS location capture
- Search and filtering

### Task Management (Core Feature)
- Complete task lifecycle: Pending -> Assigned -> Accepted -> In Progress -> Completed
- Full status history audit trail
- Task assignment with priority levels
- Automatic duration tracking

### Attendance
- GPS-verified check-in/check-out
- Automatic working-hours calculation
- One check-in per day enforcement

### Maps & Location Tracking
- Customer location shown on interactive maps (OpenStreetMap via Leaflet - free, no API key required)
- Live team map showing active employee locations for managers
- Privacy-conscious: location only recorded during active work periods

### Photo Uploads
- Before/during/after task photos
- Cloudinary integration for cloud image storage
- File type and size validation

### Notifications
- In-app notification system
- Automatic alerts on task assignment and completion
- Unread count badge

### Analytics Dashboard
- Real-time stats: active tasks, completion rate, overdue tasks
- Visual charts (pie chart breakdown by status)
- Employee performance overview

### Audit Logs
- Tracks sensitive actions (employee creation, task cancellation, etc.)
- Full metadata capture for accountability

---

## Tech Stack

**Mobile**
- React Native + Expo (SDK 57)
- TypeScript
- React Navigation
- TanStack Query (server state management)
- React Hook Form + Zod (form validation)
- Axios (with automatic token refresh interceptors)
- Expo Secure Store (encrypted token storage)
- Expo Location + Expo Image Picker
- React Native WebView (for Leaflet map rendering)

**Backend**
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication
- bcrypt password hashing
- Zod validation
- Multer + Cloudinary (image uploads)
- express-rate-limit + Helmet (security)

---

## Architecture

Monorepo structure:

WorkFlowX/
mobile/ - React Native (Expo) application
server/ - Express + TypeScript REST API
docs/ - Documentation

Multi-tenant design: every resource (users, tasks, customers) is scoped to a `Company`, ensuring complete data isolation between organizations sharing the platform.

---

## Database Schema

Key models: `Company`, `User`, `Customer`, `Task`, `TaskStatusHistory`, `Attendance`, `LocationTracking`, `TaskAttachment`, `Notification`, `AuditLog`

Full schema defined in `server/prisma/schema.prisma`.

---

## Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL
- Expo Go app (for testing on physical device)

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file (see `.env.example` for required variables):

PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/workflowx"
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Run migrations and start the server:
```bash
npx prisma migrate dev
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your device. Update the API base URL in `mobile/src/api/client.ts` to match your computer's local IP address.

---

## API Overview

| Category | Endpoints |
|---|---|
| Auth | `/api/auth/register`, `/login`, `/refresh`, `/me` |
| Employees | `/api/employees` (CRUD) |
| Customers | `/api/customers` (CRUD) |
| Tasks | `/api/tasks` (CRUD + assign + status transitions) |
| Attendance | `/api/attendance/check-in`, `/check-out`, `/me` |
| Location | `/api/location`, `/employees`, `/task/:taskId` |
| Attachments | `/api/attachments/tasks/:taskId` |
| Notifications | `/api/notifications`, `/:id/read` |
| Analytics | `/api/analytics/dashboard` |
| Audit Logs | `/api/audit-logs` |

---

## Security

- All endpoints protected by JWT authentication
- Role-based authorization on sensitive routes
- Rate limiting on authentication endpoints (10 attempts/15min)
- Input validation on every endpoint via Zod
- Multi-tenant data isolation enforced at the query level
- Passwords hashed with bcrypt, never stored in plain text
- Secrets managed via environment variables, never committed
- CORS and Helmet security headers configured
- Global error handling prevents information leakage

---

## Live Deployment

Backend API: https://workflowx-api-reh0.onrender.com/api/health
Database: PostgreSQL hosted on Neon
Note: Free-tier hosting spins down after inactivity; first request may take a few seconds to wake up.

## Planned Enhancements

The following are documented as future work:
- EAS mobile app builds for app store distribution
- Real-time updates via Socket.IO (live task/comment updates)
- Push notifications (device-level alerts via Expo push service)
- Issue reporting workflow for field employees

---

## Screenshots

(Add screenshots of key screens here - Login, Dashboard, Task Detail with map, Analytics)

---

## Author

Built by Mayuri Shinde as a full-stack portfolio project demonstrating React Native, Express, PostgreSQL, and modern mobile/backend architecture patterns.