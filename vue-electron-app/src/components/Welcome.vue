<template>
  <div>
    <md-empty-state
      md-rounded
      md-icon="account_box"
      md-label="Welcome to the application (Paper trade version)"
      md-description="Please log in to Alpaca to continue using this application."
    ></md-empty-state>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Welcome',
  computed: {
    ...mapState('login', ['loggedIn'])
  },
  methods: {
    redirect () {
      if (this.loggedIn) {
        this.$router.push('/live')
      }
    }
  },
  mounted () {
    this.redirect()
  }
}
</script>