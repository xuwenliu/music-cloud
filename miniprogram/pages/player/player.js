//歌曲播放页面

let musicList = [];
let nowPlayingIndex = 0; // 当前正在播放的index
//获取全局唯一的音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager();
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        picUrl: '',
        isPlaying: false, //true表示正在播放，false表示不播放
        isLyricShow: false,//当前歌词是否显示
        lyric: '',//歌词
        isSame: false,//表示从歌曲列表点击过来播放的音乐是否为同一首，
        // 场景：播放界面音乐播放到一半，回到上一页，再次点击刚刚播放到一半的歌曲，这时应该接着播放，而不是从头开始播放isSame用来解决这个问题的
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        musicList = wx.getStorageSync('musiclist');
        nowPlayingIndex = options.index * 1;
        this._loadMusicDetail(options.musicId);
    },

    async _loadMusicDetail (musicId) {
        if (musicId === app.getPlayingMusicId()) {
            this.setData({
                isSame: true
            })
        } else {
            this.setData({
                isSame: false
            })
        }
        // 不是同一首歌曲才停止重新播放，是就不停止
        if (!this.data.isSame) {
            backgroundAudioManager.stop();
        }
        let music = musicList[nowPlayingIndex];
        wx.setNavigationBarTitle({
            title: music.name,
        })
        this.setData({
            picUrl: music.al.picUrl,
            isPlaying: false,
        })
        app.setPlayingMusicId(musicId); //上一首，下一首的时候设置当前播放的musicId以提供歌单列表高亮显示
        wx.showLoading({
            title: '加载中...',
        })
        let res = await wx.cloud.callFunction({
            name: 'music',
            data: {
                $url: 'musicUrl',
                musicId
            }
        })

        if (res.result.data[0].url === null) {
            wx.showToast({
                title: '无权限播放'
            });
            return;
        }

        if (!this.data.isSame) {
            backgroundAudioManager.src = res.result.data[0].url;
            // backgroundAudioManager.src = 'https://m801.music.126.net/20191224153501/fac39703008bdcf76d41b69979487df3/jdyyaac/5253/5652/0e5b/e905af65fba829e51a97910fe28320f7.m4a'
            backgroundAudioManager.title = music.name;
            backgroundAudioManager.coverImgUrl = music.al.picUrl;
            backgroundAudioManager.singer = music.ar[0].name;
            backgroundAudioManager.epname = music.al.name;
        }

        this.setData({
            isPlaying: true
        }, () => {
            wx.hideLoading();
        })

        //加载歌词
        let lyricRes = await wx.cloud.callFunction({
            name: 'music',
            data: {
                $url: "lyric",
                musicId,
            }
        })
        let lyric = '暂无歌词';
        const lrc = lyricRes.result.lrc;
        if (lrc) {
            lyric = lrc.lyric;
        }
        this.setData({
            lyric
        })
        console.log(lyricRes);
    },

    togglePlay () {
        if (this.data.isPlaying) {
            backgroundAudioManager.pause();
        } else {
            backgroundAudioManager.play();
        }
        this.setData({
            isPlaying: !this.data.isPlaying
        })
    },
    onPrev () {
        nowPlayingIndex--;
        if (nowPlayingIndex < 0) {
            nowPlayingIndex = musicList.length - 1;
        }
        this._loadMusicDetail(musicList[nowPlayingIndex].id);
    },
    onNext () {
        nowPlayingIndex++;
        if (nowPlayingIndex === musicList.length) {
            nowPlayingIndex = 0;
        }
        this._loadMusicDetail(musicList[nowPlayingIndex].id);
    },

    //切换歌词显示
    onChangeLyricShow () {
        this.setData({
            isLyricShow: !this.data.isLyricShow
        })
    },

    //把进度条组件里面的当前播放时间传递到歌词组件
    timeUpdate (event) {
        // 通过.lyric class选取歌词组件，在歌词组件中定义一个叫update的方法，接受时间
        this.selectComponent('.lyric').update(event.detail.currentTime);
    },


    // 通过系统的播放和暂停控制我们自己的播放按钮以及动画
    musicPlay () {
        this.setData({
            isPlaying: true
        })
    },
    musicPause () {
        this.setData({
            isPlaying: false
        })
    },


})