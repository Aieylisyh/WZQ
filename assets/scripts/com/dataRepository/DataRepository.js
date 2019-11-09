cc.Class({
    ctor: function () {
        let DataAssembler = require("DataAssembler");
        let assembler = new DataAssembler();
        assembler.assembleData(this);
    },

    properties: {
        _containers: null,
    },

    getContainer: function (key) {
        if (this._containers == null) {
            this._containers = [];
        }
        if (this._containers[key] == null) {
            try { throw new Error() } catch (r) {
                debug.log("No container found by this key:" + key);
                debug.warn(r);
            }
            return null;
        }
        return this._containers[key];
    },

    addContainer: function (key, container) {
        if (this._containers == null) {
            this._containers = [];
        }
        if (this._containers[key] != null) {
            debug.log("This key " + key + " is already in use!");
            return false;
        }
        this._containers[key] = container;
        return true;
    },

    clearContainers: function () {
        for (let i in this._containers) {
            let dc = this._containers[i];
            if (dc != null) {
                dc.clearAndInvalidate(0);
            }
        }
    },
});