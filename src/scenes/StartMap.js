import {createGenMenu, toggleGenMenu} from '../menus/mapMenuGeneral.js';
import npcManager from '../gameObjects/npcManager.js';
export class StartMap extends Phaser.Scene {
  constructor() {
    super("startMap");
  }

  preload() {
    // Texturen, falls du später Sprites nutzt
    this.load.image("tiles", "assets/tiles/ChatGPT Image 11. Nov. 2025, 23_07_43.png");
    this.load.tilemapTiledJSON("map", "src/data/mapData/Fick dich.tmj");

  }

  create() {
    // Spielfeldgröße (größer als Bildschirm, z. B. 2000x2000)
    const worldWidth = 2000;
    const worldHeight = 2000;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Spieler
    this.player = this.add.rectangle(450, 300, 32, 32, 0x00ff00);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true); // verhindert, dass er den Rand verlässt

    // Kamera folgt dem Spieler dynamisch
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08); // sanftes Folgen
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    this.map = this.make.tilemap({ key: "map" });
    this.tileset = this.map.addTilesetImage("Fick dich", "tiles");

// Layer erzeugen
    this.ground = this.map.createLayer("Ground", this.tileset, 0, 0);
    this.walls = this.map.createLayer("Walls", this.tileset, 0, 0);

// Kollision aktivieren
    this.walls.setCollisionByProperty({ collides: true });

    // Kollision Spieler ↔ Objekte
    this.physics.add.collider(this.player, this.walls);
    this.ground.setDepth(0);  // Hintergrund
    this.player.setDepth(1);  // Player über Boden
    this.walls.setDepth(2);
    this.walls.setCollision([215]);

    // Steuerung Keys anlegen
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D,ESC,SHIFT,TAB,E");

    //Variable für offen/zu Menü
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
    this.menu.style.zIndex = "1000"; // damit es über dem Canvas liegt

// Buttons als HTML
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
      this.menuOpen = false; // Bewegung wieder aktivieren
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
      this.scene.start("Menu"); // 🔙 gehe zurück zum Hauptmenü
    });

    // Erstellen General Menu
    this.genMenu = createGenMenu();

    // Vollbildsteuerung
    this.input.keyboard.on("keydown-F11", (event) => {
      event.preventDefault();
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

      // NPC-Manager
      this.npcManager = new npcManager(this);

      // Beispiel-NPC
      this.npcManager.addNPC({
          x: 370,
          y: 250,
          texture: "npc",
          name: "Bob",
          dialog: ["Hallo!", "Wie geht’s?"],
          speed: 35
      });


  }

  update() {
    if (!this.menuOpen) {
      let speed = this.keys.SHIFT.isDown ? 400 : 200;
      const body = this.player.body;
      body.setVelocity(0);

      this.npcManager.update();

      if (this.cursors.left.isDown || this.keys.A.isDown) body.setVelocityX(-speed);
      else if (this.cursors.right.isDown || this.keys.D.isDown) body.setVelocityX(speed);

      if (this.cursors.up.isDown || this.keys.W.isDown) body.setVelocityY(-speed);
      else if (this.cursors.down.isDown || this.keys.S.isDown) body.setVelocityY(speed);
    } else {
      // Wenn Menü offen → Bewegung stoppen
      this.player.body.setVelocity(0);
    }

    // 🟥 ESC-Menü öffnen/schließen
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      const visible = this.menu.style.display === "none";
      this.menu.style.display = visible ? "block" : "none";
      this.menuOpen = visible; // Status aktualisieren
    }

    // 🟦 General Menu öffnen/schließen
    if (Phaser.Input.Keyboard.JustDown(this.keys.TAB)) {
      toggleGenMenu(this.genMenu);
      // Menüstatus umschalten
      this.menuOpen = !this.menuOpen;
    }
  }
}

