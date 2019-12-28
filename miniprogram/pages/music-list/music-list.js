//歌曲列表



Page({

    /**
     * 页面的初始数据
     */
    data: {
        musiclist: [],
        listInfo: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        let res = await wx.cloud.callFunction({
            name: 'music',
            data: {
                $url: 'musiclist',
                playlistId: options.playlistId
            }
        })
        console.log(res);
        const pl = res.result.playlist;
        this.setData({
            musiclist: pl.tracks,
            listInfo: {
                coverImgUrl: pl.coverImgUrl,
                name: pl.name
            }
        }, () => {

            this._setMusicList();
            wx.hideLoading();
        })
    },

    _setMusicList () {
        wx.setStorageSync('musiclist', this.data.musiclist);
    },
})