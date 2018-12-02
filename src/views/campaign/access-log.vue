<template>
  <div class="app-container">
    <ul class="field-container">
      <li v-for="quota in quotas" :key="quota.id">
        <h3>{{ quota.name }}</h3>
        <el-checkbox-group v-model="checkboxVal">
          <el-checkbox v-for="child in quota.children" :label="child.code" :key="child.code">{{ child.name }}</el-checkbox>
        </el-checkbox-group>
      </li>
    </ul>
    <div class="filter-container">
      <el-select v-model="listQuery.trafficId" :placeholder="'流量平台'" clearable style="width: 130px" class="filter-item">
        <el-option v-for="item in trafficList" :key="item.id" :label="item.name" :value="item.id"/>
      </el-select>
      <el-select v-model="listQuery.networkId" :placeholder="'网络联盟'" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in networkList" :key="item.id" :label="item.name" :value="item.id"/>
      </el-select>
      <el-select v-model="listQuery.offerId" :placeholder="'任务'" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in offerList" :key="item.id" :label="item.name" :value="item.id"/>
      </el-select>
      <el-date-picker
        v-model="listQuery.createBeginDate"
        class="filter-item"
        type="date"
        value-format="yyyy-MM-dd HH:mm:ss"
        placeholder="开始日期"
        style="width: 150px"/>
      <span class="filter-item">-</span>
      <el-date-picker
        v-model="listQuery.createEndDate"
        class="filter-item"
        type="date"
        value-format="yyyy-MM-dd HH:mm:ss"
        placeholder="结束日期"
        style="width: 150px"/>
      <!--<el-input :placeholder="'名字'" v-model="listQuery.title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>-->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" circle @click="handleFilter" />
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange">
      <el-table-column :label="'编号'" type="index" align="center" />
      <el-table-column :label="'营销'" prop="campaignName" align="center" />
      <el-table-column :label="'任务'" prop="offerName" align="center" />
      <el-table-column :label="'流量'" prop="trafficName" align="center" />
      <el-table-column :label="'网络联盟'" prop="networkName" align="center" />
      <el-table-column :label="'创建时间'" prop="dateCreate" sortable="custom" align="center" />
      <el-table-column v-for="quotaCode in formThead" :key="quotaCode" :label="quotasMap[quotaCode]">
        <template slot-scope="scope">
          {{ scope.row.content[quotaCode] }}
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog :visible.sync="deleteVisible" title="确认删除" width="30%">
      <span>删除后将不可恢复，确认删除？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-tooltip placement="top" content="返回顶部">
      <back-to-top :visibility-height="300" :back-position="50" transition-name="fade"/>
    </el-tooltip>
  </div>
</template>

<script>
import { pageCampaign } from '@/api/clickRecord'
import { listAll } from '@/api/quota'
import { listNetwork } from '@/api/network'
import { listTraffic } from '@/api/traffic'
import { listOffer } from '@/api/offer'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import BackToTop from '@/components/BackToTop'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj ,such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination, BackToTop },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      quotas: [],
      quotasMap: {},
      quotasArr: [],
      checkList: [],
      formThead: [],
      checkboxVal: [],
      networkList: null,
      trafficList: null,
      offerList: null,
      listQuery: {
        pageNo: 1,
        pageSize: 20,
        trafficId: null,
        networkId: null,
        offerId: null,
        campaignId: null,
        createBeginDate: null,
        createEndDate: null,
        sorts: [{
          'fieldName': 'dateUpdate',
          'sortType': 'desc'
        }]
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      deleteVisible: false,
      beginDate: '',
      endDate: ''
    }
  },
  watch: {
    checkboxVal(valArr) {
      this.formThead = this.quotasArr.filter(code => valArr.indexOf(code) >= 0)
      this.key = this.key + 1// 为了保证table 每次都会重渲 In order to ensure the table will be re-rendered each time
    }
  },
  created() {
    this.getList()
    this.listAllQuota()
    this.listNetwork()
    this.listTraffic()
    this.listOffer()
  },
  methods: {
    getList() {
      this.listLoading = true
      pageCampaign(this.listQuery).then(response => {
        if (response) {
          const data = response.data
          this.list = data.list
          this.total = data.total

          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 200)
        }
      })
    },
    listAllQuota() {
      listAll().then(response => {
        if (response) {
          this.quotas = response.data
          for (const i in this.quotas) {
            const children = this.quotas[i].children
            for (const j in children) {
              const quota = children[j]
              this.quotasMap[quota.code] = quota.name
              this.quotasArr.push(quota.code)
            }
          }
        }
      })
    },
    // 查询网络联盟列表
    listNetwork() {
      listNetwork().then(response => {
        if (response) {
          this.networkList = response.data
        }
      })
    },
    listTraffic() {
      listTraffic().then(response => {
        if (response) {
          this.trafficList = response.data
        }
      })
    },
    listOffer() {
      listOffer().then(response => {
        if (response) {
          this.offerList = response.data
        }
      })
    },
    handleFilter() {
      this.listQuery.pageNo = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .app-container {
    .field-container {
      list-style-type:none;
      margin-bottom: 30px;
      .el-checkbox-group {
        margin-left: 40px;
      }
    }
  }
</style>
