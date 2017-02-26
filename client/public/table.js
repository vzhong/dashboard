Vue.component('vtable', {
    template: '#vtable',
    props: {
        header: Array,
        rows: Array,
        default_page_size: {type: Number, default: 10},
        show: {default: null},
        remove: {default: null},
    },
    data: function () {
        return {
            sort_key: this.header[0],
            sort_order: 'asc',
            current_page: 0,
            user_page_size: null,
            user_query: null,
        }
    },
    mounted: function () {
        this.sort_by(this.header[0])
    },
    methods: {
        sort_by: function (key) {
            if (this.sort_order === 'desc' || key !== this.sort_key) {
                this.sort_order = 'asc';
            } else {
                this.sort_order = 'desc';
            }
            this.sort_key = key;
        },
        change_page: function(i) {
            this.current_page = Math.max(Math.min(this.num_pages - 1, i), 0);
        },
        extract_field: function(row, col) {
            return row[col]
        },
    },
    computed: {
        page_size: function () {
            if (this.user_page_size && this.user_page_size > 0) {
                return this.user_page_size;
            } else {
                return this.default_page_size;
            }
        },
        filtered_data: function () {
            var orig = this.rows;
            var filtered = [];
            if (this.user_query && this.user_query !== '') {
                var query = this.user_query.toLowerCase();
                for (var i=0; i<orig.length; i++) {
                    var row = orig[i];
                    for (var key in row) {
                        var val = row[key].toString();
                        if (val.toLowerCase().includes(query)) {
                            filtered.push(row);
                            break;
                        }
                    }
                }
            } else {
                filtered = orig;
            }
            return filtered;
        },
        processed_data: function () {
            // get filtered rows
            var rows = this.filtered_data;

            // sort
            var sort_key = this.sort_key;
            var sort_order = this.sort_order;
            var val_with_index = [];
            for (var i=0; i<rows.length; i++) {
                val_with_index.push([i, rows[i][sort_key]]);
            }
            val_with_index.sort(function(a, b) {
                if (sort_order === 'asc') {
                    return a[1] < b[1] ? -1 : 1
                } else {
                    return a[1] > b[1] ? -1 : 1
                }
            })

            // get results
            var ordered = [];
            val_with_index.forEach(function(v) {
                ordered.push(rows[v[0]])
            })

            // get page
            var paged = [];
            var start = this.current_page * this.page_size;
            var end = Math.min(ordered.length, start + this.page_size);
            for (var i=start; i<end; i++) {
                paged.push(ordered[i])
            }

            return paged;
        },
        num_pages: function () { return Math.ceil(this.filtered_data.length / this.page_size) },
        page_nums: function () {
            var num_pages = this.num_pages;
            var pages = [];
            for (var i=0; i<num_pages; i++) {
                pages.push(i)
            }
            return pages
        },
    },
    filters: {
        capitalize: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1)
        },
    },
})
