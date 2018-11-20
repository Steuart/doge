import request from '@/utils/request'

/**
 * 分页获取项目列表
 * @param query
 */
export function pageCampaign(query) {
  return request({
    url: '/clickRecord/page',
    method: 'get',
    params: query
  })
}
