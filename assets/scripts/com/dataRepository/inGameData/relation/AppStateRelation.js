let AppState = require("AppState");

cc.Class({
    properties: {
        _timestamp: 0,

        timestamp: {
            get: function () {
                return Math.max(this.getParentTimestamp(), this._timestamp);
            },
        },

        data: {
            get: function () {
                return this.getData();
            },
            set: function (value) {
                this.setValue(value);
            },
        },
    },

    __ctor__: function () {

    },

    invalidate: function (newTimestamp) {
        this._timestamp = newTimestamp;
    },

    getData: function () {
        if (this.isPlaying()) {
            return AppState.Playing;
        } else if (this.isBetweenRound()) {
            return AppState.BetweenRound;
        }

        return AppState.Main;
    },

    // todo
    isPlaying: function () {
        return appContext.getGameManager().game != null;
    },

    // todo
    isBetweenRound: function () {
        return false;
    },

    setData: function (value) { },

    getParentTimestamp: function () {
        return 0;
    },
});
