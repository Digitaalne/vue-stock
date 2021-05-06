import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "services",
    component: require("@/views/ChooseService").default
  },
  {
    path: "/live",
    name: "live-page",
    component: require("@/views/Live").default
  },
  {
    path: "/position",
    name: "position",
    component: require("@/views/PositionPage").default
  },
  {
    path: "/historic",
    name: "historic",
    component: require("@/views/Historic").default
  },
  {
    path: "/history",
    name: "trade history",
    component: require("@/views/TradeHistory").default
  },
  {
    path: "*",
    redirect: "/"
  }
];

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? "hash" : "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
