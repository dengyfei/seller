<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle"
      >&#xe6ef;</span
    >
    <span class="iconfont arr-right" @click="toRight" :style="comStyle"
      >&#xe6ed;</span
    >
    <span class="cat-name" :style="comStyle">{{ catName }}</span>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils.js";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 0, //当前所展示出的一级分类数据
      titleFontSize: 0,
    };
  },
  watch: {
    theme() {
      this.chartInstance.dispose();
      this.initChart();
      this.screenAdapter();
      this.updateChart();
    },
  },
  computed: {
    ...mapState(["theme"]),
    catName() {
      if (!this.allData) {
        return [];
      } else {
        return this.allData[this.currentIndex].name;
      }
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).titleColor,
      };
    },
  },
  created() {
    this.$socket.registerCallBack("hotData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "hotData",
      chartName: "hotproduct",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unRegisterCallBack("hotData");
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme);
      const initOption = {
        title: {
          text: "▎热销商品的占比",
          left: 20,
          right: 20,
        },
        legend: {
          top: "15%",
          icon: "circle",
        },
        tooltip: {
          show: true,
          //工具提示框中所显示的文字
          formatter: (arg) => {
            const thirdCategory = arg.data.children;
            let total = 0;
            thirdCategory.forEach((item) => {
              total += item.value;
            });
            let retStr = "";
            thirdCategory.forEach((item) => {
              retStr += `${item.name}: ${parseInt((item.value / total) * 100) +
                "%"}<br/>`;
            });
            return retStr;
          },
        },
        series: {
          type: "pie",
          label: {
            show: false,
          },
          // 当饼图高亮时的动作
          emphasis: {
            label: {
              show: true,
            },
            //不显示线，只显示文字
            labelLine: {
              show: false,
            },
          },
        },
      };
      this.chartInstance.setOption(initOption);
    },

    getData(ret) {
      // const { data: ret } = await this.$http.get("hotproduct");
      this.allData = ret;
      this.updateChart();
    },
    updateChart() {
      const legendData = this.allData[this.currentIndex].children.map(
        (item) => {
          return item.name;
        }
      );
      const seriesData = this.allData[this.currentIndex].children.map(
        (item) => {
          return {
            name: item.name,
            value: item.value,
            //方便在工具框中拿到三级目录
            children: item.children,
          };
        }
      );
      const dataOption = {
        legend: {
          name: legendData,
        },
        series: {
          data: seriesData,
        },
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
        },
        series: [
          {
            radius: this.titleFontSize * 4.5, //控制饼图大小
            center: ["50%", "60%"], //控制饼图中心点的位置
          },
        ],
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    toLeft() {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1;
      }
      this.updateChart();
    },
    toRight() {
      this.currentIndex++;
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0;
      }
      this.updateChart();
    },
  },
};
</script>

<style lang="less" scoped>
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.arr-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  cursor: pointer;
}
.cat-name {
  position: absolute;
  left: 80%;
  color: white;
  bottom: 20px;
}
</style>
