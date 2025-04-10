import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import FileManagement from '@/views/FileManagement.vue'
import ContentManagement from '@/views/ContentManagement.vue'
import DataManagement from '@/views/DataManagement.vue'
import TargetList from "./views/TargetList.vue";

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/file',
        name: 'FileManagement',
        component: FileManagement
    },
    {
        path: '/content',
        name: 'ContentManagement',
        component: ContentManagement
    },
    {
        path: '/data',
        name: 'DataManagement',
        component: DataManagement
    },
    {
        path: '/target',
        name: 'TargetManagement',
        component: TargetList
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_BASE_URL),
    routes
})

export default router