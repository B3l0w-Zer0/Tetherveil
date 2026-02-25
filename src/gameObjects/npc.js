
export class NPC {
    constructor(scene, config) {
        this.scene = scene;
        this.name = config.name || "NPC";
        this.dialog = config.dialog || [];
        this.items = config.items || [];
        this.speed = config.speed || 30;
        this.isTalking = false;
        this.npcId = config.id || null;

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
        if (this.isTalking) return;
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
        this.isTalking = true;
        this.sprite.setVelocity(0, 0);

        const questManager = this.scene.questManager;

        if (!questManager || !this.npcId) {
            dialogSystem.startDialog(this.dialog, this.name, this);
            return;
        }

        const { type, quest, lines } = questManager.getQuestDialogForNPC(this.npcId, this.dialog);

        switch (type) {
            case 'offer':
                dialogSystem.startQuestDialog(
                    lines,
                    this.name,
                    this,
                    quest,
                    () => questManager.acceptQuest(quest.id),
                    () => questManager.declineQuest(quest.id),
                    quest.dialogOnAccept || ["Danke!"],
                    quest.dialogOnDecline || ["Schade..."]
                );
                break;

            case 'completable':
                dialogSystem.startDialog(lines, this.name, this);
                questManager.finishQuest(quest.id);
                break;

            case 'active':
            case 'normal':
            default:
                dialogSystem.startDialog(lines, this.name, this);
                if (this.npcId) questManager.updateProgress('talk', this.npcId);
                break;
        }
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