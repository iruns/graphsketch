<template>
  <div>
    <h5>{{ config.label }}</h5>
    <div>
      <span>
        color
      </span>
      <div class="dropdown">
        <button
          @click="toggleDropdown(config.id+'-hue')"
          :class="['dropbtn',config.hue]"
        >
          {{ config.hue }}
        </button>
        <div
          :id="config.id+'-hue'"
          class="dropdown-content"
        >
          <div
            v-for="hue in colors.hues"
            @click="setValue(['design','patterns',config.id,'hue'],hue)"
            :class="[hue,'color-box']"
          >
            {{ hue }}
          </div>
        </div>
      </div>
      <div class="dropdown">
        <button
          @click="toggleDropdown(config.id+'-lightness')"
          :class="['dropbtn',config.hue,config.lightness]"
        >
          {{ config.lightness }}
        </button>
        <div
          :id="config.id+'-lightness'"
          class="dropdown-content"
        >
          <a
            v-for="lightness in colors.lightness"
            @click="setValue(['design','patterns',config.id,'lightness'],lightness)"
            :class="[config.hue,lightness]"
          >
            {{ lightness }}
          </a>
        </div>

        <!-- <v-select
          :items="colors.hues"
        >

        </v-select> -->
      </div>
    </div>
    <div>
      <span>label size</span>
      <a
        @click="changeBy(['design','patterns',config.id,'label_size'],-1)"
      > - </a>
      <span>{{ config.label_size }}</span>
      <a
        @click="changeBy(['design','patterns',config.id,'label_size'],1)"
      > + </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ItemDesign',
  props: [
    'config',
    'colors',
    'setValue',
    'changeBy',
  ],
  methods: {
    toggleDropdown (id) {
      document.getElementById(id).classList.toggle("show")
    }
  }
}
</script>
