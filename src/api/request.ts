import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 是否正在刷新Token
let isRefreshing = false
// 重试请求队列
let retryQueue: Array<(token: string) => void> = []

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 accessToken
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    // 租户ID
    const tenantId = localStorage.getItem('tenantId') || '000000'
    config.headers['X-Tenant-Id'] = tenantId
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  async (error) => {
    const status = error.response?.status
    const config = error.config

    if (status === 401) {
      // 尝试刷新Token
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken && !isRefreshing) {
        isRefreshing = true
        try {
          const res = await axios.post('/api/system/auth/refresh', {
            refreshToken,
            oldAccessToken: localStorage.getItem('accessToken')
          })
          const { accessToken, refreshToken: newRefreshToken } = res.data.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          isRefreshing = false

          // 重试队列中的请求
          retryQueue.forEach(cb => cb(accessToken))
          retryQueue = []

          // 重试当前请求
          config.headers['Authorization'] = `Bearer ${accessToken}`
          return service(config)
        } catch (refreshError) {
          // 刷新失败，清除登录状态
          isRefreshing = false
          localStorage.clear()
          ElMessage.error('登录已过期，请重新登录')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else if (isRefreshing) {
        // 正在刷新，加入队列等待
        return new Promise((resolve) => {
          retryQueue.push((token: string) => {
            config.headers['Authorization'] = `Bearer ${token}`
            resolve(service(config))
          })
        })
      } else {
        // 无refreshToken，直接跳转登录
        localStorage.clear()
        ElMessage.error('登录已过期，请重新登录')
        window.location.href = '/login'
      }
    } else if (status === 403) {
      ElMessage.error('没有权限访问')
    } else if (status === 500) {
      ElMessage.error('服务器异常')
    } else {
      ElMessage.error(error.message || '网络异常')
    }
    return Promise.reject(error)
  }
)

// 封装请求方法
export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
  timestamp: number
}

export interface PageResponse<T> {
  total: number
  pageNum: number
  pageSize: number
  pages: number
  list: T[]
}

export const request = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.get(url, config)
  },
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.post(url, data, config)
  },
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.put(url, data, config)
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.delete(url, config)
  }
}

export default service