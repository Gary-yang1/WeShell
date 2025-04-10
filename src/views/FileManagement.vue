<template>
  <div class="file-management">
    <el-card class="file-manager-card">
      <template #header>
        <div class="card-header">
          <h3>文件管理</h3>
          <div class="action-buttons">
            <el-upload
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleUploadSuccess"
                :before-upload="beforeUpload"
            >
              <el-button type="primary" :icon="Upload">上传文件</el-button>
            </el-upload>
            <el-button
                type="success"
                :icon="FolderAdd"
                @click="showCreateFolderDialog"
            >
              新建文件夹
            </el-button>
          </div>
        </div>
      </template>

      <el-table
          :data="filteredFiles"
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="文件名" sortable>
          <template #default="{ row }">
            <el-icon v-if="row.isDir"><Folder /></el-icon>
            <el-icon v-else><Document /></el-icon>
            <span class="file-name" @click="handleFileClick(row)">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="120" sortable>
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="modified" label="修改时间" width="180" sortable />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button
                size="small"
                :icon="Download"
                @click="handleDownload(row)"
                v-if="!row.isDir"
            />
            <el-button
                size="small"
                :icon="Delete"
                @click="handleDelete(row)"
            />
            <el-button
                size="small"
                :icon="Edit"
                @click="showRenameDialog(row)"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="path-navigator">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
              v-for="(path, index) in currentPathParts"
              :key="index"
              @click="navigateToPath(index)"
          >
            {{ path || '根目录' }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </el-card>

    <!-- 新建文件夹对话框 -->
    <el-dialog v-model="folderDialogVisible" title="新建文件夹" width="30%">
      <el-form :model="folderForm" :rules="folderRules" ref="folderFormRef">
        <el-form-item label="文件夹名称" prop="name">
          <el-input v-model="folderForm.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="folderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createFolder">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重命名对话框 -->
    <el-dialog v-model="renameDialogVisible" title="重命名" width="30%">
      <el-form :model="renameForm" :rules="renameRules" ref="renameFormRef">
        <el-form-item label="新名称" prop="name">
          <el-input v-model="renameForm.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRename">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Upload,
  FolderAdd,
  Download,
  Delete,
  Edit,
  Folder,
  Document
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态管理
const loading = ref(false)
const files = ref([])
const selectedFiles = ref([])
const currentPath = ref('/')
const folderDialogVisible = ref(false)
const renameDialogVisible = ref(false)
const currentFile = ref(null)

// 表单数据
const folderForm = ref({ name: '' })
const renameForm = ref({ name: '' })

// 表单验证规则
const folderRules = {
  name: [
    { required: true, message: '请输入文件夹名称', trigger: 'blur' },
    { pattern: /^[^\\/:*?"<>|]+$/, message: '不能包含非法字符', trigger: 'blur' }
  ]
}

const renameRules = {
  name: [
    { required: true, message: '请输入新名称', trigger: 'blur' },
    { pattern: /^[^\\/:*?"<>|]+$/, message: '不能包含非法字符', trigger: 'blur' }
  ]
}

// 计算属性
const currentPathParts = computed(() => {
  return currentPath.value.split('/').filter(part => part !== '')
})

const filteredFiles = computed(() => {
  return files.value.filter(file =>
      file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 生命周期钩子
onMounted(() => {
  fetchFiles()
})

// 方法
const fetchFiles = async (path = '/') => {
  try {
    loading.value = true
    // 这里替换为实际的API调用
    // const response = await axios.get('/api/files', { params: { path } })
    // files.value = response.data

    // 模拟数据
    files.value = [
      { name: 'documents', isDir: true, size: 0, modified: '2023-07-15 10:30' },
      { name: 'images', isDir: true, size: 0, modified: '2023-07-14 09:15' },
      { name: 'report.pdf', isDir: false, size: 2457600, modified: '2023-07-13 14:20' },
      { name: 'data.json', isDir: false, size: 102400, modified: '2023-07-12 11:05' }
    ]

    currentPath.value = path
  } catch (error) {
    ElMessage.error('获取文件列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSelectionChange = (selection) => {
  selectedFiles.value = selection
}

const handleFileClick = (file) => {
  if (file.isDir) {
    fetchFiles(`${currentPath.value}${file.name}/`)
  }
}

const navigateToPath = (index) => {
  const newPath = '/' + currentPathParts.value.slice(0, index + 1).join('/')
  fetchFiles(newPath)
}

const showCreateFolderDialog = () => {
  folderForm.value.name = ''
  folderDialogVisible.value = true
}

const createFolder = async () => {
  try {
    // 这里替换为实际的API调用
    // await axios.post('/api/folders', {
    //   path: currentPath.value,
    //   name: folderForm.value.name
    // })

    ElMessage.success('文件夹创建成功')
    folderDialogVisible.value = false
    fetchFiles()
  } catch (error) {
    ElMessage.error('创建文件夹失败: ' + error.message)
  }
}

const showRenameDialog = (file) => {
  currentFile.value = file
  renameForm.value.name = file.name
  renameDialogVisible.value = true
}

const confirmRename = async () => {
  try {
    // 这里替换为实际的API调用
    // await axios.put('/api/files/rename', {
    //   path: currentPath.value,
    //   oldName: currentFile.value.name,
    //   newName: renameForm.value.name
    // })

    ElMessage.success('重命名成功')
    renameDialogVisible.value = false
    fetchFiles()
  } catch (error) {
    ElMessage.error('重命名失败: ' + error.message)
  }
}

const handleDelete = (file) => {
  ElMessageBox.confirm(`确定要删除 "${file.name}" 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里替换为实际的API调用
      // await axios.delete('/api/files', {
      //   data: {
      //     path: currentPath.value,
      //     name: file.name
      //   }
      // })

      ElMessage.success('删除成功')
      fetchFiles()
    } catch (error) {
      ElMessage.error('删除失败: ' + error.message)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleDownload = (file) => {
  // 这里实现下载逻辑
  ElMessage.success(`开始下载 ${file.name}`)
  // window.open(`/api/files/download?path=${currentPath.value}&name=${file.name}`)
}

const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }
  return true
}

const handleUploadSuccess = () => {
  ElMessage.success('上传成功')
  fetchFiles()
}
</script>

<style scoped>
.file-management {
  padding: 20px;
}

.file-manager-card {
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

.file-name {
  margin-left: 8px;
  cursor: pointer;
}

.file-name:hover {
  color: #409eff;
  text-decoration: underline;
}

.path-navigator {
  margin-top: 20px;
}

.path-navigator .el-breadcrumb {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.path-navigator .el-breadcrumb-item {
  cursor: pointer;
}

.path-navigator .el-breadcrumb-item:hover {
  color: #409eff;
}
</style>