import { shallowMount } from "@vue/test-utils";
import Modal from "@/components/Modal.vue";

describe("Modal.vue", () => {
  it("Modal slot inserts data", () => {
    const wrapper = shallowMount(Modal, {
      slots: {
        body: "TEST123"
      }
    });
    expect(wrapper.text()).toContain("TEST123");
  });
});
