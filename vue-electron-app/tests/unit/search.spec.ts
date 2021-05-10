import { mount, shallowMount } from "@vue/test-utils";
import Search from "@/components/Chart/Search.vue";

describe("Search.vue", () => {
  it("Search answers are rendered", () => {
    const wrapper = shallowMount(Search, {
      data() {
        return {
          possibleSymbols: [
            { symbol: "AAPL", description: "test1" },
            { symbol: "GME", description: "test2" }
          ]
        };
      }
    });
    const infoList = wrapper.findAll("#info");
    const aapl = infoList.at(0);
    const gme = infoList.at(1);

    expect(aapl.text()).toContain("AAPL");
    expect(aapl.text()).toContain("test1");
    expect(gme.text()).toContain("GME");
    expect(gme.text()).toContain("test2");
  });
  it("Search button emits event with stock info", () => {
    const wrapper = mount(Search, {
      data() {
        return {
          symbol: "AAPL"
        };
      }
    });
    wrapper.find("#search-button").trigger("click");

    expect(wrapper.emitted().stockSearch).toBeTruthy();
    const events = [...wrapper.emitted().stockSearch!];

    expect(events.length).toBe(1);
    expect(events[0][0].symbol).toEqual("AAPL");
  });
});
