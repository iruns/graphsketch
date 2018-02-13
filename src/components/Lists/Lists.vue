<template>
    <v-tabs
      id="left-panel"
      v-model="active"
      :scrollable="false"
      grow
      >
      <v-tabs-bar>
        <v-tabs-item
          key="spreads"
          href="#spreads"
          ripple
        >
          spreads
        </v-tabs-item>
        <v-tabs-item
          key="items"
          href="#items"
          ripple
        >
          items
        </v-tabs-item>
        <v-tabs-slider color="teal"></v-tabs-slider>
      </v-tabs-bar>
      <v-tabs-items>
        <v-tabs-content
          key="spreads"
          id="spreads"
        >
          <spreadList/>
        </v-tabs-content>
        <v-tabs-content
          key="items"
          id="items"
        >
          <itemList/>
        </v-tabs-content>
      </v-tabs-items>
    </v-tabs>
    <!-- <v-list dense>
      <v-list-tile @click="">
        <v-list-tile-action>
          <v-icon>home</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Home</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile @click="">
        <v-list-tile-action>
          <v-icon>contact_mail</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Contact</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list> -->
</template>

<script>
import SpreadList from './SpreadList'
import ItemList from './ItemList'
export default {

  name: 'Lists',

  data () {
    return {
      active: 'spreads'
    }
  },

  components: {
    spreadList: SpreadList,
    itemList: ItemList,
  },
}
</script>
