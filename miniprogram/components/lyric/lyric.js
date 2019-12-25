
let lyricHeight = 0; //当前歌词滚动的高度 px

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isLyricShow: {
            type: Boolean,
            value: false
        },
        lyric: String
    },
    observers: {
        lyric (lrc) {
            if (lrc === '暂无歌词') {
                this.setData({
                    lrcList: [
                        {
                            time: 0,
                            lrc
                        }
                    ],
                    nowLyricIndex: -1
                })
            } else {
                this._parseLyric(lrc);
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        lrcList: [],//每一行歌词和时间列表
        nowLyricIndex: 0,//当前选中的歌词索引
        scrollTop: 0, //歌词滚动的高度
    },
    lifetimes: {
        ready () {
            wx.getSystemInfo({
                success (res) {
                    //求出1rpx对应的px  64是每一行歌词对应的rpx高度，在css里面定义的
                    lyricHeight = res.screenWidth / 750 * 64
                }
            })
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        update (currentTime) {
            let lrcList = this.data.lrcList;
            if (lrcList.length === 0) {
                return
            }

            //播放时间大于歌词最后一行的时间，需要直接滚动到最后一行歌词
            if (currentTime > lrcList[lrcList.length - 1].time) {
                if (this.data.nowLyricIndex != -1) {
                    this.setData({
                        nowLyricIndex: -1,
                        scrollTop: lrcList.length * lyricHeight
                    })
                }
            }


            for (let i = 0, len = lrcList.length; i < len; i++) {
                //如果当前播放时间小于等于当前行歌词对应的时间则高亮
                if (currentTime <= lrcList[i].time) {
                    this.setData({
                        nowLyricIndex: i - 1,
                        scrollTop: (i - 1) * lyricHeight
                    })
                    break;
                }
            }
        },
        //解析歌词
        _parseLyric (sLyirc) {
            let line = sLyirc.split('\n');
            let _lrcList = [];
            line.forEach(ele => {
                let time = ele.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g);
                if (time != null) {
                    console.log(time)
                    let lrc = ele.split(time)[1];
                    let timeArr = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/);
                    console.log(timeArr) // ["04:23.230","04","23","230"]
                    //把时间转换为秒
                    let time2Seconds = parseInt(timeArr[1]) * 60 + parseInt(timeArr[2]) + parseInt(timeArr[3]) / 1000
                    _lrcList.push({
                        lrc,
                        time: time2Seconds
                    })
                }
            });
            this.setData({
                lrcList: _lrcList
            })
        }
    }
})
