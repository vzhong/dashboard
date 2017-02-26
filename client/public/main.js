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
            user: ensure_auth(),
            detailed: null,
            experiments_columns: ['Name', '# Entries', ''],
            experiments_options: {},
        },
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
        },
        methods: {
            detailed_show(e) {
                this.detailed = e;
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
                this.detailed = null;
            },
            delete_experiment(e) {
                this.$firebaseRefs.experiments.child(e['.key']).remove();
            },
        },
    });
}