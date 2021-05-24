<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCatedialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        boder
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template v-slot:isok="scope">
          <i class="el-icon-check" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-close" v-else></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else> 三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="scope">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="addDanger(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="removeCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatedialogVisible"
      width="50%"
      @close="addCateDialogCloes"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="ParentCateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
              checkStrictly: 'true',
            }"
            @change="ParentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>

      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="ediDialogVisible" width="50%">
      <el-form
        :model="cateEditForm"
        :rules="cateEditFormRules"
        ref="cateRuleFormRef"
        label-width="80px"
      >
        <el-form-item label="分类名称">
          <el-input v-model="cateEditForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="ediDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addClickCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from "../../network/request";
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //商品分类的数据列表，默认空
      cateList: [],
      //商品分类的总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //   表示将当前列定义为模板
          type: "template",
          //   表示模板的名称
          template: "isok",
        },
        {
          label: "排序",
          //   表示将当前列定义为模板
          type: "template",
          //   表示模板的名称
          template: "order",
        },
        {
          label: "操作",
          //   表示将当前列定义为模板
          type: "template",
          //   表示模板的名称
          template: "opt",
        },
      ],
      //   控制添加对话框显示与否
      addCatedialogVisible: false,
      // 控制编辑对话框的显示与否
      ediDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },

      //   添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 添加编辑表单的验证规则对象
      cateEditFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 父级分类的列表
      ParentCateList: [],
      // 选中的父级分类的id数
      selectedKeys: [],

      // 查询到的分类对象
      cateEditForm: {},
    };
  },
  methods: {
    getCateLise() {
      request({
        url: "/categories",
        params: this.querInfo,
        method: "get",
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品列表失败");
        }
        this.cateList = res.data.result;
        this.total = res.data.total;
      });
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateLise();
    },

    // 监听页码值变化
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateLise();
    },
    // 点击按键展示分类对话
    showAddCatedialog() {
      this.getParentCateList();
      this.addCatedialogVisible = true;
    },
    //   获取父级分类的数据列表
    getParentCateList() {
      request({
        url: "/categories",
        method: "get",
        params: { type: 2 },
      }).then((res) => {
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("获取父级分类的数据列表失败");
        }
        this.ParentCateList = res.data;
      });
    },
    // 选择项发送变化触发这个函数

    ParentCateChange() {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击按钮添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate((valid) => {
        if (!valid) return;
        request({
          url: "/categories",
          method: "post",
          data: this.addCateForm,
        }).then((res) => {
          console.log(res);
          if (res.meta.status !== 201) {
            return this.$message.error("添加分类失败");
          }
          this.$message.success("添加分类成功");
          this.getCateLise();
          this.addCatedialogVisible = false;
        });
      });
    },
    // 监听对话框关闭事件，重置表单数据
    addCateDialogCloes() {
      this.$refs.addCateFormRef.resetFields();
      (this.selectedKeys = []), (this.addCateForm.cat_pid = 0);
      this.addCateForm.cat_level = 0;
    },

    // 点击触发编辑事件的ID
    addDanger(id) {
      request({
        url: "/categories/" + id,
        method: "get",
      }).then((res) => {
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("查询分类信息失败");
        }
        this.cateEditForm = res.data;
      });
      this.ediDialogVisible = true;
    },

    // 点击触发修改事件
    addClickCate() {
      this.$refs.cateRuleFormRef.validate((valid) => {
        if (!valid) return;

        request({
          url: "/categories/" + this.cateEditForm.cat_id,
          method: "put",
          data: {
            cat_name: this.cateEditForm.cat_name,
          },
        }).then((res) => {
          if (res.meta.status !== 200) {
            return this.$message.error("更新分类失败！");
          }
          this.$message.success("更新分类成功");
          this.ediDialogVisible = false;
          this.getCateLise();
        });
      });
    },

    // 点击删除事件
    removeCate(id) {
      const ress = "";
      // 弹出询问
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then((res) => {
          this.ress = res;
          request({
            url: "/categories/" + id,
            method: "delete",
          }).then((res) => {
            if (res.meta.status !== 200) {
              return this.$message.error("删除失败");
            }
            this.$message.success("删除成功");
            this.getCateLise();
          });
        })
        .catch((err) => {
          if (ress !== "confirm") {
            return this.$message.info("已经取消删除");
          }
        });
    },
  },
  created() {
    this.getCateLise();
  },
};
</script>

<style scoped>
.treeTable {
  margin-top: 5px;
}

.el-cascader {
  width: 100%;
}
</style>