import request from '@/utils/request'

/**
 * 分页获取项目列表
 * @param query
 */
export function pageUser(query) {
  return request({
    url: '/user/page',
    method: 'get',
    params: query
  })
}
