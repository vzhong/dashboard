Vue.component('experiment_listing', {
  props: ['experiment', 'load_log'],
  template: `
  <div class="box">
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <p class="title is-4">{{experiment.name}}</p>
        </div>
      </div>
      <div class="level-right">
        <div class="field has-addons">
          <p class="control">
            <button :class="'button is-' + (experiment.selected? 'primary': '')" title="Select experiment for plotting" @click="EventBus.$emit('select_experiment', experiment)"><i class="fa fa-check-square-o"></i></button>
          </p>
          <p class="control">
            <button class="button is-danger" @click="EventBus.$emit('delete_experiment', experiment)" title="Delete experiment from database"><i class="fa fa-trash-o"></i></button>
          </p>
          <p class="control" v-if="load_log">
            <button class="button" @click="show_table = !show_table" title="Toggle display of log file">{{show_table? 'Hide': 'Show'}} log</button>
          </p>
        </div>
      </div>
    </div>
    <p>
      <span v-for="h in header">
        <span class="tag is-dark is-medium">
          {{h}} = {{experiment.config[h]}}
        </span>
        <span> </span>
      </span>
    </p>
    <div v-if="show_table && load_log">
      <grid :data="log"></grid>
    </div>
  </div>
  `,
  created() {
    if (this.load_log) {
      this.EventBus.$on('plot_request_values', this.send_values)
    }
  },
  beforeDestroy() {
    this.EventBus.$off('plot_request_values', this.send_values)
  },
  mounted() {
    if (this.load_log) {
      var parent = this
      firebase.database().ref('experiments').child(this.experiment.name).once('value').then(snapshot => {
        var data = snapshot.val()
        if (data) {
          var header = {}
          var rows = []
          Object.keys(data).forEach(k => {
            Object.keys(data[k]).forEach(x => header[x] = true)
            rows.push(data[k])
          })
          header = Object.keys(header)
          header.sort()
          parent.EventBus.$emit('plot_add_fields', header)
          parent.log = {header: header, rows: rows, order_by: header[0], order_asc: true}
        }
      })
    }
  },
  methods: {
    send_values(event) {
      var pairs = []
      this.log.rows.forEach(r => {
        pairs.push({x: r[event.x], y: r[event.y]})
      })
      pairs.sort(function(a, b) { return a.x - b.x })
      var xs = []
      var ys = []
      pairs.forEach(t => {
        xs.push(t.x)
        ys.push(t.y)
      })
      this.EventBus.$emit('plot_add_values', {experiment: this.experiment, x: xs, y: ys})
    },
  },
  computed: {
    header() {
      var header = Object.keys(this.experiment.config)
      header.sort()
      return header
    },
  },
  data() {
    return {
      EventBus: EventBus,
      show_table: false,
      log: null,
    }
  },
})
