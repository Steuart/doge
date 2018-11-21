import request from '@/utils/request'

/**
 * 分页获取项目列表
 * @param query
 */
export function pageNetwork(query) {
  return request({
    url: '/network/page',
    method: 'get',
    params: query
  })
}

/**
 * 获取列表
 */
export function listNetwork() {
  return request({
    url: '/network/list',
    method: 'get'
  })
}
