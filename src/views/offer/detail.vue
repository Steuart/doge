<template>
  <div class="app-container">
    <div class="basic-msg">
      <h3>基本信息</h3>
      <ul>
        <li>
          <span>名字:</span>
          <span>Asses offer</span>
        </li>
        <li>
          <span>联盟:</span>
          <span>Asses offer</span>
        </li>
        <li>
          <span>Payout:</span>
          <span>6.00$</span>
        </li>
        <li>
          <span>创建日期:</span>
          <span>2018-05-21 12:00</span>
        </li>

      </ul>
      <ul>
        <li>
          <span>当日点击:</span>
          <span>1000000</span>
        </li>
        <li>
          <span>当日转换:</span>
          <span>1000</span>
        </li>
        <li>
          <span>总点击:</span>
          <span>100000000</span>
        </li>
        <li>
          <span>总转化:</span>
          <span>1000000</span>
        </li>
        <li>
          <span>总收入:</span>
          <span>20000000$</span>
        </li>
      </ul>
    </div>
    <div class="lead-Requirements">
      <h3>转化要求</h3>
      <ul>
        <li>1.asdsdasd</li>
        <li>2.asdsdasd</li>
        <li>3.asdsdasd</li>
      </ul>
    </div>
    <div class="change-log">
      <h3>变更日志</h3>
      <ul>
        <li>asdsdasd</li>
      </ul>
    </div>
    <div>
      <h3>统计信息</h3>
    </div>
  </div>
</template>

<script>

</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .app-container {
    .basic-msg {
      width: 100%;
      ul {
        display: flex;
        justify-content:flex-start;
        list-style:none;
        li {
          margin-right: 5px;
          width: 18%;
          span {
            margin-left: 5px;
          }
          span:last-child{
            font-weight: bold;
          }
        }
      }
    }
    .lead-Requirements {
      ul {
        list-style: none;
        li {
          margin-top: 15px;
        }
      }
    }
    .change-log {
      ul {
        list-style: none;
      }
    }
  }
</style>
