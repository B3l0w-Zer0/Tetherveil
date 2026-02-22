import {createGenMenu, toggleGenMenu} from '../menus/mapMenuGeneral.js';
import npcManager from '../gameObjects/npcManager.js';
import { MapManager } from '../mapping/mapManager.js';
import { mapConfig } from '../mapping/mapConfig.js';
import Options from './Options.js';
import { DialogSystem } from '../gameObjects/dialogSystem.js';
import { QuestManager } from '../gameObjects/questManager.js';

export class StartMap extends Phaser.Scene {
    constructor() {
        super("startMap");
    }

    preload() {
        mapConfig.tilesets.forEach(tileset => {
            this.load.image(tileset.key, tileset.path);
        });

        mapConfig.maps.forEach(map => {
            this.load.tilemapTiledJSON(map.key, map.tilemapPath);
        });

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

        // Animationen
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

        // 2. Dialog-System erstellen
        this.dialogSystem = new DialogSystem(this);
        this.questManager = new QuestManager(this);

        //Events Quests
        this.events.on('quest-accepted', (quest) => {
            console.log(`📜 Quest gestartet: "${quest.title}"`);
        });
        this.events.on('quest-finished', (quest) => {
            console.log(`🏆 Quest abgeschlossen: "${quest.title}"`);
        });
        this.events.on('item-received', (itemId) => {
            console.log(`🎁 Item erhalten: ${itemId}`);
        });
        this.events.on('xp-gained', (xp) => {
            console.log(`⭐ +${xp} XP`);
        });

        // 3. NPC-Manager erstellen
        this.npcManager = new npcManager(this);

        // 4. Map-Manager erstellen
        this.mapManager = new MapManager(this);

        // 5. Map laden (lädt automatisch NPCs aus Tiled + JSON!)
        const startMapKey = mapConfig.maps[0].key;
        this.mapManager.loadMap(startMapKey);

        // 6. Kamera Setup
        this.setupCamera();

        // 👇 KEIN manuelles addNPC() mehr nötig!
        // NPCs werden automatisch aus Tiled + JSON geladen

        // Steuerung
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys("W,A,S,D,ESC,SHIFT,TAB,E");
        this.menuOpen = false;

        // Pause-Menü (HTML)
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

        document.getElementById("resumeBtn").addEventListener("click", () => {
            this.menu.style.display = "none";
            this.menuOpen = false;
        });

        document.getElementById("optionsBtn").addEventListener("click", () => {
            this.scene.pause();
            this.scene.launch("options", { previousScene: this.scene.key });
            this.menu.style.display = "none";
            this.menuOpen = false;
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

    setupCamera() {
        const currentMap = this.mapManager.currentMap;

        if (!currentMap) {
            console.warn("Keine Map geladen - Kamera-Setup übersprungen");
            return;
        }

        const mapWidth = currentMap.widthInPixels;
        const mapHeight = currentMap.heightInPixels;

        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setDeadzone(100, 100);

        const settings = Options.getSettings();
        const zoom = settings?.zoomLevel || 1.0;
        this.cameras.main.setZoom(zoom);

        this.cameras.main.roundPixels = true;
    }

    update() {
        // Dialog-System update (WICHTIG: Zuerst!)
        this.dialogSystem.update();

        // NPCs updaten
        this.npcManager.update();

        // E-Taste für NPC-Interaktion
        if (Phaser.Input.Keyboard.JustDown(this.keys.E) && !this.menuOpen && !this.dialogSystem.isActive) {
            const nearbyNPC = this.npcManager.getNearbyNPC(this.player, 60);

            if (nearbyNPC) {
                nearbyNPC.startDialog(this.dialogSystem);
            }
        }

        // Dialog aktiv → keine Bewegung
        if (this.dialogSystem.isActive) {
            this.player.body.setVelocity(0);
            this.player.anims.stop();
            return;
        }

        // ESC-Menü
        if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
            const visible = this.menu.style.display === "none";
            this.menu.style.display = visible ? "block" : "none";
            this.menuOpen = visible;

            if (this.menuOpen) {
                this.player.body.setVelocity(0);
                this.player.anims.stop();
            }
        }

        // TAB-Menü
        if (Phaser.Input.Keyboard.JustDown(this.keys.TAB)) {
            toggleGenMenu(this.genMenu);
            this.menuOpen = !this.menuOpen;

            if (this.menuOpen) {
                this.player.body.setVelocity(0);
                this.player.anims.stop();
            }
        }

        // Menü offen → keine Bewegung
        if (this.menuOpen) return;

        // Movement
        const speed = this.keys.SHIFT.isDown ? 400 : 200;
        const body = this.player.body;

        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown) vx -= 1;
        else if (this.cursors.right.isDown || this.keys.D.isDown) vx += 1;

        if (this.cursors.up.isDown || this.keys.W.isDown) vy -= 1;
        else if (this.cursors.down.isDown || this.keys.S.isDown) vy += 1;

        if (vx !== 0 && vy !== 0) {
            const inv = 1 / Math.sqrt(2);
            vx *= inv;
            vy *= inv;
        }

        body.setVelocity(vx * speed, vy * speed);

        // Animationen
        if (!this.lastDir) this.lastDir = "down";

        if (vx === 0 && vy === 0) {
            this.player.anims.stop();

            switch (this.lastDir) {
                case "down": this.player.setFrame(0); break;
                case "left": this.player.setFrame(3); break;
                case "right": this.player.setFrame(6); break;
                case "up": this.player.setFrame(9); break;
            }

            return;
        }

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