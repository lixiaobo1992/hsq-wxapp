
/*!
   * Copyright 2015 by Qiniu
   * GitHub: http://github.com/qiniu/js-sdk
   * 具体参看文档 [上传资源接口](https://developer.qiniu.com/kodo/api/1273/upload-interface)
   * 备注: 七牛的官方 SDKdemo 太过冗余，以下代码经过处理
   * 整体实现
   * - 获得 token 并缓存
   * - 小于4mb 直接上传
   * - 大于4mb 分块上传，目前没有分片
   */

let token;
let retries = 30;
const noop = () => {};

function uploadQiniu(url, data, opts) {
  const {
    method = 'POST',
    headers = {},
    complete,
  } = opts;
  wx.httpRequest({
    url,
    method,
    headers,
    data,
    success: complete,
  });
}

// 七牛使用的 input:file 文件格式，这里没用
const Qiniu = {
  upload(opts) {
    const {
      file,
      name = file.name,
      // https 网站，上传地址为：https://up.qbox.me
      // 否则使用：http://upload.qiniu.com
      url = 'https://up.qbox.me',
      callback = noop,
    } = opts;
    /* eslint prefer-destructuring: 0 */
    token = opts.token;
    const uploadUrl = url;
    // const maxSize = 20 * 1024 * 1024;
    const chunkSize = 4 * 1024 * 1024; // 4mb
    const blob = file;
    const curChunkSize = [];
    const chunkBlob = [];   // 上传分块
    const ctx = [];
    const chunks = Math.ceil(file.size / chunkSize);

    function handleError(result, finish, chunk, status) {
      // 重试
      if (retries-- > 0 && !finish) {
        if (file.size > chunkSize) {
          // 分块上传
          uploadNextChunk(chunk, curChunkSize[chunk], chunkBlob[chunk]);
        } else {
          // 普通上传
          uploadSingle();
        }
      } else {
        callback(result, status);
      }
    }

    function uploadSingle() {
      const formData = new FormData();
      formData.append('file', file);
      const upUrl = uploadUrl + '?token=' + token;

      uploadQiniu(upUrl, formData, {
        complete(e) {
          const { status } = e;
          const data = JSON.parse(e.responseText);
          if (status === 200) {
            // 返回格式
            // {"hash":"FmdzoMiGtbsN3Cjq8B2PJMUOTWwH","key":"FmdzoMiGtbsN3Cjq8B2PJMUOTWwH"}
            callback(data);
          } else {
            handleError(data, '', '', status);
          }
        },
      });
    }

    function finishChunks() {
      const upUrl = uploadUrl + '/mkfile/' + file.size;
      uploadQiniu(upUrl, ctx.join(','), {
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          Authorization: 'UpToken ' + token,
        },
        complete(e) {
          const { status } = e;
          const data = JSON.parse(e.responseText);
          if (status === 200) {
            callback(data);
          } else {
            // 分片上传已经完成就不能重试了
            handleError(data, 1, '', status);
          }
        },
      });
    }

    function uploadNextChunk(chunk, curchunksize, chunkblob) {
      const upUrl = uploadUrl + '/mkblk/' + curchunksize + '?name=' + name + '&chunk=' + chunk + '&chunks=' + chunks;
      // 返回的数据结构
      //  {"ctx":"lXbcPw-Bs-_7SQ44YJ6-xgH7erfrFyvBFAEjRWeJq83v_ty6mHZUMhDw4dLDW29iamVjdCBPYmplY3RdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAPAAAAAAAAAAAAQAAPAAAAbVhVQUFPUFpJMW44WER3QQ==","checksum":"wdRP8Dr_E3KFbCgYVPRU4uHRW3w=","crc32":2185937872,"offset":15,"host":"http://upload.qiniu.com","expired_at":1496128733}
      uploadQiniu(upUrl, chunkblob, {
        headers: {
          'Content-Type': 'application/octet-stream',
          Authorization: 'UpToken ' + token,
        },
        complete(e) {
          const { status } = e;
          const data = JSON.parse(e.responseText);
          if (status === 200) {
            ctx.push(data.ctx);
            const next = chunk + 1;
            if (next !== chunks) {
              uploadNextChunk(next, curChunkSize[next], chunkBlob[next]);
            } else {
              finishChunks();
            }
          } else {
            handleError(data, '', chunk, status);
          }
        },
      });
    }

    // 创建块，最后完成是生成文件
    function startChunks() {
      let tmp = 0;
      let size;
      while (tmp < blob.size) {
        size = Math.min(chunkSize, blob.size - tmp);
        curChunkSize.push(size);
        chunkBlob.push(blob.slice(tmp, tmp + size));
        tmp += size;
      }
      uploadNextChunk(0, curChunkSize[0], chunkBlob[0]);
    }

    if (file.size > chunkSize) {
      // 分块上传
      startChunks();
    } else {
      // 普通上传
      uploadSingle();
    }
  },
  getToken() {
    return token;
  },
};


