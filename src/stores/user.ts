import { defineStore } from 'pinia'
import { loginApi, User } from '@/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null as User | null,
    tenantId: localStorage.getItem('tenantId') || '000000',
    permissions: [] as string[],
    roles: [] as string[]
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo?.username || '',
    realName: (state) => state.userInfo?.realName || ''
  },

  actions: {
    async login(username: string, password: string) {
      const res = await loginApi.login({ username, password })
      this.token = res.data.token
      this.userInfo = res.data.user
      this.permissions = res.data.permissions
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('tenantId', res.data.user.tenantId || '000000')
      return res
    },

    async logout() {
      await loginApi.logout()
      this.token = ''
      this.userInfo = null
      this.permissions = []
      this.roles = []
      localStorage.removeItem('token')
      localStorage.removeItem('tenantId')
    },

    async getUserInfo() {
      const res = await loginApi.getInfo()
      this.userInfo = res.data.user
      this.permissions = res.data.permissions
      return res
    },

    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },

    updateUserInfo(info: Partial<User>) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...info }
      }
    }
  }
})