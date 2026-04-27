# Content Broadcasting System

A backend system for managing and broadcasting educational content in schools. Teachers upload content with scheduling information, principals approve it, and the system dynamically broadcasts content based on rotation cycles.

## Overview

This system handles the complete workflow for educational content broadcasting:

- Teachers upload content files (images/PDFs) with subject, title, and broadcast schedule
- Principals review and approve/reject submitted content
- Approved content is automatically broadcast during scheduled time windows
- Multiple content items in the same subject rotate based on configured durations
- Public APIs provide live content feeds for display systems

## Features

- **JWT Authentication** - Secure token-based authentication for users
- **Role-Based Access Control** - Separate permissions for teachers and principals
- **Content Upload with Scheduling** - Teachers define broadcast times and rotation duration at upload
- **Approval Workflow** - Principals can approve or reject content with reasons
- **Dynamic Rotation Engine** - Automatically cycles through content based on duration settings
- **Public Live Feed APIs** - No authentication required for accessing broadcast content
- **IST Timezone Support** - All scheduling uses Indian Standard Time

## Tech Stack

- Node.js + Express
- MySQL + Sequelize ORM
- JWT for authentication
- Multer for file uploads
- bcrypt for password hashing

## Setup Instructions

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a MySQL database:

```sql
CREATE DATABASE content_broadcasting_db;
```

3. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

4. Start the server:

```bash
# Development
npm run dev

# Production
npm start
```

The server will run on `http://localhost:5000` by default.

## Environment Variables

Create a `.env` file with these variables:

```
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=content_broadcasting_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

MAX_FILE_SIZE=10485760
```

## Key API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user (teacher/principal)
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile

### Content Management (Teacher)

- `POST /api/content/upload` - Upload content with file and schedule
- `GET /api/content/my-uploads` - View own uploaded content

### Content Review (Principal)

- `GET /api/content/pending` - View pending content
- `PUT /api/content/:id/approve` - Approve content
- `PUT /api/content/:id/reject` - Reject content with reason

### Public Broadcast Feed

- `GET /api/content/live` - Get currently broadcasting content
- `GET /api/content/live/:teacherId` - Get live content by teacher
- `GET /api/content/feed/:subject` - Get live content by subject

See `API_DOCUMENTATION.md` for detailed endpoint specifications.

## How the Flow Works

1. **Teacher uploads content**
   - Provides title, subject, description, and file
   - Sets start_time, end_time, and rotation_duration
   - Content status is set to "pending"

2. **Principal reviews content**
   - Views all pending submissions
   - Can approve (status → "approved") or reject with reason
   - Only approved content can be broadcast

3. **System broadcasts content**
   - When current time falls within start_time and end_time window
   - If multiple content items exist for same subject, rotation engine activates
   - Calculates which item should broadcast based on rotation cycle
   - Public APIs return only the currently active content

### Rotation Logic Example

If a subject has 3 approved content items with durations 5, 5, and 10 minutes:

- Total cycle: 20 minutes
- Minutes 0-5: Item 1 broadcasts
- Minutes 5-10: Item 2 broadcasts
- Minutes 10-20: Item 3 broadcasts
- Cycle repeats continuously

## Assumptions

- All datetime inputs without timezone are treated as IST (UTC+5:30)
- Teachers can only view their own uploaded content
- Principals can view and manage all content
- File uploads are limited to PNG, JPEG, JPG, and PDF (max 10MB)
- Content must be approved before it can be broadcast
- Rotation order is automatically assigned based on upload sequence

## Future Improvements

- Add content analytics and view tracking
- Implement content expiration and archival
- Add support for video files
- Create admin dashboard for system monitoring
- Add email notifications for approval/rejection

---

For detailed API documentation, see `API_DOCUMENTATION.md`.
