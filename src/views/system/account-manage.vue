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
      <el-input :placeholder="'名字'" v-model="listQuery.username" style="width: 200px;" class="filter-item" />
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
      <el-table-column :label="'用户名'" prop="username" align="center" width="130" />
      <el-table-column :label="'昵称'" prop="nickname" width="150px" align="center" />
      <el-table-column :label="'邮箱'" prop="email" align="center" />
      <el-table-column :label="'联系电话'" prop="phone" align="center" />
      <el-table-column :label="'创建时间'" prop="dateCreate" width="170px" align="center" />
      <el-table-column :label="'状态'" width="110px" align="center" >
        <template slot-scope="scope">
          <el-tag>{{ scope.row.statusStr }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="'操作'" align="center" width="400" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="statusUpdate(scope.row)">{{ scope.row.status === 0?'禁用':'启用' }}</el-button>
          <el-button type="primary" size="small" @click="handleUpdate(scope.row)">{{ '编辑' }}</el-button>
          <el-button type="primary" size="small" @click="handlerUpdatePassword(scope.row)">{{ '修改密码 ' }}</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">{{ '删除' }}
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
      <el-form ref="dataForm" :model="tempPassword" label-position="left" label-width="100px" style="width: 500px; margin-left:50px;">
        <el-form-item :label="'原密码'" prop="title">
          <el-input v-model="tempPassword.oldPassword"/>
        </el-form-item>
        <el-form-item :label="'新密码'" prop="type">
          <el-input v-model="tempPassword.newPassword"/>
        </el-form-item>
        <el-form-item :label="'确认密码'" prop="type">
          <el-input v-model="tempPassword.confirmPassword"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updatePasswordVisible = false">{{ '取消' }}</el-button>
        <el-button type="primary" @click="confirmUpdatePassword()">{{ '确认' }}</el-button>
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
import { pageUser, addUser, updateUser, updatePasswordWithOld, deleteUser, updateUserStatus } from '@/api/user'
import waves from '@/directive/waves' // Waves directive
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
        type: undefined
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
      tempDeleteId: null,
      beginDate: '',
      endDate: '',
      userStatus: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      pageUser(this.listQuery).then(response => {
        if (response) {
          const data = response.data
          this.list = data.list
          this.total = data.total

          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 200)
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
      const userId = this.tempDeleteId
      deleteUser(userId).then(response => {
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
    },
    handlerUpdatePassword(row) {
      this.tempPassword = {
        username: null,
        oldPassword: null,
        newPassword: null,
        confirmPassword: null
      }
      this.tempPassword.username = row.username
      this.updatePasswordVisible = true
    },
    confirmUpdatePassword() {
      const newPassword = this.tempPassword.newPassword
      const confirmPassword = this.tempPassword.confirmPassword
      const username = this.tempPassword.username
      const oldPassword = this.tempPassword.oldPassword
      if (newPassword !== confirmPassword) {
        this.$notify({
          title: '密码不一致',
          message: '密码输入不一致',
          type: 'fail',
          duration: 2000
        })
        return
      }
      updatePasswordWithOld(username, oldPassword, newPassword).then(response => {
        if (response) {
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
          this.updatePasswordVisible = false
          this.getList()
        }
      })
    },
    statusUpdate(row) {
      if (row.status === 0) {
        row.status = 1
      } else {
        row.status = 0
      }
      updateUserStatus(row.id, row.status).then(response => {
        if (response) {
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
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
