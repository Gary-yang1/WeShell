<template>
  <div class="target-list-container">
    <!-- 加载中 -->
    <template v-if="loading">
      <el-skeleton :rows="6" animated />
    </template>

    <!-- 加载失败 -->
    <template v-else-if="error">
      <el-empty :description="error">
        <el-button type="primary" @click="fetchTargets">重试</el-button>
      </el-empty>
    </template>

    <!-- 正常内容 -->
    <template v-else>
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <h3>目标列表</h3>
            <el-input
                v-model="searchQuery"
                placeholder="搜索 URL / IP / 备注"
                clearable
                style="width: 300px;"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
        </template>

        <el-table
            :data="paginatedTargets"
            border
            stripe
            style="width: 100%"
        >
          <el-table-column prop="id" label="编号" width="60" />
          <el-table-column prop="url" label="URL" min-width="350" />
          <el-table-column prop="ip" label="IP" width="150" />
          <el-table-column prop="scriptType" label="类型" width="80">
            <template #default="{ row }">
              <el-tag :type="getScriptTypeColor(row.scriptType)">
                {{ row.scriptType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="osType" label="系统" width="120">
            <template #default="{ row }">
              <el-tag :type="row.osType === 'Linux' ? undefined : 'success'">
                {{ row.osType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '在线' ? 'success' : 'danger'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column prop="notes" label="备注" min-width="200">
            <template #default="{ row }">
              <div v-if="row.editing">
                <el-input
                    v-model="row.editNotes"
                    size="small"
                    @keyup.enter="saveNotes(row)"
                />
                <div style="margin-top: 5px;">
                  <el-button size="small" type="success" @click="saveNotes(row)">保存</el-button>
                  <el-button size="small" @click="cancelEdit(row)">取消</el-button>
                </div>
              </div>
              <div v-else>
                <span>{{ row.notes || '无备注' }}</span>
                <el-button
                    type="text"
                    size="small"
                    icon="Edit"
                    @click="startEdit(row)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleTest(row)">测试</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :total="filteredTargets.length"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="fetchTargets"
              @current-change="fetchTargets"
          />
        </div>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useShellList } from '@/composables/useShellList'
import axios from "axios";

// 加载数据
const { loading, error, data: targets, fetchData: fetchTargets } = useShellList()

// 搜索 + 分页
const searchQuery = ref('')
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

const filteredTargets = computed(() => {
  if (!searchQuery.value) return targets.value
  return targets.value.filter(item =>
      item.url.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.ip.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const paginatedTargets = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  return filteredTargets.value.slice(start, start + pagination.value.pageSize)
})

// 编辑备注
const startEdit = (row) => {
  row.editing = true
  row.editNotes = row.notes
}
const cancelEdit = (row) => row.editing = false
const saveNotes = async (row) => {
  try {
    // 替换成你实际的 API 请求（POST）
    // await axios.post('/api/shells/updateMemo', { id: row.id, memo: row.editNotes })
    row.notes = row.editNotes
    row.editing = false
    ElMessage.success('备注已更新')
  } catch (e) {
    ElMessage.error('更新失败：' + e.message)
  }
}

// 删除目标
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除 ${row.url} 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      await axios.post('/api/shells/delete', { id: row.id })
      targets.value = targets.value.filter(t => t.id !== row.id)
      ElMessage.success('已删除')
    } catch (e) {
      ElMessage.error('删除失败：' + e.message)
    }
  })
}

// 模拟测试
const handleTest = (row) => {
  ElMessage.info(`测试目标：${row.url}`)
}

// 脚本类型颜色
const getScriptTypeColor = (type) => {
  return {
    'PHP': 'success',
    'JSP': 'warning',
    'ASP': 'danger',
    'ASPX': 'info'
  }[type] || ''
}
</script>

<style scoped>
.target-list-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
