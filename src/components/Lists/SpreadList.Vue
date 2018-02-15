<template>
  <v-card
    id="spread-list"
    flat
    >
    <v-list>
      <v-list-group
      v-for="(spreads, projectId) in spreadsByProjects"
      :value="projectId==selection[0]"
      :key="projectId"
      >
        <v-list-tile slot="item" @click="">

          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <!-- TODO this should display name, not id -->
          <v-list-tile-content>
            <v-list-tile-title>
              {{ projectId }}
            </v-list-tile-title>
          </v-list-tile-content>

          <v-list-tile-action>
            <v-icon>keyboard_arrow_down</v-icon>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile
          v-for="(spread, spreadId) in spreads"
          :key="spreadId"
          :class="{'teal lighten-4': spreadId==selection[1]}"
          @click="select([projectId,spreadId])"
          >

          <v-list-tile-content>
            <v-list-tile-title>
              {{ spread.display_name }}
            </v-list-tile-title>
          </v-list-tile-content>

        </v-list-tile>

      </v-list-group>
    </v-list>
  </v-card>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'SpreadList',

  computed: {
    spreadsByProjects () {
      return this.$store.getters['spread/infos']
    },
    selection () {
      return this.$store.getters['spread/selection']
    }
  },

  methods: {
    select (ids) {
      this.$store.dispatch('spread/select', ids)
    }
  }
}
</script>

<style>
.selected {
  background-color:
}
</style>
