import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.zahara.com"

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })

          const { access_token } = response.data
          localStorage.setItem("access_token", access_token)

          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),

  logout: () => api.post("/auth/logout"),

  refresh: (refreshToken: string) => api.post("/auth/refresh", { refresh_token: refreshToken }),
}

// Customers API
export const customersAPI = {
  getAll: (params?: any) => api.get("/customers", { params }),
  getById: (id: number) => api.get(`/customers/${id}`),
  create: (data: any) => api.post("/customers", data),
  update: (id: number, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
}

// Branches API
export const branchesAPI = {
  getAll: (customerId: number) => api.get(`/customers/${customerId}/branches`),
  getById: (customerId: number, branchId: number) => api.get(`/customers/${customerId}/branches/${branchId}`),
  create: (customerId: number, data: any) => api.post(`/customers/${customerId}/branches`, data),
  update: (customerId: number, branchId: number, data: any) =>
    api.put(`/customers/${customerId}/branches/${branchId}`, data),
  delete: (customerId: number, branchId: number) => api.delete(`/customers/${customerId}/branches/${branchId}`),
}

// Products API
export const productsAPI = {
  getAll: (params?: any) => api.get("/products", { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post("/products", data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
}

// Orders API
export const ordersAPI = {
  getAll: (params?: any) => api.get("/orders", { params }),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: any) => api.post("/orders", data),
  update: (id: number, data: any) => api.put(`/orders/${id}`, data),
  delete: (id: number) => api.delete(`/orders/${id}`),
}

// Payments API
export const paymentsAPI = {
  getAll: (params?: any) => api.get("/payments", { params }),
  getById: (id: number) => api.get(`/payments/${id}`),
  create: (data: any) => api.post("/payments", data),
  update: (id: number, data: any) => api.put(`/payments/${id}`, data),
  delete: (id: number) => api.delete(`/payments/${id}`),
  getTypes: () => api.get("/payments/types"),
  getBalances: (customerId: number) => api.get(`/customers/${customerId}/balance`),
  getStatement: (customerId: number, params?: any) => api.get(`/customers/${customerId}/statement`, { params }),
}

// Invoices API
export const invoicesAPI = {
  getAll: (params?: any) => api.get("/invoices", { params }),
  getById: (id: number) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post("/invoices", data),
  update: (id: number, data: any) => api.put(`/invoices/${id}`, data),
  delete: (id: number) => api.delete(`/invoices/${id}`),
}

// Expenses API
export const expensesAPI = {
  getAll: (params?: any) => api.get("/expenses", { params }),
  getById: (id: number) => api.get(`/expenses/${id}`),
  create: (data: any) => api.post("/expenses", data),
  update: (id: number, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
  getCategories: () => api.get("/expenses/categories"),
}

// Employees API
export const employeesAPI = {
  getAll: (params?: any) => api.get("/employees", { params }),
  getById: (id: number) => api.get(`/employees/${id}`),
  create: (data: any) => api.post("/employees", data),
  update: (id: number, data: any) => api.put(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
}

// Agriculture API
export const agricultureAPI = {
  getCrops: (params?: any) => api.get("/agriculture/crops", { params }),
  getCropById: (id: number) => api.get(`/agriculture/crops/${id}`),
  createCrop: (data: any) => api.post("/agriculture/crops", data),
  updateCrop: (id: number, data: any) => api.put(`/agriculture/crops/${id}`, data),
  deleteCrop: (id: number) => api.delete(`/agriculture/crops/${id}`),

  getBlocks: (params?: any) => api.get("/agriculture/blocks", { params }),
  getBlockById: (id: number) => api.get(`/agriculture/blocks/${id}`),
  createBlock: (data: any) => api.post("/agriculture/blocks", data),
  updateBlock: (id: number, data: any) => api.put(`/agriculture/blocks/${id}`, data),
  deleteBlock: (id: number) => api.delete(`/agriculture/blocks/${id}`),
}

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getSales: (params?: any) => api.get("/analytics/sales", { params }),
  getPayments: (params?: any) => api.get("/analytics/payments", { params }),
}
