import Options from "./options.js";
export default class FPSDisplay extends Phaser.Scene {
    constructor() {
        super({ key: "FPSDisplay", active: true }); // active: true = läuft immer
    }

    create() {
        const settings = Options.getSettings();

        if (settings && settings.showFPS) {
            this.fpsText = this.add.text(10, 10, 'FPS: 60', {
                fontFamily: "monospace",
                fontSize: "16px",
                color: "#00ff00",
                backgroundColor: "#000000",
                padding: { x: 5, y: 5 }
            }).setDepth(10000);
        }

        // Event-Listener für Optionsänderungen
        this.game.events.on('fpsToggled', (enabled) => {
            if (enabled && !this.fpsText) {
                this.fpsText = this.add.text(10, 10, 'FPS: 60', {
                    fontFamily: "monospace",
                    fontSize: "16px",
                    color: "#00ff00",
                    backgroundColor: "#000000",
                    padding: { x: 5, y: 5 }
                }).setDepth(10000);
            } else if (!enabled && this.fpsText) {
                this.fpsText.destroy();
                this.fpsText = null;
            }
        });
    }

    update() {
        if (this.fpsText) {
            this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
        }
    }
}