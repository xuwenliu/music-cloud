let userInfo = {};
const db = wx.cloud.database();
const commentCol = db.collection('blog-comment');
const { filterDate } = require('../../utils/filter');

Component({
    options: {
        styleIsolation: 'apply-shared', // 组件样式隔离
    },
    /**
     * 组件的属性列表
     */
    properties: {
        blogId: String,
        blog: Object,
        bounceBottomType: {
            type: Number,
            value: 0, // 默认是0 - 不需要减去80, 1 需要减去80
        }
    },


    /**
     * 组件的初始数据
     */
    data: {
        authModalShow: false, // 授权弹框是否显示
        commentModalShow: false, //评论弹框是否显示
        content: '',
        bounceBottom: 0,//软键盘弹起的高度

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

                //通知父元素评论成功了
                this.triggerEvent('refreshCommentList');

                wx.hideLoading();
                wx.showToast({
                    title: '评论成功',
                })
                this.setData({
                    commentModalShow: false,
                    content: '',
                })

                // 推送模板消息 
                wx.cloud.callFunction({
                    name: 'sendMessage',
                    data: {
                        content,
                        formId,
                        commentNickName: userInfo.nickName,
                        blogId: this.properties.blogId,
                        createTime: filterDate(new Date())
                    }
                }).then((res) => {
                    console.log(res)
                })




            })

        },


        onFocus(event) {
            // 模拟器获取的高度为0
            let bounceBottom = this.properties.bounceBottomType === 0 ? event.detail.height : event.detail.height - 82
            this.setData({
                bounceBottom
            })
        },
        onBlur(event) {
            this.setData({
                bounceBottom: 0
            })
        },
    }
})