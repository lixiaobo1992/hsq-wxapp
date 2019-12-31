import {
  me,
  xmini,
  xPage,
} from '../../../config/xmini';
import mixins from '../../../utils/mixins';

/**
 * 页面类型
 * type 0 拼团规则 1 抽奖团规则
 */

// 抽奖规则
const kLotteryRuleDesc = "1. 拼团失败：24小时内没有邀请到好友一起买，系统会自动退款到您的支付账户。\n2.未中奖：系统会自动退款到您的支付账户。\n3.不能和其他优惠券叠加（不能使用优惠券）"
// 拼团规则
const kRuleDesc = "拼团失败原因说明：\n1.24小时内没有足够用户参与成团\n2.商品售完或下架\n3.达该商品购买数量上限\n4.购买活动商品不符合活动参与条件\n以上情况均有可能导致拼团失败，系统会自动退款到您的支付账户，如有疑问，请咨询客服。"

xPage({
  ...mixins,
  data: {
    shareInfo: true,
  },
  onLoad: function (query) {
    this.onPageInit(query);
    this.initData(query.type)
  },

  onShow() {

  },

  onUnload() {

  },

  initData: function(type) {
    let imageSrc, ruleImageCls, ruleDesc, ruleDescCls, mode;

    if (!type) type = 0;
    switch (parseInt(type)) {
      case 0: {
        imageSrc = "https://img1.haoshiqi.net/wxapp/img/rule_0c80f22fcc.png";
        ruleImageCls = "rule-img"
        ruleDesc = kRuleDesc;
        ruleDescCls = "rule-text";
        mode = "widthFix"
        break;
      }
      case 1: {
        imageSrc = "https://img1.haoshiqi.net/miniapp/lottery-rule_4d5c889291.jpg";
        ruleImageCls = "lottery-rule-image"
        ruleDesc = kLotteryRuleDesc;
        ruleDescCls = "lottery-rule-desc";
        mode = ""
        break;
      }
    }
    this.setData({
      imageSrc,
      ruleImageCls,
      ruleDesc,
      ruleDescCls,
      mode,
    })
  },
});
