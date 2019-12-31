

function formatNum(timestamp, hasZero) {
  var d,h,m,s;
  s = parseInt((timestamp / 1000) % 60, 10);
  m = parseInt((timestamp/1000/60)%60);
  h = parseInt((timestamp/1000/60/60)%24);
  d = parseInt((timestamp/1000/60/60/24));
  if (hasZero) {
    return {
    day: (d < 10 && d > 0) ? '0' + d : d,
    hour: h < 10 ? '0' + h : h,
    minute: m < 10 ? '0' + m : m,
    second: s < 10 ? '0' + s : s,
    };
  }
  return {
    day: d,
    hour: h,
    minute: m,
    second: s,
  };
}

module.exports = formatNum;

