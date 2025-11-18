import {createGenMenu, toggleGenMenu} from '../menus/mapMenuGeneral.js';
import npcManager from '../gameObjects/npcManager.js';
import { MapManager } from '../mapping/mapManager.js';  // ← NEU!
import { mapConfig } from '../mapping/mapConfig.js';    // ← NEU!

export class StartMap extends Phaser.Scene {
    constructor() {
        super("startMap");
    }

    preload() {
        // Alle Tilesets laden
        mapConfig.tilesets.forEach(tileset => {
            this.load.image(tileset.key, tileset.path);
        });

        // Alle Maps laden
        mapConfig.maps.forEach(map => {
            this.load.tilemapTiledJSON(map.key, map.tilemapPath);
        });
    }

    create() {
        // 1. Spieler erstellen
        this.player = this.physics.add.sprite(450, 300, null);
        this.player.setDisplaySize(32, 32);
        this.player.setTint(0x00ff00);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.pushable = true;

        // 2. Kamera folgt dem Spieler
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // 3. NPC-Manager erstellen
        this.npcManager = new npcManager(this);

        // 4. Map-Manager erstellen
        this.mapManager = new MapManager(this);

        // 5. Map laden
        const startMapKey = mapConfig.maps[0].key;
        this.mapManager.loadMap(startMapKey);

        // 6. Manuellen NPC hinzufügen
        this.npcManager.addNPC({
            x: 370,
            y: 250,
            texture: "npc",
            name: "Bob",
            dialog: ["Hallo!", "Wie geht's?"],
            speed: 35
        });

        // Steuerung Keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys("W,A,S,D,ESC,SHIFT,TAB,E");
        this.menuOpen = false;

        // ESC-Menü (dein Code bleibt gleich)
        this.menu = document.createElement("div");
        this.menu.style.position = "absolute";
        this.menu.style.top = "50%";
        this.menu.style.left = "50%";
        this.menu.style.transform = "translate(-50%, -50%)";
        this.menu.style.display = "none";
        this.menu.style.background = "rgba(0, 0, 0, 0.8)";
        this.menu.style.backgroundColor = "rgba(100, 100, 100, 0.5)";
        this.menu.style.padding = "30px";
        this.menu.style.border = "2px solid white";
        this.menu.style.borderRadius = "10px";
        this.menu.style.textAlign = "center";
        this.menu.style.zIndex = "10000";

        document.getElementById("game-container").appendChild(this.menu);

// Button-Funktionen
        document.getElementById("resumeBtn").addEventListener("click", () => {
            this.menu.style.display = "none";
            this.menuOpen = false;
        });

        document.getElementById("optionsBtn").addEventListener("click", () => {
            alert("Optionsmenü (noch nicht implementiert)");
        });

        document.getElementById("fightBtn").addEventListener("click", () => {
            this.menu.style.display = "none";
            this.menuOpen = false;
            this.scene.start("Fight");
        });

        document.getElementById("backMenuBtn").addEventListener("click", () => {
            this.menu.style.display = "none";
            this.menuOpen = false;
            this.scene.start("Menu");
        });

        // General Menu
        this.genMenu = createGenMenu();

        // Vollbild
        this.input.keyboard.on("keydown-F11", (event) => {
            event.preventDefault();
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });
    }

    update() {
        // === NPCs updaten ===
        this.npcManager.update();

        if (!this.menuOpen) {
            let speed = this.keys.SHIFT.isDown ? 400 : 200;
            const body = this.player.body;
            body.setVelocity(0);

            if (this.cursors.left.isDown || this.keys.A.isDown) body.setVelocityX(-speed);
            else if (this.cursors.right.isDown || this.keys.D.isDown) body.setVelocityX(speed);

            if (this.cursors.up.isDown || this.keys.W.isDown) body.setVelocityY(-speed);
            else if (this.cursors.down.isDown || this.keys.S.isDown) body.setVelocityY(speed);

        } else {
            this.player.body.setVelocity(0);
        }

        // ESC-Menü
        if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
            const visible = this.menu.style.display === "none";
            this.menu.style.display = visible ? "block" : "none";
            this.menuOpen = visible;
        }

        // TAB-Menü
        if (Phaser.Input.Keyboard.JustDown(this.keys.TAB)) {
            toggleGenMenu(this.genMenu);
            this.menuOpen = !this.menuOpen;
        }
    }
}