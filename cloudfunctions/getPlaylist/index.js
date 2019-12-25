// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const playListCol = db.collection('playlist');
const rp = require('request-promise');
const BASE_URL = "http://musicapi.xiecheng.live";
const MAX_LIMIT = 100;
const api = {
    personalized: BASE_URL + '/personalized', //获取推荐歌单
}

// 云函数入口函数
exports.main = async(event, context) => {

    //数据库已经有的数据 由于只能获取到100条，需要多次获取
    // let oldList = await playListCol.get();

    //1.获取总共多少条数据
    const countRes = await playListCol.count();
    const total = countRes.total;

    //2.计算出需要获取几次
    const batchTimes = Math.ceil(total / MAX_LIMIT);

    //3.定义一个任务列表，循环执行该任务列表
    const tasks = [];
    for (let i = 0; i < batchTimes; i++) {
        let promise = playListCol.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get();
        tasks.push(promise);
    }

    let oldList = [];
    if (tasks.length > 0) {
        allRes = (await Promise.all(tasks)).reduce((acc, cur) => {
            return {
                data: acc.data.concat(cur.data)
            }
        })
        oldList = allRes.data;
    }




    // 接口返回的数据
    let playList = await rp(api.personalized).then(res => JSON.parse(res).result)

    //去重
    let newList = [];
    for (let i = 0; i < playList.length; i++) {
        let flag = true;
        for (let j = 0; j < oldList.length; j++) {
            if (playList[i].id === oldList[j].id) {
                flag = false;
            }
        }
        if (flag) {
            newList.push(playList[i])
        }
    }

    //批量插入数据库
    for (let i = 0; i < newList.length; i++) {
        await playListCol.add({
            data: {
                ...newList[i],
                createTime: db.serverDate()
            }
        }).then(res => {
            console.log('插入成功');
        })
    }
}