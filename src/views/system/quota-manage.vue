<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="quotas" border fit highlight-current-row style="width: 100%">
      <el-table-column label="分组" prop="name">
        <template slot-scope="scope" >
          <el-tag v-show="scope.row.isGroup" style="color: red">{{ scope.row.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="名字" prop="name" />
      <el-table-column label="编码" prop="code" />
      <el-table-column label="备注" prop="remark" />
      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <el-button @click="deleteVisible = false">编 辑</el-button>
          <el-button type="danger" @click="confirmDelete()">删 除</el-button>
          <el-button type="success" @click="confirmDelete()">新 增</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { listAll } from '@/api/quota'
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
      listLoading: false
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
          const quotas = response.data
          const result = []
          for (const i in quotas) {
            const group = quotas[i]
            const children = group.children
            group['isGroup'] = true
            result.push(group)
            for (const j in children) {
              result.push(children[j])
            }
          }
          console.log(result)
          this.quotas = result
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 200)
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
