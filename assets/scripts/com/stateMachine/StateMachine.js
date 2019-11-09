cc.Class({
    __ctor__: function (caller, initialState) {
        if (initialState == null || typeof initialState === 'function') {
            debug.log("Argument initialState is not valid, using -1 automaticly");
            initialState = -1;
        }

        this._currentState = initialState;
        this._states = [];
        this.caller = caller;
    },

    setState: function (newState) {
        if (newState == null) {
            debug.log("Argument newState is not valid");
            return;
        }

        if (newState === this._currentState) {
            return;
        }

        if (this._states[this._currentState] != null && this._states[this._currentState].functionExit != null) {
            this._states[this._currentState].functionExit.call(this.caller, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
        }

        this._currentState = newState;
       
        if (this._states[newState] != null && this._states[newState].functionEnter != null) {
            this._states[newState].functionEnter.call(this.caller, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
        }
    },

    resetState: function () {
        if (this._states[ this._currentState] != null && this._states[ this._currentState].functionEnter != null) {
            this._states[ this._currentState].functionEnter.call(this.caller, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
        }
    },

    getState: function () {
        return this._currentState;
    },

    registerState: function (stateEnum, functionEnter, functionExit) {
        if (stateEnum == null || typeof stateEnum === 'function') {
            debug.warn("Argument stateEnum is not valid");
            return;
        }

        if (functionExit != null && typeof functionExit !== 'function') {
            debug.warn("functionExit is not a function");
            functionExit = null;
        }

        if (functionEnter != null && typeof functionEnter !== 'function') {
            debug.warn("functionEnter is not a function");
            functionEnter = null;
        }

        if (this._states[stateEnum] == null) {
            this._states[stateEnum] = {};
        }

        this._states[stateEnum].functionExit = functionExit;
        this._states[stateEnum].functionEnter = functionEnter;
    },

    unregisterState: function (stateEnum) {
        this._states[stateEnum] = null;
    },
});