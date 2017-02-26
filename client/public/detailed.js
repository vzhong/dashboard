Vue.component('detailed', {
    template: '#detailed',
    props: {
        experiment: {type: Object},
        close: {default: null},
    },
    computed: {
        log: function () {
            var rows = [];
            var exp = this.experiment
            for (var key in exp) {
                if (key !== '.key') {
                    rows.push(exp[key]);
                }
            }
            return rows;
        },
        plot_labels: function () {
            var labels = [];
            var log = this.log;
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
        name: function() {
            return this.experiment['.key'];
        },
    },
    methods: {
        plot(log) {
            var x = document.getElementById('plot-x').value;
            var y = document.getElementById('plot-y').value;
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
                title: 'Plot for ' + this.name,
                xaxis: {title: x},
                showlegend: true,
            }
            var plot_div = 'plot';
            if (document.getElementById(plot_div).data == null) {
                Plotly.plot(plot_div, [trace], layout);
            } else {
                Plotly.addTraces(plot_div, trace);
                Plotly.redraw(plot_div);
            }
        },
        delete_trace() {
            Plotly.deleteTraces('plot', 0);
        },
    }
})
