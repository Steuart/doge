import request from '@/utils/request'

/**
 * 分页获取项目列表
 * @param query
 */
export function pageCampaign(query) {
  return request({
    url: '/campaign/page',
    method: 'post',
    data: query
  })
}

export function saveCampaign(data) {
  return request({
    url: '/campaign',
    method: 'put',
    data: data
  })
}

export function getCampaign(id) {
  return request({
    url: '/campaign/' + id,
    method: 'get'
  })
}

export function updateCamapign(id, param) {
  return request({
    url: '/campaign/' + id,
    method: 'post',
    data: param
  })
}

export function deleteCampaign(id) {
  return request({
    url: '/campaign/' + id,
    method: 'delete'
  })
}
