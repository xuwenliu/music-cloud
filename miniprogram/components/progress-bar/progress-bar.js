let movableAreaWidth = 0;
let movableViewWidth = 0;
const backgroundAudioManager = wx.getBackgroundAudioManager();
let currentSec = -1; //当前的秒数
let duration = 0; //当前歌曲总时长 以秒为单位
let isMoving = false; //表示当前的进度条是否在拖拽，解决：当进度条拖动的时候和onTimeUpdate事件冲突的问题

// 问题1：当拖拽进度条的时候，会触发onChange事件和onTouchEnd事件
// 但是当来回滑动会在onTouchEnd事件执行后再次执行onChange事件，这样我们的isMoving就不起作用了
// 解决方案：TODO① 每次执行完






Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isSame: Boolean
    },

    /**
     * 组件的初始数据
     */
    data: {
        showTime: {
            currentTime: '00:00',
            totalTime: '00:00',
        },
        movableDis: 0,
        progress: 0,
    },

    lifetimes: {
        ready () {
            if (this.properties.isSame && this.data.showTime.totalTime == "00:00") {
                this._setTime();
            }
            this._getMovableDis();
            this._bindBgmEvent();
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        //手动控制播放-拖动进度条
        onChange (event) {
            //表示在拖动
            if (event.detail.source === 'touch') {
                //只做保存，不更新页面，优化性能，在onTouchEnd里面在设置进度
                this.data.movableDis = event.detail.x;
                this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100;
                isMoving = true;
                console.log('change')
            }
        },

        //手动控制播放结束-拖动结束
        onTouchEnd () {
            const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime));
            this.setData({
                progress: this.data.progress,
                movableDis: this.data.movableDis,
                ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            backgroundAudioManager.seek(duration * this.data.progress / 100);
            isMoving = false;
            console.log('end')
        },

        //获取movable-area和movable-view宽度，因为手机不一样
        _getMovableDis () {
            const query = this.createSelectorQuery();
            query.select('.movable-area').boundingClientRect();
            query.select('.movable-view').boundingClientRect();
            query.exec((rect) => {
                console.log(rect)
                movableAreaWidth = rect[0].width;
                movableViewWidth = rect[1].width;
            })
        },
        //绑定backgroundAudioManager的监听事件
        _bindBgmEvent () {

            backgroundAudioManager.onPlay(() => {
                // TODO①
                isMoving = false;
                console.log('onPlay');
                this.triggerEvent('musicPlay');
            })


            backgroundAudioManager.onPause(() => {
                console.log('onPause');
                this.triggerEvent('musicPause');
            })


            //可以播放了
            backgroundAudioManager.onCanplay(() => {
                if (typeof backgroundAudioManager.duration !== 'undefined') {
                    this._setTime();
                } else {
                    setTimeout(() => {
                        this._setTime();
                    }, 1000)
                }
            })

            //自动控制播放-播放进度 设置进度条的进度（movableDis，progress）
            backgroundAudioManager.onTimeUpdate(() => {
                if (!isMoving) { // 如果没有拖拽就设置
                    const currentTime = backgroundAudioManager.currentTime;
                    const duration = backgroundAudioManager.duration;
                    const secInt = currentTime.toString().split('.')[0];
                    if (currentSec != secInt) {
                        const currentTimeFmt = this._dateFormat(currentTime);
                        this.setData({
                            movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
                            progress: currentTime / duration * 100,
                            ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
                        })
                        currentSec = secInt;
                        //联动歌词
                        this.triggerEvent('timeUpdate', {
                            currentTime
                        });
                    }
                }

            })

            //播放结束
            backgroundAudioManager.onEnded(() => {
                this.triggerEvent('musicEnd');
            })



            //播放出错
            backgroundAudioManager.onError((err) => {
                wx.showToast({
                    title: '错误:' + err.errCode,
                })
            })
        },

        //设置右边总时长 03:37
        _setTime () {
            duration = backgroundAudioManager.duration;
            const durationFmt = this._dateFormat(duration);
            this.setData({
                ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
            })
        },

        // 格式化时间
        _dateFormat (sec) {
            //分钟
            let min = Math.floor(sec / 60);
            sec = Math.floor(sec % 60);
            return {
                min: this._parse0(min),
                sec: this._parse0(sec)
            }
        },

        //补0
        _parse0 (sec) {
            return sec < 10 ? '0' + sec : sec;
        },


    }
})