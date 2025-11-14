import {sounds, playSound} from '../../assets/audio/sounds/sounds.js';

export default class StartMenu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    preload() {
        // Optional: Hintergrundgrafik oder Button-Assets laden
        // this.load.image('background', 'assets/images/menu-bg.png');
        // this.load.audio('click', 'assets/sounds/click.mp3');
    }

    create() {
        const { width, height } = this.scale;

        // Optionaler Hintergrund
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setAlpha(0.7);

        // Titel
        this.add.text(width / 2, height * 0.25, "Tetherveil", {
            fontFamily: "serif",
            fontSize: "64px",
            color: "#ffffff",
        }).setOrigin(0.5);


        // Button-Konfiguration
        const buttonData = [
            { text: "New Game", scene: "intro" },
            { text: "Shortcut", scene: "startMap" },
            { text: "Spielstand laden", scene: "load" },
            { text: "Optionen", scene: "options" },
        ];

        const buttonSpacing = 80;
        const startY = height * 0.45;

        buttonData.forEach((btn, index) => {
            const button = this.add.text(width / 2, startY + index * buttonSpacing, btn.text, {
                fontFamily: "sans-serif",
                fontSize: "36px",
                color: "#dddddd",
                backgroundColor: "#333333",
                padding: { x: 20, y: 10 },
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on("pointerover", () => {
                    button.setStyle({ backgroundColor: "#555555", color: "#ffffff" });
                })
                .on("pointerout", () => {
                    button.setStyle({ backgroundColor: "#333333", color: "#dddddd" });
                })
                .on("pointerdown", () => {
                    playSound(sounds.click);
                    this.scene.start(btn.scene);
                });
        });
    }
}
