<template>
  <div>
    <h2 class="mb-4">系统概览</h2>

    <el-alert
        v-if="connectionStatus === 'success'"
        title="连接成功，基本信息获取完成。"
        type="success"
        show-icon
        class="mb-4"
    />

    <SystemInfoCards :system-info="systemInfo" />

    <el-row :gutter="20" class="mb-4">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>环境变量</span>
            </div>
          </template>
          <el-table :data="envVars" height="250" style="width: 100%">
            <el-table-column prop="name" label="变量名" width="180" />
            <el-table-column prop="value" label="值" />
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><CoffeeCup /></el-icon>
              <span>Java配置</span>
            </div>
          </template>
          <el-table :data="javaConfigs" height="250" style="width: 100%">
            <el-table-column prop="key" label="配置项" width="220" />
            <el-table-column prop="value" label="值" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Setting, CoffeeCup } from '@element-plus/icons-vue'
import SystemInfoCards from '@/components/SystemInfoCards.vue'
import { useSystemStore } from '@/stores/systemStore'

const systemStore = useSystemStore()

const connectionStatus = ref('loading')
const systemInfo = ref({
  java: null,
  os: null,
  app: null
})
const envVars = ref([])
const javaConfigs = ref([])

onMounted(async () => {
  try {
    // 从store获取数据，store会处理API调用
    await systemStore.fetchSystemInfo()

    // 更新组件数据
    systemInfo.value = {
      java: {
        version: systemStore.javaVersion,
        vmName: systemStore.vmName
      },
      os: {
        name: systemStore.osName,
        arch: systemStore.osArch
      },
      app: {
        pid: systemStore.pid,
        path: systemStore.appPath
      }
    }

    envVars.value = Object.entries(systemStore.envVars).map(([name, value]) => ({
      name,
      value
    }))

    javaConfigs.value = Object.entries(systemStore.javaConfigs).map(([key, value]) => ({
      key,
      value
    }))

    connectionStatus.value = 'success'
  } catch (error) {
    connectionStatus.value = 'error'
    console.error('Failed to fetch system info:', error)
  }
})
</script>