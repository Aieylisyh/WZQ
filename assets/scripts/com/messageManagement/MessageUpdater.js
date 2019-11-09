// 父类，由子类继承
cc.Class({
    extends: cc.Component,

    properties: {
        _contents: [],
    },

    init: function (type) {
        this._type = type;
    },

    getType: function () {
        return this._type;
    },

    getContent: function () {
        if (this._contents.length <= 0) {
            return null;
        }

        return this._contents.shift();
    },

    saveContent: function (content) {
        if (content == null) {
            return;
        }
        this._contents.push(content);
    },

    // 处理消息
    doHandle: function (content) {
        debug.log("you must override this function!");
    },

    // 是否刷新
    isUpdate: function () {
        debug.log("you must override this function!");
    },

    resetState: function () {
        ebug.log("you must override this function!");
    },
});
