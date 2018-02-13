<template>
  <v-card
    id="spread-editor"
    flat
    >
    <v-expansion-panel
      v-if="config"
      >
      <v-expansion-panel-content>
        <div class="category-header" slot="header">Filters</div>
        <filters
        :config="config.filters"
        :toggle="toggle"
          />
      </v-expansion-panel-content>

      <v-expansion-panel-content :value="true">
        <div class="category-header" slot="header">Item Design</div>
        <design
        :config="config.design"
        :toggle="toggle"
        :setValue="setValue"
        :changeBy="changeBy"
          />
      </v-expansion-panel-content>

      <v-expansion-panel-content>
        <div class="category-header" slot="header">Layout</div>
        <v-card class="grey lighten-4">
          <v-card-text>
            coming soon
          </v-card-text>
        </v-card>
      </v-expansion-panel-content>

    </v-expansion-panel>
  </v-card>
</template>

<script>
import Filters from './Filters'
import Design from './Design'
// import Layout from './Layout'

import _ from 'lodash'

export default {
  name: 'SpreadEditor',

  components: {
    filters: Filters,
    design: Design,
    // layout: Layout,
  },

  computed: {
    config () {

      const config = this.$store.getters['spread/savedConfig']
      const itemData = this.$store.getters['item/data']
      const patterns = this.$store.getters['item/patterns']

      const processedConfig = {}

      if(
        config &&
        itemData &&
        patterns
      ){

        // process filters
        processedConfig.filters = {
          patterns: {},
          props: {},
        }

        _.forEach(patterns, (bpProps, bpID) => {
          processedConfig.filters.patterns[bpID] = {
            ref: itemData[bpID],
            props: bpProps,
            isOn: _.get(config.filters.patterns, [bpID, 'isOn']) != false
          }
        })

        // add 'none' pattern for ones with none
        processedConfig.filters.patterns.none = {
          ref: {label: 'none', id: 'none'},
          props: [],
          isOn: _.get(config.filters.patterns, ['none', 'isOn']) != false
        }

        // process design
        processedConfig.design = {
          patterns: {},
          props: {},
        }

        // filter by active patterns
        _.forEach(
          processedConfig.filters.patterns,
          (bpSet, bpId) => {

            if(bpSet.isOn){

              // design
              // design
              const design = config.design.patterns[bpId]
              design.label = bpSet.ref.label
              design.id = bpSet.ref.id

              processedConfig.design.patterns[bpId] =
                design
            }
          }
        )

        return processedConfig
      }
    },
  },

  methods: {
    toggle (path, deleteIfFalse) {

      const value = (_.get(this.config, path) == false)
      
      this.$store.dispatch('spread/setConfig', {
        path: path,
        value: value,
        delete: (!value && deleteIfFalse)
      })
    },
    setValue (path, value) {
      this.$store.dispatch('spread/setConfig', {
        path: path,
        value: value
      })
    },
    changeBy (path, by) {
      this.$store.dispatch('spread/setConfig', {
        path: path,
        value: _.get(this.config, path) + by
      })
    },
  }
}
</script>

<style>
.category-header {
  text-transform: uppercase;
}
.item-chip {
  border-radius: 8px;
}
.config-row {
  /* height: 30px */
}
</style>
