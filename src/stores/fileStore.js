import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useFileStore = defineStore('file', () => {
    const files = ref([])
    const currentPath = ref('/')
    const loading = ref(false)

    const fetchFiles = async (path = '/') => {
        loading.value = true
        try {
            const response = await axios.get('/api/files', {
                params: { path }
            })
            files.value = response.data
            currentPath.value = path
        } catch (error) {
            console.error('Failed to fetch files:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    const createFolder = async (name) => {
        try {
            await axios.post('/api/files/folder', {
                path: currentPath.value,
                name
            })
            await fetchFiles(currentPath.value)
        } catch (error) {
            console.error('Failed to create folder:', error)
            throw error
        }
    }

    const deleteFiles = async (fileIds) => {
        try {
            await axios.delete('/api/files', {
                data: { ids: fileIds }
            })
            await fetchFiles(currentPath.value)
        } catch (error) {
            console.error('Failed to delete files:', error)
            throw error
        }
    }

    return {
        files,
        currentPath,
        loading,
        fetchFiles,
        createFolder,
        deleteFiles
    }
})