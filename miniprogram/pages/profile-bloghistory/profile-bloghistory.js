
let page = 1;
let pageSize = 10;
let totalCount = 0;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        blogList:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this._getList();
    },

    /**
      * 页面相关事件处理函数--监听用户下拉动作
      */
     onPullDownRefresh() {
        page = 1;
        this.setData({
            blogList: []
        })
        this._getList();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        page++;
        if ((page - 1) * pageSize <= totalCount) {
            this._getList();
        }
    },

    async _getList() {
        wx.showLoading({
            title: '疯狂加载中',
            mask: true
        })

        let res = await wx.cloud.callFunction({
            name: "blog",
            data: {
                $url: "list",
                page,
                pageSize,
                isMine: true,//查询我自己发布的动态
            }
        })
        totalCount = res.result.totalCount;
        let blogList = res.result.data;
        this.setData({
            blogList: this.data.blogList.concat(blogList)
        }, () => {
            wx.hideLoading();
            wx.stopPullDownRefresh();
        })
    },

    goToComment(event) {
        wx.navigateTo({
            url: `../blog-comment/blog-comment?blogId=${event.target.dataset.blogid}`,
        })
    },
    

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (event) {
        console.log(event)
        let ds = event.target.dataset;
        return {
            title: ds.blog.content,
            path: `/pages/blog-comment/blog-comment?blogId=${ds.blogid}`,
            // imageUrl:''
        }
    }
})