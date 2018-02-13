<template>
  <v-card class="grey lighten-4">
    <v-card-text>
      <h4>Patterns</h4>
      <v-chip
        v-for="bpSet in config.patterns"
        :key="'chip-'+bpSet.ref.id"
        small label
        :text-color="bpSet.isOn?'white':'grey darken-4'"
        :color="bpSet.isOn?'teal':'grey lighten-3'"
        @click="toggle(['filters','patterns',bpSet.ref.id,'isOn'])"
        class="item-chip"
      >
        {{ bpSet.ref.label }}
      </v-chip>
      <!-- <h4>Values</h4>
      <div
        v-for="bpSet in bpSet"
        v-if="bpSet.isOn"
        :key="'value'+bpSet.ref.id"
      >
        <h5>{{ bpSet.ref.label }}</h5>
        <ul>
          <li
            v-for="prop in bpSet.ref.props"
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
