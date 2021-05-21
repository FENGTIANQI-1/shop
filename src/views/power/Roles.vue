<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 添加角色列表区 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-button type="primary" @click="dialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表区 -->

      <el-table :data="rolesList" border strip>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scopes">
            <el-row
              v-for="(item, index) in scopes.row.children"
              :key="item.id"
              :class="['bdbottom', index == 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeById(scopes.row, item.id)">
                  {{ item.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二 三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环渲染二级权限 -->
                <el-row
                  v-for="(item1, index1) in item.children"
                  :key="item1.id"
                  :class="[index1 == 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeById(scopes.row, item1.id)"
                    >
                      {{ item1.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item2, index2) in item1.children"
                      :key="item2.id"
                      closable
                      @close="removeById(scopes.row, item2.id)"
                    >
                      {{ item1.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{ scopes.row }}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scopes">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="getEditor(scopes.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoles(scopes.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showDialog(scopes.row)"
              @close="setClose"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="ediDialogVisible"
      width="50%"
      @close="editClose"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="rolesFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="ediDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="dialogVisible"
      width="50%"
      @close="addClose"
    >
      <!-- 内容主题区 -->
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="60px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="ruleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="ruleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setEdiDialogVisible"
      width="50%"
      @close="rtEditClose"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setEdiDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from "../../network/request";
export default {
  data() {
    return {
      // 所有角色列表
      rolesList: [],
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      // 控制编辑角色对话框的显示与隐藏
      ediDialogVisible: false,
      // 控制添加角色对话框的显示与隐藏
      dialogVisible: false,
      // 控制分配权限对话框的显示与隐藏
      setEdiDialogVisible: false,
      // 查询到的角色对象
      editForm: {},
      // 添加角色的表单数据
      ruleForm: {
        roleName: "",
        roleDesc: "",
      },
      // 添加角色的表单规则
      rules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名",
            trigger: "blur",
          },
          {
            min: "3",
            max: "10",
            message: "请用角色的长度在3到10个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          {
            required: true,
            message: "请输入角色描述",
            trigger: "blur",
          },
          {
            min: "3",
            max: "15",
            message: "请角色描述的长度在3到15个字符之间",
            trigger: "blur",
          },
        ],
      },
      // 编辑角色验证规则
      editFormRules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名",
            trigger: "blur",
          },
          {
            min: "3",
            max: "10",
            message: "请用角色的长度在3到10个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          {
            required: true,
            message: "请输入角色描述",
            trigger: "blur",
          },
          {
            min: "3",
            max: "15",
            message: "请角色描述的长度在3到15个字符之间",
            trigger: "blur",
          },
        ],
      },
      // 默认选择的节点ID
      defKeys: [],
      // 即将分配权限的id
      roleId: "",
    };
  },
  methods: {
    // 获取角色列表
    getRolesList() {
      request({
        url: "/roles",
        method: "get",
      }).then((res) => {
        if (res.meta.status !== 200) {
          return this.$message.error("获取角色列表失败");
        }
        this.rolesList = res.data;
        // console.log(this.rolesList);
      });
    },
    // 监听角色添加对话框的关闭事件
    addClose() {
      this.$refs.ruleForm.resetFields();
    },
    // 点击添加新角色
    addUser() {
      this.$refs.ruleForm.validate((valid) => {
        if (!valid) return;
        request({
          url: "/roles",
          method: "post",
          data: this.ruleForm,
        }).then((res) => {
          // console.log(res);
          if (res.meta.status !== 201) {
            this.$message.error("添加角色失败！");
          }
          return this.$message.success("添加角色成功");
        });
        //隐藏添加角色对话框
        this.dialogVisible = false;
        // 重新获取角色列表数据;
        this.getRolesList();
      });
    },
    // 编辑修改
    getEditor(id) {
      // 拿到用户的ID
      request({
        url: "/roles/" + id,
        method: "get",
      }).then((res) => {
        if (res.meta.status !== 200) {
          return this.$message.error("查询角色信息失败");
        }
        this.editForm = res.data;
      });
      this.ediDialogVisible = true;
    },
    // 监听角色编辑对话框的关闭事件
    editClose() {
      this.$refs.rolesFormRef.resetFields();
    },
    //展示分配权限的关闭事件
    rtEditClose() {
      // this.$refs.treeRef.resetFields();
    },
    // 编辑用户信息并提交
    editRolesInfo() {
      this.$refs.rolesFormRef.validate((valid) => {
        // console.log(valid);
        if (!valid) return;
        request({
          url: "/roles/" + this.editForm.roleId,
          method: "put",
          data: {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          },
        }).then((res) => {
          console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error("更新角色失败！");
          }
          this.$message.success("更新角色成功");

          // 重新获取用户列表数据;
          this.getRolesList();
        });
        //隐藏添加用户对话框
        this.ediDialogVisible = false;
      });
    },
    // 根据ID删除对应信息
    removeRoles(id) {
      const ress = "";
      // 弹出询问
      this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then((res) => {
          // this.ress = res;
          request({
            url: "/roles/" + id,
            method: "delete",
          }).then((res) => {
            if (res.meta.status !== 200) {
              return this.$message.error("删除失败");
            }
            this.$message.success("删除成功");
            this.getRolesList();
          });
          // console.log(res);
        })
        .catch((err) => {
          if (ress !== "confirm") {
            return this.$message.info("已经取消删除");
          }
        });
    },
    // 根据ID删除对应权限
    removeById(role, rightId) {
      // 弹框提示用户是否确认删除
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then((res) => {
          const ress = res;
          request({
            url: `/roles/${role.id}/rights/${rightId}`,
            method: "delete",
          }).then((res) => {
            if (res.meta.status !== 200) {
              return this.$message.error("删除权限失败");
            }
            role.children = res.data;
            this.$message.success("删除权限成功");
          });
        })
        .catch((err) => {
          if (ress !== "confirm") {
            return this.$message.info("已经取消删除");
          }
        });
    },
    // 展示分配权限的对话框
    showDialog(role) {
      this.roleId = role.id;
      // 递归获取三级节点ID
      this.getDefKeys(role, this.defKeys);

      this.setEdiDialogVisible = true;
      request({
        url: "/rights/tree",
        method: "get",
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("获取权限数据失败");
        }
        // 把获取的权限数据保存到data中
        this.rightsList = res.data;
      });
    },
    // 通过递归的形式，获取角色下所有三级ID，并保存到defKeys中
    getDefKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => this.getDefKeys(item, arr));
    },

    // 监听权限对话框的关闭事件
    setClose() {
      this.defKeys = [];
    },
    // 点击为角色分配权限
    allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      console.log(keys);
      const idStr = keys.join(",");
      request({
        url: `/roles/${this.roleId}/rights`,
        method: "post",
        data: { rids: idStr },
      }).then((res) => {
        if (res.meta.status !== 200) {
          return this.$message.error("分配权限数据失败");
        }
        this.$message.success("分配权限成功");
        this.getRolesList();
        this.setEdiDialogVisible = false;
      });
    },
  },
  created() {
    // 获取所有权限数据
    this.getRolesList();
  },
};
</script>

<style scoped>
.el-tag {
  margin: 10px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>