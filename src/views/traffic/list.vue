<template>
  <div class="app-container">
    <div class="filter-container">
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
      <el-table-column :label="'名字'" prop="name" align="center" width="120" />
      <el-table-column :label="'主页'" prop="homePage" align="center" width="400" />
      <el-table-column :label="'备注'" prop="remark" align="center" />
      <el-table-column :label="'创建时间'" prop="dateCreate" sortable="custom" width="170px" align="center" />
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
        <el-form-item :label="'主页'" prop="type">
          <el-input v-model="temp.homePage"/>
        </el-form-item>
        <el-form-item :label="'备注'" prop="title">
          <el-input v-model="temp.remark" style="width: 100%"/>
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
        <el-button @click="dialogFormVisible = false">{{ '取消' }}</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">{{ '确认' }}</el-button>
      </div>
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
import { pageTraffic, getTrafficById, saveTraffic, updateTraffic, deleteTraffic } from '@/api/traffic'
import { listByIdRefAndType } from '@/api/tokens'
import { listAll } from '@/api/quota'
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
      listQuery: {
        pageNo: 1,
        pageSize: 20,
        name: null,
        beginDate: null,
        endDate: null,
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
        id: null,
        name: null,
        homePage: null,
        remark: '',
        tokens: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
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
      endDate: '',
      tempDeleteId: null,
      quotas: []
    }
  },
  created() {
    this.getList()
    this.listQuotas()
  },
  methods: {
    getList() {
      this.listLoading = true
      pageTraffic(this.listQuery).then(response => {
        if (response) {
          const data = response.data
          this.items = data.list
          this.total = data.total
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 150)
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
    handleFilter() {
      this.listQuery.pageNo = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
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
    resetTemp() {
      this.temp = {
        id: null,
        name: null,
        homePage: null,
        remark: '',
        tokens: []
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
      saveTraffic(param).then(response => {
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
      this.resetTemp()
      this.dialogStatus = 'update'
      const id = row.id
      this.temp.id = id
      getTrafficById(id).then(response => {
        if (response) {
          const data = response.data
          this.temp.name = data.name
          this.temp.id = data.id
          this.temp.homePage = data.homePage
          this.temp.remark = data.remark
          this.dialogFormVisible = true
        }
      })
      listByIdRefAndType(id, 1).then(response => {
        if (response) {
          if (response.data !== null) {
            this.temp.tokens = response.data
          }
          this.dialogFormVisible = true
        }
      })
    },
    updateData() {
      const param = this.temp
      updateTraffic(param.id, param).then(response => {
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
      this.tempDeleteId = row.id
      this.deleteVisible = true
    },
    confirmDelete() {
      deleteTraffic(this.tempDeleteId).then(response => {
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
