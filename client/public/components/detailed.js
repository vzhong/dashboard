Vue.component('detailed', {
  props: ['experiments'],
  template: `
  <article class="message">
    <div class="message-header">
      <p>Selected Experiments</p>
      <button class="delete" title="Close detailed panel" @click="EventBus.$emit('close_detailed')"></button>
    </div>
    <div class="message-body">
      <div class="columns">
        <div class="column">
          <div v-for="e in experiments">
            <experiment_listing :experiment="e" :load_log="true"></experiment_listing>
          </div>
        </div>
        <div class="column">
          <plot></plot>
        </div>
      </div>
    </div>
  </article>
  `,
  data() {
    return {
      EventBus: EventBus,
    }
  },
})
