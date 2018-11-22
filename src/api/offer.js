import request from '@/utils/request'


export function getOfferById(id) {
	return request({
		url: '/offer/'+id,
		method: 'get'
	})
}


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

export function saveOffer(param) {
	return request({
		url: '/offer',
		method: 'put'.
		data: param
	})
}

export function updateOffer(id,param) {
	return request({
		url: '/offer/'+id,
		method: 'post',
		data: param
	})
}

export function deleteOffer(id) {
	return request({
		url: '/offer/'+id,
		method: 'delete'
	})
}

