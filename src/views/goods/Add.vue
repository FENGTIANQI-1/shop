<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        :closable="false"
        center
      >
      </el-alert>
      <!-- 步骤条区 -->
      <el-steps
        :space="200"
        :active="+activeIndex"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTab"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type="number">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name',
                  children: 'children',
                }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTabeDate"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item"
                  v-for="(item, index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTabeDate"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"> </el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor
              ref="myQuillEditor"
              v-model="addForm.goods_introduce"
            />
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%"
    >
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import { request } from "../../network/request";
export default {
  data() {
    return {
      activeIndex: "0",
      // 添加商品的表单数据对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        // 图片数组
        pics: [],
        // 商品详情描述
        goods_introduce: "",
        attrs: [],
      },
      // 添加商品的表单的验证规则
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: "请输入商品名称",
            trigger: "blur",
          },
        ],
        goods_price: [
          {
            required: true,
            message: "请输入商品价格",
            trigger: "blur",
          },
        ],
        goods_weight: [
          {
            required: true,
            message: "请输入商品重量",
            trigger: "blur",
          },
        ],
        goods_number: [
          {
            required: true,
            message: "请输入商品数量",
            trigger: "blur",
          },
        ],
        goods_cat: [
          {
            required: true,
            message: "请输入商品数量",
            trigger: "blur",
          },
        ],
      },
      // 商品数据列表
      cateList: [],
      // 动态参数列表数据
      manyTabeDate: [],
      // 静态参数列表数据
      onlyTabeDate: [],
      //   上传图片的地址
      uploadURL: "http://106.53.73.30:8888/api/private/v1/upload",
      // 图片上传组件的headers
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewPath: "",

      // 图片预览窗口的显示与隐藏
      previewDialogVisible: false,
    };
  },
  methods: {
    getCateList() {
      request({
        url: "/categories",
        method: "get",
      }).then((res) => {
        if (res.meta.status !== 200)
          return this.$message.error("获取商品数据失败！");
        this.cateList = res.data;
      });
    },
    // 级联选择器变化会触发这个函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },

    beforeTab(activeName, oldActiveName) {
      // oldActiveName 即将离开标签页名字
      // activeName 即将进入标签页名字

      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类");
        return false;
      }
    },

    tabClick() {
      if (this.activeIndex === "1") {
        request({
          url: `/categories/${this.cateId}/attributes`,
          method: "get",
          params: {
            sel: "many",
          },
        }).then((res) => {
          if (res.meta.status !== 200) {
            return this.$message.error("获取动态参数列表失败");
          }
          res.data.forEach((item) => {
            item.attr_vals =
              item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
          });
          this.manyTabeDate = res.data;
        });
      } else if (this.activeIndex === "2") {
        request({
          url: `/categories/${this.cateId}/attributes`,
          method: "get",
          params: {
            sel: "only",
          },
        }).then((res) => {
          if (res.meta.status !== 200) {
            return this.$message.error("获取静态参数列表失败");
          }
          this.onlyTabeDate = res.data;
        });
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file);
      this.previewPath = file.url;
      this.previewDialogVisible = true;
    },
    // 处理移除图片的操作
    handleRemove(file) {
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex((r) => {
        r.pic == filePath;
      });
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    // 今天图片上传成功的事件
    handleSuccess(response) {
      //   console.log(response);
      const picInfo = {
        pic: response.data.tmp_path,
      };
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    // 点击添加商品
    add() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) {
          return this.$message.error("请填写必要的表单信息");
        }
        // 深拷贝
        const form = JSON.parse(JSON.stringify(this.addForm));
        form.goods_cat = form.goods_cat.join(",");

        // 处理动态参数
        this.manyTabeDate.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(","),
          };
          this.addForm.attrs.push(newInfo);
        });

        // 处理静态参数
        this.onlyTabeDate.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        // console.log(form);

        request({
          url: "/goods",
          method: "post",
          data: form,
        }).then((res) => {
          console.log(res);
          if (res.meta.status !== 201) {
            return this.$message.error("添加商品失败");
          }
          return this.$message.success("添加商品成功");
        });
        this.$router.push("/goods");
      });
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
  created() {
    this.getCateList();
  },
};
</script>

<style scoped>
.el-steps {
  margin: 15px 0;
}
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 10px;
}
</style>