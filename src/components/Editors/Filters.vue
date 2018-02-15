<template>
  <v-card class="grey lighten-4">
    <v-card-text>
      <h4>Patterns</h4>
      <v-chip
        v-for="patternSet in config.patterns"
        :key="'chip-'+patternSet.ref.id"
        small label
        :text-color="patternSet.isOn?'white':'grey darken-4'"
        :color="patternSet.isOn?'teal':'grey lighten-3'"
        @click="toggle(['filters','patterns',patternSet.ref.id,'isOn'])"
        class="item-chip"
      >
        {{ patternSet.ref.label }}
      </v-chip>
      <!-- <h4>Values</h4>
      <div
        v-for="patternSet in patternSet"
        v-if="patternSet.isOn"
        :key="'value'+patternSet.ref.id"
      >
        <h5>{{ patternSet.ref.label }}</h5>
        <ul>
          <li
            v-for="prop in patternSet.ref.props"
            :key="prop"
          >
            {{ prop.ref.label }}
          </li>
        </ul>
      </div> -->
    </v-card-text>
  </v-card>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'Filters',
  props: [
    'toggle',
    'config',
  ],

  computed: {

  },
}
</script>

<style>

</style>
