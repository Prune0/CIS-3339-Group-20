# API Contracts: S1 (Security) and B1 (Event Registration)

These are the responses the frontend expects from the backend. The frontend side is built (Sprint 2); the backend needs to return exactly these shapes when S1 and B1 are implemented (Sprint 3).

## Error responses (all routes)

The Axios response interceptor in `frontend/src/api/api.js` turns every error into one message string:

| Status | When | Body the frontend expects | What the user sees |
| --- | --- | --- | --- |
| `401` | No token, or token invalid/expired (`requireAuth`) | any | Logged out and sent to `/login` |
| `403` | Logged in, but not an editor (`requireRole('editor')`) | any | "You don't have permission to do that. Editor access is required." |
| `404` | Record doesn't exist, **or belongs to another organization** | `{ "error": "Event not found" }` | The `error` text |
| `400` / `500` | Validation or server error | `{ "error": "Human readable message" }` (B2 shape) | The `error` text |
| none | Backend unreachable | — | "Unable to reach the server" |

For organization isolation, a record from another organization should return `404`, not `403`. That way the response doesn't reveal that the record exists.

## Who can call what (S1)

| Operation | Viewer | Editor |
| --- | --- | --- |
| Read clients, events, services | ✅ | ✅ |
| Create, update, delete clients, events, services | `403` | ✅ |
| Register / deregister a client for an event | `403` | ✅ |

The frontend only lets the exact role `editor` change data (`isEditor` getter in `frontend/src/store/loggedInUser.js`). Every other role is read-only. This is for the UI only; the backend must enforce the same rule.

## Register and deregister (B1)

Existing routes, unchanged:

```
PUT /events/register?event=<eventId>&client=<clientId>
PUT /events/deregister?event=<eventId>&client=<clientId>
```

| Situation | Status | Body |
| --- | --- | --- |
| Registered successfully | `200` | the created/updated record (or a success string) |
| Client already registered | `200` | `{ "message": "Already registered" }` |
| Deregistered successfully | `200` | the removed/updated record (or a success string) |
| Client wasn't registered | `200` | `{ "message": "Not registered" }` |
| Client or event missing, or in another organization | `404` | `{ "error": "..." }` |
| Not an editor | `403` | any |

The two `message` strings must match exactly, since the frontend checks for them. `registerAttendee()` and `deregisterAttendee()` in `api.js` turn every reply into `{ changed, message }`:

- `changed: true`: shown as a success toast
- `changed: false` ("Already registered" / "Not registered"): shown as an info toast, not an error

The current backend still returns plain strings (for example `"Client deregistered with event"`). The frontend accepts those too, so nothing breaks before the backend is updated.
