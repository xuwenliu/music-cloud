
const { filterDate } = require('../../utils/filter');
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        blog: Object
    },
    observers: {
        ['blog.createTime'] (val) {
            if (val) {
                this.setData({
                    _createTime: filterDate(new Date(val))
                })
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        _createTime: '',
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onPreviewImage (event) {
            const current = event.target.dataset.current;
            const images = event.target.dataset.images;
            wx.previewImage({
                current,
                urls: images
            })
        },
    }
})
