import axios from 'axios'

// Create axios instance with base URL from environment variable
// In development, this will use the proxy from vite.config.ts
// In production, it will use the VITE_API_URL environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

export default api

