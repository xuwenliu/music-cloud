
//音乐推荐列表

let page = 1;
let pageSize = 15;
let totalCount = 0;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        swiper: [{
            url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg',
        },
        {
            url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg',
        },
        {
            url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg',
        }
        ],
        playlist: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad (options) {
        this._getList();
    },


    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        page = 1;
        this.setData({
            playlist: []
        })
        this._getList();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log(page, pageSize, totalCount);
        page++;
        if ((page - 1) * pageSize <= totalCount) {
            this._getList();
        }
    },

    async _getList () {
        wx.showLoading({
            title: '加载中...',
        })
        let res = await wx.cloud.callFunction({
            name: "music",
            data: {
                $url: "playlist",
                page,
                pageSize
            }
        })
        totalCount = res.result.totalCount;
        let playlist = res.result.data;
        this.setData({
            playlist: this.data.playlist.concat(playlist)
        }, () => {
            wx.hideLoading();
            wx.stopPullDownRefresh();
        })
    }
})