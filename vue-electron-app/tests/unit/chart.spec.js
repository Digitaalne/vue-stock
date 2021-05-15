import { shallowMount } from "@vue/test-utils";
import Chart from "@/components/Chart/Chart.vue";

describe("Historic.vue", () => {
    it("Spinner is showed", () => {
        const wrapper = shallowMount(Chart, {
          data() {
            return {
                    series: [
                      {
                        type: "candlestick",
                        name: "TEST",
                        data: undefined,
                        turboThreshold: 10000
                      },
                      {
                        type: "column",
                        name: "Volume",
                        data: undefined,
                        yAxis: 1
                      }
                    ]
                  }
                }
            })
        const spinner = wrapper.findComponent({name: "md-progress-spinner"});
        const chart = wrapper.findComponent({name: "highcharts"});
        expect(spinner.isVisible()).toBe(true)
        expect(chart.exists()).toBe(false)
    })
  });