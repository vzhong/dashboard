Vue.component('plot', {
  props: ['experiments', 'logs'],
  template: `
  <div>
    <section>
      <div class="level">
        <div class="level-left"><div class="level-item"></div></div>
        <div class="level-right">
          <div class="level-item">
            <div class="field has-addons">
              <p class="control">
                <button class="button is-static" title="X axis">X</button>
              </p>
              <p class="control">
                <span class="select">
                  <select v-model="current_x_field">
                    <option v-for="o in x_fields">{{o}}</option>
                  </select>
                </span>
              </p>
              <p class="control">
                <button class="button is-static" title="Y axis">Y</button>
              </p>
              <p class="control">
                <span class="select">
                  <select v-model="current_y_field">
                    <option v-for="(o, i) in y_fields" :selected="i == 0">{{o}}</option>
                  </select>
                </span>
              </p>
              <p class="control">
                <button class="button is-primary" @click="plot" title="Make plot">Plot</button>
              </p>
              <p class="control">
                <button class="button is-warning" @click="remove(-1)" title="Remove the last plotted trace">Remove last</button>
              </p>
              <p class="control">
                <button class="button is-danger" @click="remove()" title="Remove all traces">Remove all</button>
              </p>
            </div>
          </div>
        </div>
      </div>
      <br />
    </section>
    <section>
      <div id="plot"></div>
    </section>
  </div>
  `,
  created() {
    this.EventBus.$on('plot_add_fields', this.add_fields)
    this.EventBus.$on('plot_add_values', this.add_values)
  },
  beforeDestroy() {
    this.EventBus.$off('plot_add_fields', this.add_fields)
    this.EventBus.$off('plot_add_values', this.add_values)
    if (this.plot_div.data) {
      Plotly.purge(this.plot_div)
    }
  },
  mounted() {
    this.plot_div = document.getElementById('plot')
  },
  methods: {
    add_fields(fields) {
      this.fields.push.apply(this.fields, fields)
      this.current_x_field = this.x_fields[0]
      this.current_y_field = this.y_fields[0]
    },
    add_values(event) {
      var trace = {x: event.x, y: event.y, type: 'scatter', name: event.experiment.name + ': ' + this.current_x_field + ' vs ' + this.current_y_field}
      if (this.plot_div.data == null) {
        var layout = {
          title: 'Plot',
          xaxis: {title: this.current_x_field},
          showlegend: true,
          autosize: true,
          height: this.plot_div.offsetWidth,
        }
        Plotly.newPlot(this.plot_div)
        Plotly.plot(this.plot_div, [trace], layout)
      } else {
        Plotly.addTraces(this.plot_div, trace);
        Plotly.redraw(this.plot_div);
      }
    },
    plot() {
      this.EventBus.$emit('plot_request_values', {x: this.current_x_field, y: this.current_y_field})
    },
    remove(index) {
      if (this.plot_div.data && this.plot_div.data.length > 0) {
        if (index == null) {
          index = []
          for (i=0; i<this.plot_div.data.length; i++)
            index.push(i)
        }
        Plotly.deleteTraces(this.plot_div, index)
      }
    }
  },
  computed: {
    x_fields() { return this.fields },
    y_fields() { return this.fields.filter(f => f != this.current_x_field) },
  },
  data() {
    return {
      EventBus: EventBus,
      plot_div: null,
      fields: [],
      current_x_field: null,
      current_y_field: null,
    }
  },
})
