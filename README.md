# OneHaven Caregiver API

Real-time caregiver management API for managing protected members (children, seniors, etc.).

## Tech Stack

- **Runtime**: Node.js with Express
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Supabase Auth
- **Real-time**: Socket.io
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI

## Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/onehaven-caregiver-api.git
cd onehaven-caregiver-api
```

2. Install dependencies:
```bash
npm install
```

3. Create logs directory:
```bash
mkdir logs
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Configure environment variables in `.env`:
```
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/onehaven
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
```

6. Supabase Setup:
   - Go to Supabase Dashboard > Authentication > Providers > Email
   - Disable "Confirm email" for development/testing

7. Start the server:
```bash
npm run dev
```

8. Test with seed script:
```bash
npm run seed
```

## API Endpoints

### Caregivers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/caregivers/signup` | Register new caregiver | No |
| POST | `/api/caregivers/login` | Login and get Supabase access token| No |
| GET | `/api/caregivers/me` | Get current profile | Yes |

### Protected Members

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/protected-members` | Create member | Yes |
| GET | `/api/protected-members` | List all members | Yes |
| PATCH | `/api/protected-members/:id` | Update member | Yes |
| DELETE | `/api/protected-members/:id` | Delete member | Yes |

### Documentation & Testing

- Swagger UI: `http://localhost:3000/docs`
- Health Check: `http://localhost:3000/health`
- Postman Collection: Import `postman_collection.json` into Postman

## Architecture

```
src/
├── config/
│   ├── database.js      # MongoDB connection
│   ├── supabase.js      # Supabase client
│   └── swagger.js       # API documentation
├── middleware/
│   ├── auth.js          # Supabase token verification
│   ├── validate.js      # Zod validation
│   └── rateLimiter.js   # Rate limiting
├── modules/
│   ├── caregivers/
│   └── protected-members/
├── validators/
├── socket/
├── utils/
└── app.js
```

## Design Decisions

### Authentication
- Supabase Auth handles user registration, login
- Passwords managed by Supabase (not stored in MongoDB)
- MongoDB stores caregiver profile linked by `supabaseId`

### Data Access Control
- Caregivers can only access their own protected members
- Every query filters by `caregiverId` from authenticated user

### Real-time Events
- Socket.io broadcasts events on member changes
- Events: `member_added`, `member_updated`, `member_deleted`

## Event Flow

```
1. Caregiver authenticates via Supabase
2. Caregiver creates/updates/deletes a protected member
3. Server saves to MongoDB
4. Server emits Socket.io event
5. Event logged to console:

[2025-10-31 12:30:55] EVENT: member_added — { caregiverId: "abc", memberId: "xyz" }
```

## Seed Script

Demonstrates concurrent member creation:

```bash
npm run seed
```

## Security Features

- Rate Limiting: 100 req/15min (API), 10 req/15min (auth)
- Input Validation: Zod schemas
- Supabase tokens
- Data Isolation: Users access only their own data

## Bonus Features Implemented

- API rate limiting with `express-rate-limit` (global + auth-specific limits)
- Swagger/OpenAPI docs available at `/docs`
- RBAC-style ownership enforcement (caregivers can only access their own protected members)
- Postman collection included (`postman_collection.json`)

## AI Usage Summary

I used AI tools (Claude) during development for:

- Setting up Mongoose models based on the PDF requirements
- Writing Zod validation schemas for request data
- Debugging Supabase Auth integration issues
- Looking up Socket.io and Express syntax

The project structure, design decisions, and testing were done by me. I followed the PDF specifications and used AI to speed up implementation.
