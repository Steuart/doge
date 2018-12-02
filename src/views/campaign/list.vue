<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.networkId" :placeholder="'流量平台'" clearable style="width: 130px" class="filter-item">
        <el-option v-for="item in trafficList" :key="item.id" :label="item.name" :value="item.id"/>
      </el-select>
      <el-select v-model="listQuery.trafficId" :placeholder="'网络联盟'" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in networkList" :key="item.id" :label="item.name" :value="item.id"/>
      </el-select>
      <el-date-picker
        v-model="listQuery.beginDate"
        class="filter-item"
        type="date"
        value-format="yyyy-MM-dd HH:mm:ss"
        placeholder="开始日期"
        style="width: 150px"/>
      <span class="filter-item">-</span>
      <el-date-picker
        v-model="listQuery.endDate"
        class="filter-item"
        type="date"
        value-format="yyyy-MM-dd HH:mm:ss"
        placeholder="结束日期"
        style="width: 150px"/>
      <el-input :placeholder="'名字'" v-model="listQuery.name" style="width: 200px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" circle @click="getList" />
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
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
      <el-table-column :label="'编号'" type="index" align="center" width="65" />
      <el-table-column :label="'名字'" align="center" width="150">
        <template slot-scope="scope">
          <router-link to="/campaign/detail">
            <el-tag>{{ scope.row.name }}</el-tag>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column :label="'创建时间'" sortable="custom" property="dateCreate" width="170px" align="center" />
      <el-table-column :label="'跳转链接'" property="redirectLink" />
      <el-table-column :label="'转化'" sortable="custom" property="leads" width="110px" align="center" />
      <el-table-column :label="'点击'" sortable="custom" property="clicks" width="110px" align="center" />
      <el-table-column :label="'CPC(%)'" sortable="custom" property="costPerClick" width="110px" align="center" />
      <el-table-column :label="'PPL(%)'" sortable="custom" property="payPerLead" align="center" width="110px" />
      <el-table-column :label="'CVR(%)'" sortable="custom" property="payPerLead" class-name="status-col" width="110px" />
      <el-table-column :label="'CPC(%)'" sortable="custom" property="costPerClick" class-name="status-col" width="110px" />
      <el-table-column :label="'ROI(%)'" sortable="custom" property="clicks" class-name="status-col" width="110px" />
      <el-table-column :label="'操作'" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ '编辑' }}</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">{{ '删除' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px" class="edit-dialog">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="100px" style="width: 500px; margin-left:50px;">
        <el-form-item :label="'名字'" prop="title">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <!--<el-form-item :label="'类型'" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
          </el-select>
        </el-form-item>-->
        <el-form-item :label="'任务'" prop="type">
          <el-select v-model="temp.offerId" class="filter-item" placeholder="请选择">
            <el-option v-for="item in offerList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="'流量平台'" prop="type">
          <el-select v-model="temp.trafficId" class="filter-item" placeholder="请选择" @change="listTrafficToken()" >
            <el-option v-for="item in trafficList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="'CPC'" prop="title">
          <el-input v-model="temp.costPerClick" style="width: 100%"/>
        </el-form-item>
        <div class="token">
          <el-form-item v-for="(item, index) in temp.tokens" :key="item.id" :label="'p'+index">
            <el-select v-model="item.name" style="width: 40%" placeholder="请选择">
              <el-option-group
                v-for="group in quotas"
                :key="group.id"
                :label="group.name">
                <el-option
                  v-for="child in group.children"
                  :key="child.code"
                  :label="child.name"
                  :value="child.code" />
              </el-option-group>
            </el-select>
            <el-input v-model="item.value"/>
            <el-button style="display: inline;" @click="deleteToken(index)">删除</el-button>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button round style="width: 100%" @click="addToken">+</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="deleteVisible" title="确认删除" width="30%">
      <span>删除后将不可恢复，确认删除？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDelete()">确 定</el-button>
      </span>
    </el-dialog>
    <el-tooltip placement="top" content="返回顶部">
      <back-to-top :visibility-height="300" :back-position="50" transition-name="fade"/>
    </el-tooltip>
  </div>
