let RootDataContainer = require("RootDataContainer");
let ChildDataContainer = require("ChildDataContainer");
let DataKey = require("DataKey");
let DataUtil = require("DataUtil");

let DataAssembler = cc.Class({
    assembleData: function (dataRepository) {
        this.injectMessageMethods();
        this.assembleDc(dataRepository);
    },

    //往message内部注入方法。注意原来c#代码中调用该方法比现在少传一个参数
    injectMessageMethods: function () {
        //PlayingData.prototype.resetAll
    },

    assembleDc: function (dr) {
        let appStateDc = new RootDataContainer();
        dr.addContainer(DataKey.AppState, appStateDc);
    },
});