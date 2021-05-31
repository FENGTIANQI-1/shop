import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login'
// import Home from '../views/home/Home.vue'
// import Welcome from '../views/home/Welcome.vue'
// import Users from '../views/home/Users.vue'
// import Rights from '../views/power/Rights'
// import Roles from '../views/power/Roles'
// import Cate from '../views/goods/Cate'
// import Params from '../views/goods/Params'
// import GoodsList from '../views/goods/List'
// import Add from '../views/goods/Add'
// import Order from '../views/order/Order'
// import Report from '../views/report/Report'

// 路由懒加载
const Login = () => import('../components/Login.vue')
const Home = () => import('../views/home/Home.vue')
const Welcome = () => import('../views/home/Welcome.vue')
const Users = () => import('../views/home/Users.vue')
const Rights = () => import('../views/power/Rights')
const Roles = () => import('../views/power/Roles')
const Cate = () => import('../views/goods/Cate')
const Params = () => import('../views/goods/Params')
const GoodsList = () => import('../views/goods/List')
const Add = () => import('../views/goods/Add')
const Order = () => import('../views/order/Order')
const Report = () => import('../views/report/Report')




Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login',

  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    redirect: '/welcome',
    children: [{
      path: '/welcome',
      name: 'Welcome',
      component: Welcome,
    }, {
      path: '/users',
      name: 'Users',
      component: Users
    },
    {
      path: '/rights',
      name: 'Rights',
      component: Rights
    },
    {
      path: '/roles',
      name: 'Roles',
      component: Roles
    },
    {
      path: '/categories',
      name: 'Cate',
      component: Cate
    },
    {
      path: '/params',
      name: 'Params',
      component: Params
    },
    {
      path: '/goods',
      name: 'GoodsList',
      component: GoodsList
    },
    {
      path: '/goods/add',
      name: 'Add',
      component: Add
    },
    {
      path: '/orders',
      name: 'Order',
      component: Order
    },
    {
      path: '/reports',
      name: 'Report',
      component: Report
    },]
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path == '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()

})

export default router
