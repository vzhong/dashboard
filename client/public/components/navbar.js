Vue.component('navbar', {
  props: ['logo', 'items'],
  template: `
  <nav class="nav">
    <div class="nav-left">
      <a class="nav-item">
        <img v-if="logo" :src="logo">
        <slot></slot>
      </a>
    </div>
  
    <div class="nav-right nav-menu is-active">
      <div v-for="item in items" class="nav-item">
        <router-link v-if="item.route" :to="item.route">{{item.name}}</router-link>
        <a v-else class="button" @click="item.func">{{item.name}}</a>
      </div>
    </div>
  </nav>
  `,
})
