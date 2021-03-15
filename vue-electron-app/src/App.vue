<template>
  <div id="app">
    <navigation> </navigation>
    <notifications group="app" position="top left"/>
    <router-view></router-view>
  </div>
  
</template>

<script>
import Navigation from './components/Navigation.vue'
export default {
  name: 'loputoo',
  components: {
    Navigation
  }
}
</script>

<style lang="scss"> 
@import url("https://fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons");
.half{
  width:60%
}
.centered{
  margin-right: auto;
  margin-left: auto;
}
.container {
  padding-top: 2%;
}
</style>
