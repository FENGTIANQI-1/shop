<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
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
            @clear="getUsersList"
          >
            <el-button
              @click="getUsersList"
              slot="append"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 列表区 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="my_state">
          <template v-slot:default="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
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
              @click="removeUser(scopes.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
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

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="50%"
      @close="addClose"
    >
      <!-- 内容主题区 -->
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="ruleForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="ruleForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="ruleForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="ruleForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="ediDialogVisible"
      width="50%"
      @close="editClose"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="ruleFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="ediDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from "../../network/request";
export default {
  data() {
    // 验证邮箱规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱正则表达式
      const regEmail = /^\w[-\w.]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };

    // 验证手机规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机正则表达式
      const regMobile = /^(1[3|5-9])\d{9}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };

    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: "",
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2,
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      dialogVisible: false,
      // 添加用户的表单数据
      ruleForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 添加表单的验证规则对象
      rules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur",
          },
          {
            min: "3",
            max: "10",
            message: "请用户名的长度在3到10个字符之间",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "请输入用户密码",
            trigger: "blur",
          },
          {
            min: "6",
            max: "15",
            message: "请用户密码的长度在6到15个字符之间",
            trigger: "blur",
          },
        ],
        email: [
          {
            required: true,
            message: "请输入用户邮箱",
            trigger: "blur",
          },
          {
            validator: checkEmail,
            trigger: "blur",
          },
        ],
        mobile: [
          {
            required: true,
            message: "请输入用户手机",
            trigger: "blur",
          },
          {
            validator: checkMobile,
            trigger: "blur",
          },
        ],
      },
      // 控制修改对话框的显示与隐藏
      ediDialogVisible: false,
      // 查询到的用户对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          {
            required: true,
            message: "请输入用户邮箱",
            trigger: "blur",
          },
          {
            validator: checkEmail,
            trigger: "blur",
          },
        ],
        mobile: [
          {
            required: true,
            message: "请输入用户手机",
            trigger: "blur",
          },
          {
            validator: checkMobile,
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    getUsersList() {
      request({
        url: "/users",
        method: "get",
        params: this.queryInfo,
      }).then((res) => {
        console.log(res);
        if (res.meta.status !== 200)
          return this.$message.error("获取用户列表失败！");
        this.userlist = res.data.users;
        this.total = res.data.total;
      });
    },
    // 监听pagesize 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUsersList();
    },
    // 监听页码改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUsersList();
    },
    // 监听 switch 开关的改变
    userStateChange(userInfo) {
      console.log(userInfo);
      request({
        url: `/users/${userInfo.id}/state/${userInfo.mg_state}`,
        method: "put",
      }).then((res) => {
        console.log(res);
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state;
          return this.$message.error("更新用户状态失败");
        }
        this.$message.success("更新状态成功了！");
      });
    },
    // 监听对话框关闭事件
    addClose() {
      this.$refs.ruleForm.resetFields();
    },

    // 点击添加新用户
    addUser() {
      this.$refs.ruleForm.validate((valid) => {
        if (!valid) return;
        request({
          url: "/users",
          data: this.ruleForm,
        }).then((res) => {
          if (res.meta.status !== 200) {
            this.$message.error("添加用户失败！");
          }
          return this.$message.success("添加用户成功");
          //隐藏添加用户对话框
          this.dialogVisible = false;
          重新获取用户列表数据;
          this.getUsersList();
        });
      });
    },

    // 展示编辑的用户的对话框
    showDialog(id) {
      console.log(id);
      request({ url: "/users/" + id, method: "get" }).then((res) => {
        if (res.meta.status !== 200) {
          console.log(res);
          return this.$message.error("查询用户信息失败");
        }
        this.editForm = res.data;
      });
      this.ediDialogVisible = true;
    },
    // 监听修改用户对话框关闭事件
    editClose() {
      this.$refs.ruleFormRef.resetFields();
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.ruleFormRef.validate((valid) => {
        if (!valid) return;
        // 发起修改用户请求数据
        request({
          url: "/users/" + this.editForm.id,
          method: "put",
          data: {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          },
        }).then((res) => {
          console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error("更新用户失败！");
          }
          this.$message.success("更新用户成功");
          //隐藏添加用户对话框
          this.ediDialogVisible = false;
          // 重新获取用户列表数据;
          this.getUsersList();
        });
      });
    },
    // 根据ID删除对应信息
    removeUser(id) {
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
            url: "/users/" + id,
            method: "delete",
          }).then((res) => {
            if (res.meta.status !== 200) {
              return this.$message.error("删除失败");
            }
            this.$message.success("删除成功");
            this.getUsersList();
          });
          console.log(res);
        })
        .catch((err) => {
          if (ress !== "confirm") {
            return this.$message.info("已经取消删除");
          }
        });
    },
  },
  created() {
    this.getUsersList();
  },
};
</script>

<style>
</style>