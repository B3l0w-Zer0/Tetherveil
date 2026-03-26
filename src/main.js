import StartMenu from "./scenes/StartMenu.js"
import { StartMap } from "./scenes/StartMap.js";
import { Fight } from "./scenes/fight.js";
import {intro} from "./scenes/intro.js";
import FPSDisplay from "./scenes/FPSDisplay.js"
import Options from "./scenes/Options.js"

// Basis-Auflösung für Design
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

const config = {
    type: Phaser.WEBGL,
    parent: "game-container",
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    backgroundColor: "#1e1e2f",
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            fps: 60
        }
    },
    scene: [FPSDisplay, StartMenu, Options, StartMap, intro, Fight],
    scale: {
        mode: Phaser.Scale.RESIZE,  // 👈 RESIZE für Vollbild
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    render: {
        powerPreference: "high-performance",
        antialias: true,
        pixelArt: false
    }
};

const game = new Phaser.Game(config);
const canvas = document.querySelector('canvas');
if (canvas) canvas.style.pointerEvents = 'none';
game.scene.start("Menu");

// Resize Handler
let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        game.scale.resize(window.innerWidth, window.innerHeight);

        // Zoom in allen Szenen neu anwenden
        const settings = Options.getSettings();
        if (settings && settings.zoomLevel) {
            game.scene.scenes.forEach(scene => {
                if (scene.cameras && scene.cameras.main && scene.scene.key !== 'FPSDisplay') {
                    scene.cameras.main.setZoom(settings.zoomLevel);
                }
            });
        }
    }, 100);
});