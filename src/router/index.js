import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../views/home/Home.vue'
import Welcome from '../views/home/Welcome.vue'
import Users from '../views/home/Users.vue'
import Rights from '../views/power/Rights'
import Roles from '../views/power/Roles'
import Cate from '../views/goods/Cate'



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
