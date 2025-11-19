export class NPC {
    constructor(scene, config) {
        this.scene = scene;
        this.name = config.name || "NPC";
        this.dialog = config.dialog || [];
        this.items = config.items || [];
        this.speed = config.speed || 30;

        this.sprite = scene.physics.add.sprite(config.x, config.y, config.texture);
        this.sprite.setImmovable(true);
        this.sprite.setPushable(false);
        this.sprite.setCollideWorldBounds(true);


        // interne Movement-States
        this.moveTimer = 0;

        // STUCK-Detection
        this.lastX = this.sprite.x;
        this.lastY = this.sprite.y;
        this.stuckTimer = 0;

        // Richtungstabelle
        this.directions = [
            { x: 1, y: 0 },    // rechts
            { x: -1, y: 0 },   // links
            { x: 0, y: 1 },    // runter
            { x: 0, y: -1 },   // hoch
            { x: 0, y: 0 }     // idle
        ];
    }

    update() {
        this.randomMovement();
        this.checkIfStuck();
    }

    randomMovement(force = false) {
        if (!force && this.scene.time.now < this.moveTimer) return;

        // neuer Movement-Timer (1–3 Sekunden)
        this.moveTimer = this.scene.time.now + Phaser.Math.Between(1000, 3000);

        // zufällige Richtung auswählen
        const d = Phaser.Utils.Array.GetRandom(this.directions);

        this.sprite.setVelocity(d.x * (this.speed * 2), d.y * (this.speed * 2));

    }

    checkIfStuck() {
        const dx = Math.abs(this.sprite.x - this.lastX);
        const dy = Math.abs(this.sprite.y - this.lastY);

        // NPC bewegt sich nicht, obwohl Velocity vorhanden ist → stuck
        const isMoving = this.sprite.body.velocity.x !== 0 || this.sprite.body.velocity.y !== 0;

        if (isMoving && dx < 1 && dy < 1) {
            // alle 250ms neue Richtung probieren
            if (this.scene.time.now > this.stuckTimer) {
                this.stuckTimer = this.scene.time.now + 250;
                this.randomMovement(true);
            }
        }

        this.lastX = this.sprite.x;
        this.lastY = this.sprite.y;
    }

    startDialog(dialogSystem) {
        dialogSystem.startDialog(this.dialog);
    }

    giveItems(playerInventory) {
        this.items.forEach(item => {
            playerInventory.addItem(item);
        });
    }

    destroy() {
        this.sprite.destroy();
    }
}