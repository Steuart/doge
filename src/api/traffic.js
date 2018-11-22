import request from '@/utils/request'

export function getTrafficById(id) {
	return request({
		url: '/traffic/'+id,
		method: 'get'
	})
}

export function saveTraffic(data) {
	return request({
		url: '/traffic/',
		method: 'put',
		data: data
	})
}

export function updateTraffic(param) {
	return request({
		url: '/traffic/'+id,
		method: 'post',
		data: param
	})
}


export function deleteTraffic(id) {
	return request({
		url: '/traffic/'+id,
		method: 'delete'
	})
}


/**
 * 分页获取流量平台列表
 * @param query
 */
export function pageTraffic(query) {
  return request({
    url: '/traffic/page',
    method: 'get',
    params: query
  })
}

/**
 * 获取流量平台列表
 * @param query
 */
export function listTraffic(query) {
  return request({
    url: '/traffic/list',
    method: 'get'
  })
}
