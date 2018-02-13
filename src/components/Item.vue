<template>
  <v-card
    class="item"
    :id="itemData.id"
    ref="element"
    :color="design.hue+' '+design.lightness"
    hover
    @mousedown.left.prevent="startDrag"
    :style="{
      transform:
        'translate('+
          position.x +'px,'+
          position.y +'px)'
    }"
  >

    <v-card-title class="py-2 px-3">
      <h3
        :style="{
          fontSize:design.label_size+'px',
          color:design.textColor
        }"
      >
        {{ itemData.label || itemData.id}}
      </h3>
    </v-card-title>

    <v-list class="props"
      >
      <v-list-tile
        class="prop pa-0"
        v-for="(prop, prop_id) in itemData.processedProps"
        :key="prop_id"
        :ref="'prop_'+prop_id"
      >
      <!-- v-if="spreadConfig[prop_id]" -->
        <div class="prop-label">
          {{ prop.ref.label }}
        </div>

        <div
          v-if="prop.vals"
          class="vals"
        >
          {{ prop.vals.map(val => val.val).join(', ') }}
        </div>
      </v-list-tile>
    </v-list>

  </v-card>
</template>

<script>

export default {
  name: 'Item',
  props: [
    'itemData',
    'spreadConfig'
  ],

  data () {
    return {
      mouseStart: {x: null, y: null},
      elementStart: {x: null, y: null},
      dragged: false
    }
  },

  computed: {
    position () {
      let position =
        this.$store.getters['item/positions']
        [this.$props.itemData.id]

      return position
    },
    savedPosition () {
      const position =
        this.$store.getters['spread/itemPositionsBySpread']
        [this.$props.itemData.id]

      return position
    },
    design () {
      let patternId
      if(this.$props.itemData.flatPatterns.length > 0)
        patternId = this.$props.itemData.flatPatterns[0]
      else
        patternId = 'none'

      const design = this.$props.spreadConfig.patterns[patternId]

      // change font color to adapt with the lightness
      design.textColor =
        _.startsWith(design.lightness, 'lighten') ?
          'black' : 'white'

      return design
    },

  },

  created () {
    // add objects to state to setup watchers
    this.$store.dispatch('item/setupItem', {
      id: this.$props.itemData.id,
      position: {x: 500, y: 200},
      displayData: {
        item: {
          width: 0,
          height: 0,
          halfWidth: 0,
          halfHeight: 0,
        },
        props: {

        }
      }
    })
  },

  mounted () {
    // console.log('mounted');
    this.updateDisplayData()
  },

  updated () {
    // console.log(this.$props.itemData.id,'updated');
  },

  watch: {
    itemData () {
      // console.log('itemData');
      this.updateDisplayData()
    },
    design () {
      // console.log('design');
      this.updateDisplayData()
    },
    savedPosition () {
      if(
        this.savedPosition &&
        (
          this.savedPosition.x != this.position.x ||
          this.savedPosition.y != this.position.y
        )
      ){
        this.$store.dispatch('item/setPosition', {
          id: this.$props.itemData.id,
          data: this.savedPosition
        })
      }
    }
  },

  methods: {

    updateDisplayData () {

      const rect = this.$refs.element.$el.getBoundingClientRect()
      const displayData =
        this.$store.getters['item/displayData']
        [this.$props.itemData.id]

      // if different, update
      if(
        displayData &&
        (
          displayData.item.width != rect.width ||
          displayData.item.height != rect.height
        )
      ){
        this.$store.dispatch('item/setDisplayData', {
          id: this.$props.itemData.id,
          data: {
            item: {
              width: rect.width,
              height: rect.height,
              halfWidth: rect.width / 2,
              halfHeight: rect.height / 2,
            },
            // props: comp[0].itemData.props,
          }
        })
      }
    },

    startDrag (e) {

      this.$store.dispatch('item/drag', true)
      this.$data.dragged = true

      this.$data.mouseStart.x = e.screenX
      this.$data.mouseStart.y = e.screenY

      this.$data.elementStart.x = _.round(this.position.x)
      this.$data.elementStart.y = _.round(this.position.y)

      document.onmousemove = this.drag
      document.onmouseup =
        () => {
          // stop drag
          document.onmousemove = null

          // stop drag vars
          this.$store.dispatch('item/drag', false)
          this.$data.dragged = false

          // round and save position for the current spread
          const itemPosition = {}
          itemPosition[this.$props.itemData.id] = {
            x: _.round(this.position.x, -1),
            y: _.round(this.position.y, -1),
          }
          this.$store.dispatch(
            'spread/saveItemPositions',
            itemPosition
          )
        }
    },
    drag (e) {

      e.preventDefault()

      const newPosition = {
        x: this.$data.elementStart.x +
        (e.screenX - this.$data.mouseStart.x),
        y: this.$data.elementStart.y +
        (e.screenY - this.$data.mouseStart.y)
      }

      this.$store.dispatch('item/setPosition', {
        id: this.$props.itemData.id,
        data: newPosition
      })

    }
  }
}

</script>

<style scoped>
.item {
  /* float: left; */
  position: absolute;

  border-radius: 4px;
  width: 150px;

  overflow: hidden;

  transform: translate(10px, 10px);
}
.prop-label, .vals {
  display: inline-block;
  padding-bottom: 10px;
  vertical-align: text-top;
}
.prop-label {
  width: 60px;
  font-size: 12px;
  font-weight: bold;
}
.vals {
  width: 60px;
}
</style>
