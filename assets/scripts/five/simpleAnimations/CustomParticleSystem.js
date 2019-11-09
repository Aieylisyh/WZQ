cc.Class({
    extends: cc.Component,

    properties: {
        prefab: cc.Prefab,

        particleParent: cc.Node,
    },

    onLoad: function () {
        this.gameObjects = [];
    },

    onDestroy: function () {
        if (this.gameObjects == null) {
            return;
        }

        for (let i = 0; i < this.gameObjects.length; i++) {
            if (this.gameObjects[i] == null) {
                continue;
            }

            if (this.gameObjects[i].node != null) {
                this.gameObjects[i].node.destroy();
            }
        }
        
        this.gameObjects = [];
    },

    autoEmit: function () {
        //TODO
    },

    emit: function () {
        let go = cc.instantiate(this.prefab);

        let comp = go.getComponent("CustomParticle");
        if (comp == null) {
            debug.warn("CustomParticle is not found!");
            go.destroy();
            return;
        }

        this.gameObjects.push(comp);
        comp.init(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);

        if (this.particleParent != null) {
            this.particleParent.addChild(go);
        } else {
            this.node.addChild(go);
        }
    },
});