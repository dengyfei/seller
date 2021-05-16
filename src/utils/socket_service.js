export default class SocketService {
  // 单例模式
  static instance = null;
  static get Instance() {
    if (!this.instance) {
      this.instance = new SocketService();
    }
    return this.instance;
  }

  //和服务器连接的socket对象
  ws = null;
  //存储回调函数
  callBackMapping = {};
  //标识是否连接成功
  connected = false;
  //记录重试的次数
  sendRetryCount = 0;
  //重新连接尝试的次数
  connectRetryCount = 0;
  //定义服务器的方法
  connect() {
    //连接服务器
    if (!window.WebSocket) {
      return console.log("您的浏览器不支持WebSocket");
    }
    this.ws = new WebSocket("ws://localhost:9998");
    //连接成功的事件
    this.ws.onopen = () => {
      console.log("连接服务器成功了");
      this.connected = true;
      //重置重新连接的次数
      this.connectRetryCount = 0;
    };
    // 连接服务端失败
    this.ws.onclose = () => {
      console.log("连接服务器失败了");
      this.connected = false;
      this.connectRetryCount++;
      setTimeout(() => {
        this.connect();
      }, 500 * this.connectRetryCount);
    };
    // 得到服务器发送过来的数据
    this.ws.onmessage = (msg) => {
      console.log("从服务器获取到了数据");
      const recvData = JSON.parse(msg.data);
      const socketType = recvData.socketType;
      //判断回调函数是否存在
      if (this.callBackMapping[socketType]) {
        const action = recvData.action;
        if (action === "getData") {
          const realData = JSON.parse(recvData.data);
          this.callBackMapping[socketType].call(this, realData);
        } else if (action === "fullScreen") {
          this.callBackMapping[socketType].call(this, recvData);
        } else if (action === "themeChange") {
          this.callBackMapping[socketType].call(this, recvData);
        }
      }
    };
  }
  //回调函数的注册
  registerCallBack(socketType, callBack) {
    this.callBackMapping[socketType] = callBack;
  }
  //取消某个回调函数
  unRegisterCallBack(socketType) {
    this.callBackMapping[socketType] = null;
  }
  //发送数据的方法
  send(data) {
    //判断此时有没有连接成功
    if (this.connected) {
      this.sendRetryCount = 0;
      this.ws.send(JSON.stringify(data));
    } else {
      setTimeout(() => {
        this.sendRetryCount++;
        this.send(data);
      }, this.sendRetryCount * 500);
    }
  }
}
