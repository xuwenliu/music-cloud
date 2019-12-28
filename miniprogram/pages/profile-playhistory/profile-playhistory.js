const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        playHistoryList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this._getPlayHistory();
    },
    _getPlayHistory() {
       
        const openId = app.globalData.openId;
        const playHistoryList = wx.getStorageSync(openId);

        // storage里面存储的musiclist替换成播放历史的歌单
        wx.setStorage({
            key: 'musiclist',
            data: playHistoryList,
        })
        this.setData({
            playHistoryList
        })
    }

})