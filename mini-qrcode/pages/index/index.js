import drawQrcode from '../../utils/weapp.qrcode.min.js'

Page({
  data: {
    text: 'https://m.baidu.com',
    inputValue: '',
  },
  onLoad () {
    var size = this.setCanvasSize();//动态设置画布大小
    this.createQrCode(this.data.text, "myCanvas", size.w, size.h);
  },
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 500;/*不同屏幕下canvas的适配比例；设计稿是750宽，500为图片宽高*/
      var width = res.windowWidth / scale;
      var height = width;//canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    console.log(size)
    return size;
  },
  changeText (text) {
    if (!this.data.inputValue) {
      wx.showModal({
        title: '提示',
        content: '请先输入要转换的内容！',
        showCancel: false
      })
      return
    }
    this.setData({
      text: this.data.inputValue
    })
    this.createQrCode(text, "myCanvas", this.setCanvasSize().w, this.setCanvasSize().h)
  },
  bindKeyInput (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  createQrCode(text, canvasId, cavW, cavH) {//创建二维码
    drawQrcode({
      width: cavW-20,//10*2=20，二维码留白边
      height: cavH-20,
      x: 10,//相对于画布偏移量
      y: 10,//相对于画布偏移量
      canvasId: 'myCanvas',
      typeNumber: 10,
      text: text,
      image: {
        imageResource: '../../images/icon.png',
        dx: (cavW - 50) / 2,
        dy: (cavH - 50) / 2,
        dWidth: 50,//图片宽度
        dHeight: 50,//图片高度
        borderRadius:5//默认为0
      },
      callback: (e) => {//canvas转图片路径，把当前画布指定区域的内容导出生成指定大小的图片
        wx.canvasToTempFilePath({
          width: cavW,//指定的画布区域的宽度
          height: cavH,//指定的画布区域的高度
          destWidth: cavW, //输出的图片的宽度
          destHeight: cavH,//输出的图片的高度
          canvasId: 'myCanvas',
          success: (res) => {
            let tempFilePath = res.tempFilePath;
            this.setData({
              imagePath: tempFilePath
            });
          },
          fail: function (res) {
            console.log(res);
          }
        });
      }
    })
  },
  saveImageToPhotosAlbum(){
    wx.saveImageToPhotosAlbum({
      filePath: this.data.imagePath,
      success: function (res) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '保存失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  download () {
    // 导出图片 保存到相册
    wx.getSetting({//获取相册授权
      success: (res) => {
        console.log(res)
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => { //同意授权后的回调
              this.saveImageToPhotosAlbum()
            },
            fail() { //拒绝授权后的回调
              wx.showModal({
                title: '提示',
                content: '若不打开授权，则无法将图片保存在相册中！',
                showCancel: true,
                cancelText: '暂不授权',
                cancelColor: '#000000',
                confirmText: '去授权',
                confirmColor: '#3CC51F',
                success: (res) => {
                  if (res.confirm) {
                    wx.openSetting({
                      //调起客户端小程序设置界面
                    })
                  } else {
                    // console.log('用户点击取消')
                  }
                }
              })
            }
          })
        } else { //用户已经授权过了 
          this.saveImageToPhotosAlbum()
        }
      }
    })
    
      
  },
  getBase64Data () {
    // 获取二维码 base64 格式
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      destWidth: 300,
      destHeight: 300,
      canvasId: 'myCanvas',
      success(res) {
        console.log('图片的临时路径为：', res.tempFilePath)
        let tempFilePath = res.tempFilePath
        // 获取 base64
        wx.getFileSystemManager().readFile({
          filePath: tempFilePath,
          encoding: 'base64',
          success: function (res) {
            console.log('[base64 data is]', res)
            wx.showToast({
              title: '获取成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail: function (res) {
            wx.showToast({
              title: '获取失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    })
  }
})