import request from '@/utils/request'

/**
 * 分页获取流量平台列表
 * @param query
 */
export function pageTraffic(query) {
  return request({
    url: '/traffic/page',
    method: 'get',
    params: query
  })
}

/**
 * 获取流量平台列表
 * @param query
 */
export function listTraffic(query) {
  return request({
    url: '/traffic/list',
    method: 'get'
  })
}
