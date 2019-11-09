let DataContainerUpdater = require("DataContainerUpdater");

cc.Class({
    name: "RemoteAPI",

    ctor: function () {
        this.bindDataContainer();
    },

    bindDataContainer: function () {
        let kv = {};

        DataContainerUpdater.bind.call(this, kv);
    },
});