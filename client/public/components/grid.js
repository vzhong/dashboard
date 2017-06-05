Vue.component('grid', {
  props: ['data'],
  template: `
  <div>
  <table class="table">
    <thead>
      <tr>
        <th v-for="c in header">
          <a @click="sort(c)">
            {{c}}
            <span :style="order_by == c? '': 'visibility: hidden;'">
              <i :class="'is-primary fa fa-chevron-' + (order_asc? 'up': 'down')"></i>
            </span>
          </a>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="r in rows">
        <td v-for="c in header">{{r[c]}}</td>
      </tr>
    </tbody>
  </table>
  </div>
  `,
  mounted() {
    this.header = this.data.header
    this.rows = this.data.rows
    this.order_by = this.data.order_by
    this.order_asc = this.data.order_asc
  },
  methods: {
    sort(column) {
      if (column == this.order_by) {
        this.order_asc = !this.order_asc
      } else {
        this.order_by = column
        this.order_asc = true
      }

      var order_by = this.order_by
      function compare(a, b) {
        if (a[order_by] < b[order_by])
          return -1
        if (a[order_by] > b[order_by])
          return 1
        return 0
      }
      this.rows.sort(compare)
      if (!this.order_asc) {
        this.rows.reverse()
      }
    },
  },
  data() {
    return {
      header: null,
      rows: null,
      order_by: null,
      order_asc: null,
    }
  },
})
