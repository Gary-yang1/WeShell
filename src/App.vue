<template>
  <el-container class="app-container">
    <sidebar />
    <el-container>
      <el-header style="border-bottom: 1px solid #eee;">
        <h2>WeShell V1.0</h2>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
</script>

<style scoped>
.app-container {
  height: 100vh;
}
</style>