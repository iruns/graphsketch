<template>
  <div id='items'
    :style="{
      'transform-origin':
        scale.x +'px '+
        scale.y +'px',
      transform:
        'translate('+
          position.x +'px,'+
          position.y +'px) '+
        'scale('+scale.s+')',
    }"
  >
    <item
      v-for="itemId in activeItems"
      v-if="itemData[itemId]"
      :key="itemId"
      :name="itemId"
      :ref="itemId"
      :itemData="itemData[itemId]"
      :spreadConfig="spreadConfig"
      />
  </div>
</template>

<script>
import Vue from 'vue'
import Item from './Item'
import layoutResolver from '../utils/layoutResolver'
import _ from 'lodash'

let drawing

export default {

  name: 'Items',

  components: {
    item: Item
  },

  props: [
    'activeItems',
    'position',
    'scale',
  ],

  computed: {
    itemData () {
      return this.$store.getters['item/data'] || {}
    },
    spreadConfig () {
      return this.$store.getters['spread/savedConfig'].design
    },
    itemDragged () {
      return this.$store.getters['item/dragged']
    },
  },

  mounted () {
    // console.log('items mounted');
  },

  updated () {
    // console.log('items updated');
  },

  watch: {
    // TODO fix this, currently the elements are not updated yet
    // itemData () {
    //   console.log('itemData');
    //   this.animateForce ()
    // },
    // activeItems () {
    //   console.log('activeItems');
    //   this.animateForce ()
    // },
    // spreadConfig () {
    //   console.log('spreadConfig');
    //   this.animateForce ()
    // },
    itemDragged () {
      if(this.itemDragged)
        layoutResolver.stop()
      else
        this.animateForce ()
    }
  },

  methods: {
    animateForce () {

      // TODO force in relation to other's prop value
      // TODO force of itemData with same prop value

      // const config = [
      //   {
      //     p_spouse: [
      //       // side by side
      //       {
      //         strength: .99,
      //         minDist: [200, null],
      //         maxDist: [200, null],
      //         priority: 1
      //       },
      //       // y alignment
      //       {
      //         strength: .8,
      //         minDist: [null, 0],
      //         maxDist: [null, 0],
      //         priority: 1
      //       },
      //     ],
      //     p_parent: [
      //       // lift above
      //       {
      //         directional: true,
      //         strength: .9,
      //         minDist: [null, 110],
      //         maxDist: [Infinity, Infinity],
      //         priority: 1
      //       },
      //       {
      //         directional: true,
      //         strength: .7,
      //         minDist: [null, 110],
      //         maxDist: [null, 110],
      //         priority: 1
      //       },
      //       // x alignment
      //       {
      //         strength: .5,
      //         minDist: [null, null],
      //         maxDist: [100, null],
      //         priority: 1
      //       },
      //     ],
      //     '*': [
      //         {
      //           strength: .05,
      //           minDist: [50, 10],
      //           maxDist: [Infinity, Infinity],
      //           priority: 0
      //         },
      //       ]
      //   },
      //   {
      //   '*': [
      //       {
      //         strength: .7,
      //         minDist: [250, 10],
      //         maxDist: [Infinity, Infinity],
      //         priority: 0
      //       },
      //       // {
      //       //   strength: .7,
      //       //   minDist: [250, 100],
      //       //   maxDist: [Infinity, Infinity],
      //       //   priority: 0
      //       // },
      //       // {
      //       //   type: 'distance',
      //       //   force: [-1, -1],
      //       //   range: [250, 150],
      //       //   rangeDir: -1,
      //       //   priority: 999
      //       // },
      //     ]
      //   }
      // ]

      // const config = [
      //   {
      //     p_pattern: [
      //       // lift above
      //       {
      //         directional: true,
      //         strength: .9,
      //         minDist: [null, 110],
      //         maxDist: [Infinity, Infinity],
      //         priority: 1
      //       },
      //       {
      //         directional: true,
      //         strength: .7,
      //         minDist: [null, 110],
      //         maxDist: [null, 110],
      //         priority: 1
      //       },
      //       // x alignment
      //       {
      //         strength: .5,
      //         minDist: [null, null],
      //         maxDist: [100, null],
      //         priority: 1
      //       },
      //     ],
      //     p_superitem: [
      //       // lift above
      //       {
      //         directional: true,
      //         strength: .9,
      //         minDist: [null, 110],
      //         maxDist: [Infinity, Infinity],
      //         priority: 1
      //       },
      //       {
      //         directional: true,
      //         strength: .7,
      //         minDist: [null, 110],
      //         maxDist: [null, 110],
      //         priority: 1
      //       },
      //       // x alignment
      //       {
      //         strength: .5,
      //         minDist: [null, null],
      //         maxDist: [100, null],
      //         priority: 1
      //       },
      //     ],
      //     '*': [
      //         {
      //           strength: .05,
      //           minDist: [50, 10],
      //           maxDist: [Infinity, Infinity],
      //           priority: 0
      //         },
      //       ]
      //   },
      //   {
      //   '*': [
      //       {
      //         strength: .7,
      //         minDist: [200, 100],
      //         maxDist: [Infinity, Infinity],
      //         priority: 0
      //       },
      //       {
      //         strength: .7,
      //         minDist: [250, 100],
      //         maxDist: [Infinity, Infinity],
      //         priority: 0
      //       },
      //     ]
      //   }
      // ]

      const config = [
        {
        '*': [
            {
              axis: [0, 1],// [] / 'r'
              direction: 0,

              dists: [10, 10],
              strength: 30,
              priority: 0
            },
          ]
        }
      ]

      // TODO add default values to the force config
      layoutResolver.animate(
        this.itemData,
        this.$store.getters['item/positions'],
        this.$store.getters['item/displayData'],
        config,
        (payload) => this.$store.dispatch(
          'item/setPosition',
          payload
        ),
        (payload) => this.$store.dispatch(
          'spread/saveItemPositions',
          payload
        )
      )
    },

  }
}

</script>

<style>
#items {
  transform-origin: 700px 700px;
}
</style>
