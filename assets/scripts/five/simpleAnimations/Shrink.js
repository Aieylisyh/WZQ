cc.Class({
    extends: cc.Component,

    properties: {
        minScale: 0.5,

        maxScale: 1,

        turnTime: 1,

        loop: true,

        playOnEnable: true,

        startFromBig: true,

        isPlaying: false,
    },


    onLoad() {
        this.timer = 0;
        if (!this.startFromBig) {
            this.timer = this.turnTime / 2;
        }

        this.deltaScale = this.maxScale - this.minScale;
    },

    onEnable() {
        if (this.playOnEnable) {
            this.isPlaying = true;
        }
    },

    update(dt) {
        if (!this.isPlaying) {
            return;
        }

        let f = this.timer / this.turnTime;//f=0 big f=1 big f=0.5 small
        let factor = Math.cos(f * Math.PI * 2);
        this.node.scale = this.minScale + this.deltaScale * factor;
        
        this.timer -= dt;
        if (this.timer < 0) {
            this.timer += this.turnTime;
        }
    },
});
