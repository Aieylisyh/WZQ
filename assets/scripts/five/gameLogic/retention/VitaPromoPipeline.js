let DataUtil = require("DataUtil");
let DialogTypes = require('DialogTypes');

let VitaPromoPipeline = {

    flowIn: function() {
        if (appContext.getUxManager().vitaSystem.vita >= appContext.getUxManager().vitaSystem.vitaMax) {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "体力已满");
            return;
        }

        let vitaConsumeCount = appContext.getUxManager().getItemCount("VitaConsume");
        if (vitaConsumeCount > 0) {
            let info = {
                content: "T_T 体力不够啦！\n您当前拥有体力特饮【" + vitaConsumeCount + "】罐！\n是否用来恢复体力？",
                btn1: {
                    name: "喝一罐",
                    clickFunction: function() {
                        if (!appContext.getUxManager().vitaSystem.isFull()) {
                            appContext.getUxManager().vitaSystem.gain(10);
                            appContext.getUxManager().startTransaction("VitaConsume", 1, true);
                            appContext.getUxManager().saveGameInfo();
                            appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, {
                                content: "已恢复10点体力",
                            });
                        } else {
                            appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, {
                                content: "体力已满，无需使用",
                            });
                        }
                    },
                    clickFunctionCaller: this,
                },
                btn2: {
                    name: "不 喝",
                    clickFunction: function() {
                        this.notifyBuy();
                    },
                    clickFunctionCaller: this,
                },
            };

            appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
            return;
        }

        this.notifyBuy();
    },

    notifyBuy() {
        let price = this.getPrice();
        let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();

        if (!WechatAPI.enableShare && !canWatchAd) {
            //如果既不能分享 也不能看广告，就直接购买吧！
            this.onlyBuy(price);
            return;
        }

        let rest = appContext.getUxManager().canShare_vita_restTime();

        if (rest > 0) {
            if (canWatchAd) {
                let self = this;

                let info = {
                    content: "T_T 体力不够啦！\n可花费" + DataUtil.briefNumber(price) + "矿物购买10点体力\n也可观看广告，获得同样体力！\n今日还有【" + rest + "】次免费机会",
                    btn1: {
                        name: "购 买",
                        clickFunction: function() {
                            this.buyVita();
                        },
                        clickFunctionCaller: this,
                    },
                    btn2: {
                        name: "免费体力",
                        clickFunction: function() {

                            WechatAPI.videoAdUtil.updateCb({
                                failCb: function() {
                                    appContext.getAnalyticManager().sendALD("ad_vt_fail");
                                    this.showShare();
                                },
                                finishCb: function() {
                                    appContext.getAnalyticManager().sendALD("ad_vt_ok");
                                    this.getVitaByAdOrShare();
                                },
                                ceaseCb: function() {
                                    appContext.getAnalyticManager().sendALD("ad_vt_cease");
                                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后可以获得");
                                },
                                caller: self,
                            });

                            WechatAPI.videoAdUtil.show();
                        },
                        clickFunctionCaller: this,
                    },
                };

                appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
                return;
            } else {
                this.showShare();
                return;
            }
        }

        this.onlyBuy(price);
    },

    onlyBuy(price) {
        let info = {
            content: "可以花费" + DataUtil.briefNumber(price) + "矿物购买10点体力",
            btn1: {
                name: "购 买",
                clickFunction: function() {
                    this.buyVita();
                },
                clickFunctionCaller: this,
            },
        };

        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
    },

    showShare() {
        let price = this.getPrice();

        if (!WechatAPI.enableShare) {
            this.onlyBuy(price);
            return;
        }

        let rest = appContext.getUxManager().canShare_vita_restTime();

        let self = this;

        let info = {
            content: "T_T 体力不够啦！\n可花费" + DataUtil.briefNumber(price) + "矿物购买10点体力\n也可通过分享，获得同样体力！\n今日还有【" + rest + "】次免费机会",
            btn1: {
                name: "购 买",
                clickFunction: function() {
                    this.buyVita();
                },
                clickFunctionCaller: this,
            },
            btn2: {
                name: "免费体力",
                clickFunction: function() {
                    WechatAPI.shareUtil.share({
                        cb: {
                            sucCb: function() {
                                this.getVitaByAdOrShare();
                            },
                            caller: self,
                        }
                    });
                },
                clickFunctionCaller: this,
            },
        };

        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
    },

    getVitaByAdOrShare: function() {
        appContext.getUxManager().setShared_vita();
        appContext.getSoundManager().playReward();
        appContext.getDialogManager().showDialog(DialogTypes.Toast, "获得免费体力！");
        appContext.getUxManager().vitaSystem.gain(10);
    },

    buyVita: function() {
        let res = appContext.getUxManager().startTransaction("Mine", this.getPrice(), true);
        if (res) {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "购买成功！");
            appContext.getUxManager().vitaSystem.gain(10);
            appContext.getSoundManager().playReward();
        } else {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "无法购买，资源不足");
        }
    },

    getPrice: function() {
        let levelInfo = appContext.getUxManager().getPlayerLevelInfo();
        let level = levelInfo.level;
        let price = level * 1500 + 15000;
        if (price > 150000) {
            price = 150000;
        }

        return price;
    },
}

module.exports = VitaPromoPipeline;