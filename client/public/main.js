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

    // Initialize Vue
    var app = new Vue({
        el: '#app',
        data: {
            title: 'Welcome to Dashboard',
            detailed: null,
            experiments_header: ['Experiment', '# Entries'],

        },
        ready: function () { ensure_auth() },
        firebase: {
            experiments: db.ref('experiments'),
        },
        computed: {
            detailed_log: function () {
                var rows = [];
                for (var key in this.detailed) {
                    if (key !== '.key') {
                        rows.push(this.detailed[key]);
                    }
                }
                return rows;
            },
            detailed_labels: function () {
                var labels = [];
                var log = this.detailed_log;
                for (var i=0; i<log.length; i++) {
                    var row = log[i];
                    for (var k in row) {
                        if (typeof k === 'string') {
                            labels[k] = true;
                        }
                    }
                }
                labels = Object.keys(labels);
                labels.sort();
                return labels;
            },
            detailed_name: function() {
                return this.detailed['.key'];
            },
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
            detailed_plot(e) {
                var x = document.getElementById('detailed-plot-x').value;
                var y = document.getElementById('detailed-plot-y').value;
                var log = this.detailed_log;
                var xs = [];
                var ys = [];
                for (var i=0; i<log.length; i++) {
                    var row = log[i];
                    if (row[x] != null && row[y] != null) {
                        xs.push(row[x]);
                        ys.push(row[y]);
                    }
                }
                var trace = {x: xs, y: ys, type: 'scatter', name: y}
                var layout = {
                    title: 'Plot for ' + this.detailed_name,
                    xaxis: {title: x},
                    showlegend: true,
                }
                var plot_div = 'detailed-plot';
                if (plot_div.data == null) {
                    Plotly.plot(plot_div, [trace], layout);
                } else {
                    Plotly.extendTraces(plot_div, trace);
                    Plotly.redraw(plot_div);
                }
            },
            detailed_delete_trace() {
                Plotly.deleteTraces('detailed-plot', 0);
            },
            detailed_close() {
                Plotly.purge('detailed-plot')
                this.detailed = null;
            },
        },
    });
}