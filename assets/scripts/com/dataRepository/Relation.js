//单一关系的relation继承这个class，
//复杂关系的relation不继承

cc.Class({
    properties: {
        _timestamp: 0,

        timestamp: {
            get: function () {
                return Math.max(this.getParentTimestamp(), this._timestamp);
            }
        },

        _pdc: null,

        data: {
            get: function () {
                return this.getData();
            },
            set: function (value) {
                this.setData(value);
            }
        }
    },

    __ctor__: function (pdc) {
        if (pdc == null) {
            throw new Error("Parent DataContainer is not set to the relation!");
        }
        this._pdc = pdc;
    },

    invalidate: function (newTimeStamp) {
        this._timestamp = newTimeStamp;
    },

    getData: function () {
        debug.log("you must override this function!");
        return null;
    },

    setData: function (value) {
        debug.log("you must override this function!");
    },

    getParentTimestamp: function () {
        return this._pdc.timestamp;
    },
});