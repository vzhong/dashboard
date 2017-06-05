Vue.component('experiment_listings', {
  props: [],
  template: `
  <div>
    <p class="subtitle is-4">You have {{experiments.length}} experiments in total and {{filtered_experiments.length}} after filtering.</p>
    
    <detailed v-if="selected_experiments.length > 0" :experiments="selected_experiments"></detailed>

    <div class="box">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <p class="title is-4">Filters</p>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <form @submit="add_condition">
              <div class="field has-addons">
                <p class="control">
                  <input class="input" type="text" placeholder="Condition field" v-model="current_condition_field">
                </p>
                <p class="control">
                  <span class="select">
                    <select name="country" v-model="current_condition_operator">
                      <option v-for="o in condition_operators" :value="o">{{o}}</option>
                    </select>
                  </span>
                </p>
                <p class="control">
                  <input class="input" type="text" placeholder="Condition value" v-model="current_condition_value">
                </p>
                <p class="control">
                  <input class="button is-primary" title="Add condition to filter" type="submit" value="Add">
                </p>
                <p class="control">
                  <a class="button is-danger" title="Clear all conditions" @click="conditions=[]">Clear</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <p>
        <span v-for="c in conditions">
          <span class="tag is-dark is-medium">
            {{c.field}} {{c.operator}} {{c.value}}
            <button class="delete is-small" @click="remove_condition(c)""></button>
          </span>
          <span> </span>
        </span>
      </p>
    </div>

    <notification v-if="message.length > 0" :type="message_type" :message="message" @close="message=''"></notification>
    <div v-for="e in filtered_experiments">
      <experiment_listing :experiment="e"></experiment_listing>
    </div>
  </div>
  `,
  created() {
    this.EventBus.$on('close_detailed', this.close_detailed)
    this.EventBus.$on('delete_experiment', this.delete_experiment)
    this.EventBus.$on('select_experiment', this.select_experiment)
  },
  beforeDestroy() {
    this.EventBus.$off('close_detailed', this.close_detailed)
    this.EventBus.$off('delete_experiment', this.delete_experiment)
    this.EventBus.$off('select_experiment', this.select_experiment)
  },
  mounted() {
    var parent = this
    firebase.database().ref('experiment_listings').once('value').then(snapshot => {
      var data = snapshot.val()
      if (data) {
        var names = Object.keys(data)
        names.sort()
        names.forEach(n => {
          this.experiments.push({name: n, config: data[n], selected: false})
        })
      }
    })
  },
  methods: {
    close_detailed() {
      this.selected_experiments.forEach(e => e.selected = false)
    },
    delete_experiment(experiment) {
      firebase.database().ref('experiment_listings').child(e.name).remove()
      this.experiments = this.experiments.filter(x => x != experiment)
    },
    select_experiment(experiment) {
      experiment.selected = !experiment.selected
    },
    add_condition(event) {
      event.preventDefault()
      if (this.current_condition_field && this.current_condition_value) {
        this.conditions.push({field: this.current_condition_field, operator: this.current_condition_operator, value: this.current_condition_value})
        this.current_condition_field = null
        this.current_condition_operator = this.condition_operators[0]
        this.current_condition_value = null
      }
    },
    remove_condition(c) {
      this.conditions = this.conditions.filter(item => item != c)
    },
  },
  computed: {
    selected_experiments() {
      return this.experiments.filter(e => e.selected)
    },
    filtered_experiments() {
      var filtered = []
      var conditions = this.conditions
      this.experiments.forEach(e => {
        var ok = true
        conditions.forEach(c => {
          var x = e.config[c.field]
          if (c.operator == '=')
            ok = x == c.value
          if (c.operator == '>') {
            if (isNaN(c.value) || isNaN(x))
              ok = x > c.value
            else
              ok = Number(x) > Number(c.value)
          }
          if (c.operator == '<') {
            if (isNaN(c.value) || isNaN(x))
              ok = x < c.value
            else
              ok = Number(x) < Number(c.value)
          }
        })
        if (ok)
          filtered.push(e)
      })
      return filtered
    },
  },
  data() {
    return {
      EventBus: EventBus,
      experiments: [],
      current_condition_field: null,
      current_condition_operator: '=',
      current_condition_value: null,
      conditions: [],
      condition_operators: ['=', '>', '<'],
      message: "",
      message_type: "is-primary",
    }
  }
})
