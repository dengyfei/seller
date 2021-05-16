// 服务器入口文件
// 创建koa实例对象
const Koa = require("koa");
const app = new Koa();
// 绑定中间件
// 1.绑定第一层中间件
const respDurationMiddleware = require("./middleware/koa_response_duration");
app.use(respDurationMiddleware);
// 2.绑定第二层中间件
const respHeaderMiddleware = require("./middleware/koa_response_header");
app.use(respHeaderMiddleware);
// 3.绑定第二层中间件
const respDataMiddleware = require("./middleware/koa_response_data");
app.use(respDataMiddleware);
// 绑定端口号
app.listen(8888);

const webSocketService = require("./service/web_socket_service");
//开启服务端的监听，监听客户端的连接
webSocketService.listen();
