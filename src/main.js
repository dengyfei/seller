import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
// 引入全局的样式文件
import "./assets/css/global.less";
//引入字体文件
import "./assets/font/iconfont.css";
import SocketService from "@/utils/socket_service";

// 对服务端进行websocket的连接
SocketService.Instance.connect();
Vue.prototype.$socket = SocketService.Instance;

//请求基准配置
axios.defaults.baseURL = "http://127.0.0.1:8888/api/";
//将axios挂载到vue原型对象上
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

// 将全局echarts对象挂载到vue的原型对象上
Vue.prototype.$echarts = window.echarts;
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
