import Vue from 'vue'
import _ from 'lodash'
import hash from 'object-hash'

function getItem (id, items, logType) {

    let ref = items[id]
    // if item not found, create temporary item
    // that will hopefully be replaced by update from
    // other projects
    if(!ref){
      ref = {
        label: `${logType} ${id} not found!`,
        superitems: [[]],
        patterns: [[]]
      }
      console.log(`${logType} ${id} not found!`);
      Vue.set(items, id, ref)
    }

    return ref
}

function processProps (item, items) {

  item.processedProps = {}

  _.forEach(item.props, (propVals, propId) => {

    const propRef = getItem(propId, items, 'prop')

    // attach the prop object
    const processedProps = {
      vals: [],
      ref: propRef
    }

    // replace 'item' type values with the actual item
    propVals.map((valSet, idx) => {

      processedProps.vals[idx] = {
        val: valSet.val
      }

      if(valSet.type == 'item_ref'){

        let valRef = getItem(valSet.val, items, 'item')

        processedProps.vals[idx].ref = valRef
        if(valRef.label)
          processedProps.vals[idx].val = valRef.label
      }
    })

    Vue.set(item.processedProps, propId, processedProps)
  })
}

function getSuperitems (item, items) {

  // empty old one
  item.superitems.length = 0
  item.superitems[0] = []

  // collect direct superitems
  let directSuperitems =
    _.get(item, ['props', 'p_superitem'])

  if(directSuperitems){

    item.superitems[0] = directSuperitems.map(valSet => valSet.val)

    item.superitems[0].map((superitem, idx) => {

      // get superitems of the direct ones
      const itemRef = getItem(superitem, items, 'superitem')
      item.superitems.push(itemRef.superitems)
    })
  }
}

function flattenAllSuperitems (items) {

  _.forEach(items, item => {
    // if different, flatten
    const superitemsHash = hash(item.superitems)
    if(superitemsHash != item.superitemsHash){
      item.superitemsHash = superitemsHash
      item.flatSuperitems = _.uniq(
        _.flattenDeep(item.superitems)
      )
    }
  })
}

// get inherit properties of superitems
function inheritFromSuperitems (items) {

  // for each superitem's value of every item
  _.forEach(items, item => {

    _.forEach(item.flatSuperitems, superitemId => {

      _.forEach(items[superitemId].props, (superitemProp, propId) => {

        // if the prop is not superitem
        // (since it's already in the flatSuperitems key)
        if(propId != 'p_superitem'){
          let prop = item.props[propId]
          if(!prop)
            prop = item.props[propId] = []

          _.forEach(superitemProp, valSet => {

            // if it's not inherited from the superitem's super
            if(!valSet.superitem){
              prop.push({
                val: valSet.val,
                type: valSet.type,
                superitem: superitemId
              })
            }
          })
        }
      })
    })
  })
}

function getPatterns (item, items) {

  // empty old one
  item.patterns.length = 0
  item.patterns[0] = []


  // collect direct patterns
  let directPatterns =
    _.get(item, ['props', 'p_pattern'])

  if(directPatterns){

    item.patterns[0] = directPatterns.map(valSet => valSet.val)

    // get superitems of the direct ones
    item.patterns[0].map((patternItem, idx) => {

      const itemRef = getItem(patternItem, items, 'pattern item')
      item.patterns.push(itemRef.flatSuperitems)
    })
  }
}

function flattenAllPatterns (items) {

  _.forEach(items, item => {
    // if different, flatten
    const patternsHash = hash(item.patterns)
    if(patternsHash != item.patternsHash){
      item.patternsHash = patternsHash
      item.flatPatterns = _.uniq(
        _.flattenDeep(item.patterns)
      )
    }
  })
}

export default {
  processProps,

  getSuperitems,
  flattenAllSuperitems,
  inheritFromSuperitems,

  getPatterns,
  flattenAllPatterns,
}
