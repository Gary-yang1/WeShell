import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useSystemStore = defineStore('system', () => {
    // 状态
    const javaVersion = ref('')
    const vmName = ref('')
    const osName = ref('')
    const osArch = ref('')
    const pid = ref('')
    const appPath = ref('')
    const envVars = ref({})
    const javaConfigs = ref({})

    // 操作
    const fetchSystemInfo = async () => {
        try {
            // 这里替换为实际的API端点
            const response = await axios.get('/api/system/info')

            // 假设后端返回的数据结构如下
            const data = response.data

            javaVersion.value = data.java.runtime.version
            vmName.value = data.java.vm.name
            osName.value = data.os.name
            osArch.value = data.os.arch
            pid.value = data.app.pid
            appPath.value = data.app.path
            envVars.value = data.envVars
            javaConfigs.value = data.javaConfigs

            return data
        } catch (error) {
            console.error('Failed to fetch system info:', error)
            throw error
        }
    }

    return {
        javaVersion,
        vmName,
        osName,
        osArch,
        pid,
        appPath,
        envVars,
        javaConfigs,
        fetchSystemInfo
    }
})