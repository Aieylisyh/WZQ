// let StringUtil = require("StringUtil");
let Encoder = require("Encoder");
let DataUtil = require("DataUtil");

let TtShare = {

    //根据类型获取query
    getQuery: function(param) {
        let query = "";
        if (param) {
            if (param.items) {
                query = "items=" + Encoder.makeGiftCode(param.items);
            }
        }

        return this.refineQuery(query);
    },

    refineQuery: function(query) {
        let res = {};

        let cardCode = null;
        if (query != "") {
            cardCode = DataUtil.getRandomPasswordByLength(5);
            query += "&cardCode=" + cardCode;
        }

        res.query = query;
        if (cardCode != null) {
            res.cardCode = cardCode;
        }

        return res;
    },

    getShareInfo: function(param) {
        debug.log("getShareInfo");

        //https://developer.toutiao.com/app/setting/share/ttf14d87f06e671d2f
        //9md3idq61ek5a673kk
        //2mib4c3o24ab5b2507
        let shareObj = {
            templateId: '2mib4c3o24ab5b2507', // 替换成通过审核的分享ID
            title: '分分钟上手，89%的人难以精通的潜艇作战',
            imageUrl: "customRes/shareImg.png",
            success() {
                console.log('分享成功');
                if (param && param.cb && param.cb.sucCb) {
                    param.cb.sucCb.call(param.cb.caller);
                }
            },
            fail(e) {
                console.log('分享失败');
                if (param && param.cb && param.cb.failCb) {
                    param.cb.failCb.call(param.cb.caller);
                }
            }
        };
        let queryObj = this.getQuery(param);
        shareObj.query = queryObj.query;

        if (param != null) {
            this.cb = param.cb;
        }

        if (queryObj.cardCode != null) {
            shareObj.cardCode = queryObj.cardCode;
        }
        debug.log("分享内容！");
        debug.log(shareObj);
        return shareObj;
    },

    onShow: function() {},

    listenOnShare: function() {
        //这个方法会在初始化游戏时执行，除非在回调函数里，否则请不要使用运行时定义的全局变量如debug
        tt.onShareAppMessage(function(res) {
            console.log('tt分享');
            //这里的成功失败是选择分享方式后确定的，不能保证一定分享出去
            return {
                title: '分分钟上手，89%的人难以精通的潜艇作战',
                templateId: '9md3idq61ek5a673kk',
                imageUrl: "customRes/shareImg2.png",
                success() {
                    console.log('tt成功')
                },
                fail(e) {
                    console.log('tt失败', e)
                }

            }
        });
    },

    share: function(param) {
        let shareObj = this.getShareInfo(param);

        if (shareObj.cardCode != null) {
            appContext.getUxManager().recordCardCode(shareObj.cardCode);
            delete shareObj.cardCode;
        }

        // if (this.cb != null) {
        //     this.cb.time = Date.now();
        //     //debug.log(this.cb.time);
        // }
        tt.shareAppMessage(shareObj);
    },

    shareVideo(path) {
        // tt.shareAppMessage({
        //     channel: 'video',
        //     title: '测试分享视频',
        //     desc: "测试描述",
        //     imageUrl: '',
        //     templateId: '', // 替换成通过审核的分享ID
        //     query: '',
        //     extra: {
        //         videoPath: 'ttfile://temp/test.mp4', // 可替换成录屏得到的视频地址
        //         videoTopics: ['话题1', '话题2']
        //     },
        //     success() {
        //         console.log('分享视频成功');
        //     },
        //     fail(e) {
        //         console.log('分享视频失败');
        //     }
        // })

        debug.log("分享视频");
        debug.log(path);
        let recordTimeEnough = true;
        let delta = Date.now() - WechatAPI.cache.gameRecordStartTime;
        if (delta == null || delta <= 3000) {
            recordTimeEnough = false;
        }
        
        if (!recordTimeEnough) {
            appContext.getDialogManager().showDialog("Toast", "请至少录制3秒视频")
            return;

        }
        tt.shareAppMessage({
            channel: 'video',
            imageUrl: '',
            templateId: '2mib4c3o24ab5b2507',
            query: '',
            extra: {
                videoPath: path,
                videoTopics: ['潜艇', '战争']
            },
            success() {
                console.log('分享视频成功');
            },
            fail(e) {
                console.log('分享视频失败');
                //如果少于三秒这里会报错！但是不一定是因为少于三秒
                //appContext.getDialogManager().showDialog("Toast", "请录制3秒以上的视频")
            }
        })
    },
};

module.exports = TtShare;