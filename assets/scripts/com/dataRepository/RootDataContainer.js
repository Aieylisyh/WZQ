cc.Class({
    properties: {
        timestamp: {
            get: function () {
                return this._timestamp;
            }
        },

        _data: null,

        _timestamp: 0,
    },

    write: function (data, timestamp) {
        if (timestamp < this._timestamp) {
            return;
        }
        this._data = data;
        this._timestamp = timestamp;
    },

    read: function (isDelete = false) {
        if (isDelete) {
            this._data = null;
        }
        return this._data;
    },

    invalidate: function (newTimeStamp) {
        this._timestamp = newTimeStamp;
    },

    clearAndInvalidate: function (newTimeStamp) {
        this.invalidate(newTimeStamp);
        this.clearNotInvalidate();
    },

    clearNotInvalidate: function () {
        this._data = null;
    },
});