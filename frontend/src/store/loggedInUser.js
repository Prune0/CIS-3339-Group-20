
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { loginUser, logoutUser, restoreAuthSession } from '../api/api'

const toast = useToast()

// F4: Keep the expiration timer outside Pinia's reactive state.
let expirationTimer = null
const MAX_TIMEOUT_MS = 2147483647

export const useLoggedInUserStore = defineStore({
  id: 'loggedInUser',

  state: () => ({
    name: "",
    role: "",
    isLoggedIn: false
  }),

  // S1: Allowlist check. Only the exact role 'editor' can change data.
  // Any other value (viewer, a typo, an empty or unknown role) is read-only,
  // so a new role added on the backend can't accidentally get write access.
  getters: {
    isEditor: (state) => state.isLoggedIn && state.role === 'editor'
  },

  actions: {
    // F4: Restore saved login and validate the JWT.
    restoreSession() {
      const decodedToken = restoreAuthSession()

      if (!decodedToken) {
        this.clearSessionState()
        return
      }

      this.$patch({
        isLoggedIn: true,
        role: decodedToken.role,
        name: decodedToken.name || ''
      })

      this.scheduleTokenExpiration(decodedToken.exp)
    },

    // F4: Automatically check the token when it expires.
    scheduleTokenExpiration(exp) {
      if (expirationTimer !== null) {
        clearTimeout(expirationTimer)
        expirationTimer = null
      }

      const remainingMs = exp * 1000 - Date.now()

      if (remainingMs <= 0) {
        this.clearSession()
        return
      }

      expirationTimer = setTimeout(() => {
        // Recheck the saved token, then update login state.
        this.restoreSession()

        // If the session expired while viewing a protected
        // page, return the user to the login screen.
        if (
          !this.isLoggedIn &&
          this.$router.currentRoute.value.meta.requiresAuth
        ) {
          this.$router.replace({
            name: 'login',
            query: {
              redirect: this.$router.currentRoute.value.fullPath
            }
          })
        }
      }, Math.min(remainingMs, MAX_TIMEOUT_MS))
    },

    clearSessionState() {
      // F4: Cancel any existing expiration timer.
      if (expirationTimer !== null) {
        clearTimeout(expirationTimer)
        expirationTimer = null
      }

      this.$patch({
        name: "",
        role: "",
        isLoggedIn: false
      })
    },

    clearSession() {
      logoutUser()
      this.clearSessionState()
    },

    async login(username, password) {
      try {
        await loginUser(username, password)

        // F4: Use the same JWT validation for new logins
        // and restored sessions.
        this.restoreSession()

        if (!this.isLoggedIn) {
          throw new Error("Login token is invalid or expired")
        }

        // F4: Return to the originally requested page.
        const redirect = this.$router.currentRoute.value.query.redirect

        const destination =
          typeof redirect === 'string' &&
          redirect.startsWith('/') &&
          !redirect.startsWith('//')
            ? redirect
            : '/'

        await this.$router.push(destination)
        toast.success("Login Successful!")

      } catch (error) {
        toast.error(error.message)
      }
    },

    logout() {
      this.clearSession()
      this.$router.push("/")
      toast.info("You have been logged out!")
    }
  }
})
