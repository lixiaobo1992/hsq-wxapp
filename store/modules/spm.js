// import { storage } from '@xmini/x-mini/lib/core/storage';
// import api from '/api';


const setArray = ['spm', 'page', 'block'];
export default {
  state: {
    pre_spm: '',

    spm: 'hsq_wxapp',
    page: '',
    block: '',

    currentSpm: 'hsq_wxapp',
  },
  mutations: {
    ['SET_SPM']: (state, spmData = {}) => {

      for (let key in spmData) {
        if (setArray.includes(key)) {
          // 不等于时更新
          if (state[key] != spmData[key]) {
            state[key] = spmData[key];
          }
        }
      }
      const currentSpm = getNewSPM(state);
      if (currentSpm != state.currentSpm) {
        state.pre_spm = state.currentSpm;
      }
      state.currentSpm = currentSpm;
      console.log('state.currentSpm:',state.currentSpm);
    },
  },
  actions: {
    // 修改用户信息
    updatedSPM({ commit, state }, spmData) {
      console.log('::::::::::::::::::修改用户信息');
      commit('SET_SPM', spmData);
    },
  },
}



function getNewSPM(state) {
  const {
    spm= 'hsq_wxapp',
    page= '',
    block= '', } = state;
  let tempSpmArray = [spm];

  if (page) {
    tempSpmArray.push(page);
    if (block) {
      tempSpmArray.push(block);
    }
  }

  return tempSpmArray.join('.')
}
