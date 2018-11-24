import request from '@/utils/request'

/**
 * 根据流量id获取trafficToken列表
 * @param trafficId
 */
export function listByTrafficId(trafficId) {
  return request({
    url: '/trafficToken/list',
    method: 'get',
    params: {
      trafficId: trafficId
    }
  })
}
