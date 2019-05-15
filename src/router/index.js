import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'
import store from '@/store'
/* Router Modules */

/** note: Submenu only appear when children.length>=1
 *  detail see  https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 **/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    roles: ['admin','editor']     will control the page roles (you can set multiple roles)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if true ,the page will no be cached(default is false)
  }
**/
export const constantRouterMap = [
  { path: '*',
    component: () => import('@/views/errorPage/404')
  },
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/register',
    name: '注册',
    component: () => import('@/views/register/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/authredirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '主页', icon: 'dashboard', noCache: true }
      }
    ]
  },
  {
    path: '/campaign',
    component: Layout,
    redirect: '/campaign',
    alwaysShow: true, // will always show the root menu
    meta: {
      title: '营销',
      icon: 'component'
    },
    children: [
      {
        path: '/campaign/campaign_list',
        component: () => import('@/views/campaign/list.vue'),
        name: 'campaign_list',
        meta: { title: '项目列表', noCache: true }
      },
      {
        path: '/campaign/access_log',
        component: () => import('@/views/campaign/access-log.vue'),
        name: 'access_log',
        meta: { title: '访问日志', noCache: true }
      },
      {
        path: '/campaign/detail',
        component: () => import('@/views/campaign/detail.vue'),
        alwaysShow: false,
        name: 'detail',
        hidden: true,
        meta: { title: '任务详情', noCache: true }
      },
      {
        path: '/campaign/edit',
        component: () => import('@/views/campaign/edit.vue'),
        alwaysShow: false,
        name: 'edit',
        hidden: true,
        meta: { title: '编辑任务', noCache: true }
      }
    ]
  },
  {
    path: '/offer',
    component: Layout,
    redirect: '/offer',
    children: [
      {
        path: 'list',
        component: () => import('@/views/offer/list.vue'),
        name: 'list',
        meta: { title: '任务', icon: 'money', noCache: true }
      },
      {
        path: 'detail',
        component: () => import('@/views/offer/detail.vue'),
        name: 'detail',
        hidden: true,
        meta: { title: '任务详情', noCache: true }
      }
    ]
  },
  {
    path: '/network',
    component: Layout,
    redirect: '/network',
    children: [
      {
        path: 'index',
        component: () => import('@/views/network/list.vue'),
        name: 'network',
        meta: { title: '网络联盟', icon: 'international', noCache: true }
      }
    ]
  },
  {
    path: '/traffic',
    component: Layout,
    redirect: '/traffic',
    children: [
      {
        path: 'index',
        component: () => import('@/views/traffic/list.vue'),
        name: 'traffic',
        meta: { title: '流量平台', icon: 'nested', noCache: true }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/guide/index',
    alwaysShow: true, // will always show the root menu
    meta: {
      title: '系统设置',
      icon: 'setting'
    },
    children: [
      {
        path: 'account',
        component: () => import('@/views/system/account-manage.vue'),
        name: 'account',
        meta: { title: '账号管理', noCache: true }
      },
      {
        path: 'quota',
        component: () => import('@/views/system/quota-manage.vue'),
        name: 'quota',
        meta: { title: '指标管理', noCache: true }
      }
    ]
  }
]

const router = new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

// const whiteList = []
router.beforeEach((to, from, next) => {
  const exclude = ['/login', '/register', '/404', '/401']

  if (store.getters.token === 'undefined' || !store.getters.token) {
    if (exclude.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router
