import Vue from 'vue'
import firebase from '../firebase'
import _ from 'lodash'

export default {
  namespaced: true,
  state: {
    infos: {
      // projectId: {spreadId: infos}
    },

    selectedProject: null,
    selectedId: null,

    configs: {

    },

    itemPositionsBySpread: {

    },
  },
  getters: {
    infos: (state) => state.infos,

    selection (state) {
      return [
        state.selectedProject,
        state.selectedId,
      ]
    },
    savedConfig (state, getters, rootState, rootGetters) {
      if(
        state.selectedProject &&
        state.selectedId
      ){
        const savedSpread = _.get(state.infos, [
          state.selectedProject,
          state.selectedId
        ])

        const config = state.configs[state.selectedId] || {}
        const itemData = rootGetters['item/data']
        const patterns = rootGetters['item/patterns']

        if(
          itemData &&
          patterns
        ){
          // TODO process each time, or get as much from saved?
          const processedConfig = {}

          // process filters
          processedConfig.filters = {
            patterns: {},
            props: {},
          }

          _.forEach(patterns, (patternProps, patternId) => {
            processedConfig.filters.patterns[patternId] = {
              ref: itemData[patternId],
              props: patternProps,
              isOn: _.get(
                config.filters,
                ['patterns', patternId, 'isOn']
              ) != false
            }
          })

          // add 'none' pattern for ones with none
          processedConfig.filters.patterns.none = {
            ref: {label: 'none', id: 'none'},
            props: [],
            isOn: _.get(
              config.filters,
              ['patterns', 'none', 'isOn']
            ) != false
          }

          // process design
          processedConfig.design = {
            patterns: {},
            props: {},
          }

          // filter by active patterns
          _.forEach(
            processedConfig.filters.patterns,
            (patternSet, patternId) => {

              if(patternSet.isOn){

                // design
                const design = _.get(
                  config, ['design', 'patterns', patternId]
                ) || {}


                // assign default values
                _.defaults(design, {
                  hue: 'grey',
                  lightness: 'lighten-4',
                  label_size: 18,
                })

                design.label = patternSet.ref.label
                design.id = patternSet.ref.id

                processedConfig.design.patterns[patternId] =
                  design
              }
            }
          )

          return processedConfig
        }
      }
    },
    itemPositionsBySpread: (state) =>
      state.itemPositionsBySpread[state.selectedId] || {},

  },
  mutations: {
    updateInfos (state, payload) {
      Vue.set(state.infos, payload.projectId, payload.data)
    },
    updateConfig (state, payload) {
      Vue.set(state.configs, payload.id, payload.data)
    },
    removeProject (state, payload) {
      Vue.delete(state.infos, payload.projectId)
    },

    select (state, ids) {
      // console.log('select');
      state.selectedProject = ids[0]
      state.selectedId = ids[1]
    },
    updateItemPositions (state, payload) {
      Vue.set(state.itemPositionsBySpread, payload.id, payload.data)
    },
  },
  actions: {

    fetch (context) {

      // include
      _.forEach(
        context.rootState.project.settings.usedProjects,
        (dependants, projectId) => {
          firebase.database.ref(`projects/${projectId}/spreadInfos`)
            .on('value', (snapshot) => {
              context.commit(
                'updateInfos',
                {
                  projectId: projectId,
                  data: snapshot.val()
                }
              )
            })
        }
      )

      // live
      const projectId =
        context.rootState.project.selection.selectedId

      firebase.database.ref(`projects/${projectId}/spreadInfos`)
        .on('value', (snapshot) => {
          context.commit(
            'updateInfos',
            {
              projectId: projectId,
              data: snapshot.val()
            }
          )
          // if no spread is selected, select 1st one
          if(!context.state.selectedId){
            context.dispatch('select', [
              projectId,
              _.keys(snapshot.val())[0]
            ])
          }
        })
    },

    select (context, ids) {

      const selectedProject = context.state.selectedProject
      const projectId = context.rootState.project.selection.selectedId
      const selectedId = context.state.selectedId

      // if different
      if(ids[1] != selectedId){

        // turn off previous selection's listeners
        firebase.database.ref(
          `projects/${selectedProject}/`+
          `spreadConfigs/`+selectedId
        ).off()

        firebase.database.ref(
          `projects/${projectId}/`+
          `item_positions_by_spread/`+selectedId
        ).off()

        context.commit('select', ids)

        // and fetch new ones
        firebase.database.ref(
          `projects/${ids[0]}/`+
          `spreadConfigs/`+ids[1]
        )
        .on('value', (snapshot) => {
          context.commit(
            'updateConfig', {
              id: ids[1],
              data: snapshot.val()
            }
          )
        })

        firebase.database.ref(
          `projects/${projectId}/`+
          `item_positions_by_spread/`+ids[1]
        )
        .on('value', (snapshot) => {
          context.commit(
            'updateItemPositions', {
              id: ids[1],
              data: snapshot.val()
            }
          )
        })
      }
    },
    setConfig (context, payload) {

      let path = 'projects/'
      path += context.rootState.project.selection.selectedId
      path += '/spreadConfigs/'+context.state.selectedId+'/'
      path += payload.path.join('/')

      // if delete
      if(payload.delete)
        firebase.database.ref(path)
          .remove()
      // else set TODO change this to update
      else
        firebase.database.ref(path)
          .set(payload.value)
    },

    saveItemPositions (context, payload) {
      let path = 'projects/'
      path += context.rootState.project.selection.selectedId
      path += '/item_positions_by_spread/'
      path += context.state.selectedId

      firebase.database.ref(path)
        .update(payload)
    },
  }
}
