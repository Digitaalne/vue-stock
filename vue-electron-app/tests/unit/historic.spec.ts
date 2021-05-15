import { shallowMount } from "@vue/test-utils";
import Historic from "@/views/Historic.vue";

describe("Historic.vue", () => {
    it("Warning is not rendered, when false", () => {
        const wrapper = shallowMount(Historic, {});
        wrapper.setData({showWarning: false})
        const warning = wrapper.find("#warning");
        expect(warning.exists()).toBe(false);
    })
  });