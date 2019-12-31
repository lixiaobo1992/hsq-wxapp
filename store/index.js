
import orderCommit from './modules/order-commit';
import user from './modules/user'
import msg from './modules/msg'
import location from './modules/location';
import spm from './modules/spm'

export default {
  modules: {
    spm,
    // products,
    order_commit: orderCommit,
    msg,
    user,
    location
  },
}
