Vue.component('notification', {
  props: {
    type: String,
    message: String,
  },
  template: `
  <div :class="'notification ' + type">
    <button class="delete" @click="$emit('close')"></button>
    {{ message }}
  </div>
  `,
})
