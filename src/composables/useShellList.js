// src/composables/useShellList.js
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export function useShellList() {
    const loading = ref(true)
    const error = ref(null)
    const data = ref([])

    const api = axios.create({
        baseURL: '/api',
        timeout: 10000
    })

    const fetchData = async () => {
        try {
            loading.value = true
            error.value = null
            const res = await api.post('/shells/list')
            data.value = res.data.map(item => ({
                id: item.id,
                url: item.url,
                ip: item.ip,
                scriptType: item.type,
                osType: item.os,
                status: '未知',
                notes: item.memo,
                createdAt: item.addTime ? new Date(item.addTime).toLocaleString() : '',
                editing: false,
                editNotes: item.memo
            }))
        } catch (err) {
            error.value = '获取目标失败：' + err.message
            ElMessage.error(error.value)
        } finally {
            loading.value = false
        }
    }

    let timer = null
    onMounted(() => {
        fetchData()
        timer = setInterval(fetchData, 60000)
    })

    onUnmounted(() => {
        if (timer) clearInterval(timer)
    })

    return {
        loading,
        error,
        data,
        fetchData
    }
}
