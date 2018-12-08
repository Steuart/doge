import request from '@/utils/request'

/**
 * 初始化指标
 */
export function init() {
  return request({
    url: '/system/init',
    method: 'get'
  })
}
