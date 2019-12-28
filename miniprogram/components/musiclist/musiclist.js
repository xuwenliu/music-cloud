const app = getApp();

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        musiclist: Array
    },

    /**
     * 组件的初始数据
     */
    data: {
        playingId: -1,
    },

    // 组件所在页面的生命周期
    pageLifetimes: {
        show () {
            this.setData({
                playingId: parseInt(app.getPlayingMusicId())
            })
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        select (event) {
            const ds = event.currentTarget.dataset;
            this.setData({
                playingId: ds.musicid
            }, () => {
                wx.navigateTo({
                    url: `../../pages/music-player/music-player?musicId=${ds.musicid}&index=${ds.index}`,
                })
            })
        }
    }
})
