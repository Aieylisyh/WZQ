// let StringUtil = require("StringUtil");
let Encoder = require("Encoder");
let DataUtil = require("DataUtil");
let Item = require("Item");
let DialogTypes = require("DialogTypes");

let TtShare = {

    //根据类型获取query
    getQuery: function (param) {
        let query = "";
        if (param) {
            if (param.items) {
                query = "items=" + Encoder.makeGiftCode(param.items);
            }
        }

        return this.refineQuery(query);
    },

    refineQuery: function (query) {
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

    getShareInfo: function (param) {
        debug.log("getShareInfo");

        //https://developer.toutiao.com/app/setting/share/ttf14d87f06e671d2f
        //8ee2j69haaaijm7gid
        //ch4n5gsi0njkflegg5
        let shareObj = {
            templateId: '8ee2j69haaaijm7gid', // 替换成通过审核的分享ID
            title: '极速五子棋对战，进来看就能玩',
            imageUrl: "customRes/shareImg.png",
            success() {
                console.log('分享成功');
                if (param && param.cb && param.cb.sucCb) {
                    param.cb.sucCb.call(param.cb.caller);
                }
            },
            fail(e) {
                console.log('分享失败');
                console.log(e);
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

    onShow: function () { },

    listenOnShare: function () {
        //这个方法会在初始化游戏时执行，除非在回调函数里，否则请不要使用运行时定义的全局变量如debug
        tt.onShareAppMessage(function (res) {
            console.log('tt分享');
            //这里的成功失败是选择分享方式后确定的，不能保证一定分享出去
            //8ee2j69haaaijm7gid
            //ch4n5gsi0njkflegg5
            return {
                title: '官方正版五子棋作战，休闲免费1秒上手',
                templateId: '8ee2j69haaaijm7gid',
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

    share: function (param) {
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

    setShareVideoCB(cb) {
        // console.log('setShareVideoCB');
        // console.log(cb);
        this.shareVideoCB = cb;
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
        let deltaSecond = WechatAPI.ttRecorder.getDuration();
        if (deltaSecond == null || deltaSecond <= 3) {
            recordTimeEnough = false;
        }

        if (!recordTimeEnough) {
            appContext.getDialogManager().showDialog("Toast", "请至少录制3秒视频")
            return;

        }
        //8ee2j69haaaijm7gid
        //ch4n5gsi0njkflegg5
        let self = this;

        tt.shareAppMessage({
            channel: 'video',
            imageUrl: '',
            templateId: '8ee2j69haaaijm7gid',
            query: '',
            extra: {
                videoPath: path,
                videoTopics: ['五子棋', '棋牌']
            },
            success() {
                console.log('分享视频成功');

                console.log(self.shareVideoCB);
                if (self.shareVideoCB && self.shareVideoCB.length > 0) {

                    let reward = self.shareVideoCB;
                    self.shareVideoCB = null;
                    console.log(reward);
                    appContext.getUxManager().rewardItems(reward);
                    let text = Item.getTextByItem(reward);
                    appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, "分享成功\n获得: " + text);

                    appContext.getUxManager().saveGameInfo();
                }
            },
            fail(e) {
                console.log(e);
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "分享视频失败");
                //如果少于三秒这里会报错！但是不一定是因为少于三秒
                //appContext.getDialogManager().showDialog("Toast", "请录制3秒以上的视频")
            }
        })
    },
};

module.exports = TtShare;