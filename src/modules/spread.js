import Vue from 'vue'
import firebase from '../firebase'
import _ from 'lodash'

export default {
  namespaced: true,
  state: {
    byProject: {
      // projectId: {spreadId: config}
    },

    selectedProject: null,
    selectedId: null,

    itemPositionsBySpread: {

    },
  },
  getters: {
    byProject: (state) => state.byProject,

    selection (state) {
      return [
        state.selectedProject,
        state.selectedId,
      ]
    },
    savedConfig (state) {
      if(
        state.selectedProject &&
        state.selectedId
      ){
        const savedSpread = _.get(state.byProject, [
          state.selectedProject,
          state.selectedId
        ])

        if(savedSpread){
          // list project's patterns and their labels
          // list project's patterns and their props
          // list props and their labels
          return savedSpread.config
        }
      }
    },
    itemPositionsBySpread: (state) =>
      state.itemPositionsBySpread[state.selectedId] || {},

  },
  mutations: {
    updateData (state, payload) {
      Vue.set(state.byProject, payload.projectId, payload.data)
    },
    removeProject (state, payload) {
      Vue.delete(state.byProject, payload.projectId)
    },

    select (state, ids) {
      state.selectedProject = ids[0]
      state.selectedId = ids[1]
    },
    updateItemPositions (state, payload) {
      // TODO save position of a item in a spread to firebase
      // change will be listened by the spread module
      // although, maybe wait until the animation has stopped
      state.itemPositionsBySpread = payload || {}
    },
  },
  actions: {

    fetch (context) {

      // include
      _.forEach(
        context.rootState.project.settings.usedProjects,
        (dependants, projectId) => {
          firebase.database.ref(`projects/${projectId}/spreads`)
            .once('value', (snapshot) => {
              context.commit(
                'updateData',
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

      firebase.database.ref(`projects/${projectId}/spreads`)
        .on('value', (snapshot) => {
          context.commit(
            'updateData',
            {
              projectId: projectId,
              data: snapshot.val()
            }
          )
          context.commit('select', [
            projectId,
            _.keys(snapshot.val())[0]
          ])
          // TODO maybe only listen to the active spread
          // and fetch saved positions
          firebase.database.ref(
            `projects/${projectId}/item_positions_by_spread`
          )
          .on('value', (snapshot) => {
            context.commit(
              'updateItemPositions', snapshot.val()
            )
          })
        })
    },

    select (context, ids) {
      context.commit('select', ids)
    },
    setConfig (context, payload) {

      let path = 'projects/'
      path += context.rootState.project.selection.selectedId
      path += '/spreads/'+context.state.selectedId+'/config/'
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
