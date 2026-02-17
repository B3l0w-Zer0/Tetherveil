import StartMenu from "./scenes/StartMenu.js"
import { StartMap } from "./scenes/StartMap.js";
import { Fight } from "./scenes/fight.js";
import {intro} from "./scenes/intro.js";
import FPSDisplay from "./scenes/FPSDisplay.js"
import Options from "./scenes/options.js"

// Lade gespeicherte Auflösung oder nutze Default
const savedSettings = localStorage.getItem('tetherVeilSettings');
let gameWidth = 1280;
let gameHeight = 720;

if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    if (settings.resolution) {
        const [width, height] = settings.resolution.split('x').map(Number);
        gameWidth = width;
        gameHeight = height;
    }
}

const config = {
    type: Phaser.WEBGL,
    parent: "game-container",
    width: gameWidth,
    height: gameHeight,
    backgroundColor: "#1e1e2f",
    physics: {
        default: "arcade",
        arcade: { debug: false }
    },
    scene: [FPSDisplay, StartMenu, Options, StartMap, intro, Fight],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
        powerPreference: "high-performance",
        antialias: true
    }
};

const game = new Phaser.Game(config);

game.scene.start("Menu");



            