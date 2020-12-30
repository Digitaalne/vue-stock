import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
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
  ]
})
