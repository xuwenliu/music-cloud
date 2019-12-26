// 发布
let page = 1;
let pageSize = 10;
let totalCount = 0;

Page({

    data: {
        modalShow: false,//控制底部弹出层是否显示
        blogList: [],
    },
    onLoad () {
        this._getList();
    },

    //发布
    onPublish () {
        //1.判断用户是否授权
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: (infoRes) => {
                            this.authSuccess({
                                detail: infoRes.userInfo
                            })
                        }
                    })
                } else {
                    this.setData({
                        modalShow: true
                    })
                }
            }
        })

    },
    authSuccess (event) {
        const userInfo = event.detail;
        wx.navigateTo({
            url: `../blog-edit/blog-edit?nickName=${userInfo.nickName}&avatarUrl=${userInfo.avatarUrl}`
        })
    },
    authFail () {
        wx.showModal({
            title: '授权的用户才能发布',
            content: ''
        })
    },
    /**
      * 页面相关事件处理函数--监听用户下拉动作
      */
    onPullDownRefresh () {
        page = 1;
        this.setData({
            blogList: []
        })
        this._getList();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom () {
        page++;
        if ((page - 1) * pageSize <= totalCount) {
            this._getList();
        }
    },

    async _getList () {
        wx.showLoading({
            title: '疯狂加载中',
        })
        let res = await wx.cloud.callFunction({
            name: "blog",
            data: {
                $url: "list",
                page,
                pageSize
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

    goToComment (event) {
        wx.navigateTo({
            url: `../blog-comment/blog-comment?blogId=${event.target.dataset.blogid}`,
        })
    }

})