import request from '@/utils/request'


export function getNetworkById(id){
	return requet({
		url: '/network/'+id,
		method: 'get'
	})
}

/**
 * 分页获取项目列表
 * @param query
 */
export function pageNetwork(query) {
  return request({
    url: '/network/page',
    method: 'get',
    params: query
  })
}

/**
 * 获取列表
 */
export function listNetwork() {
  return request({
    url: '/network/list',
    method: 'get'
  })
}

export function sveNetwork(param) {
	return request({
		url: '/network'
		method: 'put',
		data: param
	})
}

export function updateNetwork(id, param) {
	return request({
		url: '/network/'+id,
		method: 'post',
		data: param
	})
}


export function deleteNetwork(id) {
	return request({
		url: '/network'+id,
		method: 'delete'
	})
}





