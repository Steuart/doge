import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'

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
    component: () => import('@/views/login/index'),
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
        meta: { title: 'dashboard', icon: 'dashboard', noCache: true }
      }
    ]
  },
  {
    path: '/campaign',
    component: Layout,
    redirect: '/campaign',
    alwaysShow: true, // will always show the root menu
    meta: {
      title: 'campaign',
      icon: 'component'
    },
    children: [
      {
        path: '/campaign/campaign_list',
        component: () => import('@/views/campaign/list.vue'),
        name: 'campaign_list',
        meta: { title: 'campaign_list', noCache: true }
      },
      {
        path: '/campaign/access_log',
        component: () => import('@/views/campaign/access-log.vue'),
        name: 'access_log',
        meta: { title: 'access_log', noCache: true }
      },
      {
        path: '/campaign/detail',
        component: () => import('@/views/campaign/detail.vue'),
        alwaysShow: false,
        name: 'detail',
        hidden: true,
        meta: { title: '任务详情', noCache: true }
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
        meta: { title: 'offer', icon: 'money', noCache: true }
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
        meta: { title: 'network', icon: 'international', noCache: true }
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
        meta: { title: 'traffic', icon: 'nested', noCache: true }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/guide/index',
    alwaysShow: true, // will always show the root menu
    meta: {
      title: 'system',
      icon: 'setting'
    },
    children: [
      {
        path: 'account',
        component: () => import('@/views/system/account-manage.vue'),
        name: 'account',
        meta: { title: 'account_manage', noCache: true }
      }
    ]
  }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
