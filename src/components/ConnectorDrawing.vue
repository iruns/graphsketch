<template>
  <div id='connector_drawing' ref="drawing">
    <svg width="1500" height="1000">
      <marker
        id="DotM" refX="4" refY="4"
        markerWidth="8" markerHeight="8" orient="auto">
        <circle  cx="4" cy="4" r="4" fill="teal"/>
      </marker>
      <marker
        id="TriangleM" viewBox="0 0 10 10" refX="10" refY="5"
        markerWidth="10" markerHeight="10" orient="auto">
        <path  d="M 0 0 L 10 5 L 0 10 z" fill="teal"/>
      </marker>
      <g
        :transform="
          'translate('+
            scale.x +' '+
            scale.y +') '+
          'scale('+scale.s+')'
        "
      >
        <g
          :transform="
            'translate('+
              -scale.x+' '+
              -scale.y +')'
          "
        >
          <g
            :transform="
              'translate('+
                (position.x / scale.s) +' '+
                (position.y / scale.s) +')'
            "
          >
            <path
              v-for="connection in connections"
              :d="connection.d"
              :stroke-width="connection.width"
              :stroke="connection.color"
              :opacity="connection.opacity"
              fill="none"
              marker-start="url(#DotM)"
              marker-end="url(#TriangleM)"
              />
          </g>
        </g>
      </g>
    </svg>
    <ul>
      <li
        v-for="(position, id) in itemPositions"
        >
        {{ id }}: {{ position }}
      </li>
    </ul>
  </div>
</template>

<script>
import _ from 'lodash'

let drawing

export default {

  name: 'ConnectorDrawing',

  props: [
    'activeItems',
    'position',
    'scale',
  ],

  computed: {
    itemPositions () {
      return this.$store.getters['item/positions']
    },

    connections () {

      const items = this.$store.getters['item/data']
      const displayData = this.$store.getters['item/displayData']
      const positions = this.$store.getters['item/positions']

      // const config = {
      //   p_parent: {
      //     source: 'item',
      //     width: 1,
      //     color: 'black'
      //   },
      //   p_spouse: {
      //     source: 'item',
      //     width: 2,
      //     color: 'red'
      //   },
      // }
      const config = {
        p_pattern: {
          source: 'item',
          width: 1,
          opacity: .5,
          color: 'black'
        },
        p_superitem: {
          source: 'item',
          width: 1,
          opacity: .5,
          color: 'grey'
        },
      }
      const rects = {}
      _.forEach(displayData, (displayDatum, id) => {

        rects[id] = _.cloneDeep(displayDatum).item

        rects[id].centerX = positions[id].x + displayDatum.item.halfWidth
        rects[id].centerY = positions[id].y + displayDatum.item.halfHeight

      })

      const connections = []

      _.forEach(this.$props.activeItems, itemId => {

        const item = items[itemId]
        // const element = items[itemId].element

        if(
          // element &&
          // element.style.display != 'none'
          true
        ){

          _.forEach(config, (propConfig, propId) => {

            const propData = _.get(item, ['props', propId])

            if(propData != undefined){

              const prop = _.get(item, ['props', propId])
              // const propRect = prop.getBoundingClientRect()

              _.forEach(propData, valSet => {

                const valId = valSet.val

                if(
                  valId && items[valId] &&
                  true
                  // items[valId].element &&
                  // items[valId].element.style.display != 'none'
                ){
                  const source = rects[itemId]
                  const target = rects[valId]

                  if(target && source){

                    switch (propConfig.source) {
                      case 'item':
                        this.getEdgeCoords(source, target)
                        this.getEdgeCoords(target, source)
                        break;
                      case 'prop':
                        source.x = propRect.x
                        source.y = propRect.y
                        break;
                      default:

                    }

                    target.x -= source.x
                    target.y -= source.y
                    const length = Math.sqrt(
                      (target.x * target.x) +
                      (target.y * target.y)
                    )

                    connections.push({

                      d: "M "+source.x+
                        " "+source.y+
                        " q "+ target.x/2+
                        " "+ (target.y/2 - (length*.2))+
                        " "+ target.x+
                        " "+ target.y,
                        // " l "+ target.x+
                        // " "+ target.y,

                      width: propConfig.width,
                      color: propConfig.color,
                      opacity: propConfig.opacity,

                      t: rects[itemId]
                    })
                  }
                }
              })
            }
          })
        }
      })
      return connections
    }
  },

  mounted () {

  },

  updated () {
    // console.log('up');
  },

  methods: {
    getEdgeCoords (source, target) {

      const quarter = 1.5708

      // connection angle
      const A = Math.atan2(
        source.centerY - target.centerY,
        source.centerX - target.centerX ,
      )

      const absA = Math.abs(A)

      const C1 = Math.atan2(
        source.halfHeight,
        source.halfWidth
      )
      const C2 = quarter - C1

      // vert or horz
      const horz = (
        absA < C1 ||
        absA > C1 + (C2 * 2)
      )

      let placement = {}
      if(horz){
        placement.x = source.width/2
        // if not 0, calculate; else set to 0
        placement.r = placement.x ? placement.x / Math.cos(A) : 0
        placement.y = Math.sin(A) * placement.r
        if(absA < quarter){
          placement.x = placement.x * -1
          placement.y = placement.y * -1
        }
      }
      else{
        placement.y = source.height/2
        // if not 0, calculate; else set to 0
        placement.r = placement.y ? placement.y / Math.sin(A) : 0
        placement.x = Math.cos(A) * placement.r
        if(A > 0){
          placement.x = placement.x * -1
          placement.y = placement.y * -1
        }
      }

      source.x = placement.x + source.centerX
      source.y = placement.y + source.centerY
    }
  }
}
</script>

<style>
#connector_drawing{
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
}
</style>
