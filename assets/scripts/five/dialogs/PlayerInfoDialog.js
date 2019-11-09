let DialogTypes = require("DialogTypes");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        _totalAttributeLength: 151, // 总的属性长度(固定写死)

        triangle01: cc.Node, // 这个不太好方便命名

        triangle02: cc.Node,
        
        triangle03: cc.Node,

        triangle04: cc.Node,
    },

    show: function (info) {
        this.setCharacterAttribute(info);

        this.fadeInBackground();
        this.fastShowAnim();
    },

    // 设置人物属性图
    setCharacterAttribute: function (info) {
        // todo
        let keepWin = 0.6;
        let grade = 0.5;
        let winRate = 0.45;
        let skill = 0.70;

        this.triangle01.width = skill * this._totalAttributeLength;
        this.triangle01.height = keepWin * this._totalAttributeLength;

        this.triangle02.height = keepWin * this._totalAttributeLength;
        this.triangle02.width = grade * this._totalAttributeLength;

        this.triangle03.width = skill * this._totalAttributeLength;
        this.triangle03.height = winRate * this._totalAttributeLength;

        this.triangle04.width = grade * this._totalAttributeLength;
        this.triangle04.height = winRate * this._totalAttributeLength;
    },

    // 点击"？"按钮
    onClickBtnHelp: function () {
        appContext.getDialogManager().showDialog(DialogTypes.GradeInfo);
    },

    // 点击"分享"按钮
    onClickBtnShare: function () {
        debug.log("分享");
        WechatAPI.wxShare.shareByType();
    },

    onClickBtnClose: function () {
        this.hide();
    },
});
