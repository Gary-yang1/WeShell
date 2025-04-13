<template>
  <div class="dashboard-container">
    <!-- 加载状态 -->
    <template v-if="loading">
      <el-skeleton :rows="10" animated />
    </template>

    <!-- 错误状态 -->
    <template v-else-if="error">
      <el-empty :description="error">
        <el-button type="primary" @click="fetchData">重新加载</el-button>
      </el-empty>
    </template>

    <!-- 正常内容 -->
    <template v-else>
      <h2 class="mb-4">系统概览</h2>

      <el-alert
          title="系统运行正常"
          type="success"
          show-icon
          class="mb-4"
          :closable="false"
      />

      <!-- 客户端统计卡片 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #f0f7ff;">
                <el-icon color="#409EFF" :size="24"><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">客户端总数</div>
                <div class="stat-value">{{ stats.totalClients }}</div>
                <div class="stat-trend">
                  <span>较上月
                    <el-icon :color="stats.clientGrowth >= 0 ? '#67C23A' : '#F56C6C'">
                      <CaretTop v-if="stats.clientGrowth >= 0" />
                      <CaretBottom v-else />
                    </el-icon>
                    {{ Math.abs(stats.clientGrowth) }}%
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #f0f9eb;">
                <el-icon color="#67C23A" :size="24"><Connection /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">在线客户端</div>
                <div class="stat-value">{{ stats.onlineClients }}</div>
                <div class="stat-extra">活跃: {{ stats.activeClients }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #fdf6ec;">
                <el-icon color="#E6A23C" :size="24"><Odometer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">节点在线数</div>
                <div class="stat-value">{{ stats.onlineNodes }} / {{ stats.totalNodes }}</div>
                <div class="stat-extra">健康度: {{ stats.healthRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 系统资源信息 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-icon><Cpu /></el-icon>
                <span>CPU 使用情况</span>
              </div>
            </template>
            <div class="resource-container">
              <div class="resource-value">
                <el-progress
                    type="dashboard"
                    :percentage="systemResources.cpu.usage"
                    :color="getUsageColor(systemResources.cpu.usage)"
                    :width="120"
                >
                  <template #default>
                    <div class="progress-label">
                      <div class="progress-value">{{ systemResources.cpu.usage }}%</div>
                      <div class="progress-title">使用率</div>
                    </div>
                  </template>
                </el-progress>
              </div>
              <div class="resource-details">
                <div class="detail-item">
                  <span class="detail-label">核心数:</span>
                  <span class="detail-value">{{ systemResources.cpu.cores }} 核</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">型号:</span>
                  <span class="detail-value">{{ systemResources.cpu.model }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">负载:</span>
                  <span class="detail-value">{{ systemResources.cpu.load.join(', ') }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-icon><Box /></el-icon>
                <span>内存 使用情况</span>
              </div>
            </template>
            <div class="resource-container">
              <div class="resource-value">
                <el-progress
                    type="dashboard"
                    :percentage="systemResources.memory.usagePercent"
                    :color="getUsageColor(systemResources.memory.usagePercent)"
                    :width="120"
                >
                  <template #default>
                    <div class="progress-label">
                      <div class="progress-value">{{ systemResources.memory.usagePercent }}%</div>
                      <div class="progress-title">使用率</div>
                    </div>
                  </template>
                </el-progress>
              </div>
              <div class="resource-details">
                <div class="detail-item">
                  <span class="detail-label">总内存:</span>
                  <span class="detail-value">{{ formatSize(systemResources.memory.total) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">已用内存:</span>
                  <span class="detail-value">{{ formatSize(systemResources.memory.used) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">空闲内存:</span>
                  <span class="detail-value">{{ formatSize(systemResources.memory.free) }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 磁盘和系统信息 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-icon><Coin /></el-icon>
                <span>磁盘 使用情况</span>
              </div>
            </template>
            <div v-for="disk in systemResources.disks" :key="disk.mountPoint" class="disk-item">
              <div class="disk-info">
                <span class="disk-mount">{{ disk.mountPoint }}</span>
                <span class="disk-type">{{ disk.fsType }}</span>
              </div>
              <el-progress
                  :percentage="disk.usagePercent"
                  :color="getUsageColor(disk.usagePercent)"
                  :show-text="false"
                  :stroke-width="8"
              />
              <div class="disk-details">
                <span>{{ formatSize(disk.used) }} / {{ formatSize(disk.total) }}</span>
                <span>{{ disk.usagePercent }}% 已用</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>系统信息</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="操作系统">{{ systemInfo.os.name }} {{ systemInfo.os.arch }}</el-descriptions-item>
              <el-descriptions-item label="运行时间">{{ formatUptime(systemResources.uptime) }}</el-descriptions-item>
              <el-descriptions-item label="Java版本">{{ systemInfo.java.version }}</el-descriptions-item>
              <el-descriptions-item label="JVM名称">{{ systemInfo.java.vmName }}</el-descriptions-item>
              <el-descriptions-item label="应用路径">{{ systemInfo.app.path }}</el-descriptions-item>
              <el-descriptions-item label="PID">{{ systemInfo.app.pid }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>

      <!-- 客户端在线状态图表 -->
      <el-card class="mb-4">
        <template #header>
          <div class="card-header">
            <el-icon><TrendCharts /></el-icon>
            <span>客户端在线状态 (最近24小时)</span>
          </div>
        </template>
        <div style="height: 300px;">
          <div class="chart-placeholder">
            <el-icon :size="50"><DataAnalysis /></el-icon>
            <p>客户端在线状态图表</p>
          </div>
        </div>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import {
  User, Connection, Odometer, Cpu, Box,
  Coin, InfoFilled, TrendCharts, DataAnalysis,
  CaretTop, CaretBottom
} from '@element-plus/icons-vue'

// 状态管理
const loading = ref(true)
const error = ref(null)
const stats = ref({
  totalClients: 0,
  onlineClients: 0,
  activeClients: 0,
  clientGrowth: 0,
  totalNodes: 0,
  onlineNodes: 0,
  healthRate: 0
})
const systemInfo = ref({
  java: { version: '', vmName: '' },
  os: { name: '', arch: '' },
  app: { pid: '', path: '' }
})
const systemResources = ref({
  cpu: { usage: 0, cores: 0, model: '', load: [0, 0, 0] },
  memory: { total: 0, used: 0, free: 0, usagePercent: 0 },
  disks: [],
  uptime: 0
})

// API 配置
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE || '/api',
//   timeout: 10000
// })
const  api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 辅助函数：格式化字节大小
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 辅助函数：格式化运行时间
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24))
  const hours = Math.floor((seconds % (3600 * 24)) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${days}天 ${hours}小时 ${mins}分钟`
}

// 辅助函数：获取使用率颜色
const getUsageColor = (percentage) => {
  if (percentage < 50) return '#67C23A'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

// 获取系统数据
const fetchData = async () => {
  try {
    loading.value = true
    error.value = null

    // 并行请求所有数据
    const [statsRes, infoRes, resourcesRes] = await Promise.all([
      api.get('/dashboard/stats'),
      api.get('/system/info'),
      api.get('/system/resources')
    ])

    // 处理统计数据
    stats.value = {
      totalClients: statsRes.data.totalClients || 0,
      onlineClients: statsRes.data.onlineClients || 0,
      activeClients: statsRes.data.activeClients || 0,
      clientGrowth: statsRes.data.clientGrowth || 0,
      totalNodes: statsRes.data.totalNodes || 0,
      onlineNodes: statsRes.data.onlineNodes || 0,
      healthRate: statsRes.data.healthRate || 0
    }

    // 处理系统信息
    systemInfo.value = {
      java: {
        version: infoRes.data.javaVersion || '未知',
        vmName: infoRes.data.vmName || '未知'
      },
      os: {
        name: infoRes.data.osName || '未知',
        arch: infoRes.data.osArch || '未知'
      },
      app: {
        pid: infoRes.data.pid || '未知',
        path: infoRes.data.appPath || '未知'
      }
    }

    // 处理资源信息
    systemResources.value = {
      cpu: {
        usage: resourcesRes.data.cpu?.usage || 0,
        cores: resourcesRes.data.cpu?.cores || 0,
        model: resourcesRes.data.cpu?.model || '未知',
        load: resourcesRes.data.cpu?.load || [0, 0, 0]
      },
      memory: {
        total: resourcesRes.data.memory?.total || 0,
        used: resourcesRes.data.memory?.used || 0,
        free: resourcesRes.data.memory?.free || 0,
        usagePercent: resourcesRes.data.memory?.usagePercent || 0
      },
      disks: (resourcesRes.data.disks || []).map(disk => ({
        mountPoint: disk.mountPoint || '未知',
        fsType: disk.fsType || '未知',
        total: disk.total || 0,
        used: disk.used || 0,
        usagePercent: Math.round(((disk.used || 0) / (disk.total || 1)) * 100) || 0
      })),
      uptime: resourcesRes.data.uptime || 0
    }

  } catch (err) {
    console.error('获取数据失败:', err)
    error.value = `数据加载失败: ${err.message || '未知错误'}`
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 初始化加载数据
onMounted(() => {
  fetchData()

  // 设置定时刷新（每分钟）
  const timer = setInterval(fetchData, 60000)

  // 组件卸载时清除定时器
  return () => clearInterval(timer)
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stat-card {
  margin-bottom: 0;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-extra, .stat-trend {
  font-size: 12px;
  color: #909399;
}

.resource-container {
  display: flex;
  align-items: center;
}

.resource-value {
  width: 150px;
  display: flex;
  justify-content: center;
}

.resource-details {
  flex: 1;
  padding-left: 20px;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-label {
  display: inline-block;
  width: 80px;
  color: #909399;
}

.detail-value {
  font-weight: 500;
}

.disk-item {
  margin-bottom: 16px;
}

.disk-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.disk-mount {
  font-weight: 500;
}

.disk-type {
  color: #909399;
  font-size: 12px;
}

.disk-details {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.progress-label {
  text-align: center;
}

.progress-value {
  font-size: 24px;
  font-weight: bold;
}

.progress-title {
  font-size: 12px;
  color: #909399;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>