const WebSocket = require("ws");
const path = require("path");
const fileUtils = require("../utils/file_utils");
//创建WebSocket服务端的对象，绑定的断口号是9998
const wss = new WebSocket.Server({
  port: 9998,
});

module.exports.listen = () => {
  //监听连接事件
  //client：代表的是客户端的连接socket对象
  wss.on("connection", (client) => {
    console.log("有客户端连接成功了");
    //对客户端的连接对象进行message事件的监听
    //msg：由客户端发给服务端的数据
    client.on("message", async (msg) => {
      let payload = JSON.parse(msg);
      const action = payload.action;
      if (action === "getData") {
        let filePath = "../data/" + payload.chartName + ".json";
        filePath = path.join(__dirname, filePath);
        const ret = await fileUtils.getFileJsonDate(filePath);
        //在服务端获取到数据的基础之上，增加一个data字段
        //data所对应的值，就是某个json文件的内容
        payload.data = ret;
        client.send(JSON.stringify(payload));
      } else {
        //原封不动的将所接收到的数据转发给每个处于连接状态的客户端
        //wss.clients就是所有客户端的连接
        wss.clients.forEach((client) => {
          //后端向前端发送数据
          client.send(msg);
        });
      }
    });
  });
};
