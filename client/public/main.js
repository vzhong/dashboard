window.onload = function() {

    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyC5gIyB7XBw3UYsU6EJI2MJAVs5IFnf6vY",
      authDomain: "dashboard-ffc72.firebaseapp.com",
      databaseURL: "https://dashboard-ffc72.firebaseio.com",
      storageBucket: "dashboard-ffc72.appspot.com",
      messagingSenderId: "1081800712753"
    };
    firebase.initializeApp(config);

    var db = firebase.database();
    ensure_auth();

    // Initialize Vue
    var app = new Vue({
        el: '#app',
        data: {
            title: 'Welcome to Dashboard',
            detailed: null,
            experiments_header: ['Experiment', '# Entries'],
        },
        firebase: {
            experiments: db.ref('experiments'),
        },
        computed: {
            processed_experiments: function() {
                var list = [];
                this.experiments.forEach(function(e) {
                    var r = {}
                    r['Experiment'] = e['.key']
                    r['# Entries'] = Object.keys(e).length - 1
                    r['orig'] = e
                    list.push(r)
                })
                return list
            },
        },
        methods: {
            show: function(row) {
                if (this.detailed) { this.detailed_close() }
                this.detailed = row.orig;
            },
            remove: function(row) {
                this.$firebaseRefs.experiments.child(row.orig['.key']).remove();
            },
            detailed_close: function() {
                Plotly.purge('plot')
                this.detailed = null;
            },
        },
    });
}