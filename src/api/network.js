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
