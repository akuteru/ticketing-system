export default{
    namespaced: true,
    state:{
        snack: null
    },
    getters: {
        snack(state){
            return state.snack
        }
    },
    mutations: {
        SET_TEXT(state, text){
            state.snack = text
        }
    },
    actions:{
        snack({commit}, text){
            commit('SET_TEXT', text)
            setTimeout(() => {
              commit('SET_TEXT', null)  
            }, 2000)
        }
    }
}