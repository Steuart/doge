import request from '@/utils/request'

export function defaultTransferStatistic(query) {
  return request({
    url: '/statistic/default',
    method: 'get',
    params: query
  })
}
