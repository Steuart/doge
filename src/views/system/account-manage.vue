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
      <el-table-column :label="'用户名'" prop="username" align="center" width="65" />
      <el-table-column :label="'昵称'" prop="nickname" width="150px" align="center" />
      <el-table-column :label="'邮箱'" prop="email" align="center" />
      <el-table-column :label="'联系电话'" prop="phone" align="center" />
      <el-table-column :label="'创建时间'" prop="dateCreate" width="170px" align="center" />
      <el-table-column :label="'状态'" prop="status" width="110px" align="center" />
      <el-table-column :label="'操作'" align="center" width="400" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="small">{{ '禁用' }}</el-button>
          <el-button type="primary" size="small" @click="handleUpdate(scope.row)">{{ '编辑' }}</el-button>
          <el-button type="primary" size="small" @click="updatePasswordVisible = true">{{ '修改密码 ' }}</el-button>
          <el-button size="small" type="danger" @click="deleteVisible = true">{{ '删除' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px" class="edit-dialog">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="100px" style="width: 500px; margin-left:50px;">
        <el-form-item v-show="dialogStatus==='create'" :label="'用户名'" prop="title">
          <el-input v-model="temp.username"/>
        </el-form-item>
        <el-form-item :label="'昵称'" prop="title">
          <el-input v-model="temp.nickname"/>
        </el-form-item>
        <el-form-item :label="'邮箱'" prop="type">
          <el-input v-model="temp.email"/>
        </el-form-item>
        <el-form-item :label="'联系电话'" prop="type">
          <el-input v-model="temp.phone"/>
        </el-form-item>
        <el-form-item v-show="dialogStatus==='create'" :label="'密码'" prop="type">
          <el-input v-model="temp.password"/>
        </el-form-item>
        <el-form-item v-show="dialogStatus==='create'" :label="'确认密码'" prop="type">
          <el-input v-model="temp.confirmPassword"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ '取消' }}</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">{{ '确认' }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="updatePasswordVisible" width="700px" class="edit-dialog">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="100px" style="width: 500px; margin-left:50px;">
        <el-form-item :label="'原密码'" prop="title">
          <el-input v-model="temp.title"/>
        </el-form-item>
        <el-form-item :label="'新密码'" prop="type">
          <el-input v-model="temp.title"/>
        </el-form-item>
        <el-form-item :label="'确认密码'" prop="type">
          <el-input v-model="temp.title"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updatePasswordVisible = false">{{ '取消' }}</el-button>
        <el-button type="primary" @click="updatePasswordVisible=false">{{ '确认' }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="deleteVisible" title="确认删除" width="30%">
      <span>删除后将不可恢复，确认删除？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteVisible = false">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { pageUser, addUser, updateUser } from '@/api/user'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

export default {
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
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      showReviewer: false,
      temp: {
        username: null,
        password: null,
        email: null,
        phone: null,
        nickname: null,
        confirmPassword: null
      },
      tempPassword: {
        username: null,
        oldPassword: null,
        newPassword: null,
        confirmPassword: null
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      deleteVisible: false,
      downloadLoading: false,
      updatePasswordVisible: false,
      beginDate: '',
      endDate: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      pageUser(this.listQuery).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 200)
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
        username: null,
        password: null,
        email: null,
        phone: null,
        nickname: null
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
      addUser(this.temp).then(response => {
        if (response.code === '1') {
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
          this.dialogFormVisible = false
          this.getList()
        } else {
          this.$notify({
            title: '失败',
            message: '创建失败',
            type: 'fail',
            duration: 2000
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      const id = this.temp.id
      updateUser(id, this.temp).then(response => {
        if (response.code === '1') {
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
          this.dialogFormVisible = false
          this.getList()
        } else {
          this.$notify({
            title: '失败',
            message: '更新失败',
            type: 'fail',
            duration: 2000
          })
        }
      })
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
    },
    handleDownload() {
      this.downloadLoading = true
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
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
