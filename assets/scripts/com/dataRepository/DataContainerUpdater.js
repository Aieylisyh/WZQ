let DataContainerUpdater = {

    bind: function (kvList) {
        if (this._bindDataContainerDone) {
            return;
        }

        this.dcData = this.dcData || [];

        for (let i in kvList) {
            let obj = {};
            if (kvList[i]) {
                obj.func = this[kvList[i]];
            }

            this.dcData[i] = obj;
        }

        let dr = appContext.getDataRepository();
        for (let i in this.dcData) {
            if (this.dcData[i].dc == null) {
                let dc = dr.getContainer(i);
                if (dc == null) {
                    debug.warn("can not bind dataContainer");
                    continue;
                }
                this.dcData[i].dc = dc;
                this.dcData[i].timestamp = 0;
            }
        }
        this._bindDataContainerDone = true;
    },

    update: function () {
        if (this._bindDataContainerDone) {
            for (let i in this.dcData) {
                let dcData = this.dcData[i];
                if (dcData && dcData.dc.timestamp >= dcData.timestamp && dcData.dc.timestamp > 0) {
                    if (dcData.func != null) {
                        dcData.func.call(this, dcData.dc.read());
                    }
                    dcData.timestamp = cc.director.getTotalFrames();
                }
            }
        }
    },
}

module.exports = DataContainerUpdater; 