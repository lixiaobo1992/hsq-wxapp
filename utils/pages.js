// var app = require('../app.json'); // 无法加载json 文件
// const app = {
//   "pages": [
//     "demo/test/test",
//     "pages/index/index",
//     "pages/list/list"
//   ],
// };
import { mapTo } from './map';

const { pages = [], tabBar = {} } = __wxConfig;
const tabBarList = tabBar.list || [];
const tabPages = mapTo(tabBarList, (item) => {
  return item.pagePath.replace('.html', '');
});

function pagesMap(pageArr) {
  return pageArr.reduce((obj, item) => {
    const page = item.split('/').reverse()[0] || '';
    /* eslint no-param-reassign: 0 */
    obj[page] = `${item}`;
    return obj;
  }, {});
}

function pagesObj(allPages, tabPages) {
  return {
    allPages: pagesMap(allPages),
    tabPages: pagesMap(tabPages),
    defaultPage: allPages[0].split('/').reverse(),
  }
}

const miniPages = pagesObj(pages, tabPages);

console.log('注册页面：');
console.log(miniPages);

module.exports = miniPages;
