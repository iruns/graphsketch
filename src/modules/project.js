import Vue from 'vue'
import firebase from '../firebase'
import _ from 'lodash'
import hash from 'object-hash'

export default {
  namespaced: true,
  state: {
    selection: {
      own: [
        {
          id: 'base',
          access: 2
        }
      ],
      public: [],
      selectedId: null,
    },

    includedInfos: {

    },

    settings: {
      // TODO fetching actions should only be called for the changed projects
      // for making sure that the current fetch cascade is up to date
      includedHash: '',
      includedProjects: [
        // projectId: [indirect includes]
      ],
      // for making sure that the current fetch cascade is up to date
      includedSumHash: '',
      // updated on add/remove inclusions
      includedProjectsSum: [
        // projectId: [other project ids]
      ],
      // updated on add/remove inclusions
      // includedByProjects: {
      //
      // },
      // user: {
      //
      // }
    },
  },
  getters: {
    select (state) {
      return state.selection.selectedId
    }
  },
  mutations: {
    select (state, payload) {
      state.selection.selectedId = payload
    },
    updateIncluded (state, payload) {
      state.settings.includedHash = payload.hash
      if(payload.data)
        state.settings.includedProjects = payload.data
    },
    updateIncludedSum (state, payload) {
      state.settings.includedProjectsSum = payload
    }
  },
  actions: {

    select (context, payload) {
      context.commit('select', payload)
      context.dispatch('fetchIncludedList')
    },

    fetchIncludedList (context, payload) {

      const projectId = context.state.selection.selectedId

      firebase.database.ref(`projects/${projectId}/include`)
        .on('value', (snapshot) => {

          const data = snapshot.val() || []
          const includedHash = hash(data)

          context.commit(
            'updateIncluded',
            {
              data: data,
              hash: includedHash
            }
          )
          // get the includedProjectsSum from the included
          context.dispatch('fetchSecondaryIncludedList', {
            hash: includedHash,
            data: data,
            idx: 0,
          })
        })
    },
    fetchSecondaryIncludedList (context, payload) {

      const includedProjectId =
        context.state.settings.includedProjects[payload]

      // if there's unfetched includedProjects, fetch
      if(includedProjectId){
        firebase.database.ref(`projects/${projectId}/include`)
          .once('value', (snapshot) => {

            // if still hash is is still up to date, continue to next
            if(payload.hash == context.state.settings.includedHash){
              payload.idx++
              payload.data = _.union(payload.data, snapshot.val())

              context.dispatch('fetchSecondaryIncludedList', payload)
            }
          })
      }
      // else, commit the sum
      // TODO maybe only for the difference
      else{

        // reverse so the most basic projects are listed first
        _.reverse(payload.data)

        const includedSumHash = hash(payload.data)
        payload.hash = includedSumHash

        context.commit(
          'updateIncludedSum',
          payload.data
        )

        // and start fetching spreads and items
        context.dispatch('spread/fetch', null, {root: true})
        context.dispatch(
          'item/fetch',
          {
            hash: payload.hash,
            idx: 0,
          },
          {root: true}
        )
      }
    },

    setIncludedList (context, payload) {
      // set on firebase
    }
  }
}
