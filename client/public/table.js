Vue.component('vtable', {
    template: '#vtable',
    props: {
        name: String,
        header: Array,
        rows: Array,
    },
    data: function () {
        return {
            sort_key: this.header[0],
            sort_order: 'asc',
        }
    },
    reader: function () { sort_by(this.header[0]) },
    methods: {
        sort_by: function (key) {
            if (this.sort_order === 'desc' || key !== this.sort_key) {
                this.sort_order = 'asc';
            } else {
                this.sort_order = 'desc';
            }
            this.sort_key = key;
        },
    },
    computed: {
        processed_data: function () {
            var rows = this.rows;
            var sort_key = this.sort_key;
            var sort_order = this.sort_order;
            var val_with_index = [];
            for (var i=0; i<rows.length; i++) {
                val_with_index.push([i, rows[i][sort_key]]);
            }
            val_with_index.sort(function(a, b) {
                if (sort_order === 'desc') {
                    return a[1] < b[1] ? -1 : 1
                } else {
                    return a[1] > b[1] ? -1 : 1
                }
            })
            var ordered = [];
            val_with_index.forEach(function(v) {
                ordered.push(rows[v[0]])
            })
            return ordered;
        },
    }
})

window.onload = function () {

var app = new Vue({
    el: '#app',
    data: {
        title: 'Dashboard',
        log: [
            {iteration: 1, score: 2},
            {iteration: 2, score: 4},
            {iteration: 3, score: 6},
            {iteration: 4, score: 8},
            {iteration: 5, score: 10},
        ],
        header: ['iteration', 'score']
    },
})

}