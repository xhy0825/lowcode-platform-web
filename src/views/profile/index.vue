<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 当前激活的标签页
const activeTab = ref('profile')

// 个人信息表单
const profileForm = reactive({
  realName: '',
  email: '',
  phone: '',
  gender: '',
  birthday: '',
  address: '',
  remark: ''
})

// 密码修改表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 头像上传
const avatarUrl = ref('')

// 安全设置
const securitySettings = reactive({
  loginNotify: true,
  smsNotify: false,
  emailNotify: true,
  twoFactorAuth: false
})

// 操作日志
const operationLogs = ref([
  { time: '2024-01-15 10:30:00', action: '登录系统', ip: '192.168.1.100', device: 'Chrome / Windows' },
  { time: '2024-01-15 09:00:00', action: '修改密码', ip: '192.168.1.100', device: 'Chrome / Windows' },
  { time: '2024-01-14 16:45:00', action: '更新个人信息', ip: '192.168.1.100', device: 'Chrome / Windows' },
  { time: '2024-01-14 14:20:00', action: '登录系统', ip: '192.168.1.108', device: 'Safari / Mac' },
  { time: '2024-01-13 08:30:00', action: '登录系统', ip: '192.168.1.100', device: 'Chrome / Windows' }
])

// 加载用户信息
const loadUserInfo = () => {
  if (userInfo.value) {
    profileForm.realName = userInfo.value.realName || ''
    profileForm.email = userInfo.value.email || ''
    profileForm.phone = userInfo.value.phone || ''
  }
}

// 保存个人信息
const handleSaveProfile = async () => {
  try {
    // await userApi.updateProfile(profileForm)
    ElMessage.success('个人信息更新成功')
    userStore.updateUserInfo(profileForm)
  } catch (e) {
    console.error(e)
    ElMessage.error('保存失败')
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordForm.oldPassword) {
    ElMessage.warning('请输入原密码')
    return
  }
  if (!passwordForm.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    ElMessage.warning('密码长度至少6位')
    return
  }

  try {
    // await userApi.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (e) {
    console.error(e)
    ElMessage.error('密码修改失败')
  }
}

// 头像上传成功
const handleAvatarSuccess = (response: any) => {
  if (response.code === 200) {
    avatarUrl.value = response.data.url
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error('头像上传失败')
  }
}

// 头像上传前校验
const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 保存安全设置
const handleSaveSecurity = async () => {
  try {
    // await userApi.updateSecuritySettings(securitySettings)
    ElMessage.success('安全设置已保存')
  } catch (e) {
    console.error(e)
    ElMessage.error('保存失败')
  }
}

// 绑定手机
const handleBindPhone = () => {
  ElMessageBox.prompt('请输入手机号码', '绑定手机', {
    inputPattern: /^1[3-9]\d{9}$/,
    inputErrorMessage: '请输入正确的手机号码'
  }).then(({ value }) => {
    profileForm.phone = value
    ElMessage.success('手机绑定成功')
  })
}

// 绑定邮箱
const handleBindEmail = () => {
  ElMessageBox.prompt('请输入邮箱地址', '绑定邮箱', {
    inputPattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    inputErrorMessage: '请输入正确的邮箱地址'
  }).then(({ value }) => {
    profileForm.email = value
    ElMessage.success('邮箱绑定成功')
  })
}

onMounted(() => {
  loadUserInfo()
})
</script>

