<template>
  <div class="app-container">
    <ul v-loading="listLoading">
      <li v-for="quota in quotas" :key="quota.id">
        <div class="group">
          <span> {{ quota.name }}</span>
          <span class="content"> {{ quota.code }}</span>
          <span class="content"> {{ quota.remark }}</span>
          <div class="operate" >
            <el-button size="mini" type="primary" icon="el-icon-edit" circle @click="handleUpdate(quota)"/>
            <el-button :disabled="quota.deleteAble === 1" size="mini" type="danger" icon="el-icon-delete" circle @click="handleDelete(quota)"/>
            <el-button size="mini" type="success" icon="el-icon-plus" circle @click="handleCreate(quota)"/>
          </div>
        </div>
        <el-row :gutter="20">
          <el-col v-for="child in quota.children" :key="child.id" :span="6">
            <el-card class="box-card" shadow="hover">
              <div slot="header" class="card-header">
                <span>{{ child.name }}</span>
                <div class="operate" >
                  <el-button size="mini" type="primary" icon="el-icon-edit" circle @click="handleUpdate(child)" />
                  <el-button :disabled="child.deleteAble === 1" size="mini" type="danger" icon="el-icon-delete" circle @click="handleDelete(child)"/>
                  <el-button size="mini" type="success" icon="el-icon-plus" circle @click="handleCreate(quota,child)"/>
                </div>
              </div>
              <ul class="body">
                <li class="item">
                  <span>code</span>: {{ child.code }}
                </li>
                <li class="item">
                  <span>更新日期</span>: {{ child.dateUpdate }}
                </li>
                <li class="item">
                  <span>创建日期</span>: {{ child.dateCreate }}
                </li>
                <li class="item">
                  <span>备注：</span>{{ child.remark }}
                </li>
              </ul>
            </el-card>
          </el-col>
        </el-row>
      </li>
    </ul>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px" class="edit-dialog">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="100px" style="width: 500px; margin-left:50px;">
        <el-form-item :label="'名字'" prop="title">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item :label="'code'" prop="type">
          <el-input v-model="temp.code"/>
        </el-form-item>
        <el-form-item :label="'是否可删除'" prop="type">
          <template>
            <el-radio v-model="temp.deleteAble" :label="0">是</el-radio>
            <el-radio v-model="temp.deleteAble" :label="1">否</el-radio>
          </template>
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
import { listAll, saveQuota, updateQuota, deleteQuota } from '@/api/quota'
import treeTable from '@/components/TreeTable'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  components: { Pagination, treeTable },
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
      quotas: [],
      func: null,
      expandAll: false,
      listLoading: false,
      ifShowOperate: false,
      dialogFormVisible: false,
      temp: {
        name: null,
        code: null,
        remark: null,
        groupId: null,
        deleteAble: 1,
        beforeQuotaId: null
      },
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogStatus: null,
      deleteVisible: false,
      deleteId: null
    }
  },
  computed: {
    rowClass: (row, index) => {
      console.log(index)
      if (row.isGroup) {
        return { 'background-color': 'red' }
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listAll().then(response => {
        if (response) {
          this.quotas = response.data
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 200)
        }
      })
    },
    resetTemp() {
      this.temp = {
        id: null,
        name: null,
        code: null,
        remark: '',
        groupId: null,
        beforeQuotaId: null,
        deleteAble: null
      }
    },
    handleUpdate(row) {
      this.resetTemp()
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.temp = row
    },
    updateData() {
      const id = this.temp.id
      updateQuota(id, this.temp).then(response => {
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
    handleCreate(group, quota) {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.temp.groupId = group.id
      if (quota) {
        this.temp.beforeQuotaId = quota.id
        this.temp.type = 1
      } else {
        this.temp.type = 0
      }
    },
    createData() {
      if (this.temp.type === 0) {
        this.temp.groupId = 0
      }
      saveQuota(this.temp).then(response => {
        if (response) {
          if (response) {
            this.$notify({
              title: '成功',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
            this.dialogFormVisible = false
            this.getList()
          }
        }
      })
    },
    handleDelete(row) {
      this.deleteVisible = true
      this.deleteId = row.id
    },
    confirmDelete() {
      deleteQuota(this.deleteId).then(response => {
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.deleteVisible = false
        this.getList()
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .app-container {
    color: #606266;
    ul li {
      list-style-type:none;
    }
    .group{
      min-height: 50px;
      font-size: 25px;
      width: 100%;
      .content {
        font-size: 16px;
        margin-left: 10px;
      }
      .operate {
        display: none;
        .el-button {
          margin: 0;
        }
      }
    }
    .group:hover > .operate {
      display: inline-block;
    }
    .el-col {
      margin-bottom: 10px;
      .box-card {
        color: #606266;
        min-height: 200px;
        .operate {
          display: none;
          float: right;
          .el-button {
            margin: 0;
          }
        }
        .card-header {
          font-weight: bold;
          font-size: 18px;
        }
        .card-header:hover>.operate {
          display: inline-block;
        }
        .item {
          margin-bottom: 10px;
          font-weight: normal;
          span{
            color: #9dc8db;
          }
        }
        ul {
          padding-left: 0;
        }
      }
    }
  }
</style>
