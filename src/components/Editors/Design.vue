<template>
  <v-card class="grey lighten-4">
    <v-card-text>
      <h4>Patterns</h4>
      <itemDesign
        v-for="(bpSet, bpId) in config.patterns"
        :key="'item-design-'+bpId"
        :name="'item-design-'+bpId"
        :config="bpSet"
        :setValue="setValue"
        :changeBy="changeBy"
        :colors="colors"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import ItemDesign from './ItemDesign'
import _ from 'lodash'

export default {
  name: 'Design',

  props: [
    'toggle',
    'config',
    'setValue',
    'changeBy',
  ],

  components: {
    itemDesign: ItemDesign
  },

  data () {
    return {
      colors:{
        hues: [
          'red',
          'pink',
          'purple',
          // 'deep-purple',
          'indigo',
          'blue',
          // 'light-blue',
          // 'cyan',
          'teal',
          'green',
          // 'light-green',
          'lime',
          'yellow',
          // 'amber',
          'orange',
          // 'deep-orange',
          'brown',
          // 'blue-grey',
          'grey',
        ],
        lightness: [
          'lighten-4',
          // 'lighten-3',
          'lighten-2',
          // 'lighten-1',
          'darken-1',
          // 'darken-2',
          'darken-3',
          // 'darken-4',
        ]
      }
    }
  },

  computed: {
  },
}
</script>

<style>

</style>
