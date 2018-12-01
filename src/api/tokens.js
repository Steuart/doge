import request from '@/utils/request'

/**
 * 保存tokens
 * @param data
 */
export function saveTokens(data) {
  return request({
    url: '/tokens',
    method: 'put',
    data: data
  })
}

/**
 * 更新tokens
 * @param id
 */
export function updateTokens(id, data) {
  return request({
    url: '/tokens/' + id,
    method: 'post',
    data: data
  })
}

/**
 * 更新删除tokens
 * @param id
 */
export function deleteTokens(id) {
  return request({
    url: '/tokens/' + id,
    method: 'delete'
  })
}

/**
 * 根据业务id和类型查询
 * @param idRef
 */
export function listByIdRefAndType(idRef, type) {
  return request({
    url: '/tokens/list',
    method: 'get',
    params: {
      idRef: idRef,
      type: type
    }
  })
}
