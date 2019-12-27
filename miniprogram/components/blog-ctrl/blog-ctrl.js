let userInfo = {};
const db = wx.cloud.database();
const commentCol = db.collection('blog-comment');

Component({
    options: {
        styleIsolation: 'apply-shared', // 组件样式隔离
    },
    /**
     * 组件的属性列表
     */
    properties: {
        blogId: String
    },


    /**
     * 组件的初始数据
     */
    data: {
        authModalShow: false, // 授权弹框是否显示
        commentModalShow: false, //评论弹框是否显示
        content: ''
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onComment() {
            //1.判断用户是否授权
            wx.getSetting({
                success: (res) => {
                    if (res.authSetting['scope.userInfo']) {
                        wx.getUserInfo({
                            success: (infoRes) => {
                                userInfo = infoRes.userInfo;
                                //显示评论弹出层
                                this.setData({
                                    commentModalShow: true,
                                    content: ''
                                })
                            }
                        })
                    } else {
                        this.setData({
                            authModalShow: true
                        })
                    }
                }
            })
        },
        authSuccess(event) {
            userInfo = event.detail;
            //授权框消失，评论框显示
            this.setData({
                authModalShow: false,

            }, () => {
                this.setData({
                    commentModalShow: true,
                    content: ''
                })
            })
        },
        authFail() {
            wx.showModal({
                title: '授权的用户才能评论',
            })
        },
        //发布评论
        onSend(event) {
            let content = event.detail.value.content;
            let formId = event.detail.formId;
            console.log(event)
            // 数据插入到云数据库
            if (content.trim() === '') {
                wx.showModal({
                    title: "评论内容不能为空"
                })
                return;
            }
            wx.showLoading({
                title: "提交评论中",
                mask: true
            })
            commentCol.add({
                data: {
                    content,
                    blogId: this.properties.blogId,
                    nickName: userInfo.nickName,
                    avatarUrl: userInfo.avatarUrl,
                    createTime: db.serverDate()

                }
            }).then(res => {

                // 推送模板消息 
                wx.cloud.callFunction({
                    name: 'sendMessage',
                    data: {
                        content,
                        formId,
                        commentNickName: userInfo.nickName,
                        blogId: this.properties.blogId,
                        createTime:db.serverDate()
                    }
                }).then((res) => {
                    console.log(res)
                })

                wx.hideLoading();
                wx.showToast({
                    title: '评论成功',
                })
                this.setData({
                    commentModalShow: false,
                    content: '',
                })
            })

        }
    }
})