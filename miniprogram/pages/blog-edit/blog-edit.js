
const MAX_WORDS_NUM = 140; //输入文字的最大个数
const MAX_IMAGE_NUM = 9;//最多选择9张图
const db = wx.cloud.database();
const blogCol = db.collection('blog');
let fileIDs = []; //图片id
let content = '';//内容
let userInfo = {};//用户昵称和头像
Page({

    /**
     * 页面的初始数据
     */
    data: {
        wordsNum: 0,
        bounceBottom: 0,//软键盘弹起的高度
        images: [],//选择的图片列表
        isShowAddBtn: true, // 是否显示添加图片
    },
    onLoad (options) {
        userInfo = options;
    },

    onInput (event) {
        let wordsNum = event.detail.value.length;
        if (wordsNum >= MAX_WORDS_NUM) {
            wordsNum = `最大字数为${MAX_WORDS_NUM}`
        }
        this.setData({
            wordsNum,
        })
        content = event.detail.value;
    },
    onFocus (event) {
        // 模拟器获取的高度为0
        this.setData({
            bounceBottom: event.detail.height
        })
    },
    onBlur (event) {
        this.setData({
            bounceBottom: 0
        })
    },
    //选择图片
    onChooseImage () {
        let chooseNum = MAX_IMAGE_NUM - this.data.images.length;
        wx.chooseImage({
            count: chooseNum, // 还可以选几张
            sourceType: ['album', 'camera'],
            success: (res) => {
                console.log(res);
                this.setData({
                    images: this.data.images.concat(res.tempFilePaths),
                })
                // 第一次选完了 还可以选几张
                chooseNum = MAX_IMAGE_NUM - this.data.images.length
                this.setData({
                    isShowAddBtn: chooseNum > 0
                })
            },
        })
    },
    //删除图片
    onDeleteImage (event) {
        let index = event.target.dataset.index;
        this.data.images.splice(index, 1);
        this.setData({
            images: this.data.images
        }, () => {
            this.setData({
                isShowAddBtn: this.data.images.length <= MAX_IMAGE_NUM - 1
            })
        })
    },
    //预览
    onPreviewImage (event) {
        const current = event.target.dataset.current
        wx.previewImage({
            current,
            urls: this.data.images
        })
    },
    //发布
    send () {
        // 1.图片->云存储->fileID
        // 2.数据->云数据库
        // 3.那些数据呢？ 内容,fileID<Array>,昵称,头像,openId,发布时间

        if (content.trim() === '') {
            wx.showModal({
                title: '请输入内容再发布',
                content: '',
            })
            return;
        }
        wx.showLoading({
            title: '发布中',
            mask: true
        })
        //上传图片到云存储
        let promiseTask = [];
        for (let i = 0, len = this.data.images.length; i < len; i++) {
            let p = new Promise((resolve, reject) => {
                let item = this.data.images[i];
                //文件拓展名
                let ext = /\.\w+$/.exec(item)[0];
                wx.cloud.uploadFile({
                    cloudPath: 'blog/' + Date.now() + "_" + Math.random() * 10000000 + ext,
                    filePath: item,
                    success: (res) => {
                        resolve(res);
                        console.log(res);
                        fileIDs = fileIDs.concat(res.fileID);
                    },
                    fail: (err) => {
                        reject(err);
                        console.error(err);
                    }
                })
            })
            promiseTask.push(p)
        }

        //上传到云数据库
        Promise.all(promiseTask).then(_ => {
            blogCol.add({
                data: {
                    ...userInfo,
                    content,
                    images: fileIDs,
                    createTime: db.serverDate()
                }
            }).then((res) => {
                console.log(res)
                wx.hideLoading();
                wx.showToast({
                    title: '发布成功'
                })
                //返回发现页面,并且刷新
                wx.navigateBack();
                const pages = getCurrentPages();
                //取到上一个页面
                const prevPage = pages[pages.length - 2];
                prevPage.onPullDownRefresh();
            }).catch((err) => {
                console.log(err)
                wx.hideLoading();
                wx.showToast({
                    title: '发布失败',
                })
            })
        }).catch((err) => {
            console.log('err', err)
        })

    }
})