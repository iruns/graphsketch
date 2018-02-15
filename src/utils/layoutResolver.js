import _ from 'lodash'

const MIN_SPEED = .3
const MAX_SPEED = 50

let paused = false
let timeoutFunc
let tick = () => {console.log("NOT STARTED")}

function animate(
  ids,
  itemData, itemPositions, itemDisplayData,
  config,
  setItemPosition, saveItemPositions
){

  // clear prev timeout
  clearTimeout(timeoutFunc)

  const nodes = {}
  let forces = {}

  // if there are actually stuff to animate
  if(ids.length > 0){

    // create nodes
    ids.map((id, idx) => {

      nodes[id] = {
        idx: idx,
        id: id,
        props: itemData[id].props,
        position: [
          itemPositions[id].x,
          itemPositions[id].y,
        ],
        displayData: itemDisplayData[id].item,
        offset: [0, 0],
        forces: []
      }
    })

    // fill the nodes' forces
    _.forEach(nodes, (node, id) => {

      config.map((phase, phaseIdx) => {

        // check if any config applies
        _.forEach(phase, (propConfigs, propId) => {

          // if for all
          if(propId == '*'){

            propConfigs.map(propConfig => {

              _.forEach(nodes, (target, targetId) => {

                if(
                  // if not self
                  id != targetId &&
                  (
                    // if the same force has been created by the other item
                    !forces[targetId] ||
                    !forces[targetId][id]
                  )
                ){

                  const newForce = {
                    config: fillSides(
                      getType(propConfig.axis),
                      node, target, propConfig
                    ),
                    // phase: phaseIdx,
                    target: target
                  }

                  _.set(forces, [id, targetId], true)
                  node.forces.push(newForce)
                }
              })
            })
            return true
          }

          // const prop = node.props[propId]

          // if(prop != undefined){
          //
          //   propConfigs.map(propConfig => {
          //
          //     _.forEach(prop, valSet => {
          //
          //       const target = nodes[valSet.val]
          //
          //       if(target){
          //         const newForce = {
          //           config: propConfig,
          //           phase: phaseIdx,
          //           target: target
          //         }
          //         node.forces.push(newForce)
          //       }
          //     })
          //   })
          // }
        })
      })
    })

    forces = null

    let frames = 0
    let lastPhase = 0
    let lastNode = Math.min(1, ids.length-1)

    // for (var i = lastNode + 1; i < ids.length; i++)
    //   nodes[ids[i]].element.style.display = 'none'

    // TODO quantize positions after each tick
    tick = () => {

      // for each node
      for (let n = 0; n <= lastNode; n++) {

        const id = ids[n]
        const node = nodes[id]

        // for each force set in the node
        node.forces.map(force => {

          // if in active phase
          // if(force.phase <= lastPhase){

            // if the target is already activated
            // if(force.target.idx <= lastNode){

              const type = getType(force.config.axis)

              const offset = getOffset(
                type, node,
                force.target, force.config
              )
              node.offset[0] += offset[0] / 2
              node.offset[1] += offset[1] / 2
              force.target.offset[0] -= offset[0] / 2
              force.target.offset[1] -= offset[1] / 2

            // }
          // }
        })
      }

      let going = false

      // for (let n = 0; n <= lastNode; n++) {
      for (let n = 0; n < ids.length; n++) {

        const id = ids[n]
        const node = nodes[id]

        // if still moving more than MIN_SPEED, don't stop
        if(
          !going && (
            Math.abs(node.offset[0]) > MIN_SPEED ||
            Math.abs(node.offset[1]) > MIN_SPEED
          )
        )
          going = true


        // move position
        for (var i = 0; i < 2; i++){
          // node.offset[i] *= .2
          node.offset[i] = _.clamp(node.offset[i], -MAX_SPEED, MAX_SPEED)
          node.position[i] += Math.round(node.offset[i])
        }

        setItemPosition({
          id: id,
          data: {
            x: _.round(node.position[0], -1),
            y: _.round(node.position[1], -1),
          }
        })

        node.offset = [0, 0]
      }

      // if not going any more, try to activate next phase or node
      if(!going){
        going = true
        lastPhase++

        // if already last phase, activate next node,
        // and restart phase
        if(lastPhase == config.length){

          lastNode++
          if(lastNode < ids.length){
            // nodes[ids[lastNode]].element.style.display = 'block'
            lastPhase = 0
          }
          // if already last node, finish
          else
            going = false
        }
      }

      frames++
      // console.log('------',frames);

      if(going && frames < 50 && !paused)
        timeoutFunc = setTimeout(tick, 1000/100)
      // if ending, save positiond
      else{
        const positions = {}
        _.forEach(nodes, (node, id) => {
          positions[id] = {
            x: node.position[0],
            y: node.position[1],
          }
        })
        saveItemPositions(positions)
      }
    }
    tick()
}
}

