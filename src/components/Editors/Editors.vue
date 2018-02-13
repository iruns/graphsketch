<template>
    <v-tabs
      id="left-panel"
      v-model="active"
      :scrollable="false"
      grow
      >
      <v-tabs-bar>
        <v-tabs-item
          key="spread"
          href="#spread"
          ripple
        >
          spread
        </v-tabs-item>
        <v-tabs-item
          key="item"
          href="#item"
          ripple
        >
          item
        </v-tabs-item>
        <v-tabs-slider color="teal"></v-tabs-slider>
      </v-tabs-bar>
      <v-tabs-items>
        <v-tabs-content
          key="spread"
          id="spread"
        >
          <spreadEditor/>
        </v-tabs-content>
        <v-tabs-content
          key="item"
          id="item"
        >
          <itemEditor/>
        </v-tabs-content>
      </v-tabs-items>
    </v-tabs>
</template>

<script>
import SpreadEditor from './SpreadEditor'
import ItemEditor from './ItemEditor'
export default {

  name: 'Editors',

  data () {
    return {
      active: 'spread'
    }
  },

  components: {
    spreadEditor: SpreadEditor,
    itemEditor: ItemEditor,
  },
}
</script>
