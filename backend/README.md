# Team Task Manager Backend

A Node.js + Express backend for the Team Task Manager application.

## Features
- JWT authentication with `signup` and `login`
- Admin/Member role-based access control
- CRUD for projects (Admin-only for create/update/delete)
- Task creation and management with assignment
- Dashboard metrics for total projects, task statuses, and overdue tasks
- MongoDB with Mongoose schema relationships

## Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example`
3. Set the following variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Run in development mode
   ```bash
   npm run dev
   ```

## API Endpoints
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects` (Admin)
- `PUT /api/projects/:id` (Admin)
- `DELETE /api/projects/:id` (Admin)
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks` (Admin)
- `PUT /api/tasks/:id` (Admin or assigned member)
- `DELETE /api/tasks/:id` (Admin)
- `GET /api/dashboard/metrics`

## Notes
- All protected endpoints require `Authorization: Bearer <token>` header.
- Task status updates can be done by the assigned member or Admin.
