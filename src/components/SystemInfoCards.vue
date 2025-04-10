<template>
  <el-row :gutter="20" class="mb-4">
    <el-col :span="8">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Cpu /></el-icon>
            <span>Java环境</span>
          </div>
        </template>
        <div v-if="systemInfo.java">
          <p><strong>版本:</strong> {{ systemInfo.java.version }}</p>
          <p><strong>VM:</strong> {{ systemInfo.java.vmName }}</p>
        </div>
        <el-skeleton :rows="2" animated v-else />
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Platform /></el-icon>
            <span>操作系统</span>
          </div>
        </template>
        <div v-if="systemInfo.os">
          <p><strong>名称:</strong> {{ systemInfo.os.name }}</p>
          <p><strong>架构:</strong> {{ systemInfo.os.arch }}</p>
        </div>
        <el-skeleton :rows="2" animated v-else />
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>应用信息</span>
          </div>
        </template>
        <div v-if="systemInfo.app">
          <p><strong>PID:</strong> {{ systemInfo.app.pid }}</p>
          <p><strong>路径:</strong> {{ systemInfo.app.path }}</p>
        </div>
        <el-skeleton :rows="2" animated v-else />
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { Cpu, Platform, InfoFilled } from '@element-plus/icons-vue'

defineProps({
  systemInfo: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>