// pages/blog-comment/blog-comment.js
const { filterDate } = require('../../utils/filter');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        blog: {},
        commentList: [],
        blogId: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        this.setData({
            blogId: options.blogId
        })
        this.getBlogCommentDetail();
    },

    async getBlogCommentDetail() {
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        try {
            let res = await wx.cloud.callFunction({
                name: 'blog',
                data: {
                    $url: 'detail',
                    blogId: this.data.blogId,
                }
            })
            let commentList = res.result.commentList.map(item => {
                item.createTime = filterDate(new Date(item.createTime));
                return item
            })
            wx.hideLoading();
            this.setData({
                commentList,
                blog: res.result.detail
            })
        } catch (error) {
            console.log(error)
            wx.hideLoading();
            wx.showToast({
                title: '加载失败',
            })
        }



    },

    /**
    * 用户点击右上角分享
    */
    onShareAppMessage: function (event) {
        return {
            title: this.data.blog.content,
            path: `/pages/blog-comment/blog-comment?blogId=${this.data.blogId}`,
            // imageUrl:''
        }
    }
})