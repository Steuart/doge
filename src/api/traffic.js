import request from '@/utils/request'

/**
 * 分页获取项目列表
 * @param query
 */
export function pageTraffic(query) {
  return request({
    url: '/traffic/page',
    method: 'get',
    params: query
  })
}
