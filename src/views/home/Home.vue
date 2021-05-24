<template>
  <el-container class="home-container">
    <!-- 头部菜单 -->
    <el-header>
      <div>
        <img src="../../assets/home.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 左侧导航栏 -->
      <el-aside :width="isButton ? '64px' : '200px'">
        <div class="left-button" @click="asideButton">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#ffd04b"
          unique-opened
          :collapse="isButton"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="icons[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveState('/' + subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template></el-menu-item
            >
          </el-submenu>
        </el-menu></el-aside
      >
      <!-- 右侧内容 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { request } from "../../network/request";
export default {
  name: "Home",
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      icons: {
        125: "el-icon-user-solid",
        103: "el-icon-s-cooperation",
        101: "el-icon-s-operation",
        102: "el-icon-s-order",
        145: "el-icon-s-platform",
      },
      isButton: false,
      // 别激活的链接地址
      activePath: "",
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear("token");
      this.$router.push("/login");
    },
    // 获取所有的菜单
    getMenuList() {
      request({
        url: "/menus",
        method: "get",
      }).then((res) => {
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.menuList = res.data;
      });
    },
    // 折叠
    asideButton() {
      this.isButton = !this.isButton;
    },
    // 保存链接的激活状态
    saveState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    },
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
};
972652;
</script>

<style scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;
  padding-left: 0;
}
.el-header div {
  display: flex;
  align-items: center;
}
.el-header div img {
  height: 54px;
  width: 78px;
}
.el-header div span {
  margin-left: 15px;
}
.el-aside {
  background-color: #333744;
}
.el-menu {
  border-right: none;
}
.el-main {
  background-color: #eaedf1;
}
.home-container {
  height: 100vh;
}
.left-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>