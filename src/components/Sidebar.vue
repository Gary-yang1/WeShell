<template>
  <el-aside width="200px" class="sidebar">
    <div class="logo-container">

    </div>
    <el-menu
        router
        :default-active="$route.path"
        class="el-menu-vertical"
        @select="handleSelect"
    >
      <!-- 仪表台 -->
      <el-menu-item index="/dashboard">
        <el-icon><Monitor /></el-icon>
        <span>仪表台</span>
      </el-menu-item>

      <!-- 目标列表 -->
      <el-menu-item index="/target">
        <el-icon><Aim /></el-icon>
        <span>目标列表</span>
      </el-menu-item>

      <!-- Webshell生成 -->
      <el-menu-item index="/webshell-generate">
        <el-icon><MagicStick /></el-icon>
        <span>Webshell生成</span>
      </el-menu-item>

      <!-- 系统设置 -->
      <el-sub-menu index="/system-settings">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </template>
        <el-menu-item index="/system-settings/basic">
          <el-icon><Tools /></el-icon>
          <span>基本设置</span>
        </el-menu-item>
        <el-menu-item index="/system-settings/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/system-settings/logs">
          <el-icon><Document /></el-icon>
          <span>系统日志</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>

<script setup>
import {
  Monitor,
  Aim,
  MagicStick,
  Setting,
  Tools,
  User,
  Document
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleSelect = (key) => {
  router.push(key)
}
</script>

<style scoped>
.sidebar {
  background-color: #f8f9fa;
  height: 100vh;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e6e6e6;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
}

.el-menu-item:hover {
  background-color: #f0f7ff;
}
</style>