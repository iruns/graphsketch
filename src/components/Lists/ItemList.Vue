<template>
  <v-card
    id="item-list"
    flat
    >
    <v-list
      dense
    >
        <v-list-tile
          v-for="(itemData, itemId) in projectItemData"
          :key="itemId"
          @click="select"
          >

          <v-list-tile-content>
            <v-list-tile-title>
              {{ itemData.label || itemId }}
            </v-list-tile-title>
          </v-list-tile-content>

        </v-list-tile>
    </v-list>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'ItemList',

  computed: {
    ...mapGetters({
      projectItemData: 'item/data'
    }),
    selection () {
      // return this.$store.getters['spread/selection']
    }
  },

  methods: {
    select (ids) {
      // this.$store.dispatch('spread/select', ids)
    }
  }
}
</script>

<style>
.selected {
  background-color:
}
</style>
