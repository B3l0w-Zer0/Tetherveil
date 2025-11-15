import StartMenu from "./scenes/StartMenu.js"
import { StartMap } from "./scenes/StartMap.js";
import { Fight } from "./scenes/fight.js";
import {intro} from "./scenes/intro.js";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: window.innerWidth,     // dynamisch: ganze Bildschirmbreite
  height: window.innerHeight,   // dynamisch: ganze Bildschirmhöhe
  backgroundColor: "#1e1e2f",
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: [StartMenu, StartMap, intro, Fight ],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  }
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

            