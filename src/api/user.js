import request from '@/utils/request'

/**
 * 分页获取项目列表
 * @param data
 */
export function pageUser(data) {
  return request({
    url: '/user/page',
    method: 'post',
    data: data
  })
}

/**
 * 添加用户
 * @param data
 */
export function addUser(data) {
  return request({
    url: '/user',
    method: 'put',
    data: data
  })
}

/**
 * 更新用户
 * @param data
 * @param id
 */
export function updateUser(id, data) {
  return request({
    url: '/user/' + id,
    method: 'post',
    data: data
  })
}

/**
 * 更新用户密码
 * @param username
 * @param password
 */
export function updatePassword(username, password) {
  return request({
    url: '/user/' + username,
    method: 'post',
    data: {
      password: password
    }
  })
}

/**
 * 删除用户
 * @param id
 */
export function deleteUser(id) {
  return request({
    url: '/user/' + id,
    method: 'delete'
  })
}
