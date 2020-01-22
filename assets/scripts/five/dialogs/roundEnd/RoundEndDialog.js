let PlayerInfo = require("PlayerInfo");
let DialogTypes = require("DialogTypes");
let Grade = require("Grade");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        oppoPlayerInfo: PlayerInfo,

        selfPlayerInfo: PlayerInfo,

        gradeIcon: cc.Sprite,

        gradeLabel: cc.Label,

        gradeBar: cc.ProgressBar,

        gradeScoreLabel: cc.Label,

        btnContinue: cc.Node,

        btnBack: cc.Node,

        btnShowOff: cc.Node,

        btnKeepGrade: cc.Node,

        looserTag: cc.Node,

        looserTagLabel: cc.Label,

        winnerTag: cc.Node,

        winnerTagXLeft: -150,

        winnerTagXRight: 150,

        looserTagXLeft: -150,

        looserTagXRight: 150,

        mainNode: cc.Node,

        chestsNode: cc.Node,

        chestPrefab: cc.Prefab,

        buttons: cc.Node,

        expPart: cc.Node,

        expAddPart: cc.Node,

        expProgressBar: cc.ProgressBar,

        expProgressBarLabel: cc.Label,

        expLowLabel: cc.Label,

        expArtNum: cc.Label,

        expArtNumPref: cc.Label,
    },

    show: function (info) {
        if (info == null) {
            this.hide();
            return;
        }

        window.re = this;
        debug.log(info);

        this.fadeInBackground();
        this.info = info;
        this.step = 1;

        this.processStep();
    },

    processStep: function () {
        //整体次序 step
        // 0 初始
        // 1 宝箱（如果有） showChests
        // 2 基础面板 showMainBoard
        // 3 出现胜利者 showWinner
        // 4 积分 showGradeExp
        // 5 段位动画（如果有） showGradeAnim
        // 6 出现按钮 showButtons
        // 7 广告（如果有） showBannerAd

        switch (this.step) {
            case 1:
                this.showChests();
                break;

            case 2:
                this.showMainBoard();
                break;

            case 3:
                this.showWinner();
                break;

            case 4:
                this.showGradeExp();
                break;

            case 5:
                this.showGradeAnim();
                break;

            case 6:
                this.showButtons();
                break;

            case 7:
                this.showBannerAd();
                break;

        }
    },

    showChests: function () {
        if (this.info.chestInfo == null) {
            this.step = 2;
            this.processStep();
            return;
        }

        this.chestsNode.active = true;
        this.mainNode.active = false;

        this.chestsNode.scale = 0.1;
        let action1 = cc.scaleTo(0.2, 1).easing(cc.easeBackOut());
        let action2 = cc.callFunc(function () {
            this.createChests();
        }, this);

        let seq = cc.sequence(action1, action2);
        this.chestsNode.runAction(seq);
    },

    showMainBoard: function () {
        this.chestsNode.active = false;
        this.mainNode.active = true;

        this.mainNode.scale = 0.1;
        let action = cc.scaleTo(0.2, 1).easing(cc.easeBackOut());
        this.mainNode.runAction(action);

        this.selfPlayerInfo.setup(this.info.selfPlayer);
        this.oppoPlayerInfo.setup(this.info.opponentPlayer);

        this.scheduleOnce(function () {
            this.step = 3;
            this.processStep();
        }, 1);
    },

    showWinner: function () {
        this.looserTag.x = this.info.win ? this.looserTagXRight : this.looserTagXLeft;
        this.winnerTag.x = this.info.win ? this.winnerTagXLeft : this.winnerTagXRight;
        this.looserTag.active = true;
        this.winnerTag.active = true;

        this.gradeScoreLabel.string = this.info.win ? "小胜一场" : "小败一场";

        this.winnerTag.scale = 0.1;
        let action1 = cc.scaleTo(0.5, 1).easing(cc.easeBackOut());
        this.winnerTag.runAction(action1);

        this.looserTag.scale = 0.1;
        let action2 = cc.scaleTo(0.5, 1).easing(cc.easeBackOut());
        this.looserTag.runAction(action2);

        if (this.info.isLooserOffline) {
            this.looserTagLabel.string = "超时或离线";
        } else if (this.info.isSurrender) {
            this.looserTagLabel.string = "主动认输";
        } else {
            this.looserTagLabel.string = "输 了";
        }

        this.scheduleOnce(function () {
            this.step = 4;
            this.processStep();
        }, 0.5);
    },

    showGradeExp: function () {
        //  info.gradeScoreAdd 
        //  info.toScore
        //  info.fromScore
        this.gradeAndFillInfoFrom = Grade.getGradeAndFillInfoByScore(this.info.fromScore);
        this.gradeAndFillInfoTo = Grade.getGradeAndFillInfoByScore(this.info.toScore);
        this.gradeInfoFrom = Grade.getGradeInfo(this.gradeAndFillInfoFrom.grade);
        this.gradeInfoTo = Grade.getGradeInfo(this.gradeAndFillInfoTo.grade);
        debug.log(this.gradeAndFillInfoFrom);
        debug.log(this.gradeAndFillInfoTo);
        debug.log(this.gradeInfoFrom);
        debug.log(this.gradeInfoTo);

        let total = this.gradeAndFillInfoFrom.fillTop - this.gradeAndFillInfoFrom.fillBottom;
        this.expProgressBar.progress = this.gradeAndFillInfoFrom.fillAmount / total;
        this.expProgressBarLabel.string = this.gradeAndFillInfoFrom.fillAmount + "/" + total;

        this.expPart.scale = 0.1;
        this.expPart.runAction(cc.scaleTo(0.5, 1).easing(cc.easeBackOut()));

        this.expArtNumPref.string = this.info.win ? "积分+" : "积分-";
        this.expArtNum.string = Math.abs(this.info.gradeScoreAdd);
        this.expAddPart.scale = 0.1;
        let shakeAction = cc.scaleTo(0.5, 1).easing(cc.easeBackOut());
        this.expAddPart.runAction(cc.sequence(cc.delayTime(0.6), shakeAction));

        this.scheduleOnce(function () {
            this.step = 5;
            this.processStep();
        }, 1.2);
    },

    showGradeAnim: function () {
        let total = this.gradeAndFillInfoTo.fillTop - this.gradeAndFillInfoTo.fillBottom;
        let rest = total - this.gradeAndFillInfoTo.fillAmount;

        this.expProgressBar.progress = this.gradeAndFillInfoTo.fillAmount / total;
        this.expProgressBarLabel.string = this.gradeAndFillInfoTo.fillAmount + "/" + total;

        this.expLowLabel.string = "距提升到下一个段位还需要" + rest + "积分";

        this.scheduleOnce(function () {
            this.step = 6;
            this.processStep();
        }, 1);
    },

    showButtons: function () {
        this.btnShowOff.active = false;
        this.btnKeepGrade.active = false;
        this.buttons.active = true;

        this.buttons.y = -520;
        let action = cc.moveTo(0.5, 0, -40).easing(cc.easeCubicActionOut());
        this.buttons.runAction(action);

        this.scheduleOnce(function () {
            this.step = 7;
            this.processStep();
        }, 1);
    },

    showBannerAd: function () {

    },

    // 点击"返回首页"按钮
    onClickBtnBack: function () {
        appContext.getAppController().clearGameData();
        appContext.getAppController().backToMain();
        this.hide();
    },

    // 点击"再来一局"按钮
    onClickBtnContinue: function () {
        this.hide();
        // let gm = appContext.getGameManager();
        // let p2 = DummyPicker.pickTestDummy();
        // gm.createGame(gm.selfPlayer, p2, Math.random(), {});
        // gm.startGame();
        appContext.getAppController().backToMain();
        appContext.getDialogManager().showDialog(DialogTypes.Match);
    },

    // 点击"炫耀"按钮
    onClickBtnShowoff: function () {
        WechatAPI.wxShare.shareByType();
    },

    // 点击"段位保护"按钮
    onClickBtnProtectGrade: function () {
        this.hide();
    },

    onClickChest: function (chest) {
        if (chest == null) {
            return;
        }

        let id = chest.id;
        this.chests = [];
        this.chests.push(this.chestsVisual[id]);
        this.chestsVisual.splice(id, 1);
        this.chests.push(this.chestsVisual.pop());
        this.chests.push(this.chestsVisual.pop());
        this.chestsVisual = null;

        //TODO获得对应奖励
        this.chests[0].onOpen(true, this.info.chestInfo.chest0);

        this.scheduleOnce(function () {
            this.chests[1].onOpen(false, this.info.chestInfo.chest1);
            this.chests[2].onOpen(false, this.info.chestInfo.chest2);
        }, 1);

        this.scheduleOnce(function () {
            this.chests[0].node.destroy();
            this.chests[1].node.destroy();
            this.chests[2].node.destroy();
            this.chests = null;

            this.step = 2;
            this.processStep();
        }, 3);
    },

    createChests: function () {

        //TODO
        /*  info.chestInfo = {
              chest0: {
                  text: "大奖",
                  resUrl: "images/rankImg/rank1",
              },
              chest1: null,
              chest2: {
                  text: "参与奖",
                  resUrl: "images/rankImg/rank2",
              },
          };*/


        this.chestsVisual = [];

        for (let i = 0; i < 3; i++) {
            this.createChest(i);
        }
    },

    createChest: function (i) {
        this.scheduleOnce(function () {
            let chestNode = cc.instantiate(this.chestPrefab);
            let chest = chestNode.getComponent("Chest");

            chest.init(this, i);
            this.chestsVisual.push(chest);


            this.chestsNode.addChild(chestNode);
            chestNode.x = (i - 1) * 190;
            if (i === 1) {
                chestNode.y = -200;
            } else {
                chestNode.y = -260;
            }
        }, i * 0.4);
    },
});
