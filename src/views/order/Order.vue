<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input
            v-model="queryInfo.query"
            placeholder="请输入内容"
            class="input-with-select"
            clearable
            @clear="getOrderList"
          >
            <el-button
              @click="getOrderList"
              slot="append"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 列表区 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template v-slot="scope">
            {{ scope.row.create_time | showDate }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scopes">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showBox(scopes.row.id)"
            ></el-button>
            <!-- 展示物流进度按钮 -->

            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showProgressBox(scopes.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 25]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressVisibleClose"
    >
      <el-form
        :model="addressForm"
        :rules="addressRules"
        ref="addressRef"
        label-width="80px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityDate"
            v-model="addressForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 展示物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"
      @close="addressVisibleClose"
    >
      <span>一段信息</span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from "../../network/request";
import { formatDate } from "../../common/utils";
import cityDate from "./citydata";
export default {
  data() {
    return {
      orderList: [],
      queryInfo: {
        query: "",
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5,
      },
      total: 0,
      // 决定修改地址对话框的显示与隐藏
      addressVisible: false,

      addressForm: {
        address1: [],
        address2: "",
      },
      // 添加表单的验证规则对象
      addressRules: {
        address1: [
          {
            required: true,
            message: "请选择省市区县",
            trigger: "blur",
          },
        ],
        address2: [
          {
            required: true,
            message: "请填写详细地址",
            trigger: "blur",
          },
        ],
      },
      cityDate,
      // 决定展示物流进度对话框的显示与隐藏
      progressVisible: false,
    };
  },
  methods: {
    getOrderList() {
      request({
        url: "/orders",
        method: "get",
        params: this.queryInfo,
      }).then((res) => {
        console.log(res);
        if (res.meta.status !== 200)
          return this.$message.error("获取订单列表失败！");
        this.orderList = res.data.goods;
        this.total = res.data.total;
      });
    },
    // 监听pagesize 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 监听页码改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    // 展示修改地址对话框
    showBox() {
      this.addressVisible = true;
    },
    addressVisibleClose() {
      this.$refs.addressRef.resetFields();
    },
    // 展示物流进度对话框
    showProgressBox() {
      //   request({
      //     url: "/kuaidi/1106975712662",
      //     method: "get",
      //   }).then((res) => {
      //     console.log(res);
      //   });
      this.progressVisible = true;
    },
  },
  filters: {
    showDate(value) {
      const date = new Date(value * 1000);

      return formatDate(date, "yyyy-MM-dd hh:mm:ss");
    },
  },
  created() {
    this.getOrderList();
  },
};
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>