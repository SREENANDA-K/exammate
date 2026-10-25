# ExamMate Java backend

This is a Spring Boot / Java replacement service for the existing Express backend. It uses the database referenced by the existing `DATABASE_URL` and the same `/api` route prefix. The React frontend and original `backend/` project remain unchanged.

## Run

Requires Java 17+ and Maven. From this directory:

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST:5432/DATABASE"
$env:JWT_SECRET = "use-the-same-secret-as-the-current-backend"
mvn spring-boot:run
```

The service accepts the existing SQLite `DATABASE_URL` (`file:./dev.db`) as well as PostgreSQL URLs, and also supports `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`. Set `PORT` to change the default port (5000). `UPLOAD_DIR` defaults to `../backend/uploads` so uploaded PDFs are shared with the current backend.

## API coverage

The Java service includes health, registration/login/JWT authentication, profile, syllabus upload and structure editing, topic management, exams, timetable generation and session state updates, progress, notifications, and PDF uploads. It targets the existing Prisma PostgreSQL tables; it does not create or migrate the database schema. The same `JWT_SECRET` is required so existing tokens remain valid during a backend switch.

Start the Java service on port 5000 for local Vite proxy use, or point the frontend's existing `VITE_API_URL` deployment setting at the Java service. Keep the Node service available until the Java service has been built and exercised against a non-production database.
