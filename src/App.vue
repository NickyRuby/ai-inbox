<template>
  <Spotlight />
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import Spotlight from './components/Spotlight.vue'

export default {
  name: "App",
  components: {
    HelloWorld,
    Spotlight
  },
};
</script>

body {
   opacity:·0.1; 
}

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
