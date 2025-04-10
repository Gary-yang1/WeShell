<template>
  <div>
    <h2 class="mb-4">文件管理</h2>

    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex gap-2">
            <el-button type="primary" @click="handleUpload">
              <el-icon><Upload /></el-icon>
              <span>上传</span>
            </el-button>
            <el-button @click="handleNewFolder">
              <el-icon><FolderAdd /></el-icon>
              <span>新建文件夹</span>
            </el-button>
            <el-button type="danger" :disabled="selectedFiles.length === 0" @click="handleDelete">
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </div>

          <el-input
              v-model="searchQuery"
              placeholder="搜索文件..."
              style="width: 300px"
              clearable
          >
            <template #append>
              <el-button :icon="Search" />
            </template>
          </el-input>
        </div>
      </template>

      <el-table
          :data="filteredFiles"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="名称">
          <template #default="{ row }">
            <el-icon v-if="row.isDirectory"><Folder /></el-icon>
            <el-icon v-else><Document /></el-icon>
            <span class="ml-2">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="120">
          <template #default="{ row }">
            {{ row.isDirectory ? '-' : formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="modified" label="修改日期" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="handleDownload(row)">
              <el-icon><Download /></el-icon>
            </el-button>
            <el-button size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="文件上传" width="30%">
      <el-upload
          drag
          multiple
          :action="uploadUrl"
          :headers="uploadHeaders"
          :on-success="handleUploadSuccess"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或<em>点击上传</em>
        </div>
      </el-upload>
    </el-dialog>

    <!-- 新建文件夹对话框 -->
    <el-dialog v-model="folderDialogVisible" title="新建文件夹" width="30%">
      <el-form :model="folderForm" label-width="80px">
        <el-form-item label="文件夹名">
          <el-input v-model="folderForm.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="folderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmNewFolder">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Upload,
  FolderAdd,
  Delete,
  Search,
  Download,
  Edit,
  UploadFilled,
  Folder,
  Document
} from '@element-plus/icons-vue'
import { useFileStore } from '@/stores/fileStore'
import {ElMessage} from "element-plus";

const fileStore = useFileStore()

const loading = ref(false)
const searchQuery = ref('')
const selectedFiles = ref([])
const uploadDialogVisible = ref(false)
const folderDialogVisible = ref(false)
const folderForm = ref({ name: '' })

// 模拟的文件数据，实际应从store获取
const files = ref([
  { id: 1, name: 'config', isDirectory: true, size: 0, modified: '2023-07-15 14:30' },
  { id: 2, name: 'application.properties', isDirectory: false, size: 12288, modified: '2023-07-14 09:15' }
])

const filteredFiles = computed(() => {
  if (!searchQuery.value) return files.value
  return files.value.filter(file =>
      file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
})

onMounted(async () => {
  loading.value = true
  try {
    await fileStore.fetchFiles()
    // 实际项目中应该使用store中的数据
    // files.value = fileStore.files
  } catch (error) {
    console.error('Failed to fetch files:', error)
  } finally {
    loading.value = false
  }
})

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSelectionChange = (selection) => {
  selectedFiles.value = selection
}

const handleUpload = () => {
  uploadDialogVisible.value = true
}

const handleNewFolder = () => {
  folderForm.value.name = ''
  folderDialogVisible.value = true
}

const handleDelete = () => {
  ElMessageBox.confirm('确定要删除选中的文件吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际调用删除API
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleDownload = (file) => {
  // 调用下载API
  console.log('Download:', file.name)
}

const handleEdit = (file) => {
  // 打开编辑界面
  console.log('Edit:', file.name)
}

const handleUploadSuccess = (response, file) => {
  uploadDialogVisible.value = false
  ElMessage.success(`${file.name} 上传成功`)
  // 刷新文件列表
}

const confirmNewFolder = () => {
  if (!folderForm.value.name.trim()) {
    ElMessage.warning('请输入文件夹名称')
    return
  }
  // 调用API创建文件夹
  folderDialogVisible.value = false
  ElMessage.success('文件夹创建成功')
  // 刷新文件列表
}
</script>