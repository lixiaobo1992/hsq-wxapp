// function format(date, options = {type: 'date', format: 'Y年M月D日'}) {
//   if (options.type === 'countdown' && !options.format) {
//     options.format = 'H时F分S秒';
//   }

// }


// http://jsben.ch/ZAaku
function formatNum(n) {
  if (n < 10) return '0' + n;
  return n;
}
/**
 * formatCountDown(times, 'D天H:F:S')
 *
 * @param {any} times
 * @param {string} [format='H:F:S']
 * @returns
 */
function formatCountDown(times, format = 'H:F:S') {
  let time = parseInt(times * 0.001, 10);

  const seconds = time % 60;
  time = parseInt(time / 60, 10);
  const minutes = time % 60;
  time = parseInt(time / 60, 10);
  const hours = parseInt(time % 24, 10);
  const days = parseInt(time / 24, 10);

  return format.replace(/Y|y|M|m|D|d|H|h|F|f|S|s/g, function (a) {
    switch (a) {
      case "d": return days;
      case "D": return formatNum(days);
      case "h": return hours;
      case "H": return formatNum(hours);
      case "f": return minutes;
      case "F": return formatNum(minutes);
      case "s": return seconds;
      case "S": return formatNum(seconds);
    }
  });
}
function formatDate(date, format = 'Y年M月D日') {
  if (typeof date === 'number') {
    date = new Date(date * 1000);
  }
  return format.replace(/Y|y|M|m|D|d|H|h|F|f|S|s/g, function (a) {
    switch (a) {
      case "y": return (date.getFullYear() + "").slice(2);
      case "Y": return date.getFullYear();
      case "m": return date.getMonth() + 1;
      case "M": return formatNum(date.getMonth() + 1);
      case "d": return date.getDate();
      case "D": return formatNum(date.getDate());
      case "h": return date.getHours();
      case "H": return formatNum(date.getHours());
      case "f": return date.getMinutes();
      case "F": return formatNum(date.getMinutes());
      case "s": return date.getSeconds();
      case "S": return formatNum(date.getSeconds());
    }
  });
}

// 传入毫秒，计算出剩余时间的时分秒
function formatLeftTimeObj(time, hasZero = true) {
  if (typeof time !== 'number') {
    time = parseInt(time)
  }
  time = parseInt(time / 1000)
  const d = parseInt(time / 86400)
  time = time - d * 86400
  const h = parseInt(time / 3600)
  time = time - h * 3600
  const f = parseInt(time / 60)
  const s = time - f * 60
  return {
    d: hasZero ? formatNum(d) : d,
    h: hasZero ? formatNum(h) : h,
    f: hasZero ? formatNum(f) : f,
    s: hasZero ? formatNum(s) : s,
  }
}


const mini = {
  formatDate,
  formatCountDown,
  formatNum,
  formatLeftTimeObj,
}

module.exports = mini;

