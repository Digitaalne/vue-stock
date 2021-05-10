import { mount, shallowMount } from "@vue/test-utils";
import Price from "@/components/Price.vue";

describe("Price.vue", () => {
  it("renders prices if given", () => {
    const data = { askPrice: 5, bidPrice: 2, lastPrice: 3 };
    const wrapper = shallowMount(Price, {
      propsData: { data }
    });

    const askPrice = wrapper.find("#ask-price");
    const bidPrice = wrapper.find("#bid-price");
    const lastPrice = wrapper.find("#last-price");

    expect(askPrice.text()).toContain(5);
    expect(lastPrice.text()).toContain(3);
    expect(bidPrice.text()).toContain(2);
  });
  it("does not render prices if not given", () => {
    const data = {
      askPrice: undefined,
      bidPrice: undefined,
      lastPrice: undefined
    };
    const wrapper = shallowMount(Price, {
      propsData: { data }
    });

    const askPrice = wrapper.find("#ask-price");
    const bidPrice = wrapper.find("#bid-price");
    const lastPrice = wrapper.find("#last-price");

    expect(askPrice.exists()).toBe(false);
    expect(bidPrice.exists()).toBe(false);
    expect(lastPrice.exists()).toBe(false);
  });
  it("Stop price rendered if type is stop_limit", () => {
    const data = { askPrice: 5, bidPrice: 2, lastPrice: 3 };
    const wrapper = shallowMount(Price, {
      propsData: { data },
      data() {
        return {
          type: "stop_limit"
        };
      }
    });
    const stopPrice = wrapper.find("#stop-price");
    expect(stopPrice.exists()).toBe(true);
  });
  it("Stop price rendered if type is stop", () => {
    const data = { askPrice: 5, bidPrice: 2, lastPrice: 3 };
    const wrapper = shallowMount(Price, {
      propsData: { data },
      data() {
        return {
          type: "stop"
        };
      }
    });
    const stopPrice = wrapper.find("#stop-price");
    expect(stopPrice.exists()).toBe(true);
  });
  it("Stop price is not rendered by default", () => {
    const data = { askPrice: 5, bidPrice: 2, lastPrice: 3 };
    const wrapper = shallowMount(Price, {
      propsData: { data }
    });
    const stopPrice = wrapper.find("#stop-price");
    expect(stopPrice.exists()).toBe(false);
  });
  it("Stop limit is not rendered by default", () => {
    const data = { askPrice: 5, bidPrice: 2, lastPrice: 3 };
    const wrapper = shallowMount(Price, {
      propsData: { data }
    });
    const stopLimit = wrapper.find("#stop-limit");
    expect(stopLimit.exists()).toBe(false);
  });
  it("Stop limit is rendered when type is stop_limit", () => {
    const data = { askPrice: 5, bidPrice: 2, lastPrice: 3 };
    const wrapper = shallowMount(Price, {
      propsData: { data },
      data() {
        return {
          type: "stop_limit"
        };
      }
    });
    const stopLimit = wrapper.find("#stop-limit");
    expect(stopLimit.exists()).toBe(true);
  });
  it("Stop limit is rendered when type is limit", () => {
    const data = { askPrice: 5, bidPrice: 2, lastPrice: 3 };
    const wrapper = shallowMount(Price, {
      propsData: { data },
      data() {
        return {
          type: "limit"
        };
      }
    });
    const stopLimit = wrapper.find("#stop-limit");
    expect(stopLimit.exists()).toBe(true);
  });
  it("Close button exists and emits event", () => {
    const data = { askPrice: 5, bidPrice: 2, lastPrice: 3 };
    const wrapper = mount(Price, {
      propsData: { data }
    });
    const closeButton = wrapper.find("#close-button");
    closeButton.trigger("click");
    expect(wrapper.emitted().closeChart).toBeTruthy();
  });
});
