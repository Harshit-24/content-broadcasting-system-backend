# API Documentation

Base URL: `http://localhost:5000`

All endpoints return JSON in this format:

```json
{
  "success": true/false,
  "message": "Description",
  "data": {...}
}
```

---

## Authentication

### Register User

**POST** `/api/auth/register`

**Access:** Public

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "teacher"
}
```

**Purpose:** Create a new user account. Role must be either "teacher" or "principal".

---

### Login

**POST** `/api/auth/login`

**Access:** Public

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Purpose:** Authenticate and receive JWT token. Use the token in Authorization header for protected routes.

**Response includes:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get Current User

**GET** `/api/auth/me`

**Access:** Authenticated

**Headers:**

```
Authorization: Bearer <token>
```

**Purpose:** Get profile information of currently logged-in user.

---

## Teacher Content

### Upload Content

**POST** `/api/content/upload`

**Access:** Teacher only

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**

- `title` (required) - Content title
- `subject` (required) - Subject name
- `description` (optional) - Content description
- `start_time` (required) - Broadcast start time (ISO 8601, treated as IST if no timezone)
- `end_time` (required) - Broadcast end time (ISO 8601)
- `rotation_duration` (optional) - Duration in minutes (default: 5)
- `file` (required) - File upload (PNG, JPEG, JPG, or PDF, max 10MB)

**Purpose:** Upload content with scheduling information. Content status is set to "pending" and requires principal approval.

**Example:**

```bash
curl -X POST http://localhost:5000/api/content/upload \
  -H "Authorization: Bearer <token>" \
  -F "title=Math Lesson 1" \
  -F "subject=Mathematics" \
  -F "description=Introduction to Algebra" \
  -F "start_time=2026-04-28T09:00:00" \
  -F "end_time=2026-04-28T17:00:00" \
  -F "rotation_duration=10" \
  -F "file=@/path/to/file.pdf"
```

---

### View My Uploads

**GET** `/api/content/my-uploads`

**Access:** Teacher only

**Headers:**

```
Authorization: Bearer <token>
```

**Purpose:** View all content uploaded by the logged-in teacher.

---

## Principal Review

### View Pending Content

**GET** `/api/content/pending`

**Access:** Principal only

**Headers:**

```
Authorization: Bearer <token>
```

**Purpose:** View all content awaiting approval, sorted oldest first (FIFO).

---

### Approve Content

**PUT** `/api/content/:id/approve`

**Access:** Principal only

**Headers:**

```
Authorization: Bearer <token>
```

**Purpose:** Approve pending content. Only content with status "pending" can be approved. Changes status to "approved" and records approver details.

---

### Reject Content

**PUT** `/api/content/:id/reject`

**Access:** Principal only

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "rejection_reason": "Content quality does not meet standards. Please revise."
}
```

**Purpose:** Reject pending content with a reason. Only content with status "pending" can be rejected. Rejection reason must be 10-1000 characters.

---

## Public Broadcast APIs

These endpoints do not require authentication and apply dynamic rotation logic. When multiple approved content items exist for the same subject within the active time window, only the currently broadcasting item (based on rotation cycle) is returned.

### Get Live Content

**GET** `/api/content/live`

**Access:** Public

**Purpose:** Get currently broadcasting content across all subjects. Returns one active item per subject based on rotation cycle.

---

### Get Live Content by Teacher

**GET** `/api/content/live/:teacherId`

**Access:** Public

**URL Parameters:**

- `teacherId` - User ID of the teacher

**Purpose:** Get currently broadcasting content uploaded by a specific teacher. Applies rotation logic if multiple items are active.

---

### Get Content Feed by Subject

**GET** `/api/content/feed/:subject`

**Access:** Public

**URL Parameters:**

- `subject` - Subject name (e.g., "Mathematics", "Science")

**Purpose:** Get currently broadcasting content for a specific subject. Returns the active item in the rotation cycle.

---

### Get All Broadcast-Ready Content

**GET** `/api/content/broadcast-ready`

**Access:** Public

**Purpose:** Get all approved and scheduled content regardless of current time. Does not apply rotation logic - returns full list.

---

## Utility

### Get Content by ID

**GET** `/api/content/:id`

**Access:** Authenticated (Teachers can only view their own content)

**Headers:**

```
Authorization: Bearer <token>
```

**Purpose:** Get detailed information about a specific content item.

---

## Response Examples

### Success Response

```json
{
  "success": true,
  "message": "Content uploaded successfully",
  "data": {
    "id": 1,
    "title": "Math Lesson 1",
    "subject": "Mathematics",
    "status": "pending",
    "start_time": "2026-04-28T09:00:00.000Z",
    "end_time": "2026-04-28T17:00:00.000Z",
    "uploader": {
      "id": 2,
      "name": "John Doe",
      "role": "teacher"
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Title is required",
  "data": null
}
```

---

## Notes

- All datetime values without timezone suffix are treated as IST (Asia/Kolkata, UTC+5:30)
- JWT tokens expire after 7 days (configurable)
- File uploads are stored in `src/uploads/` directory
- Rotation cycle starts from the earliest start_time among content items in the same subject
- Content must be approved before it appears in live broadcast feeds
- Teachers can only upload content, not approve it
- Principals cannot upload content, only review and approve/reject

---

## Testing Flow

1. Register a teacher and a principal account
2. Login as teacher and save the token
3. Upload content with scheduling information
4. Login as principal and save the token
5. View pending content and approve it
6. Access public live feed to see currently broadcasting content

For detailed setup instructions, see `README.md`.
