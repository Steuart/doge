import request from '@/utils/request'

/**
 * 根据campaignId获取token列表
 * @param campaignId
 */
export function listByCampaignId(campaignId) {
  return request({
    url: '/campaignToken/list',
    method: 'get',
    data: {
      campaignId: campaignId
    }
  })
}
