import Vue from 'vue'
import firebase from '../firebase'
import _ from 'lodash'
import hash from 'object-hash'

import itemUtils from '../utils/item'

export default {
  namespaced: true,
  state: {
      byProject: {
        // projectId: [item ids]
      },
      data: {

      },

      displayData: {

      },
      positions: {

      },
      dragged: false
  },
  getters: {
    data: (state) => state.data,

    patterns (state) {
      let patterns = []
      const patternData = {}

      // collect list of all patterns
      _.forEach(state.data, (itemData, itemId) => {
        patterns = _.union(
          patterns,
          itemData.flatPatterns
        )
      })

      _.forEach(patterns, patternId => {
        const props = _.get(state.data, [
          patternId,
          'rules',
          'product',
          'props'
        ])
        // TODO also take from the bp's superitems,
        // and resolve contradicting rules
        patternData[patternId] = _.keys(props)
      })

      // TODO check if this is efficient (not overcalled)
      // if it is, find a way to only update changed ones
      return patternData
    },

    props (state) {

      const propData = {}
      // TODO add possibleValues
      const possibleValues = {}

      // collect list of all props
      _.forEach(state.data, (itemData, itemId) => {
        if(
          itemData.flatPatterns &&
          itemData.flatPatterns.includes('prop')
        ){

          const propDatum = {}

          // fill inverse (if exists)
          const inverse = itemData.props.p_inverse_prop
          if(inverse)
            propDatum.inverse = inverse.map(set => set.val)

          // fill value patterns
          propDatum.valuePatterns =
            itemData.props.p_value_pattern.map(set => set.val)

          propData[itemId] = propDatum
        }
      })

      // save to the inverse' inverse
      _.forEach(propData, (propDatum, propId) => {

        if(propDatum.inverse){
          propDatum.inverse.map(inverseId => {

            let inverse = propData[inverseId].inverse

            // if no inverse yet, create and fill
            if(!inverse)
              inverse = propData[inverseId].inverse = [propId]

            // else, check if already added, and add
            else{
              if(!inverse.includes(propId))
                inverse.push(propId)
            }

          })
        }
      })

      // TODO check if this is efficient (not overcalled)
      // if it is, find a way to only update changed ones
      return propData
    },

    displayData: (state) => state.displayData,
    positions: (state) => state.positions,

    dragged: (state) => state.dragged,
  },
  mutations: {
    updateData (state, payload) {

      // copy the project's item ids for tracking deleted ids
      const deletedItems = state.byProject[payload.projectId]

      // changed item ids
      const updatedItemIds = []

      // then start a new one
      const projectItems = []
      Vue.set(state.byProject, payload.projectId, projectItems)

      // update or add new items
      // while tracking old, deleted items
      _.forEach(payload.data, (data, id) => {

        if(!data.props)
          data.props = {}

        data.propsHash = hash(data.props)

        const oldData = state.data[id]

        // so prop object connections are not broken,
        // replace the contents of the objects
        // instead of replacing it with a new one

        if(oldData){

          // track deleted items
          if(deletedItems)
            _.pull(deletedItems, id)

          // if the props are different, replace
          if(oldData.propsHash != data.propsHash){

            // keep track of changed ones
            updatedItemIds.push(id)

            // empty old ones with no new ones
            _.forEach(oldData, (val, key) => {
              if(!data[key])
                delete oldData[key]
            })

            // fill with new ones
            _.forEach(data, (val, key) => {
              Vue.set(state.data[id], key, val)
            })
          }
        }
        // or if new, simply add
        else{
          // create holder for processed data
          data.superitems = [[]]
          data.patterns = [[]]

          data.id = id

          Vue.set(state.data, id, data)
          updatedItemIds.push(id)
        }

        // repopulate the project's item ids
        projectItems.push(id)
      })

      // delete deleted items from data
      if(deletedItems)
        deletedItems.map(id => {
          Vue.delete(state.data, id)
        })

      // TODO the superitem and pattern collection processes need to be less redundant
      // process new or updated items
      _.forEach(updatedItemIds, id => {
        const itemData = payload.data[id]
        // try to connect each item's props
        itemUtils.processProps(itemData, state.data)
        // collect superitems
        itemUtils.getSuperitems(itemData, state.data)
      })

      // flatten superitems of all of the project's item
      // that might have their superitems change
      itemUtils.flattenAllSuperitems(state.data)

      // inherit props from superitems
      itemUtils.inheritFromSuperitems(state.data)

      // collect patterns of new or updated items
      _.forEach(updatedItemIds, id => {
        const itemData = payload.data[id]
        itemUtils.getPatterns(itemData, state.data)
      })

      // flatten patterns of all of the project's item
      // that might have their superitems / patterns change
      itemUtils.flattenAllPatterns(state.data)
    },

    removeProject (state, payload) {

      const projectItems = state.byProject[payload]
      // if the project exists
      if(projectItems){

        projectItems.map(itemId => {
          // TODO check if no items actually need this
          // through state.project.includedProjectsSum

          // then delete the item from data
        })
        // then delete the project
        Vue.delete(state.byProject, payload)
      }
    },

    setupItems (state, payload) {
      Vue.set(state, 'positions', payload.positions)
      Vue.set(state, 'displayData', payload.displayData)
    },
    setupItem (state, payload) {
      Vue.set(state.positions, payload.id, payload.position)
      Vue.set(state.displayData, payload.id, payload.displayData)
    },
    // TODO add cleanup mutation

    setDisplayData (state, payload) {
      state.displayData[payload.id] = payload.data
    },

    setPosition (state, payload) {
      state.positions[payload.id] = payload.data
    },

    drag (state, payload) {
      state.dragged = payload
    },

  },
  actions: {
    fetch (context, payload) {

      const project = context.rootState.project

      // include dependencies first
      const includedProjectId =
        project.settings.includedProjectsSum[payload.idx]

      // if there's unfetched includedProjects, fetch
      if(includedProjectId){
        firebase.database.ref(
          `projects/${includedProjectId}/items`
        )
        .once('value', (snapshot) => {

          // if still hash is is still up to date,
          if(payload.hash == project.settings.includedSumHash){

            // commit,
            context.commit(
              'updateData',
              {
                projectId: includedProjectId,
                data: snapshot.val()
              }
            )
            // and continue to next
            payload.idx++
            context.dispatch('fetch', payload)
          }
        })
      }

      // then fetch the live project
      else
        firebase.database.ref(
          `projects/${project.selection.selectedId}/items`
        )
        .on('value', (snapshot) => {
          context.commit(
            'updateData',
            {
              projectId: project.selection.selectedId,
              data: snapshot.val(),
            }
          )
        })
    },

    savePosition (context, payload) {
      context.commit('savePosition', payload)
    },

    setupItems (context, payload) {
      context.commit('setupItems', payload)
    },
    setupItem (context, payload) {
      context.commit('setupItem', payload)
    },

    setDisplayData (context, payload) {
      context.commit('setDisplayData', payload)
    },

    setPosition (context, payload) {
      context.commit('setPosition', payload)
    },


    drag (context, payload) {
      context.commit('drag', payload)
    }
  }
}
