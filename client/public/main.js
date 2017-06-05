// Initialize Vue

const router = new VueRouter({
  routes: [
    { path: '/', name: 'home', component: Home },
  ]
})


const app = new Vue({
  router: router,
  mounted() {
    let config = {
      apiKey: "AIzaSyC5gIyB7XBw3UYsU6EJI2MJAVs5IFnf6vY",
      authDomain: "dashboard-ffc72.firebaseapp.com",
      databaseURL: "https://dashboard-ffc72.firebaseio.com",
      storageBucket: "dashboard-ffc72.appspot.com",
      messagingSenderId: "1081800712753"
    };
    firebase.initializeApp(config)
    var parent = this
    firebase.auth().onAuthStateChanged(function(user) {
      parent.user = user
    })
  },
  methods: {
    logout() {
      if (firebase.auth().currentUser) {
        firebase.auth().signOut()
      }
      this.user = null
    }
  },
  computed: {
    navbar() {
      var logo = '/static/logo.png'
      var items = [
        {name: 'Home', route: '/'}
      ]
      if (this.user) {
        items.push({name: this.user.email, route: '/'})
        items.push({name: 'Logout', func: this.logout})
      }
      return {logo, items}
    }
  },
  data: {
    user: null,
  }
}).$mount('#app')
