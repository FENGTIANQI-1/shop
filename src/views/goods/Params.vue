<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-alert
        title="注意！只允许你为第三级分类设置参数"
        type="warning"
        effect="dark"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 现在商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
            }"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="adddialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引 -->
            <el-table-column type="index"> </el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="showDialogDel(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="adddialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="showDialogDel(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="adddialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editdialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from "../../network/request";
export default {
  data() {
    return {
      //商品分类列表
      cateList: [],
      //   级联选择框双相绑定到的数组
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: "many",
      //动态参数数据
      manyTableData: [],
      //静态参数数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      adddialogVisible: false,
      // 控制修改参数对话框的显示与隐藏
      editdialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {},
      // 添加表单的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      // 修改表单的验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      // 修改的表单数据对象
      editForm: {},
      // // 控制按钮与文本框的切换显示
      // inputVisible: false,
      // // 文本框输入的内容
      // inputValue: "",
    };
  },
  methods: {
    // 获取所有商品列表
    getCateLise() {
      request({
        url: "/categories",
        method: "get",
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品分类失败");
        }
        this.cateList = res.data;
      });
    },
    // 级联选择框变化，会触发这个函数
    handleChange() {
      this.getParamsData();
    },
    //获取参数的数据列表
    getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }

      //根据所选id 和当前所处面板，获取对应参数
      request({
        url: `/categories/${this.cateId}/attributes`,
        method: "get",
        params: {
          sel: this.activeName,
        },
      }).then((res) => {
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数列表失败");
        }
        console.log(res.data);
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
          item.inputVisible = false;
          item.inputValue = "";
        });
        if (this.activeName === "many") {
          this.manyTableData = res.data;
        } else {
          this.onlyTableData = res.data;
        }
      });
    },
    // 这是tab页签点击事件的处理函数
    handleTabClick() {
      this.getParamsData();
    },
    // 添加对话框的关闭事件
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate((vali) => {
        if (!vali) return;
        request({
          url: `/categories/${this.cateId}/attributes`,
          method: "post",
          data: {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          },
        }).then((res) => {
          // console.log(res);
          if (res.meta.status !== 201) {
            return this.$message.error("添加参数失败");
          }
          return this.$message.success("添加参数成功");
        });
        this.adddialogVisible = false;
        this.getParamsData();
      });
    },
    // 重置修改的表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击按钮修改参数
    editParams() {
      this.$refs.editFormRef.validate((vali) => {
        if (!vali) return;
        request({
          url: `/categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          method: "put",
          data: {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          },
        }).then((res) => {
          console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error("修改参数失败");
          }
          return this.$message.success("修改参数成功");
        });
        this.getParamsData();
        this.editdialogVisible = false;
      });
    },
    // 点击按钮修改对话框
    showDialog(id) {
      request({
        url: `/categories/${this.cateId}/attributes/${id}`,
        method: "get",
        params: {
          attr_sel: this.activeName,
          attr_sel: this.activeName,
        },
      }).then((res) => {
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数信息失败");
        }
        this.editForm = res.data;
      });
      this.editdialogVisible = true;
    },
    // 点击删除按钮
    showDialogDel(id) {
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
            url: `/categories/${this.cateId}/attributes/${id}`,
            method: "delete",
          }).then((res) => {
            if (res.meta.status !== 200) {
              return this.$message.error("删除失败");
            }
            this.$message.success("删除成功");
          });
          this.getCateLise();
        })
        .catch((err) => {
          if (ress !== "confirm") {
            return this.$message.info("已经取消删除");
          }
        });
    },
    // 文本框失去焦点或者按下enter都会触发这个事件
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      // 如果没有return 则说需要进行后续处理

      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;

      // 需要发起请求保存这次操作
      this.saveAttrVals(row);
    },
    // 将对attr_vals的操作保存到数据库
    saveAttrVals(row) {
      request({
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        method: "put",
        data: {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        },
      }).then((res) => {
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数失败");
        }
        return this.$message.success("修改参数成功");
      });
    },
    // 点击按钮显示文本输入框
    showInput(row) {
      row.inputVisible = true;
      // 让文本框自动获得焦点
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 删除对应的可选项
    handleClose(index, row) {
      row.attr_vals.splice(index, 1);
      this.saveAttrVals(row);
    },
  },
  created() {
    this.getCateLise();
  },
  computed: {
    //   如果按钮需要被禁用返回ture 反之false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    //当前选择的三级分类ID
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    // 动态计算添加分类对话框的文本
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    },
  },
};
</script>

<style scoped>
.cat_opt {
  margin: 20px 0;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 100px;
}
</style>