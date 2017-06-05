Vue.component('login', {
  template: `
  <div class="login">
    <notification v-if="error.length > 0" type="is-warning" :message="error" @close="error=''"></notification>
    <p class="title">Welcome to Dashboard!</p>

    <p class="subtitle">Please sign in to view your experiments.</p>

    <form @submit="login">
      <div class="field">
        <p class="control has-icons-left">
          <input class="input" type="email" placeholder="Email" v-model="email">
          <span class="icon is-small is-left">
            <i class="fa fa-envelope"></i>
          </span>
        </p>
      </div>
      <div class="field">
        <p class="control has-icons-left">
          <input class="input" type="password" placeholder="Password" v-model="password">
          <span class="icon is-small is-left">
            <i class="fa fa-lock"></i>
          </span>
        </p>
      </div>
      <div class="field">
        <div class="level">
          <div class="level-left">
            <div class="level-item"></div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <p class="control">
                <input type="submit" class="button is-primary" value="Login">
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
  `,
  mounted() {
  },
  methods: {
    login(event) {
      event.preventDefault()
      var parent = this
      parent.error = ''
      firebase.auth().signInWithEmailAndPassword(this.email, this.password).catch(function(error) {
        parent.error = error.message
      });
      if (parent.error == '') {
        this.email = null
        this.password = null
        this.$emit('login')
      }
    }
  },
  data() {
    return {
      error: '',
      email: null,
      password: null,
    }
  }
})
