// 发布

Page({

    /**
     * 页面的初始数据
     */
    data: {
        modalShow: false,//控制底部弹出层是否显示
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

})