function getType (axis) {
  if(axis == 'r') return 'field'
  return axis.length
}

function fillSides (type, node, target, propConfig) {

  const itemConfig = _.cloneDeep(propConfig)

  // get edges of effect relative to the
  // coordinate position [left, right]

  itemConfig.ownSides = [null, null]

  switch (type) {
    // if spacing
    case 2:
      itemConfig.ownSides = [
        [
          -propConfig.dists[0] + 0,
          propConfig.dists[0] + node.displayData.width
        ],
        [
          -propConfig.dists[1] + 0,
          propConfig.dists[1] + node.displayData.height
        ]
      ]
      itemConfig.targetSides = [
        [0, target.displayData.width],
        [0, target.displayData.height],
      ]
      break;
    // if sort or align
    case 1:

      break;
    // if attract or repel
    default:

  }
  return itemConfig
}

function getOffset (type, node, target, config) {
  let offset = [0, 0]
  switch (type) {
    // if spacing
    case 2:

      const ownSides = [[],[]]
      const targetSides = [[],[]]

      for (var axis = 0; axis < 2; axis++){
        for (var side = 0; side < 2; side++) {

          ownSides[axis][side] =
            node.position[axis] +
            config.ownSides[axis][side]

          targetSides[axis][side] =
            target.position[axis] +
            config.targetSides[axis][side]
        }
      }

      // check if both axis overlap
      const overlaps = (
        ownSides[0][0] < targetSides[0][1] &&
        ownSides[0][1] > targetSides[0][0] &&
        ownSides[1][0] < targetSides[1][1] &&
        ownSides[1][1] > targetSides[1][0]
      )

      // if overlaps, get shortest side
      if(overlaps){
        let minDist = Infinity
        let minAxis

        // for each axis
        for (var axis = 0; axis < 2; axis++){

          // for each target side
          for (var side = 0; side < 2; side++) {

            const mult = side == 0 ? -1 : 1
            const other = side == 0 ? 1 : 0
            const dist = (targetSides[axis][side] - ownSides[axis][other])

            // if this target side is inside
            if(dist * mult > 0){
              if(Math.abs(dist) < Math.abs(minDist)){
                minDist = dist
                minAxis = axis
              }
            }
          }
        }

        // set force in direction of, and limit to minDist
        let force
        if(minDist > 0)
          force = Math.min(config.strength, minDist)
        else
          force = Math.max(-config.strength, minDist)

        // set offset to match
        if(minAxis != undefined)
          offset[minAxis] = force
      }
      break;
    // if sort or align
    case 1:

      break;
    // if attract or repel
    default:

  }
  return offset
}

function stop () {
  clearTimeout(timeoutFunc)
}

document.addEventListener('keyup', (event) => {

  const keyName = event.key;

  if (keyName === ' '){
    paused = !paused
    console.log('-----' +  (paused ? 'PAUSED' : 'RESUMED') + '-----');
    if(!paused)
      tick()
    else
      clearTimeout(timeoutFunc)
  }
})

export default {
  animate,
  stop
}
