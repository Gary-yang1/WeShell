<template>
  <div class="content-management">
    <el-card class="content-card">
      <template #header>
        <div class="card-header">
          <h3>内容管理</h3>
          <div class="action-buttons">
            <el-button type="primary" @click="showCreateDialog">
              <el-icon><Plus /></el-icon>新增内容
            </el-button>
            <el-input
                v-model="searchQuery"
                placeholder="搜索内容..."
                clearable
                style="width: 300px; margin-left: 10px;"
                @clear="handleSearchClear"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table
          :data="filteredContents"
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'warning'">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" sortable />
        <el-table-column prop="updatedAt" label="更新时间" width="180" sortable />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button
                size="small"
                type="danger"
                @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
            <el-button
                size="small"
                type="success"
                @click="handlePublish(row)"
                v-if="row.status !== 'published'"
            >
              <el-icon><Promotion /></el-icon>
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

    <!-- 内容编辑对话框 -->
    <el-dialog
        v-model="contentDialogVisible"
        :title="dialogTitle"
        width="70%"
        top="5vh"
    >
      <el-form
          :model="contentForm"
          :rules="contentRules"
          ref="contentFormRef"
          label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="contentForm.title" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="contentForm.category" placeholder="请选择分类">
            <el-option
                v-for="item in categories"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="contentForm.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">发布</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <div style="border: 1px solid #dcdfe6; border-radius: 4px;">
            <TiptapEditor v-model="contentForm.content" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="contentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitContent">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Plus,
  Search,
  Edit,
  Delete,
  Promotion
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TiptapEditor from '@/components/TiptapEditor.vue'

// 状态管理
const loading = ref(false)
const contents = ref([])
const selectedContents = ref([])
const contentDialogVisible = ref(false)
const isEditMode = ref(false)
const currentContentId = ref(null)
const searchQuery = ref('')

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表单数据
const contentForm = ref({
  title: '',
  category: '',
  status: 'draft',
  content: ''
})

// 表单验证规则
const contentRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 3, max: 100, message: '长度在 3 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ]
}

// 分类选项
const categories = ref([
  { value: 'news', label: '新闻' },
  { value: 'tutorial', label: '教程' },
  { value: 'announcement', label: '公告' },
  { value: 'other', label: '其他' }
])

// 计算属性
const dialogTitle = computed(() => {
  return isEditMode.value ? '编辑内容' : '新增内容'
})

const filteredContents = computed(() => {
  if (!searchQuery.value) return contents.value
  return contents.value.filter(item =>
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
})

// 生命周期钩子
onMounted(() => {
  fetchContents()
})

// 方法
const fetchContents = async () => {
  try {
    loading.value = true
    // 这里替换为实际的API调用
    // const response = await axios.get('/api/contents', {
    //   params: {
    //     page: pagination.value.currentPage,
    //     size: pagination.value.pageSize
    //   }
    // })
    // contents.value = response.data.items
    // pagination.value.total = response.data.total

    // 模拟数据
    contents.value = [
      {
        id: 1,
        title: '系统使用指南',
        category: 'tutorial',
        status: 'published',
        content: '这里是系统使用指南的内容...',
        createdAt: '2023-07-15 10:30',
        updatedAt: '2023-07-15 10:30'
      },
      {
        id: 2,
        title: '系统维护通知',
        category: 'announcement',
        status: 'draft',
        content: '系统将于本周末进行维护...',
        createdAt: '2023-07-14 09:15',
        updatedAt: '2023-07-14 09:15'
      }
    ]
    pagination.value.total = 2
  } catch (error) {
    ElMessage.error('获取内容列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const getCategoryType = (category) => {
  const types = {
    news: '',
    tutorial: 'success',
    announcement: 'warning',
    other: 'info'
  }
  return types[category] || ''
}

const showCreateDialog = () => {
  isEditMode.value = false
  contentForm.value = {
    title: '',
    category: '',
    status: 'draft',
    content: ''
  }
  contentDialogVisible.value = true
}

const handleEdit = (content) => {
  isEditMode.value = true
  currentContentId.value = content.id
  contentForm.value = {
    title: content.title,
    category: content.category,
    status: content.status,
    content: content.content
  }
  contentDialogVisible.value = true
}

const submitContent = async () => {
  try {
    // 这里替换为实际的API调用
    if (isEditMode.value) {
      // await axios.put(`/api/contents/${currentContentId.value}`, contentForm.value)
      ElMessage.success('内容更新成功')
    } else {
      // await axios.post('/api/contents', contentForm.value)
      ElMessage.success('内容创建成功')
    }
    contentDialogVisible.value = false
    fetchContents()
  } catch (error) {
    ElMessage.error('操作失败: ' + error.message)
  }
}

const handleDelete = (content) => {
  ElMessageBox.confirm(`确定要删除 "${content.title}" 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // await axios.delete(`/api/contents/${content.id}`)
      ElMessage.success('删除成功')
      fetchContents()
    } catch (error) {
      ElMessage.error('删除失败: ' + error.message)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handlePublish = async (content) => {
  try {
    // await axios.patch(`/api/contents/${content.id}/publish`)
    ElMessage.success('内容已发布')
    fetchContents()
  } catch (error) {
    ElMessage.error('发布失败: ' + error.message)
  }
}

const handleSelectionChange = (selection) => {
  selectedContents.value = selection
}

const handleSearch = () => {
  // 实现搜索逻辑
  fetchContents()
}

const handleSearchClear = () => {
  searchQuery.value = ''
  fetchContents()
}

const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  fetchContents()
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  fetchContents()
}
</script>

<style scoped>
.content-management {
  padding: 20px;
}

.content-card {
  min-height: calc(100vh - 100px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>