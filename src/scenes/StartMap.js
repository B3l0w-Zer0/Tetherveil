import {createGenMenu, toggleGenMenu} from '../menus/mapMenuGeneral.js';
import npcManager from '../gameObjects/npcManager.js';
import { MapManager } from '../mapping/mapManager.js';
import { mapConfig } from '../mapping/mapConfig.js';

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

        // Player Bilder laden
        this.load.spritesheet("player", "assets/sprites/player_spritesheet.png", {
            frameWidth: 32,
            frameHeight: 32
        });

    }

    create() {
        // 1. Spieler erstellen
        this.player = this.physics.add.sprite(450, 300, "player", 0);
        this.player.setDisplaySize(32, 32);

        this.player.body.setCollideWorldBounds(true);
        this.player.body.pushable = true;

        this.anims.create({
            key: "walk-down",
            frames: this.anims.generateFrameNumbers("player", {start: 0, end: 2}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "walk-left",
            frames: this.anims.generateFrameNumbers("player", {start: 3, end: 5}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "walk-right",
            frames: this.anims.generateFrameNumbers("player", {start: 6, end: 8}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "walk-up",
            frames: this.anims.generateFrameNumbers("player", {start: 9, end: 11}),
            frameRate: 10,
            repeat: -1
        });

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

        // ESC-Menü (HTML)
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
        this.menu.style.zIndex = "1000";

        this.menu.innerHTML = `
      <h2 style="color:white; margin-bottom:20px;">Pause Menü</h2>
      <button id="resumeBtn" style="display:block; margin:10px auto; padding:10px 20px;">Resume</button>
      <button id="optionsBtn" style="display:block; margin:10px auto; padding:10px 20px;">Options</button>
      <button id="fightBtn" style="display:block; margin:10px auto; padding:10px 20px;">Kampf starten</button>
      <button id="backMenuBtn" style="display:block; margin:10px auto; padding:10px 20px;">Back to Menu</button>`;

        document.getElementById("game-container").appendChild(this.menu);

        // Button-Funktionen
        document.getElementById("resumeBtn").addEventListener("click", () => {
            this.menu.style.display = "none";
            this.menuOpen = false;
        });

        document.getElementById("optionsBtn").addEventListener("click", () => {
            this.scene.start("options");
            this.menu.style.display = "none";
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

        // === Menü-Handling ===
        if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
            const visible = this.menu.style.display === "none";
            this.menu.style.display = visible ? "block" : "none";
            this.menuOpen = visible;

            // Wenn Menü aufgeht: Player stoppen + Animation stoppen
            if (this.menuOpen) {
                this.player.body.setVelocity(0);
                this.player.anims.stop();
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.TAB)) {
            toggleGenMenu(this.genMenu);
            this.menuOpen = !this.menuOpen;

            if (this.menuOpen) {
                this.player.body.setVelocity(0);
                this.player.anims.stop();
            }
        }

        // Wenn Menü offen ist: keine Bewegung
        if (this.menuOpen) return;

        // === Movement ===
        const speed = this.keys.SHIFT.isDown ? 400 : 200;
        const body = this.player.body;

        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown) vx -= 1;
        else if (this.cursors.right.isDown || this.keys.D.isDown) vx += 1;

        if (this.cursors.up.isDown || this.keys.W.isDown) vy -= 1;
        else if (this.cursors.down.isDown || this.keys.S.isDown) vy += 1;

        // Diagonal normalisieren (sonst diagonal schneller)
        if (vx !== 0 && vy !== 0) {
            const inv = 1 / Math.sqrt(2);
            vx *= inv;
            vy *= inv;
        }

        body.setVelocity(vx * speed, vy * speed);

        // === Animation + Idle Frames ===
        // Merke letzte Richtung (für Idle)
        if (!this.lastDir) this.lastDir = "down";

        if (vx === 0 && vy === 0) {
            // Idle: Frame je Richtung (0=down, 3=left, 6=right, 9=up)
            this.player.anims.stop();

            switch (this.lastDir) {
                case "down":
                    this.player.setFrame(0);
                    break;
                case "left":
                    this.player.setFrame(3);
                    break;
                case "right":
                    this.player.setFrame(6);
                    break;
                case "up":
                    this.player.setFrame(9);
                    break;
            }

            return;
        }

        // Lauf-Animation je nach dominanter Achse
        if (Math.abs(vx) > Math.abs(vy)) {
            if (vx > 0) {
                this.lastDir = "right";
                this.player.anims.play("walk-right", true);
            } else {
                this.lastDir = "left";
                this.player.anims.play("walk-left", true);
            }
        } else {
            if (vy > 0) {
                this.lastDir = "down";
                this.player.anims.play("walk-down", true);
            } else {
                this.lastDir = "up";
                this.player.anims.play("walk-up", true);
            }
        }
    }
}