</template>

<script>
import { pageCampaign, getCampaign, deleteCampaign, updateCamapign, saveCampaign } from '@/api/campaign'
import { listNetwork } from '@/api/network'
import { listTraffic } from '@/api/traffic'
import { listOffer } from '@/api/offer'
import { listByIdRefAndType } from '@/api/tokens'
import { listAll } from '@/api/quota'
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
      networkList: null,
      trafficList: null,
      offerList: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNo: 1,
        pageSize: 20,
        trafficId: null,
        networkId: null,
        name: null,
        beginDate: null,
        endDate: null,
        sorts: [{
          'fieldName': 'dateUpdate',
          'sortType': 'desc'
        }]
      },
      temp: {
        id: null,
        name: null,
        costPerClick: null,
        trafficId: null,
        offerId: null,
        tokens: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      deleteVisible: false,
      tempDeleteId: null,
      downloadLoading: false,
      beginDate: '',
      endDate: '',
      quotas: []
    }
  },
  created() {
    this.getList()
    this.listNetwork()
    this.listTraffic()
    this.listOffer()
    this.listQuotas()
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
          }, 1.5 * 100)
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
    listTrafficToken() {
      const trafficId = this.temp.trafficId
      this.temp.tokens = []
      listByIdRefAndType(trafficId, 1).then(response => {
        if (response) {
          const datas = response.data
          for (const i in datas) {
            const data = datas[i]
            this.temp.tokens.push({
              name: data.name,
              value: data.value,
              id: data.id
            })
          }
        }
      })
    },
    // 列出所有的指标
    listQuotas() {
      listAll().then(response => {
        if (response) {
          this.quotas = response.data
        }
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop !== null) {
        let sortType = 'asc'
        if (order === 'descending') {
          sortType = 'desc'
        } else {
          sortType = 'asc'
        }
        this.listQuery.sorts = [{
          'fieldName': prop,
          'sortType': sortType
        }]
      }
      this.getList()
    },
    resetTemp() {
      this.temp = {
        name: null,
        costPerClick: null,
        trafficId: null,
        offerId: null,
        tokens: [],
        status: 'published'
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      const param = this.temp
      saveCampaign(param).then(response => {
        if (response) {
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
          this.dialogFormVisible = false
          this.getList()
        }
      })
    },
    updateData() {
      const param = this.temp
      updateCamapign(param.id, param).then(response => {
        if (response) {
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
          this.dialogFormVisible = false
          this.getList()
        }
      })
    },
    handleUpdate(row) {
      this.resetTemp()
      this.dialogStatus = 'update'
      const id = row.id
      this.temp.id = id
      getCampaign(id).then(response => {
        if (response) {
          const data = response.data
          this.temp.name = data.name
          this.temp.costPerClick = data.costPerClick
          this.temp.trafficId = data.trafficId
          this.temp.offerId = data.offerId
          this.dialogFormVisible = true
        }
      })
      listByIdRefAndType(id, 0).then(response => {
        if (response) {
          if (response.data !== null) {
            this.temp.tokens = response.data
          }
          this.dialogFormVisible = true
        }
      })
    },
    addToken() {
      this.temp.tokens.push({
        name: null,
        value: null,
        id: null
      })
    },
    deleteToken(index) {
      this.temp.tokens.splice(index, 1)
    },
    handleDelete(row) {
      this.deleteVisible = true
      this.tempDeleteId = row.id
    },
    confirmDelete() {
      deleteCampaign(this.tempDeleteId).then(response => {
        if (response) {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.deleteVisible = false
          this.getList()
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .app-container {
    .edit-dialog {
      .el-input{
        width: 100%;
      }
      .el-select{
        width: 100%;
      }

      .token {
        .el-input{
          width: 40%;
          display: inline-block;
        }
      }
    }
  }
</style>
