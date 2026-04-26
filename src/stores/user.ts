import { defineStore } from 'pinia'
import { loginApi, User } from '@/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    userInfo: null as User | null,
    tenantId: localStorage.getItem('tenantId') || '000000',
    permissions: [] as string[],
    roles: [] as string[],
    menus: [] as any[]
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken,
    username: (state) => state.userInfo?.username || '',
    realName: (state) => state.userInfo?.realName || '',
    hasPermission: (state) => (permission: string) => {
      return state.permissions.includes(permission) || state.permissions.includes('*:*:*')
    },
    hasRole: (state) => (role: string) => {
      return state.roles.includes(role) || state.roles.includes('admin')
    }
  },

  actions: {
    async login(username: string, password: string, captcha?: string, captchaKey?: string) {
      const res = await loginApi.login({ username, password, captcha, captchaKey })
      const data = res.data

      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
      this.userInfo = data.user
      this.tenantId = data.tenantId
      this.permissions = data.permissions
      this.roles = data.roles
      this.menus = data.menus

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('tenantId', data.tenantId)

      return res
    },

    async logout() {
      await loginApi.logout()
      this.accessToken = ''
      this.refreshToken = ''
      this.userInfo = null
      this.permissions = []
      this.roles = []
      this.menus = []
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tenantId')
    },

    async getUserInfo() {
      const res = await loginApi.getUserInfo()
      this.userInfo = res.data.user
      this.permissions = res.data.permissions
      return res
    },

    async getMenus() {
      const res = await loginApi.getMenus()
      this.menus = res.data
      return res
    },

    async refreshAccessToken() {
      if (!this.refreshToken) return false
      try {
        const res = await loginApi.refreshToken(this.refreshToken, this.accessToken)
        const data = res.data
        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        return true
      } catch (e) {
        this.logout()
        return false
      }
    },

    setToken(accessToken: string, refreshToken?: string) {
      this.accessToken = accessToken
      localStorage.setItem('accessToken', accessToken)
      if (refreshToken) {
        this.refreshToken = refreshToken
        localStorage.setItem('refreshToken', refreshToken)
      }
    },

    updateUserInfo(info: Partial<User>) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...info }
      }
    }
  }
})