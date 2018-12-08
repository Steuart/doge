<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.networkId" :placeholder="'网络联盟'" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in networkList" :key="item.id" :label="item.name" :value="item.id"/>
      </el-select>
      <el-date-picker
        v-model="listQuery.beginDate"
        value-format="yyyy-MM-dd HH:mm:ss"
        class="filter-item"
        type="date"
        placeholder="开始日期"
        style="width: 150px"/>
      <span class="filter-item">-</span>
      <el-date-picker
        v-model="listQuery.endDate"
        value-format="yyyy-MM-dd HH:mm:ss"
        class="filter-item"
        type="date"
        placeholder="结束日期"
        style="width: 150px"/>
      <el-input :placeholder="'名字'" v-model="listQuery.name" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" circle @click="handleFilter" />
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">{{ '新增' }}</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="items"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange">
      <el-table-column :label="'编号'" type="index" align="center" width="65" />
      <el-table-column :label="'名字'" prop="id" align="center" width="130">
        <template slot-scope="scope">
          <router-link to="/offer/detail">
            <el-tag> {{ scope.row.name }} </el-tag>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column :label="'联盟'" width="150px" property="networkName" align="center" />
      <el-table-column :label="'URL'" property="url" />
      <el-table-column :label="'Payout'" sortable="custom" property="payout" width="110px" align="center" />
      <el-table-column :label="'简介'" property="remark" align="center" />
      <!--
        <el-table-column :label="'类型'" property="type" width="90px" align="center" />
      -->
      <el-table-column :label="'创建时间'" sortable="custom" property="dateCreate" width="160px" align="center" />
      <el-table-column :label="'状态'" sortable="custom" width="90px" property="status" align="center" />
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
        <el-form-item :label="'联盟'" prop="type">
          <el-select v-model="temp.networkId" class="filter-item" placeholder="请选择">
            <el-option v-for="item in networkList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="'URL'" prop="type">
          <el-input v-model="temp.url" style="width: 100%"/>
        </el-form-item>
        <el-form-item :label="'Payout'" prop="title">
          <el-input v-model="temp.payout" style="width: 100%"/>
        </el-form-item>
        <el-form-item :label="'简介'" prop="type">
          <el-input
            v-model="temp.remark"
            :rows="6"
            type="textarea"
            placeholder="请输入内容"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ '取消' }}</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">{{ '确认' }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"/>
        <el-table-column prop="pv" label="Pv"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ 'table.confirm' }}</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="deleteVisible" title="确认删除" width="30%">
      <span>删除后将不可恢复，确认删除？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDelete()">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { pageOffer, saveOffer, updateOffer, deleteOffer, getOfferById } from '@/api/offer'
import { listNetwork } from '@/api/network'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

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
  components: { Pagination },
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
      items: null,
      total: 0,
      listLoading: true,
      networkList: null,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sorts: [{
          'fieldName': 'dateUpdate',
          'sortType': 'desc'
        }]
      },
      tempDeleteId: null,
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: null,
        networkId: null,
        name: null,
        url: null,
        remark: '',
        payout: null
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      deleteVisible: false,
      downloadLoading: false,
      beginDate: '',
      endDate: ''
    }
  },
  created() {
    this.getList()
    this.listNetwork()
  },
  methods: {
    getList() {
      this.listLoading = true
      pageOffer(this.listQuery).then(response => {
        const data = response.data
        this.items = data.list
        this.total = data.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 200)
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
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    resetTemp() {
      this.temp = {
        id: null,
        networkId: null,
        name: null,
        url: null,
        remark: '',
        payout: null
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
      console.log(this.temp)
      saveOffer(this.temp).then(response => {
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
    handleUpdate(row) {
      const id = row.id
      getOfferById(id).then(response => {
        if (response) {
          const data = response.data
          this.temp = {
            id: data.id,
            networkId: data.networkId,
            name: data.name,
            url: data.url,
            remark: data.remark,
            payout: data.payout
          }
          this.dialogStatus = 'update'
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].clearValidate()
          })
        }
      })
    },
    updateData() {
      const param = this.temp
      updateOffer(param.id, param).then(response => {
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
    handleDelete(row) {
      this.deleteVisible = true
      this.tempDeleteId = row.id
    },
    confirmDelete() {
      deleteOffer(this.tempDeleteId).then(response => {
        if (response) {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
          this.deleteVisible = false
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
