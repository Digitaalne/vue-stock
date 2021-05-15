<template>
  <div class="modal">
    <div class="modal-inside">
      <header class="modal-header">
        <slot name="header">
          <md-button
            id="close"
            type="button"
            @click="close"
            aria-label="Close modal"
          >
            <md-icon>clear</md-icon></md-button
          >
        </slot>
      </header>
      <section class="modal-body">
        <slot name="body"></slot>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal",
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.modal {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
}
.modal-inside {
  background: #ffffff;
  flex-direction: column;
  box-shadow: 1px 1px 10px 1px;
  overflow-x: auto;
  overflow-y: auto;
  display: flex;
  padding: 20px;
}
#close {
  flex: right;
  justify-content: right;
  display: flex;
}
</style>
