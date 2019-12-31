
function getLimitInfo(type) {
  return {
    warning: {
      title: `获取${type}无权限`,
      content: `是否现在开启？`,
    },
    tips: {
      title: `开启${type}权限`,
      content: `您需要点击右上角“关于好食期” -> 右上角“设置” -> 授权允许使用“${type}”。`,
    },
  };
}


module.exports = {
  limitGeo: getLimitInfo('地理位置'),
  limitUserInfo: getLimitInfo('用户信息'),
};
