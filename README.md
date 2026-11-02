# English Yaari Session Booking API

REST API where teachers create sessions, users book them, and completed sessions show up in the user's history.

Built with Node.js, TypeScript, Express.js, MongoDB and Mongoose.

## Requirements

- Node.js 20 or newer
- MongoDB 5.0 or newer (local or MongoDB Atlas)

## Setup

```bash
git clone https://github.com/bikash1376/english-yaari.git
cd english-yaari
npm install
cp .env.example .env
```

Edit `.env`:

| Variable      | Description                                               | Default |
| ------------- | --------------------------------------------------------- | ------- |
| `PORT`        | Port the server listens on                                | `3000`  |
| `MONGODB_URI` | MongoDB connection string (required)                      |         |
| `TIMEZONE`    | IANA timezone used to decide what "a date" means, for example `UTC` or `Asia/Kolkata` | `UTC` |

## Run

Development, with reload:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

Health check: `GET http://localhost:3000/health`

### Troubleshooting

If startup fails with `querySrv ECONNREFUSED`, your DNS resolver is blocking the SRV lookup that `mongodb+srv://` strings need. Use the standard connection string instead. In Atlas, open Connect, then Drivers, and pick the older driver version to get it. It looks like:

```
mongodb://<user>:<password>@host1:27017,host2:27017,host3:27017/english-yaari?tls=true&authSource=admin&replicaSet=<replicaSetName>
```

## Project Structure

```
src/
  config/        environment and database connection
  models/        Mongoose schemas (User, Teacher, Session)
  validators/    request validation with Zod
  services/      business logic and aggregation pipelines
  controllers/   request and response handling
  routes/        Express routers
  middlewares/   centralized error handler and 404 handler
  utils/         AppError class
  app.ts         Express app
  server.ts      entry point
```

## Response Format

Success:

```json
{ "success": true, "data": {} }
```

Error:

```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "email must be a valid email" }] }
```

## APIs

Dates in request bodies can be an ISO string (`2026-12-01T10:00:00.000Z`) or a timestamp in milliseconds (`1796119200000`).

### Create User

`POST /users`

```json
{ "fullName": "Asha Rao", "email": "asha@example.com", "phone": "+91 9876543210" }
```

- `201` user created
- `400` invalid input
- `409` email already exists

### Create Teacher

`POST /teachers`

This endpoint is not in the assignment list. It is included so sessions can be created without inserting teachers by hand.

```json
{ "fullName": "Ravi Kumar", "email": "ravi@example.com", "specialization": "Spoken English", "experience": 5 }
```

- `201` teacher created
- `400` invalid input
- `409` email already exists

### Create Session

`POST /sessions`

```json
{ "teacherId": "<teacherId>", "startTime": "2026-12-01T10:00:00.000Z", "endTime": "2026-12-01T11:00:00.000Z" }
```

- `201` session created with status `AVAILABLE`
- `400` invalid input, or `endTime` is not greater than `startTime`
- `404` teacher not found

### Available Sessions for Booking

`GET /sessions/available?dateTimestamp=1796119200000`

`dateTimestamp` is a timestamp in milliseconds. Any time within the day works. Returns every `AVAILABLE` session whose `startTime` falls on that date (in `TIMEZONE`), sorted by `startTime`, with teacher details. Built with the MongoDB aggregation pipeline.

- `200` list of sessions
- `400` missing or invalid `dateTimestamp`

### Book Session

`POST /sessions/:id/book`

```json
{ "userId": "<userId>" }
```

- `200` session is now `BOOKED` and linked to the user
- `400` invalid id
- `404` user or session not found
- `409` session is already booked, or is not `AVAILABLE`

Booking is atomic. If two users try to book the same session at the same time, only one succeeds and the other gets `409`.

### Mark Session Complete

`PATCH /sessions/:id/complete`

- `200` session is now `COMPLETED` and `completedAt` is set
- `400` invalid id
- `404` session not found
- `409` session is not `BOOKED`

### User Session List

`GET /users/:id/sessions`

Built with the MongoDB aggregation pipeline (`$match`, `$lookup`, `$facet`).

```json
{
  "success": true,
  "data": {
    "upcomingSessions": [],
    "completedSessions": []
  }
}
```

- `upcomingSessions`: the user's `BOOKED` sessions, soonest first
- `completedSessions`: the user's `COMPLETED` sessions, most recently completed first
- `200` sessions returned
- `400` invalid id
- `404` user not found

## Testing with Postman or Bruno

The collection is at `postman/english-yaari.postman_collection.json`.

- Postman: Import, then select the file.
- Bruno: Import Collection, choose Postman Collection, then select the file.

Set the `baseUrl` collection variable if the server is not on `http://localhost:3000`, then run the requests from top to bottom. Each request saves the ids it creates (`userId`, `teacherId`, `sessionId`, `dateTimestamp`) so the next request can use them.
