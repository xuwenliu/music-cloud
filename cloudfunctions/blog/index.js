// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const TcbRouter = require('tcb-router');
const db = cloud.database();
const blogCol = db.collection('blog');
const blogCommentCol = db.collection('blog-comment');
const MAX_LIMIT = 100;

// 云函数入口函数
exports.main = async (event, context) => {
    const app = new TcbRouter({
        event
    });

    app.router('list', async (ctx, next) => {
        const page = event.page || 1;
        const pageSize = event.pageSize || 10;
        const keyword = event.keyword.trim();
        let searchCondition = {} //查询条件
        if (keyword !== '') {
            searchCondition = {
                content: db.RegExp({
                    regexp: keyword,
                    options: 'i'
                })
            }
        }

        let res = await blogCol
            .where(searchCondition)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .orderBy('createTime', 'desc')
            .get();
        let totalCount = await blogCol.count();
        ctx.body = {
            page,
            pageSize,
            totalCount: totalCount.total,
            ...res
        }
    })


    app.router('detail', async (ctx, next) => {
        let blogId = event.blogId;

        //详情查询
        let detail = await blogCol.doc(blogId).get().then(res => res.data);
        //评论查询

        let commentList = [];
        //1.获取总共多少条数据
        const countRes = await blogCol.count();
        const total = countRes.total;

        //2.计算出需要获取几次
        if (total > 0) {
            const batchTimes = Math.ceil(total / MAX_LIMIT);
            //3.定义一个任务列表，循环执行该任务列表
            const tasks = [];
            for (let i = 0; i < batchTimes; i++) {
                let promise = blogCommentCol.skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
                    blogId
                }).orderBy('createTime', 'desc').get();
                tasks.push(promise);
            }
            if (tasks.length > 0) {
                let allRes = (await Promise.all(tasks)).reduce((acc, cur) => {
                    return {
                        data: acc.data.concat(cur.data)
                    }
                })
                commentList = allRes.data;
            }
        }
        ctx.body = {
            detail,
            commentList
        }
        
    })


    return app.serve();
}