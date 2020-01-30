
cc.Class({
    extends: cc.Component,

    properties: {
        fan: cc.Node,

        //spChecked: cc.Node,
    },

    setFan: function (checked = false) {
        this.fan.active = checked;
    },
});