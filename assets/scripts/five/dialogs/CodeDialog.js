
let DialogTypes = require("DialogTypes");
let Item = require("Item");
let StringUtil = require("StringUtil");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        eB: cc.EditBox,
    },

    show: function () {
        this.fadeInBackground();
        this.fastShowAnim();
    },

    onCommitCode() {
        if (appContext.getUxManager().gameInfo == null) {
            return;
        }
        if (appContext.getUxManager().gameInfo.usedCode == null) {
            appContext.getUxManager().gameInfo.usedCode = [];
        }
        appContext.getSoundManager().playBtn();
        let s = this.eB.string;
        s = StringUtil.trimSpace(s);

        if (StringUtil.isEmpty(s)) {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "请输入活动码");
        } else {
            if (s == "reset") {
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "数据已重置");
                appContext.getUxManager().resetGameInfo();
                return;
            }
            if (!this.isCodeValid(s)) {
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "不是有效的活动码");
                return;
            }
            if (this.isCodeUsed(s)) {
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "活动码已使用过");
                return;
            }
            let reward;
            if (s == "wzqdz") {
                reward = [{ type: "GrabFirstCard", count: 1 }, { type: "Gold", count: 288 }];
            } else if (s == "woshidaren") {
                reward = [{ type: "GrabFirstCard", count: 5 }, { type: "KeepGradeCard", count: 1 }, { type: "Gold", count: 588 }];
            } else if (s == "wzqdzdr") {
                reward = [{ type: "GrabFirstCard", count: 6 }, { type: "KeepGradeCard", count: 6 }, { type: "Gold", count: 988 }];
            }
            this.recodeCode(s);
            appContext.getUxManager().rewardItems(reward);
            let text = Item.getTextByItem(reward);
            appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, "恭喜您！\n活动码兑换成功\n获得: " + text + "\n\n奖励已发放，请查收");
        }
    },

    recodeCode(s) {
        if (this.isCodeUsed(s)) {
            return;
        }

        appContext.getUxManager().gameInfo.usedCode.push(s);
        appContext.getUxManager().saveGameInfo();
    },

    isCodeValid(s) {
        if (s == "wzqdz") {
            return true;
        } else if (s == "woshidaren") {
            return true;
        } else if (s == "wzqdzdr") {
            return true;
        }
        return false;
    },

    isCodeUsed(s) {
        let codes = appContext.getUxManager().gameInfo.usedCode;
        let res = false;

        //注意这样写，里面的return不是return当前的域！
        codes.forEach(element => {
            if (s == element) {
                res = true;
            }
        });
        return res;
    },

    onHideFunc() {
        let w = appContext.getWindowManager().currentWindowNode;
        let gw = w.getComponent("GameWindow");
        let mw = w.getComponent("MainWindow");
        mw && mw.onPlayerInfoDialogHide();
        gw && gw.onPlayerInfoDialogHide();
    },
});
