<template>
  <div class="login-color">
    <div class="login-box">
      <!-- 头像 -->
      <div class="avatar-box">
        <img src="../assets/home.png" alt="" />
      </div>
      <!-- 登陆表单 -->
      <el-form class="el-input" :model="form" :rules="rules" ref="LoginFrom">
        <el-form-item prop="username">
          <el-input
            prefix-icon="el-icon-user"
            v-model="form.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-unlock"
            v-model="form.password"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item class="btn">
          <el-button type="primary" @click="bt2">登陆</el-button>
          <el-button type="info" @click="bt">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import "element-ui/lib/theme-chalk/index.css";
import { request } from "../network/request";
export default {
  name: "Login",
  data() {
    return {
      form: {
        username: "admin",
        password: "123456",
      },
      rules: {
        username: [
          { required: true, message: "请输入登录名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
          { required: true, message: "请输入登录密码", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    bt() {
      this.$refs.LoginFrom.resetFields();
    },
    bt2() {
      this.$refs.LoginFrom.validate((valid) => {
        // if (!valid) return;
        // const resut = await this.$http.post("login", this.form);
        // console.log(resut);
        request({
          url: "/login",
          data: this.form,
        }).then((res) => {
          if (!valid) return;
          if (res.meta.status !== 200) {
            this.$message.error("登录失败哦");
          } else {
            this.$message.success("登录成功啦");
          }
          window.sessionStorage.setItem("token", res.data.token);
          this.$router.push("/home");
        });
      });
    },
  },
};
</script>

<style scoped>
.login-color {
  background-color: #2b4b6b;
  height: 100%;
  background-image: url("../assets/back-c.jpg");
}
.login-box {
  width: 450px;
  height: 300px;
  background-color: red;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  box-shadow: 0 0 0 0 rgb(0, 0, 0, 0.3);
}
.login-box .avatar-box {
  background-color: #fff;
  height: 130px;
  width: 130px;
  border-radius: 50%;
  box-shadow: 0 0 8px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
}
.avatar-box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.el-input {
  width: 100%;
  position: relative;
  top: 30%;

  padding: 0 10px;
  box-sizing: border-box;
}
.btn {
  display: flex;
  justify-content: flex-end;
}
</style>