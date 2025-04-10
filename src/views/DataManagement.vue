<template>
  <div class="data-management">
    <el-card class="data-card">
      <template #header>
        <div class="card-header">
          <h3>数据管理</h3>
          <div class="action-buttons">
            <el-button type="primary" @click="handleExport">
              <el-icon><Download /></el-icon>导出数据
            </el-button>
            <el-button type="success" @click="handleImport">
              <el-icon><Upload /></el-icon>导入数据
            </el-button>
            <el-button type="danger" @click="handleClear">
              <el-icon><Delete /></el-icon>清空数据
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="数据库表" name="tables">
          <el-table
              :data="tables"
              style="width: 100%"
              v-loading="loading"
              @row-click="handleTableClick"
          >
            <el-table-column prop="name" label="表名" />
            <el-table-column prop="rows" label="记录数" width="120" />
            <el-table-column prop="size" label="大小" width="120">
              <template #default="{ row }">
                {{ formatSize(row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" width="180" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button
                    size="small"
                    type="primary"
                    @click.stop="handleBackup(row)"
                >
                  备份
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="数据备份" name="backups">
          <el-table
              :data="backups"
              style="width: 100%"
              v-loading="loading"
          >
            <el-table-column prop="name" label="备份名称" />
            <el-table-column prop="size" label="大小" width="120">
              <template #default="{ row }">
                {{ formatSize(row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="备份时间" width="180" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button
                    size="small"
                    type="success"
                    @click="handleRestore(row)"
                >
                  恢复
                </el-button>
                <el-button
                    size="small"
                    type="danger"
                    @click="handleDeleteBackup(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="数据统计" name="statistics">
          <div class="statistics-container">
            <el-row :gutter="20">
              <el-col :span="8" v-for="stat in statistics" :key="stat.name">
                <el-card shadow="hover">
                  <template #header>
                    <div class="stat-header">
                      <el-icon :size="20" :color="stat.color">
                        <component :is="stat.icon" />
                      </el-icon>
                      <span>{{ stat.name }}</span>
                    </div>
                  </template>
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-desc">{{ stat.desc }}</div>
                </el-card>
              </el-col>
            </el-row>

            <el-card shadow="hover" style="margin-top: 20px;">
              <template #header>
                <div>数据增长趋势</div>
              </template>
              <div style="height: 300px;">
                <!-- 这里可以放置图表组件 -->
                <div class="chart-placeholder">
                  <el-icon :size="50"><DataAnalysis /></el-icon>
                  <p>数据增长趋势图表</p>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 数据导入对话框 -->
      <el-dialog v-model="importDialogVisible" title="导入数据" width="40%">
        <el-upload
            drag
            action="/api/data/import"
            :limit="1"
            :on-success="handleImportSuccess"
            :before-upload="beforeImportUpload"
        >
          <el-icon :size="50"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 JSON、CSV 格式文件，大小不超过 50MB
            </div>
          </template>
        </el-upload>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Download,
  Upload,
  Delete,
  DataAnalysis,
  UploadFilled,
  Collection,
  Histogram,
  TrendCharts
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态管理
const loading = ref(false)
const activeTab = ref('tables')
const tables = ref([])
const backups = ref([])
const importDialogVisible = ref(false)

// 统计数据
const statistics = ref([
  {
    name: '总数据量',
    value: '1.2GB',
    desc: '比上周增长 5%',
    icon: Collection,
    color: '#409EFF'
  },
  {
    name: '数据表数量',
    value: '24',
    desc: '包含系统表和用户表',
    icon: Histogram,
    color: '#67C23A'
  },
  {
    name: '备份数量',
    value: '8',
    desc: '最近备份: 今天 10:30',
    icon: TrendCharts,
    color: '#E6A23C'
  }
])

// 生命周期钩子
onMounted(() => {
  fetchTables()
  fetchBackups()
})

// 方法
const fetchTables = async () => {
  try {
    loading.value = true
    // 这里替换为实际的API调用
    // tables.value = await axios.get('/api/data/tables')

    // 模拟数据
    tables.value = [
      { name: 'users', rows: 1024, size: 5242880, updatedAt: '2023-07-15 10:30' },
      { name: 'products', rows: 256, size: 2097152, updatedAt: '2023-07-14 09:15' },
      { name: 'orders', rows: 2048, size: 10485760, updatedAt: '2023-07-14 14:20' }
    ]
  } catch (error) {
    ElMessage.error('获取数据表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const fetchBackups = async () => {
  try {
    loading.value = true
    // 这里替换为实际的API调用
    // backups.value = await axios.get('/api/data/backups')

    // 模拟数据
    backups.value = [
      { name: 'backup_20230715', size: 15728640, createdAt: '2023-07-15 10:30' },
      { name: 'backup_20230714', size: 14680064, createdAt: '2023-07-14 09:15' },
      { name: 'backup_20230713', size: 13631488, createdAt: '2023-07-13 14:20' }
    ]
  } catch (error) {
    ElMessage.error('获取备份列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleTableClick = (row) => {
  // 可以在这里实现查看表数据的逻辑
  console.log('查看表数据:', row.name)
}

const handleExport = () => {
  ElMessage.success('开始导出数据')
  // window.open('/api/data/export')
}

const handleImport = () => {
  importDialogVisible.value = true
}

const handleClear = () => {
  ElMessageBox.confirm('确定要清空所有数据吗? 此操作不可恢复!', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger'
  }).then(() => {
    ElMessage.success('已清空数据')
    fetchTables()
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleBackup = async (table) => {
  try {
    // await axios.post('/api/data/backup', { table: table.name })
    ElMessage.success(`表 ${table.name} 备份成功`)
    fetchBackups()
  } catch (error) {
    ElMessage.error('备份失败: ' + error.message)
  }
}

const handleRestore = (backup) => {
  ElMessageBox.confirm(`确定要从备份 ${backup.name} 恢复数据吗?`, '确认恢复', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // await axios.post('/api/data/restore', { backup: backup.name })
      ElMessage.success('数据恢复成功')
      fetchTables()
    } catch (error) {
      ElMessage.error('恢复失败: ' + error.message)
    }
  }).catch(() => {
    ElMessage.info('已取消恢复')
  })
}

const handleDeleteBackup = (backup) => {
  ElMessageBox.confirm(`确定要删除备份 ${backup.name} 吗?`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // await axios.delete(`/api/data/backups/${backup.name}`)
      ElMessage.success('备份删除成功')
      fetchBackups()
    } catch (error) {
      ElMessage.error('删除失败: ' + error.message)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const beforeImportUpload = (file) => {
  const isLt50M = file.size / 1024 / 1024 < 50
  const isSupportedFormat = ['application/json', 'text/csv'].includes(file.type)

  if (!isSupportedFormat) {
    ElMessage.error('只支持 JSON 或 CSV 格式文件')
    return false
  }
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过 50MB')
    return false
  }
  return true
}

const handleImportSuccess = () => {
  importDialogVisible.value = false
  ElMessage.success('数据导入成功')
  fetchTables()
}
</script>

<style scoped>
.data-management {
  padding: 20px;
}

.data-card {
  min-height: calc(100vh - 100px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.statistics-container {
  padding: 10px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.stat-desc {
  color: #909399;
  font-size: 12px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}
</style>