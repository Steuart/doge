<template>
  <div class="app-container">
    <div class="basic-info">
      <h2>基本信息</h2>
      <ul>
        <li>
          <span>名字：</span>
          <span>名字</span>
        </li>
        <li>
          <span>任务：</span>
          <span>名字</span>
        </li>
        <li>
          <span>类型：</span>
          <span>名字</span>
        </li>
        <li>
          <span>流量平台：</span>
          <span>名字</span>
        </li>
        <li>
          <span>网络联盟：</span>
          <span>名字</span>
        </li>
        <li>
          <span>URL：</span>
          <span>名字</span>
        </li>
      </ul>
    </div>
    <div class="click-info">
      <h2>转化信息</h2>
      <ul>
        <li>
          <span>CPC：</span>
          <span>名字</span>
        </li>
        <li>
          <span>PPL：</span>
          <span>名字</span>
        </li>
        <li>
          <span>CVR：</span>
          <span>名字</span>
        </li>
        <li>
          <span>CPC：</span>
          <span>名字</span>
        </li>
        <li>
          <span>ROI：</span>
          <span>名字</span>
        </li>
      </ul>
    </div>
    <div class="static-info">
      <h3>统计信息</h3>
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <el-button>点击转化</el-button>
        <el-button>收入支出</el-button>
      </el-row>
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <div >
          <el-button>日</el-button>
          <el-button>月</el-button>
          <el-date-picker
            v-model="beginDate"
            class="filter-item"
            type="date"
            placeholder="开始日期"
            style="width: 150px"/>
          <span class="filter-item">-</span>
          <el-date-picker
            v-model="endDate"
            class="filter-item"
            type="date"
            placeholder="结束日期"
            style="width: 150px"/>
        </div>
        <line-chart :chart-data="lineChartData" />
      </el-row>
    </div>
  </div>
</template>

<script>
import LineChart from './components/LineChart'
const lineChartData = {
  newVisitis: {
    expectedData: [700, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}
export default {
  name: 'DashboardAdmin',
  components: {
    LineChart
  },
  data() {
    return {
      lineChartData: lineChartData.newVisitis
    }
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
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
