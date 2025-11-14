export class NPC {
    constructor(scene, config) {
        this.scene = scene;
        this.name = config.name;
        this.dialog = config.dialog;
        this.items = config.items || [];
        this.speed = config.speed || 30;

        this.sprite = scene.physics.add.sprite(config.x, config.y, config.texture);
        this.sprite.setImmovable(true);

        this.moveTimer = 0;
    }

    update() {
        this.randomMovement();
    }

    randomMovement() {
        if (this.scene.time.now < this.moveTimer) return;

        // neuer Movement-Timer
        this.moveTimer = this.scene.time.now + Phaser.Math.Between(1000, 3000);

        // zufällige Richtung
        const dirs = [
            { x: 1, y: 0 }, { x: -1, y: 0 },
            { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 0, y: 0 } // stehen bleiben
        ];

        const d = dirs[Math.floor(Math.random() * dirs.length)];

        this.sprite.setVelocity(d.x * this.speed, d.y * this.speed);
    }

    startDialog(dialogSystem) {
        dialogSystem.startDialog(this.dialog);
    }

    giveItems(playerInventory) {
        this.items.forEach(item => {
            playerInventory.addItem(item);
        });
    }
}