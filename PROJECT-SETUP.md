# Data Platform: Project and Setup Guide

## What this project does

This is a web app for a nonprofit organization and its Community Health Workers. Staff can keep client records, manage services, create events, register clients for events, and view dashboard summaries.

The project has two parts:

- `frontend/` is the Vue 3 website. It shows the pages and sends requests to the backend.
- `backend/` is a Node.js/Express API. It authenticates users and reads or writes data in MongoDB.

The frontend components have been migrated from the Vue Options API to the Composition API using `<script setup>`. The login session is restored from a JWT in browser `localStorage` when the app starts. Expired or unreadable tokens are discarded, and a server `401` response clears the session and redirects to login.

## Requirements

- Node.js and npm
- MongoDB Community Server running locally, or a MongoDB Atlas database
- MongoDB Compass is optional, but useful for creating and checking database records

## 1. Start MongoDB

For a local MongoDB installation on Windows, check that the service exists and start it in PowerShell (run PowerShell as Administrator if needed):

```powershell
Get-Service MongoDB
Start-Service MongoDB
```

If you use MongoDB Atlas instead, use the Atlas connection string in the backend configuration below and ensure your network/IP access is allowed.

## 2. Create and seed the database

The example local setup uses a database named `test`. In MongoDB Compass, connect to:

```text
mongodb://127.0.0.1:27017
```

Create or select the `test` database. Create two collections named `org` and `users`.

Insert this organization document into `test.org` (use Compass's JSON view/import):

```json
{
  "_id": { "$oid": "64e0380b3cc28d087655693b" },
  "name": "Community Center"
}
```

Insert these example accounts into `test.users`:

```json
[
  {
    "_id": { "$oid": "64e03e5e3cc28d0886756964" },
    "username": "john",
    "role": "viewer",
    "password": "$2b$10$QHV3SuupBrtJ4ruv9hJfAulpFMbr6hBiUfE6BPmW5jpyHYet4YRxu",
    "org": { "$oid": "64e0380b3cc28d087655693b" }
  },
  {
    "_id": { "$oid": "64e03e5e3cc28d0886756963" },
    "username": "marry",
    "role": "editor",
    "password": "$2b$10$gyLl6DC4eMAKdfP/NADo6OeLZzmOFqxzYg5Xr4FG31O8TO0WA2H0y",
    "org": { "$oid": "64e0380b3cc28d087655693b" }
  }
]
```

These are **demo-only credentials**. The passwords corresponding to these bcrypt hashes are:

- `john` (viewer): `DemoViewer-2026!`
- `marry` (editor): `DemoEditor-2026!`

Do not use these credentials in a real deployment. If the collections already contain records with the same `_id` values, do not insert duplicates; update the records or choose new ObjectIds and set `ORG_ID` to match the organization.

## 3. Configure and start the backend

Create `backend/.env` (do not commit it) with values for your database:

```env
MONGO_URL=mongodb://127.0.0.1:27017/test
PORT=3000
ORG_ID=64e0380b3cc28d087655693b
JWT_SECRET=replace-this-with-a-long-random-secret
```

For a random JWT secret, generate one locally with Node.js:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set `JWT_SECRET` to the generated value. `ORG_ID` must be the same organization `_id` used by the records in MongoDB.

Open a PowerShell terminal:

```powershell
cd D:\CIS-3339-Group-20\backend
npm install
node app.js
```

The backend should report that it is listening on port `3000` and that the database connection succeeded. Keep this terminal open.

## 4. Configure and start the frontend

Create `frontend/.env` from the example (do not commit it):

```powershell
cd D:\CIS-3339-Group-20\frontend
copy .env.example .env
```

It should contain:

```env
VITE_ROOT_API=http://localhost:3000
```

Open a second PowerShell terminal:

```powershell
cd D:\CIS-3339-Group-20\frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Log in with one of the demo accounts above. The viewer can browse authenticated areas; the editor also sees the create forms.

## Notes and troubleshooting

- If MongoDB reports `ECONNREFUSED 127.0.0.1:27017`, the local database service is stopped or unavailable. Start it, or use a reachable Atlas URI.
- If login says the username is invalid, check that `MONGO_URL` points to the database containing the `users` collection and that the username's `org` ObjectId matches `ORG_ID`.
- If login says the password is invalid, verify the typed password matches the bcrypt hash stored for that account. The original password cannot be recovered from a bcrypt hash.
- A valid token is kept in `localStorage` to survive refreshes. JavaScript running in the page can access it, so an XSS vulnerability could expose it. An `httpOnly` cookie is not readable by page JavaScript, but a cookie-based design also needs appropriate CSRF protections.
- The frontend shows create forms based on the user's role, but the backend currently checks authentication rather than enforcing editor-only permissions on write routes. Do not treat UI-only role checks as a production security boundary.
- Never commit `.env` files, real passwords, JWT secrets, MongoDB credentials, or production tokens.

## Frontend build and deployment

### Build

From `frontend/`, with `frontend/.env` set up as in step 4:

```powershell
npm run build
```

The build should exit with code 0 and write the static site to `frontend/dist/`.

`VITE_ROOT_API` is baked into `dist/` at build time, so **rebuild after changing it**. To build against a deployed backend, set it to that URL first (no trailing slash), e.g. `VITE_ROOT_API=https://<your-backend-host>`. If it is missing, the app logs `VITE_ROOT_API is not set` in the browser console.

### Check the production build locally

```powershell
npm run serve      # or: npm run preview
```

Open `http://localhost:4173`. This serves `dist/`, not the dev server, so use it for the final demo. Refreshing a nested page such as `/clientdetails/<id>` should reload that page instead of returning a 404.

### Deploy to a static host

Point the host at the `frontend` folder, use `npm run build` as the build command and `dist` as the publish directory, and set `VITE_ROOT_API` in the host's environment variables.

| Host | SPA fallback setup |
| --- | --- |
| Netlify / Cloudflare Pages | Nothing extra: `frontend/public/_redirects` (`/*  /index.html  200`) is copied into `dist/` on every build. |
| Render (Static Site) | Add a Rewrite rule: `/*` → `/index.html`. |
| Vercel | Add a rewrite of `/(.*)` to `/index.html` in `vercel.json`. |

The SPA fallback is needed because the router uses HTML5 history mode: paths like `/clientdetails/123` exist only inside the Vue app, so the host must answer unknown paths with `index.html`.

The backend's `CORS_ORIGIN` must be set to the deployed frontend's exact URL, or the browser will block API calls.

### Cross-platform notes

- Asset imports use forward slashes (`@/assets/...`) so the build works on Windows, macOS, and Linux.
- Linux build hosts are case-sensitive, so imports must match file names exactly (e.g. `eventDetails.vue`). A build that passes on Windows can still fail on the host.
- If the app is served from a subfolder, set `base` in `vite.config.js`; the router reads it through `import.meta.env.BASE_URL`.
