cc.Class({
    properties: {
        timestamp: {
            get: function () {
                return this._relation.timestamp;
            }
        },

        _relation: null,
    },

    __ctor__: function (relation) {
        if (relation == null) {
            throw new Error("Argument relation is not set!");
        }
        this._relation = relation;
    },

    write: function (data, timestamp) {
        if (timestamp < this.timestamp) {
            return;
        }
        this._relation.data = data;
        this._relation.invalidate(timestamp);
    },

    read: function (isDelete = false) {
        if (isDelete) {
            this._relation.data = null;
        }
        return this._relation.data;
    },

    invalidate: function (newTimestamp) {
        this._relation.invalidate(newTimestamp);
    },


    clearAndInvalidate(newTimestamp) {
        this.invalidate(newTimestamp);
        this.clearNotInvalidate();
    },

    clearNotInvalidate() {
        this._relation.data = null;
    },
});