// 获取定义的全局数据
const app = getApp()
console.log(app)

// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 屏幕的高度
    wh: 0,
    // 摄像头默认后置摄像
    position: 'front',
    // 这是照片的地址
    src: '',
    // 控制中间提示框的显示
    isShowBox: false,
    // 是否展示照片
    isShowPic: false,
    // 人脸信息
    faceInfo: null,
    // 映射关系
    map: {
      gender: {
        male: '男',
        female: '女'
      },
      expression: {
        none: '不笑',
        smile: '微笑',
        laugh: '大笑'
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          wh: res.windowHeight
        })
      },
    })
  },
  // 点击按钮
  reverseCamera() {
    const newPosition = this.data.position === 'front' ? 'back' : 'front'
    this.setData({
      position: newPosition
    })
  },
  // 拍照
  takePhone () {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log(res)
        this.setData({
          src: res.tempImagePath,
          isShowPic: true
        }, () => {
          this.getFaceInfo()
        })
      },
      fail: (err) => {
        this.setData({
          src: ''
        })
      }
    })
  },
  // 从相册选取照片
  choosePhone () {
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album'],
      success: (res) => {
        if(res.tempFilePaths.length > 0) {
          this.setData({
            src: res.tempFilePaths[0],
            isShowPic: true
          }, () => {
            this.getFaceInfo()
          })
        }
      },
      fail: (err) => {
        console.log('选择照片失败')
        this.setData({
          src: ''
        })
      }

    })
  },
  // 重新选择照片
  reChoose() {
    this.setData({
      isShowPic: false,
      src: '',
      isShowBox:false
    })
  },
  // 测试图片颜值的函数
  getFaceInfo() {
    const token = app.globalData.access_token
    // 判断鉴权失败
    if(!token) {
      return wx.showToast({
        title: '鉴权失败'
      })
    }

    // 添加loading效果
    wx.showLoading({
      title: '颜值检测中...'
    })

    /**如果成功的话
     * 调用文件管理器
     * 
     */
    const fileManger = wx.getFileSystemManager()
   
    const fileStr = fileManger.readFileSync(this.data.src, 'base64')
    // 发起请求
    wx.request({
      method: 'POST',
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=' + token,
      Header: {
        'Content-Type': 'application/json'
      },
      data: {
        image: fileStr,
        image_type: 'BASE64',
        face_field: 'age,beauty,expression,face_shape,gender,glasses,emotion',  // 年龄 颜值分数 表情  脸型  性别 眼睛 情绪  
      },
      success: (res) => {
        console.log(res)
        if(res.data.result.face_num <= 0) {
          return wx.showToast({
            title: '未检测到人脸'
          })
        }
        this.setData({
          faceInfo: res.data.result.face_list[0],
          isShowBox: true
        })
      },
      fail: (err) => {
        wx.showToast({
          title: '颜值检测失败！'
        })
      },
      complete: () => {
        // 关闭loading效果
        wx.hideLoading()
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})