module.exports = Qiniu;



/*
ajax上传的时候，需要获得input:file选择的文件（可能为多个文件），获取其文件列表为：
// input标签的files属性
document.querySelector("#fileId").files
// 返回的是一个文件列表数组
获得的文件列表，然后遍历插入到表单数据当中。即：

// 获得上传文件DOM对象
var oFiles = document.querySelector("#fileId");


// 实例化一个表单数据对象
var formData = new FormData();

// 遍历图片文件列表，插入到表单数据中
for (var i = 0, file; file = oFiles[i]; i++) {
  // 文件名称，文件对象
  formData.append(file.name, file);
}


// 实例化一个AJAX对象
var xhr = new XMLHttpRequest();
xhr.onload = function() {
  alert("上传成功！");
}
xhr.open("POST", "upload.php", true);

// 发送表单数据
xhr.send(formData);


上传到服务器之后，获取到文件列表为：

Array
(
  [jpg_jpg] => Array
    (
      [name] => jpg.jpg
      [type] => image/jpeg
      [tmp_name] => D:\xampp\tmp\phpA595.tmp
      [error] => 0
      [size] => 133363
    )

  [png_png] => Array
    (
      [name] => png.png
      [type] => image/png
      [tmp_name] => D:\xampp\tmp\phpA5A6.tmp
      [error] => 0
      [size] => 1214628
    )

)
*/


// var base64Decode = function (data) {
//   var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
//   var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
//   ac = 0,
//   dec = "",
//   tmp_arr = [];
//
//   if (!data) {
//     return data;
//   }
//
//   data += '';
//
//   do { // unpack four hexets into three octets using index points in b64
//     h1 = b64.indexOf(data.charAt(i++));
//     h2 = b64.indexOf(data.charAt(i++));
//     h3 = b64.indexOf(data.charAt(i++));
//     h4 = b64.indexOf(data.charAt(i++));
//
//     bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
//
//     o1 = bits >> 16 & 0xff;
//     o2 = bits >> 8 & 0xff;
//     o3 = bits & 0xff;
//
//     if (h3 === 64) {
//       tmp_arr[ac++] = String.fromCharCode(o1);
//     } else if (h4 === 64) {
//       tmp_arr[ac++] = String.fromCharCode(o1, o2);
//     } else {
//       tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
//     }
//   } while (i < data.length);
//
//   dec = tmp_arr.join('');
//
//   return dec;
// };
// var URLSafeBase64Decode = function(v) {
//   v = v.replace(/_/g, '/').replace(/-/g, '+');
//   return base64Decode(v);
// };
// var getPutPolicy = function (uptoken) {
//   var segments = uptoken.split(":");
//   var ak = segments[0];
//   var putPolicy = JSON.parse(URLSafeBase64Decode(segments[2]));
//   putPolicy.ak = ak;
//   if (putPolicy.scope.indexOf(":") >= 0) {
//     putPolicy.bucket = putPolicy.scope.split(":")[0];
//     putPolicy.key = putPolicy.scope.split(":")[1];
//   } else {
//     putPolicy.bucket = putPolicy.scope;
//   }
//   return putPolicy;
// };
