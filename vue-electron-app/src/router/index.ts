import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'landing-page',
    component: require('@/components/Welcome').default
  },
  {
    path: '/live',
    name: 'live-page',
    component: require('@/components/Live').default
  },
  {
    path: '/position',
    name: 'position',
    component: require('@/components/PositionPage').default
  },
  {
    path: '/historic',
    name: 'historic',
    component: require('@/components/Historic').default
  },
  {
    path: '/history',
    name: 'trade history',
    component: require('@/components/TradeHistory').default
  },
  {
    path: '*',
    redirect: '/'
  }
];

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
