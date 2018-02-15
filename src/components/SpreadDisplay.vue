<template>
  <div id='spreadDisplay'
    @mousedown.left.self.prevent="startDrag"
    @wheel.ctrl.prevent="zoom"
    ref="element"
  >
    <items
      :activeItems="activeItems"
      :position="contentPosition"
      :scale="contentScale"
    />
    <connectorDrawing
      :activeItems="activeItems"
      :position="contentPosition"
      :scale="contentScale"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Vue from 'vue'

import _ from 'lodash'
import Items from './Items'
import ConnectorDrawing from './ConnectorDrawing'

let drawing

export default {

  name: 'SpreadDisplay',

  components: {
    items: Items,
    connectorDrawing: ConnectorDrawing
  },

  data () {
    return {
      mouseStart: {x: null, y: null},
      elementStart: {x: null, y: null},
      contentPosition: {x: 0, y: 0},
      contentScale: {s:1, x:0, y: 0},
      // dimensions: {x: 0, y: 0},
      dragged: false
    }
  },

  computed: {
    activeItems () {

      // return ['value_type', 'item', 'prop']
      // return ['value_type', 'item']
      // return ['value_type']
      // console.log();

      const itemData = this.$store.getters['item/data']
      const patterns = this.$store.getters['item/patterns']
      const spreadConfig = this.$store.getters['spread/savedConfig']
      let activeItems = []

      if(itemData && spreadConfig){
        const filters = spreadConfig.filters

        // filter items
        activeItems = _.keys(_.pickBy(itemData,
          (itemDatum, itemId) => {

            let active = false

            // if no pattern, filter by the pattern 'none'
            if(itemDatum.flatPatterns.length == 0)
              active = _.get(
                spreadConfig.filters.patterns,
                ['none', 'isOn']
              ) != false
            // else, filter by patterns
            else{
              _.forEach(patterns,
                (props, patternId) => {

                  // if the pattern is used / not defined, activate
                  if(
                    _.get(
                      spreadConfig.filters.patterns,
                      [patternId, 'isOn']
                    ) != false &&
                    itemDatum.flatPatterns.includes(patternId)
                  )
                    active = true

                  // if already activated, skip others
                  if(active)
                    return false
                }
              )
            }

            return active
          }
        ))

        // filter props
        // _.forEach(activeItems)
      }

      return activeItems
    }
  },

  methods: {
    startDrag (e) {

      this.$data.dragged = true

      this.$data.mouseStart.x = e.screenX
      this.$data.mouseStart.y = e.screenY

      this.$data.elementStart.x =
        parseInt(this.contentPosition.x, 10)
      this.$data.elementStart.y =
        parseInt(this.contentPosition.y, 10)

      document.onmousemove = this.drag
      document.onmouseup =
        () => {
          // this.$store.dispatch('item/drag', false)
          this.$data.dragged = false
          document.onmousemove = null
          document.onmouseup = null
        }
    },
    drag (e) {
      e.preventDefault()

      this.$data.contentPosition = {
        x: this.$data.elementStart.x +
        (e.screenX - this.$data.mouseStart.x),
        y: this.$data.elementStart.y +
        (e.screenY - this.$data.mouseStart.y)
      }

    },
    zoom (e) {
      const rect = this.$refs.element.getBoundingClientRect()

      this.$data.contentScale.x = e.screenX - rect.x
      this.$data.contentScale.y = e.screenY - rect.y

      if(e.deltaY<0)
        this.$data.contentScale.s += .1
      else
        this.$data.contentScale.s -= .1
    }
  }
}

</script>

<style>
#spreadDisplay{
  /* position: absolute; */
  position: relative;
  width: 100%;
  height: 100%;
  background-repeat: repeat;
  background-image: url("../assets/grid.png");
}
</style>
