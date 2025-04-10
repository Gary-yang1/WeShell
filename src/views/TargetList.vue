<template>
  <div class="target-list-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h3>目标列表</h3>
          <div class="header-actions">
            <el-input
                v-model="searchQuery"
                placeholder="搜索目标..."
                clearable
                style="width: 300px; margin-right: 10px;"
                @clear="handleSearchClear"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleAddTarget">
              <el-icon><Plus /></el-icon>新增目标
            </el-button>
          </div>
        </div>
      </template>

      <el-table
          :data="filteredTargets"
          style="width: 100%"
          v-loading="loading"
          border
          stripe
      >
        <el-table-column prop="id" label="编号" width="80" sortable />
        <el-table-column prop="url" label="URL" min-width="200" />
        <el-table-column prop="ip" label="IP" width="150" />
        <el-table-column prop="scriptType" label="脚本类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getScriptTypeColor(row.scriptType)">
              {{ row.scriptType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="osType" label="OS类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.osType === 'Linux' ? '' : 'success'">
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
        <el-table-column prop="createdAt" label="创建时间" width="180" sortable />
        <el-table-column prop="notes" label="备注" min-width="200">
          <template #default="{ row }">
            <div v-if="row.editing">
              <el-input
                  v-model="row.editNotes"
                  size="small"
                  @keyup.enter="saveNotes(row)"
              />
              <div class="edit-actions">
                <el-button
                    size="small"
                    type="success"
                    @click="saveNotes(row)"
                >
                  保存
                </el-button>
                <el-button
                    size="small"
                    @click="cancelEdit(row)"
                >
                  取消
                </el-button>
              </div>
            </div>
            <div v-else class="notes-content">
              <span>{{ row.notes || '无备注' }}</span>
              <el-button
                  type="text"
                  size="small"
                  @click="startEdit(row)"
                  icon="Edit"
                  class="edit-btn"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
                size="small"
                type="primary"
                @click="handleTest(row)"
            >
              测试
            </el-button>
            <el-button
                size="small"
                type="danger"
                @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增目标对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="50%"
    >
      <el-form
          :model="targetForm"
          :rules="rules"
          ref="targetFormRef"
          label-width="100px"
      >
        <el-form-item label="URL" prop="url">
          <el-input v-model="targetForm.url" placeholder="http://example.com" />
        </el-form-item>
        <el-form-item label="IP" prop="ip">
          <el-input v-model="targetForm.ip" placeholder="192.168.1.1" />
        </el-form-item>
        <el-form-item label="脚本类型" prop="scriptType">
          <el-select v-model="targetForm.scriptType" placeholder="请选择">
            <el-option
                v-for="item in scriptTypes"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="OS类型" prop="osType">
          <el-radio-group v-model="targetForm.osType">
            <el-radio label="Linux">Linux</el-radio>
            <el-radio label="Windows">Windows</el-radio>
            <el-radio label="Other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
              v-model="targetForm.notes"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态管理
const loading = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const currentTargetId = ref(null)
const searchQuery = ref('')

// 表单数据
const targetForm = ref({
  url: '',
  ip: '',
  scriptType: '',
  osType: 'Linux',
  notes: ''
})

// 表单验证规则
const rules = {
  url: [
    { required: true, message: '请输入URL', trigger: 'blur' },
    { pattern: /^(http|https):\/\/[^\s]+/, message: '请输入有效的URL', trigger: 'blur' }
  ],
  ip: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/, message: '请输入有效的IP地址', trigger: 'blur' }
  ],
  scriptType: [
    { required: true, message: '请选择脚本类型', trigger: 'change' }
  ],
  osType: [
    { required: true, message: '请选择OS类型', trigger: 'change' }
  ]
}

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 数据
const targets = ref([])
const scriptTypes = ref(['PHP', 'JSP', 'ASP', 'ASPX', 'Other'])

