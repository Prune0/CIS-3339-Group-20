# F1: Persistent Login and Composition API Migration

This note explains the F1 frontend work in simple terms. It is separate from the existing project and setup guides.

## Login survives a refresh

Before this change, the login request saved the JWT in the browser, but the app did not read it back after a page refresh. Pinia therefore started logged out, even when a token was saved.

The F1 implementation restores the session when the app starts:

1. `main.js` creates Pinia and the router, then creates the logged-in-user store.
2. Before installing the router and mounting the app, it calls `restoreSession()`.
3. The store asks the API module to read `authToken` from `localStorage`.
4. The API module decodes the token and checks for a valid expiry time (`exp`) and role.
5. If the token passes these checks, the API module restores the Bearer `Authorization` header and the store restores the user's logged-in state, name, and role.
6. If the token is missing, malformed, expired, or lacks the required claims, the app removes it and starts logged out instead of crashing.

The related implementation is in:

- [`frontend/src/main.js`](./frontend/src/main.js) — restores the store before the router starts and installs the response handler.
- [`frontend/src/store/loggedInUser.js`](./frontend/src/store/loggedInUser.js) — stores login state and exposes restore/clear actions.
- [`frontend/src/api/api.js`](./frontend/src/api/api.js) — saves and removes the token, restores the authorization header, and handles unauthorized responses.

### What happens on a 401

The Axios response interceptor watches for HTTP `401 Unauthorized` responses. When one arrives, it removes the saved token and authorization header, clears the Pinia session, and navigates to `/login`. Other failed requests continue through the usual rejected-promise path so their callers can handle the error.

## Composition API migration

The Vue components under `frontend/src` were moved from the Options API to `<script setup>`. The templates and intended workflows were retained while component behavior moved to Composition API features:

- `data()` state became `ref()` or `reactive()` state.
- `mounted()` and `created()` lifecycle hooks became `onMounted()` where appropriate.
- `methods` became functions declared in the component script.
- Component props use `defineProps()`.
- Route access and navigation use `useRoute()` and `useRouter()`.
- Form validation continues to use Vuelidate with reactive form state.
- Chart components still render Chart.js charts from their props.

Comments in the migrated component scripts identify the Composition API conversion. The migration covers the root app, dashboard, login, client/event/service forms and list/detail views, and both chart components.

## Verification performed

- The frontend production build completed successfully with `npm run build`.
- A source scan found no remaining Options API component definitions in `frontend/src`.
- In the browser, a valid, unexpired token restored the editor state after refresh.
- Malformed and expired stored tokens were removed without a crash.
- A protected request returning `401` cleared the session and redirected to `/login`.
- The client intake form continued to show its validation messages after the migration.

The verification checks above were performed manually in the browser and with a production build; they are not a replacement for an automated test suite.

## Security considerations

The current implementation uses `localStorage` because that was the F1 requirement. Any JavaScript running on the page can read a token stored there, so a cross-site scripting (XSS) vulnerability could expose it. A more secure design can use an `httpOnly`, `Secure`, appropriately `SameSite` cookie so page JavaScript cannot directly read the JWT. Cookie-based authentication must also account for cross-site request forgery (CSRF).

Decoding a JWT in the browser only reads its claims; it does not verify the signature. The backend remains responsible for validating the JWT signature and expiry. If the server rejects a token, the `401` interceptor clears the local session.

The app's frontend hides creation links and pages based on the user's role, but the backend must also enforce role authorization for every protected write operation. UI-only role checks are not a server-side security boundary.
