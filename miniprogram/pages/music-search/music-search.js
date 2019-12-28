
const colors = ['#00bcd4', '#f2826a', '#7232dd', '#ff1744', '#1de9b6', '#d43c43', '#039be5', '#d500f9', '#795548', '#b388ff'];

const db = wx.cloud.database();
const searchHistoryCol = db.collection('music-search-history');


Page({

    /**
     * 页面的初始数据
     */
    data: {
        keywords: '',
        hotList: [], // 热门搜索列表
        musiclist: [], //搜索结果类别
        isShowMusiclist: false, // 是否显示搜索列表结果
        searchHistoryList: [],//曾经搜索过的
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this._getHot();
        this._getSearchHistory();
    },

    async _getHot() {
        let res = await wx.cloud.callFunction({
            name: 'music',
            data: {
                $url: 'hot'
            }
        })
        let hots = res.result.result.hots;
        hots.map(item => {
            item.color = colors[Math.floor(Math.random() * 11)];
            return item;
        })
        this.setData({
            hotList: hots
        })
        console.log(res);
    },

    async _getSearchHistory() {
        let res = await searchHistoryCol.orderBy('searchTime', 'desc').get();
        this.setData({
            searchHistoryList: res.data
        })
    },


    // 点击搜索
    onTapSearch(event) {
        this.setData({
            keywords: event.target.dataset.keyword,
        })
        this.getSearchList();
    },

    // 输入搜索
    onInputSearch(event) {
        this.setData({
            keywords: event.detail.keyword
        })
        this.getSearchList();

    },
    onInputClear() {
        this.setData({
            musiclist: [],
            isShowMusiclist: false
        })
        wx.setStorageSync('musiclist', []);

    },
    onInputChange(event) {
        console.log(event)
        let keywords = event.detail.keyword;
        if (!keywords) {
            this.onInputClear();
        }
    },

    //删除搜索记录
    async delSearchHistory(event) {
        const keywords = event.target.dataset.keyword;
        wx.showLoading({
            title: '删除中',
            mask: true
        })
        let res = await searchHistoryCol.where({
            keywords
        }).remove();

        if (res) {
            wx.showToast({
                title: '删除成功',
            })
            wx.hideLoading();
            this._getSearchHistory();
        }
    },

    async getSearchList() {
        if (!this.data.keywords) {
            return;
        }
        wx.showLoading({
            title: '疯狂搜索中',
        })
        let res = await wx.cloud.callFunction({
            name: 'music',
            data: {
                $url: "search",
                keywords: this.data.keywords
            }
        })
        wx.hideLoading();
        if (res.result) {
            let musiclist = res.result.result.songs;
            musiclist.map(item => {
                item.alia = item.alias;
                item.ar = item.artists;
                item.al = item.album;
                return item;
            })
            this.setData({
                musiclist,
                isShowMusiclist: true
            })
            this._setMusicList();
            console.log(res)
        }
    },

    _setMusicList() {
        wx.setStorageSync('musiclist', this.data.musiclist);
    },
})