export class DialogSystem {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.currentDialog = [];
        this.currentIndex = 0;
        this.npcName = "";

        this.createUI();
    }

    createUI() {
        const { width, height } = this.scene.scale;

        // Container für gesamte Dialog-UI
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(1000);
        this.container.setVisible(false);

        // === NAME-BOX (oben) ===
        const nameBoxY = height - 260;

        this.nameBg = this.scene.add.rectangle(
            150,           // X-Position links
            nameBoxY,      // Y-Position
            250,           // Breite
            50,            // Höhe
            0x1a1a2e,      // Dunkles Blau
            1
        );
        this.nameBg.setStrokeStyle(3, 0xffffff);

        this.nameText = this.scene.add.text(150, nameBoxY, "", {
            fontFamily: "sans-serif",
            fontSize: "24px",
            color: "#ffff00",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // === TEXT-BOX (unten) ===
        const textBoxY = height - 150;

        this.dialogBg = this.scene.add.rectangle(
            width / 2,
            textBoxY,
            width - 100,
            180,
            0x000000,
            0.9
        );
        this.dialogBg.setStrokeStyle(4, 0xffffff);

        this.dialogText = this.scene.add.text(
            80,              // Links mit Padding
            textBoxY - 70,   // Oben in der Box
            "",
            {
                fontFamily: "sans-serif",
                fontSize: "22px",
                color: "#ffffff",
                wordWrap: { width: width - 180 },
                lineSpacing: 8
            }
        );

        // === WEITER-PFEIL (rechts unten) ===
        this.continueArrow = this.scene.add.text(
            width - 100,
            height - 70,
            "▼",
            {
                fontFamily: "sans-serif",
                fontSize: "28px",
                color: "#00ff00"
            }
        ).setOrigin(0.5);

        // Alles zum Container hinzufügen
        this.container.add([
            this.dialogBg,
            this.nameBg,
            this.nameText,
            this.dialogText,
            this.continueArrow
        ]);

        // Pfeil Animation (hüpft)
        this.scene.tweens.add({
            targets: this.continueArrow,
            y: '+=10',
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    startDialog(dialogLines, npcName = "???") {
        if (this.isActive) return;

        this.currentDialog = Array.isArray(dialogLines) ? dialogLines : [dialogLines];
        this.currentIndex = 0;
        this.npcName = npcName;
        this.isActive = true;

        this.container.setVisible(true);
        this.showCurrentLine();
    }

    showCurrentLine() {
        if (this.currentIndex >= this.currentDialog.length) {
            this.endDialog();
            return;
        }

        // Name anzeigen
        this.nameText.setText(this.npcName);

        // Text anzeigen
        this.dialogText.setText(this.currentDialog[this.currentIndex]);

        // Pfeil verstecken wenn letzter Dialog
        if (this.currentIndex >= this.currentDialog.length - 1) {
            this.continueArrow.setVisible(false);
        } else {
            this.continueArrow.setVisible(true);
        }
    }

    nextLine() {
        if (!this.isActive) return;

        this.currentIndex++;
        this.showCurrentLine();
    }

    endDialog() {
        this.isActive = false;
        this.container.setVisible(false);
        this.currentDialog = [];
        this.currentIndex = 0;
    }

    update() {
        if (!this.isActive) return;

        // Enter/Space/E zum Fortschreiten
        const enterKey = this.scene.input.keyboard.addKey('ENTER');
        const spaceKey = this.scene.input.keyboard.addKey('SPACE');
        const eKey = this.scene.input.keyboard.addKey('E');

        if (Phaser.Input.Keyboard.JustDown(enterKey) ||
            Phaser.Input.Keyboard.JustDown(spaceKey) ||
            Phaser.Input.Keyboard.JustDown(eKey)) {
            this.nextLine();
        }
    }
}