<template>
  <div class="profile-container">
    <!-- 个人信息卡片 -->
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <el-avatar :size="100" :src="avatarUrl" class="user-avatar">
              {{ userInfo?.realName?.charAt(0) || 'U' }}
            </el-avatar>
            <el-upload
              class="avatar-upload"
              action="/api/upload/avatar"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <el-button size="small" class="upload-btn">
                <el-icon><Camera /></el-icon>
                更换头像
              </el-button>
            </el-upload>
          </div>
        </div>
        <div class="info-section">
          <h2 class="user-name">{{ userInfo?.realName || '用户' }}</h2>
          <div class="user-meta">
            <el-tag class="role-tag">{{ userInfo?.roles?.join(',') || '普通用户' }}</el-tag>
            <span class="dept-name">{{ userInfo?.deptName || '未分配部门' }}</span>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-label">账号</span>
              <span class="stat-value">{{ userInfo?.username }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">注册时间</span>
              <span class="stat-value">{{ userInfo?.createdTime || '2024-01-01' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">登录次数</span>
              <span class="stat-value">128 次</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签页区域 -->
    <div class="profile-tabs">
      <el-tabs v-model="activeTab" class="profile-tabs-content">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="profile">
          <div class="tab-content">
            <el-form :model="profileForm" label-width="100px" class="profile-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="用户账号">
                    <el-input :value="userInfo?.username" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="用户姓名">
                    <el-input v-model="profileForm.realName" placeholder="请输入姓名" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="手机号码">
                    <div class="input-with-btn">
                      <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
                      <el-button size="small" type="primary" @click="handleBindPhone" v-if="!profileForm.phone">
                        绑定
                      </el-button>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="电子邮箱">
                    <div class="input-with-btn">
                      <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
                      <el-button size="small" type="primary" @click="handleBindEmail" v-if="!profileForm.email">
                        绑定
                      </el-button>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="性别">
                    <el-radio-group v-model="profileForm.gender">
                      <el-radio value="male">男</el-radio>
                      <el-radio value="female">女</el-radio>
                      <el-radio value="other">保密</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="生日">
                    <el-date-picker
                      v-model="profileForm.birthday"
                      type="date"
                      placeholder="请选择生日"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="地址">
                <el-input v-model="profileForm.address" placeholder="请输入地址" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="profileForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveProfile" class="save-btn">
                  <el-icon><FolderChecked /></el-icon>
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <div class="tab-content">
            <el-form :model="passwordForm" label-width="100px" class="password-form">
              <el-form-item label="原密码">
                <el-input
                  v-model="passwordForm.oldPassword"
                  type="password"
                  placeholder="请输入原密码"
                  show-password
                />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认密码">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleChangePassword" class="save-btn">
                  <el-icon><Key /></el-icon>
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
            <el-alert type="info" :closable="false" class="password-tip">
              <template #title>密码安全提示</template>
              <ul>
                <li>密码长度至少6位</li>
                <li>建议使用字母、数字和特殊字符组合</li>
                <li>请勿使用与其他网站相同的密码</li>
                <li>定期修改密码以提高安全性</li>
              </ul>
            </el-alert>
          </div>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <div class="tab-content">
            <div class="security-section">
              <div class="security-item">
                <div class="security-left">
                  <el-icon class="security-icon"><Bell /></el-icon>
                  <div class="security-info">
                    <h4>登录通知</h4>
                    <p>每次登录系统时发送通知提醒</p>
                  </div>
                </div>
                <el-switch v-model="securitySettings.loginNotify" />
              </div>
              <div class="security-item">
                <div class="security-left">
                  <el-icon class="security-icon"><ChatDotRound /></el-icon>
                  <div class="security-info">
                    <h4>短信通知</h4>
                    <p>重要操作通过短信提醒</p>
                  </div>
                </div>
                <el-switch v-model="securitySettings.smsNotify" />
              </div>
              <div class="security-item">
                <div class="security-left">
                  <el-icon class="security-icon"><Message /></el-icon>
                  <div class="security-info">
                    <h4>邮件通知</h4>
                    <p>系统消息通过邮件发送</p>
                  </div>
                </div>
                <el-switch v-model="securitySettings.emailNotify" />
              </div>
              <div class="security-item">
                <div class="security-left">
                  <el-icon class="security-icon"><Lock /></el-icon>
                  <div class="security-info">
                    <h4>双重认证</h4>
                    <p>启用双重身份认证提高安全性</p>
                  </div>
                </div>
                <el-switch v-model="securitySettings.twoFactorAuth" />
              </div>
            </div>
            <el-button type="primary" @click="handleSaveSecurity" class="save-btn">
              <el-icon><FolderChecked /></el-icon>
              保存设置
            </el-button>
          </div>
        </el-tab-pane>

        <!-- 操作日志 -->
        <el-tab-pane label="操作日志" name="logs">
          <div class="tab-content">
            <el-table :data="operationLogs" class="logs-table" stripe>
              <el-table-column prop="time" label="操作时间" width="180" />
              <el-table-column prop="action" label="操作内容" />
              <el-table-column prop="ip" label="IP地址" width="140" />
              <el-table-column prop="device" label="设备信息" width="180" />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-container {
  padding: 0;

  // 个人信息卡片
  .profile-card {
    background: #fff;
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .profile-header {
      display: flex;
      gap: 30px;

      .avatar-section {
        .avatar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;

          .user-avatar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            font-size: 36px;
            font-weight: 600;
            border: 3px solid #fff;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          }

          .upload-btn {
            border-radius: 8px;
            background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
            border: 1px solid #e4e7ed;

            &:hover {
              background: #409eff;
              color: #fff;
              border-color: #409eff;
            }
          }
        }
      }

      .info-section {
        flex: 1;

        .user-name {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 12px;
        }

        .user-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;

          .role-tag {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: #fff;
            border-radius: 12px;
          }

          .dept-name {
            color: #909399;
            font-size: 14px;
          }
        }

        .user-stats {
          display: flex;
          gap: 40px;

          .stat-item {
            display: flex;
            flex-direction: column;

            .stat-label {
              font-size: 13px;
              color: #909399;
            }

            .stat-value {
              font-size: 16px;
              color: #303133;
              font-weight: 500;
              margin-top: 4px;
            }
          }
        }
      }
    }
  }

  // 标签页区域
  .profile-tabs {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .profile-tabs-content {
      :deep(.el-tabs__header) {
        margin-bottom: 20px;
      }

      :deep(.el-tabs__item) {
        font-size: 15px;
        font-weight: 500;

        &.is-active {
          color: #409eff;
        }
      }

      .tab-content {
        padding: 10px 20px;

        .profile-form, .password-form {
          max-width: 600px;

          :deep(.el-form-item__label) {
            font-weight: 500;
            color: #606266;
          }

          :deep(.el-input__wrapper),
          :deep(.el-select__wrapper) {
            border-radius: 8px;
          }

          .input-with-btn {
            display: flex;
            gap: 12px;

            .el-input {
              flex: 1;
            }
          }

          .save-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;
            padding: 12px 24px;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
          }
        }

        .password-tip {
          margin-top: 20px;
          border-radius: 8px;

          ul {
            margin: 8px 0 0 0;
            padding-left: 20px;
            color: #606266;

            li {
              margin-bottom: 4px;
            }
          }
        }

        // 安全设置
        .security-section {
          max-width: 600px;

          .security-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border: 1px solid #e4e7ed;
            border-radius: 12px;
            margin-bottom: 16px;
            transition: all 0.2s;

            &:hover {
              border-color: #409eff;
              background: linear-gradient(135deg, #ecf5ff 0%, #fff 100%);
            }

            .security-left {
              display: flex;
              align-items: center;
              gap: 16px;

              .security-icon {
                font-size: 24px;
                color: #409eff;
              }

              .security-info {
                h4 {
                  font-size: 15px;
                  font-weight: 500;
                  color: #303133;
                  margin-bottom: 4px;
                }

                p {
                  font-size: 13px;
                  color: #909399;
                }
              }
            }

            :deep(.el-switch.is-checked .el-switch__core) {
              background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
              border-color: transparent;
            }
          }
        }

        // 操作日志表格
        .logs-table {
          border-radius: 8px;

          :deep(th.el-table__cell) {
            background: #f5f7fa;
            font-weight: 600;
          }

          :deep(td.el-table__cell) {
            padding: 12px 0;
          }
        }
      }
    }
  }
}

// 响应式
@media screen and (max-width: 768px) {
  .profile-container {
    .profile-card .profile-header {
      flex-direction: column;
      align-items: center;

      .info-section {
        text-align: center;

        .user-stats {
          justify-content: center;
        }
      }
    }
  }
}
</style>