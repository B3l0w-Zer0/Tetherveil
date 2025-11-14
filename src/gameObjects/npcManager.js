import { NPC } from './npc.js';

export default class NPCManager {
    constructor(scene) {
        this.scene = scene;
        this.npcs = [];
    }

    addNPC(config) {
        const npc = new NPC(this.scene, config);
        this.scene.physics.add.collider(npc.sprite, this.scene.walls);
        this.npcs.push(npc);
        return npc;
    }

    removeNPC(npc) {
        const i = this.npcs.indexOf(npc);
        if (i !== -1) {
            npc.destroy();
            this.npcs.splice(i, 1);
        }
    }

    update() {
        for (let npc of this.npcs) {
            npc.update();
        }
    }

    getNearbyNPC(player, radius = 60) {
        const r2 = radius * radius;
        for (let npc of this.npcs) {
            const dx = player.x - npc.sprite.x;
            const dy = player.y - npc.sprite.y;
            if ((dx * dx + dy * dy) < r2) return npc; // schneller: squared distance
        }
        return null;
    }
}