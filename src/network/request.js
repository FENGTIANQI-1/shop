import axios from 'axios'
import Vue from 'vue';
// 导入 Nprogress 这个包
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'


export function request(config) {
    const instance = axios.create({
        baseURL: 'http://106.53.73.30:8888/api/private/v1/',
        method: 'post',
        timeout: '5000'
    })

    // NProgress.start() 显示进度条   NProgress.done()隐藏进度条
    // axios 拦截器
    instance.interceptors.request.use(config => {
        // console.log(config);
        NProgress.start()
        config.headers.Authorization = window.sessionStorage.getItem('token')
        return config /*释放 */
    }, err => {
        console.log(err);
    })


    // 相应拦截
    instance.interceptors.response.use(res => {
        NProgress.done()
        // console.log(res);
        return res.data /*释放 */
    }, err => {
        console.log(err);
    })

    return instance(config)
}