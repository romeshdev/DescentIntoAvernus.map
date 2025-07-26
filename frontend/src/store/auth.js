import { defineStore } from 'pinia'
import axios from 'axios'
export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,//localStorage.getItem('token'),
        loading: false,
        error: null
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'admin'
    },
    actions: {
        async initializeAuth() {
            if (this.token) {
                this.setAuthHeader(this.token)
                try {
                    await this.fetchCurrentUser()
                } catch (error) {
                    this.logout()
                }
            }
        },
        async login(credentials) {
            this.loading = true
            this.error = null

            try {
                const response = await axios.post('/api/auth/login', credentials)
                const { token, user } = response.data

                this.token = token
                this.user = user
                localStorage.setItem('token', token)
                this.setAuthHeader(token)

                return { success: true }
            } catch (error) {
                this.error = error.response?.data?.message || 'Login failed'
                return { success: false, error: this.error }
            } finally {
                this.loading = false
            }
        },

        async register(userData) {
            this.loading = true
            this.error = null

            try {
                const response = await axios.post('/api/auth/register', userData)
                const { token, user } = response.data

                this.token = token
                this.user = user
                localStorage.setItem('token', token)
                this.setAuthHeader(token)

                return { success: true }
            } catch (error) {
                this.error = error.response?.data?.message || 'Registration failed'
                return { success: false, error: this.error }
            } finally {
                this.loading = false
            }
        },

        async fetchCurrentUser() {
            try {
                const response = await axios.get('/api/auth/me')
                this.user = response.data
            } catch (error) {
                throw error
            }
        },

        logout() {
            this.user = null
            this.token = null
            this.error = null
            localStorage.removeItem('token')
            delete axios.defaults.headers.common['Authorization']
        },

        setAuthHeader(token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
    }
})