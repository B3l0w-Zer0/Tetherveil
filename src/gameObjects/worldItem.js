export class WorldItem {
    constructor(scene, x, y, itemId, itemData) {
        this.scene = scene;
        this.itemId = itemId;
        this.itemData = itemData;
        this.collected = false;

        if (scene.textures.exists(itemData.texture)) {
            this.sprite = scene.add.image(x, y, itemData.texture);
        } else {
            this.sprite = scene.add.rectangle(x, y, 16, 16, this.getFallbackColor(itemData.type));
        }

        // Diese zwei Zeilen waren das Problem:
        this.sprite.setDepth(50);
        this.sprite.setScrollFactor(1);

        // Bob-Animation
        scene.tweens.add({
            targets: this.sprite,
            y: y - 4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.createGlowEffect(x, y);

        this.tooltip = scene.add.text(x, y - 24, itemData.name, {
            fontFamily: 'sans-serif',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000cc',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setDepth(51).setVisible(false);
    }

    getFallbackColor(type) {
        const colors = {
            consumable: 0xff4444,
            material:   0xffaa00,
            weapon:     0x4444ff,
            armor:      0x44ff44
        };
        return colors[type] || 0xffffff;
    }

    createGlowEffect(x, y) {
        // Kleiner Leuchtkreis unter dem Item
        this.glow = this.scene.add.circle(x, y + 4, 10, 0xffffff, 0.2);
        this.scene.tweens.add({
            targets: this.glow,
            alpha: 0.5,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    showTooltip(visible) {
        this.tooltip.setVisible(visible);
    }

    /**
     * Item aufsammeln - spielt Animation ab und zerstört das Objekt
     * @param {Function} onComplete - Callback wenn Animation fertig
     */
    collect(onComplete) {
        if (this.collected) return;
        this.collected = true;

        this.scene.tweens.killTweensOf(this.sprite);
        this.scene.tweens.killTweensOf(this.glow);

        // Aufsammel-Animation: nach oben fliegen und ausblenden
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y - 30,
            alpha: 0,
            duration: 400,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.destroy();
                if (onComplete) onComplete();
            }
        });

        this.scene.tweens.add({
            targets: [this.glow, this.tooltip],
            alpha: 0,
            duration: 200
        });
    }

    destroy() {
        this.scene.tweens.killTweensOf(this.sprite);
        this.scene.tweens.killTweensOf(this.glow);
        this.sprite.destroy();
        this.glow.destroy();
        this.tooltip.destroy();
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
}