import axios from 'axios'
import Vue from 'vue';

export function request(config) {
    const instance = axios.create({
        baseURL: 'http://www.ysqorz.top:8888/api/private/v1/',
        method: 'post',
        timeout: '5000'
    })


    // axios 拦截器
    instance.interceptors.request.use(config => {
        console.log(config);
        return config /*释放 */
    }, err => {
        console.log(err);
    })


    // 相应拦截
    instance.interceptors.response.use(res => {
        console.log(res);
        return res.data /*释放 */
    }, err => {
        console.log(err);
    })

    return instance(config)
}