// 计算属性
const dialogTitle = computed(() => {
  return isEditMode.value ? '编辑目标' : '新增目标'
})

const filteredTargets = computed(() => {
  if (!searchQuery.value) return targets.value
  return targets.value.filter(item =>
      item.url.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.ip.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
})

// 生命周期钩子
onMounted(() => {
  fetchTargets()
})

// 方法
const fetchTargets = async () => {
  try {
    loading.value = true
    // 这里替换为实际的API调用
    // const response = await axios.get('/api/targets', {
    //   params: {
    //     page: pagination.currentPage,
    //     size: pagination.pageSize
    //   }
    // })
    // targets.value = response.data.items.map(item => ({
    //   ...item,
    //   editing: false,
    //   editNotes: item.notes
    // }))
    // pagination.total = response.data.total

    // 模拟数据
    targets.value = [
      {
        id: 1,
        url: 'http://example1.com',
        ip: '192.168.1.101',
        scriptType: 'PHP',
        osType: 'Linux',
        status: '在线',
        notes: '测试服务器1',
        createdAt: '2023-07-15 10:30',
        editing: false,
        editNotes: '测试服务器1'
      },
      {
        id: 2,
        url: 'http://example2.com',
        ip: '192.168.1.102',
        scriptType: 'JSP',
        osType: 'Windows',
        status: '离线',
        notes: '测试服务器2',
        createdAt: '2023-07-14 09:15',
        editing: false,
        editNotes: '测试服务器2'
      }
    ]
    pagination.value.total = 2
  } catch (error) {
    ElMessage.error('获取目标列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const getScriptTypeColor = (type) => {
  const colors = {
    'PHP': 'success',
    'JSP': 'warning',
    'ASP': 'danger',
    'ASPX': 'info'
  }
  return colors[type] || ''
}

const startEdit = (row) => {
  row.editing = true
  row.editNotes = row.notes
}

const saveNotes = async (row) => {
  try {
    // 这里替换为实际的API调用
    // await axios.patch(`/api/targets/${row.id}/notes`, {
    //   notes: row.editNotes
    // })

    row.notes = row.editNotes
    row.editing = false
    ElMessage.success('备注更新成功')
  } catch (error) {
    ElMessage.error('更新备注失败: ' + error.message)
  }
}

const cancelEdit = (row) => {
  row.editing = false
}

const handleAddTarget = () => {
  isEditMode.value = false
  targetForm.value = {
    url: '',
    ip: '',
    scriptType: '',
    osType: 'Linux',
    notes: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEditMode.value = true
  currentTargetId.value = row.id
  targetForm.value = {
    url: row.url,
    ip: row.ip,
    scriptType: row.scriptType,
    osType: row.osType,
    notes: row.notes
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    // 这里替换为实际的API调用
    if (isEditMode.value) {
      // await axios.put(`/api/targets/${currentTargetId.value}`, targetForm.value)
      ElMessage.success('目标更新成功')
    } else {
      // await axios.post('/api/targets', targetForm.value)
      ElMessage.success('目标添加成功')
    }
    dialogVisible.value = false
    fetchTargets()
  } catch (error) {
    ElMessage.error('操作失败: ' + error.message)
  }
}

const handleTest = (row) => {
  ElMessage.info(`开始测试目标: ${row.url}`)
  // 这里实现测试逻辑
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除目标 "${row.url}" 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // await axios.delete(`/api/targets/${row.id}`)
      ElMessage.success('删除成功')
      fetchTargets()
    } catch (error) {
      ElMessage.error('删除失败: ' + error.message)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleSearchClear = () => {
  searchQuery.value = ''
  fetchTargets()
}

const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  fetchTargets()
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  fetchTargets()
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
  flex-wrap: wrap;
  gap: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.notes-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.edit-btn {
  margin-left: 8px;
}

.edit-actions {
  margin-top: 5px;
  display: flex;
  gap: 5px;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    margin-top: 10px;
  }
}
</style>