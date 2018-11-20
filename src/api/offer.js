import request from '@/utils/request'

/**
 * 分页获取项目列表
 * @param query
 */
export function pageOffer(query) {
  return request({
    url: '/offer/page',
    method: 'get',
    params: query
  })
}
