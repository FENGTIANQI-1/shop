<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
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
            @clear="getGoodsList"
          >
            <el-button
              @click="getGoodsList"
              slot="append"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 列表区 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格（元）"
          prop="goods_price"
          width="95px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="95px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time ">
          <template v-slot="scope">
            {{ scope.row.add_time | showDate }}
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="goods_state">
          <template v-slot="scopes">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showDialog(scopes.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUser(scopes.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 15, 25]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script >
import { request } from "../../network/request";
import { formatDate } from "../../common/utils";
export default {
  data() {
    return {
      // 得到的商品数据
      goodsList: [],
      // 获取商品列表的参数对象
      queryInfo: {
        query: "",
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10,
      },
      total: 0,
    };
  },
  methods: {
    getGoodsList() {
      request({
        url: "/goods",
        method: "get",
        params: this.queryInfo,
      }).then((res) => {
        if (res.meta.status !== 200)
          return this.$message.error("获取商品列表失败！");
        this.goodsList = res.data.goods;
        this.total = res.data.total;
      });
    },
    // 监听pagesize 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    // 监听页码改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    // 点击删除触发
    removeUser(id) {
      const ress = "";
      // 弹出询问
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then((res) => {
          this.res = ress;
          request({
            url: "/goods/" + id,
            method: "delete",
          }).then((res) => {
            if (res.meta.status !== 200) {
              return this.$message.error("删除失败");
            }
            this.$message.success("删除成功");
            this.getGoodsList();
          });
        })
        .catch((err) => {
          if (ress !== "confirm") {
            return this.$message.info("已经取消删除");
          }
        });
    },

    goAddPage() {
      this.$router.push("/goods/add");
    },
  },
  filters: {
    showDate(value) {
      const date = new Date(value * 1000);

      return formatDate(date, "yyyy-MM-dd hh:mm:ss");
    },
  },
  created() {
    this.getGoodsList();
  },
};
</script>

<style scope>
</style>