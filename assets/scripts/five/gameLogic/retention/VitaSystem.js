let VitaSystem = {
    vitaMax: 60,

    //regTime: 3600000, //ms  1 hour
    regTime: 600000, //ms

    vitaPromoPipeline: require("VitaPromoPipeline"),

    getSaveData: function() {
        return {
            vita: this.vita,
            regTimestamp: this.regTimestamp,
        };
    },

    getTimeRest: function() {
        if (this.regTimestamp <= 0) {
            return 0;
        }

        let t = this.regTime - (Date.now() - this.regTimestamp);
        if (t < 0) {
            return 0;
        }

        return t
    },

    init: function() {
        this.toFull();
    },

    toFull: function() {
        //debug.log("toFull");
        this.vita = this.vitaMax;
        this.regTimestamp = 0;
    },

    load: function(data) {
        this.vita = data.vita;
        if (this.vita == null) {
            this.vita = 1;
        }
        this.regTimestamp = data.regTimestamp;
        this.refresh();
    },

    use: function(c = 1) {
        if (this.vita < c) {
            return false;
        }

        this.vita -= c;
        let reg = this.refresh();
        if (!reg) {
            appContext.getUxManager().saveGameInfo();
        }
    },

    gain: function(c = 1) {
        this.vita += c;
        this.refresh();
    },

    isFull: function() {
        return this.vita >= this.vitaMax;
    },

    refresh: function() {
        let reg = false;
        if (this.isFull()) {
            this.toFull();
            return;
        }

        if (this.regTimestamp <= 0) {
            //debug.warn("!VitaSystem regTimestamp 0");
            this.regTimestamp = Date.now();
        }

        // debug.log("regTimestamp "+this.regTimestamp);
        let timePassed = Date.now() - this.regTimestamp;
        // debug.log("timePassed "+timePassed);
        while (timePassed >= this.regTime) {
            this.vita += 1;
            reg = true;
            if (this.vita >= this.vitaMax) {
                this.toFull();
                appContext.getUxManager().saveGameInfo();
                return reg;
            }

            this.regTimestamp += this.regTime;
            timePassed = Date.now() - this.regTimestamp;
            appContext.getUxManager().saveGameInfo();
        }

        return reg;
    },
}

module.exports = VitaSystem;