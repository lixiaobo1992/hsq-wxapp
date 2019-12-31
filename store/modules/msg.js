import api from '../../api/index';
import { isEmptyObject } from '../../utils/is';
import { storage } from '@xmini/x-mini/lib/index';

let msgPollingTime = null; // 计时器
let lastTimestamp = storage.get('home-msg-last-timestamp') || 0;

const defaultState = {
  isNewMsg: false,
  newMsg: [],
};
const mutations = {
  ['UPDATED_NEW_MSG'](state, payload) {
    state.newMsg = payload;
  },
  ['SET_MSG_STATUS'](state, flag) {
    state.isNewMsg = flag;
  },
};
const actions = {
  ///
  // 修改 是否有新消息状态
  setMsgStatus({ commit, state }, flag) {
    commit('SET_MSG_STATUS', flag);
  },
  startPollingMsg({ commit, state }, payload) {
    clearInterval(msgPollingTime);
    changeMsgStatus();

    msgPollingTime = setInterval(() => {
      changeMsgStatus();
    }, 35000);

    function changeMsgStatus() {
      getNewMsg(res => {
        // console.log(res);
        lastTimestamp = res.timestamp; // 上一次请求的时间戳。默认0
        // 存储到本地
        storage.set('home-msg-last-timestamp', lastTimestamp, 0);
        const { list = [] } = res.data;
        if (list.length) {
          commit('UPDATED_NEW_MSG', list);
        }
      });
    }
  },
  stopPollingMsg({ commit, state }, payload) {
    clearInterval(msgPollingTime);
    commit('UPDATED_NEW_MSG', []);
  },
};

let currRequestIndex = 0; // 请求位置 防止同时请求返回数据相互覆盖问题

function getNewMsg(callBack) {
  // 记录请求 位置
  const qIndex = currRequestIndex;
  currRequestIndex++;
  api.getRecentpinevents(
    {
      lastTimestamp,
      isLoading: false,
    },
    res => {
      // 判断请求返回 位置
      if (currRequestIndex - 1 > qIndex) {
        return;
      }
      // console.log(res);
      if (isEmptyObject(res.data)) {
        // console.log('更新消息状态')
        callBack && callBack(res);
      }
    },
    err => {
      console.log(err);
      return true;
    }
  );
}

export default {
  state: defaultState,
  mutations,
  actions,
};
