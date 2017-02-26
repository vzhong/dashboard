Vue.component('vtable', {
    template: '#vtable',
    props: {
        name: String,
        header: Array,
        rows: Array,
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