import request from '@/utils/request'

/**
 * 查询所有的指标
 * @param data
 */
export function listAll() {
  return request({
    url: '/quota/listAll',
    method: 'get'
  })
}

/**
 * 保存指标
 * @param data
 */
export function saveQuota(param) {
  return request({
    url: '/quota',
    method: 'put',
    data: param
  })
}

/**
 * 更新指标
 * @param data
 */
export function updateQuota(id, param) {
  return request({
    url: '/quota/' + id,
    method: 'post',
    data: param
  })
}

/**
 * 删除指标
 * @param data
 */
export function deleteQuota(id) {
  return request({
    url: '/quota/' + id,
    method: 'delete'
  })
}
