<template>
  <div class="app-container">
    <div class="filter-container">
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
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange">
      <el-table-column :label="'编号'" type="index" align="center" width="65" />
      <el-table-column :label="'名字'" prop="name" align="center" width="120" />
      <el-table-column :label="'主页'" prop="homePage" width="200px" align="center" />
      <el-table-column :label="'总收入'" prop="earnings" align="center" width="120" />
      <el-table-column :label="'任务数'" prop="offerNumber" align="center" width="120" />
      <el-table-column :label="'EPC'" prop="epc" align="center" width="120" />
      <el-table-column :label="'简介'" prop="remark" />
      <el-table-column :label="'创建时间'" prop="dateCreate" sortable="customer" width="155px" align="center" />
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

        <div class="token">
          <el-form-item v-for="(item, index) in temp.offerTokens" :key="item.id" :label="'p'+index">
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
            <el-button style="display: inline;" @click="deleteToken('offerToken',index)">删除</el-button>
          </el-form-item>
        </div>
        <el-form-item :label="'任务参数'">
          <el-button round style="width: 100%" @click="addToken('offerToken')">+</el-button>
        </el-form-item>
        <div class="token">
          <el-form-item v-for="(item, index) in temp.callbackTokens" :key="item.id" :label="'p'+index">
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
            <el-button style="display: inline;" @click="deleteToken('callbackToken',index)">删除</el-button>
          </el-form-item>
        </div>
        <el-form-item :label="'回调参数'">
          <el-button round style="width: 100%" @click="addToken('callbackToken')">+</el-button>
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
import { pageNetwork, saveNetwork, updateNetwork, deleteNetwork, getNetworkById } from '@/api/network'
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
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNo: 1,
        pageSize: 20,
        name: undefined,
        beginDate: undefined,
        endDate: undefined,
        sorts: [{
          'fieldName': 'dateUpdate',
          'sortType': 'desc'
        }]
      },
      temp: {
        id: null,
        name: null,
        homePage: null,
        remark: '',
        offerTokens: [],
        callbackTokens: []
      },
      quotas: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      deleteVisible: false,
      tempDeleteId: null
    }
  },
  created() {
    this.getList()
    this.listQuotas()
  },
  methods: {
    // 列出所有的指标
    listQuotas() {
      listAll().then(response => {
        if (response) {
          this.quotas = response.data
        }
      })
    },
    getList() {
      this.listLoading = true
      pageNetwork(this.listQuery).then(response => {
        if (response) {
          const data = response.data
          this.list = data.list
          this.total = data.total

          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 150)
        }
      })
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
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: null,
        name: null,
        homePage: null,
        remark: '',
        offerTokens: [],
        callbackTokens: []
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
      saveNetwork(this.temp).then(response => {
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
      getNetworkById(id).then(response => {
        if (response) {
          const data = response.data
          this.temp = {
            id: data.id,
            name: data.name,
            homePage: data.homePage,
            remark: data.remark
          }
        }
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      updateNetwork(this.temp.id, this.temp).then(response => {
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
      deleteNetwork(this.tempDeleteId).then(response => {
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
    },
    addToken(type) {
      if (type === 'callbackToken') {
        this.temp.callbackTokens.push({
          name: null,
          value: null,
          id: null
        })
        return
      }
      this.temp.offerTokens.push({
        name: null,
        value: null,
        id: null
      })
    },
    deleteToken(type, index) {
      if (type === 'callbackToken') {
        this.temp.callbackTokens.splice(index, 1)
        return
      }
      this.temp.offerTokens.splice(index, 1)
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
