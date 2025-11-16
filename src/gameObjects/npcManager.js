import { NPC } from './npc.js';

export default class NPCManager {
    constructor(scene) {
        this.scene = scene;
        this.group = scene.physics.add.group();
        this.npcs = [];
    }

    addNPC(config) {
        const npc = new NPC(this.scene, config);

        // Kollision NPC <-> Tilemap-Layer
        if (this.scene.walls) {
            this.scene.physics.add.collider(npc.sprite, this.scene.walls);
        }

        // ← HIER NEU: Kollision NPC <-> Player
        if (this.scene.player) {
            this.scene.physics.add.collider(npc.sprite, this.scene.player);
        }

        this.group.add(npc.sprite);
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

            if ((dx * dx + dy * dy) <= r2) {
                return npc;
            }
        }

        return null;
    }
}