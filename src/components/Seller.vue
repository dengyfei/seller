<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null, //服务器返回的数据
      currentPage: 1, //当前显示的页数
      totalPage: 0, //一共多少页
      timerId: null, //定时器的ID
    };
  },
  created() {
    this.$socket.registerCallBack("sellerData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "sellerData",
      chartName: "seller",
      value: "",
    });
    //监听窗口变化
    window.addEventListener("resize", this.screenAdapter);
    //在页面加载完成的时候，主动进行屏幕的适配
    this.screenAdapter();
  },
  destored() {
    clearInterval(this.timerId);
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unRegisterCallBack("trendData");
  },
  methods: {
    // 初始化echartsInstance对象
    initChart() {
      this.chartInstance = this.$echarts.init(
        this.$refs.seller_ref,
        this.theme
      );
      //对图表初始化配置
      const initOption = {
        title: {
          text: "▎商家销售量统计", //标题文字
          //标题文本位置
          left: 20,
          top: 20,
        },
        //坐标轴位置配置
        grid: {
          top: "20%",
          left: "3%",
          right: "6%",
          bottom: "3%",
          containLabel: true, //以上百分比包含坐标轴上的文字
        },
        xAxis: {
          type: "value", //指定x轴类型为值类型
        },
        yAxis: {
          type: "category", //指定y轴类型为类目轴
        },
        //工具提示
        tooltip: {
          trigger: "axis", //鼠标移入坐标轴时触发
          //鼠标移入坐标轴所展示的样式
          axisPointer: {
            type: "line",
            z: 0, //调整背景的层级
            lineStyle: {
              color: "#2D3443",
            },
          },
        },
        series: [
          {
            type: "bar", //指定图表类型为柱状图
            //条目文字
            label: {
              show: true, //显示文字
              position: "right", //文字位置
              //文字样式
              textStyle: {
                color: "white",
              },
            },
            //条目样式设置
            itemStyle: {
              //通过两个坐标指明颜色渐变的方向，
              //通过数组指明不同百分比之下颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                //0%处的颜色
                {
                  offset: 0,
                  color: "#5052EE",
                },
                //100%处的颜色
                {
                  offset: 1,
                  color: "#AB6EE5",
                },
              ]),
            },
          },
        ],
      };
      this.chartInstance.setOption(initOption);
      //对图表对象进行鼠标事件的监听
      //当鼠标移入图表时，取消定时器
      this.chartInstance.on("mouseover", () => {
        clearInterval(this.timerId);
      });
      //当鼠标移出图表时，启动定时器
      this.chartInstance.on("mouseout", () => {
        this.startInterval();
      });
    },

    //获取服务器数据
    getData(ret) {
      try {
        // const { data: ret } = await this.$http.get("seller");
        this.allData = ret;
        //对数据排序
        this.allData.sort((a, b) => {
          return a.value - b.value;
        });
        this.totalPage =
          this.allData.length % 5 === 0
            ? this.allData.length / 5
            : this.allData.length / 5 + 1;
        this.updateChart();
        //开启定时器
        this.startInterval();
      } catch {
        (e) => {
          console.log(e);
        };
      }
    },

    //更新数据
    updateChart() {
      const start = (this.currentPage - 1) * 5;
      const end = this.currentPage * 5;
      const showData = this.allData.slice(start, end);
      //类目轴数组: ['商家1', '商家2', '商家3', ……]
      const sellerNames = showData.map((item) => {
        return item.name;
      });
      //值
      const selllerValues = showData.map((item) => {
        return item.value;
      });
      //数据配置
      const dataOption = {
        yAxis: {
          data: sellerNames, //指定类目轴数组
        },
        series: [
          {
            data: selllerValues, //指定值的数组
          },
        ],
      };
      this.chartInstance.setOption(dataOption);
    },

    //设置定时器
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId);
      }
      this.timerId = setInterval(() => {
        this.currentPage++;
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1;
        }
        //调用更新方法
        this.updateChart();
      }, 3000);
    },
    //当浏览器窗口大小发生变化时，会调用该方法来完成屏幕的适配
    screenAdapter() {
      //获取图表容器宽度
      const container = this.$refs.seller_ref.offsetWidth;
      const titleFontSize = (container / 100) * 3.6;
      //和分辨率大小相关的配置
      const adapterOption = {
        title: {
          //标题文本样式
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        //工具提示
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize,
            },
          },
        },
        series: [
          {
            barWidth: titleFontSize, //柱的宽度
            //条目样式设置
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0], //四个角的圆角，从左上起
            },
          },
        ],
      };
      this.chartInstance.setOption(adapterOption);
      //手动的调用图表对象的resize方法
      this.chartInstance.resize();
    },
  },
  computed: {
    ...mapState(["theme"]),
  },
  watch: {
    theme() {
      this.chartInstance.dispose(); //销毁当前的图表
      this.initChart(); //重新以最新的主题来初始化图表对象
      this.screenAdapter(); //完成屏幕的适配
      this.updateChart(); //更新图表的显示
    },
  },
};
</script>
<style lang="less"></style>
