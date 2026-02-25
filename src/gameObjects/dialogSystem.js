import { NPC } from './npc.js';

/**
 * DialogSystem
 * Unterstützt normalen Dialog UND Quest-Angebote (mit Ja/Nein Auswahl)
 */
export class DialogSystem {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.currentDialog = [];
        this.currentIndex = 0;
        this.npcName = "";

        // Quest-Choice-Modus
        this.isChoiceActive = false;
        this.choiceCallback = null;

        this.createUI();
    }

    createUI() {
        const { width, height } = this.scene.scale;

        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(1000);
        this.container.setVisible(false);

        // === NAME-BOX ===
        const nameBoxY = height - 260;

        this.nameBg = this.scene.add.rectangle(150, nameBoxY, 250, 50, 0x1a1a2e, 1);
        this.nameBg.setStrokeStyle(3, 0xffffff);

        this.nameText = this.scene.add.text(150, nameBoxY, "", {
            fontFamily: "sans-serif",
            fontSize: "24px",
            color: "#ffff00",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // === TEXT-BOX ===
        const textBoxY = height - 150;

        this.dialogBg = this.scene.add.rectangle(
            width / 2, textBoxY,
            width - 100, 180,
            0x000000, 0.9
        );
        this.dialogBg.setStrokeStyle(4, 0xffffff);

        this.dialogText = this.scene.add.text(80, textBoxY - 70, "", {
            fontFamily: "sans-serif",
            fontSize: "22px",
            color: "#ffffff",
            wordWrap: { width: width - 180 },
            lineSpacing: 8
        });

        // === WEITER-PFEIL ===
        this.continueArrow = this.scene.add.text(width - 100, height - 70, "▼", {
            fontFamily: "sans-serif",
            fontSize: "28px",
            color: "#00ff00"
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: this.continueArrow,
            y: '+=10',
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // === CHOICE-BUTTONS (Quest annehmen/ablehnen) ===
        this.choiceContainer = this.scene.add.container(0, 0);
        this.choiceContainer.setScrollFactor(0);
        this.choiceContainer.setDepth(1001);
        this.choiceContainer.setVisible(false);

        const btnY = height - 80;
        const centerX = width / 2;

        // Ja-Button
        this.btnYesBg = this.scene.add.rectangle(centerX - 120, btnY, 180, 50, 0x1a7a1a, 1);
        this.btnYesBg.setStrokeStyle(3, 0x00ff00);
        this.btnYesBg.setInteractive({ useHandCursor: true });

        this.btnYesText = this.scene.add.text(centerX - 120, btnY, "✔ Annehmen", {
            fontFamily: "sans-serif",
            fontSize: "20px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Nein-Button
        this.btnNoBg = this.scene.add.rectangle(centerX + 120, btnY, 180, 50, 0x7a1a1a, 1);
        this.btnNoBg.setStrokeStyle(3, 0xff4444);
        this.btnNoBg.setInteractive({ useHandCursor: true });

        this.btnNoText = this.scene.add.text(centerX + 120, btnY, "✘ Ablehnen", {
            fontFamily: "sans-serif",
            fontSize: "20px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Hover-Effekte
        this.btnYesBg.on('pointerover', () => this.btnYesBg.setFillStyle(0x22aa22));
        this.btnYesBg.on('pointerout', () => this.btnYesBg.setFillStyle(0x1a7a1a));
        this.btnNoBg.on('pointerover', () => this.btnNoBg.setFillStyle(0xaa2222));
        this.btnNoBg.on('pointerout', () => this.btnNoBg.setFillStyle(0x7a1a1a));

        // Click-Events
        this.btnYesBg.on('pointerdown', () => this.resolveChoice(true));
        this.btnNoBg.on('pointerdown', () => this.resolveChoice(false));

        this.choiceContainer.add([
            this.btnYesBg, this.btnYesText,
            this.btnNoBg, this.btnNoText
        ]);

        // Keyboard-Auswahl (1 = Ja, 2 = Nein)
        this.scene.input.keyboard.on('keydown-ONE', () => {
            if (this.isChoiceActive) this.resolveChoice(true);
        });
        this.scene.input.keyboard.on('keydown-TWO', () => {
            if (this.isChoiceActive) this.resolveChoice(false);
        });

        // Alles zum Dialog-Container
        this.container.add([
            this.dialogBg,
            this.nameBg,
            this.nameText,
            this.dialogText,
            this.continueArrow
        ]);
    }

    // ─────────────────────────────────────────
    // NORMALER DIALOG
    // ─────────────────────────────────────────

    startDialog(dialogLines, npcName = "???", npc) {
        if (this.isActive) return;
        this.activeNPC = npc;

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

        this.nameText.setText(this.npcName);
        this.dialogText.setText(this.currentDialog[this.currentIndex]);

        const isLast = this.currentIndex >= this.currentDialog.length - 1;
        this.continueArrow.setVisible(!isLast || this.isChoiceActive);
    }

    nextLine() {
        if (!this.isActive || this.isChoiceActive) return;

        this.currentIndex++;

        // Letzter Dialog-Eintrag und Choice noch ausstehend
        if (this.currentIndex >= this.currentDialog.length && this.pendingChoice) {
            this.showChoice(this.pendingChoice);
            this.pendingChoice = null;
            return;
        }

        this.showCurrentLine();
    }

    endDialog() {
        this.isActive = false;
        this.isChoiceActive = false;
        this.pendingChoice = null;
        this.container.setVisible(false);
        this.choiceContainer.setVisible(false);
        this.currentDialog = [];
        this.currentIndex = 0;

        if (this.activeNPC) {
            this.activeNPC.isTalking = false;
            this.activeNPC.randomMovement(true);
            this.activeNPC = null;
        }
    }

    // ─────────────────────────────────────────
    // QUEST-DIALOG
    // ─────────────────────────────────────────

    /**
     * Startet einen Dialog mit nachfolgendem Quest-Angebot
     * @param {string[]} lines       - Dialog-Zeilen vor der Auswahl
     * @param {string}   npcName
     * @param {NPC}      npc
     * @param {object}   quest       - Quest-Definition
     * @param {Function} onAccept    - Callback wenn angenommen
     * @param {Function} onDecline   - Callback wenn abgelehnt
     * @param acceptLines
     * @param declineLines
     */
    startQuestDialog(lines, npcName, npc, quest, onAccept, onDecline, acceptLines = [], declineLines = []) {
        if (this.isActive) return;
        this.startDialog(lines, npcName, npc);
        this.pendingChoice = { quest, onAccept, onDecline, acceptLines, declineLines };
    }

    showChoice({ quest, onAccept, onDecline, acceptLines, declineLines }) {
        this.isChoiceActive = true;
        this.choiceCallback = { onAccept, onDecline, acceptLines, declineLines };
        this.choiceContainer.setVisible(true);
        this.continueArrow.setVisible(false);
        this.dialogText.setText(`[Quest] ${quest.title}\n\n${quest.description}\n\nNimmst du die Quest an?`);
    }

    resolveChoice(accepted) {
        if (!this.isChoiceActive) return;

        this.isChoiceActive = false;
        this.choiceContainer.setVisible(false);

        const cb = this.choiceCallback;
        this.choiceCallback = null;

        const followUpLines = accepted
            ? (cb?.acceptLines || [])
            : (cb?.declineLines || []);

        if (accepted) cb?.onAccept?.();
        else cb?.onDecline?.();

        if (followUpLines.length > 0) {
            this.currentDialog = followUpLines;
            this.currentIndex = 0;
            this.continueArrow.setVisible(true);
            this.showCurrentLine();
        } else {
            this.endDialog();
        }
    }

    // ─────────────────────────────────────────
    // UPDATE (Keyboard-Input)
    // ─────────────────────────────────────────

    update() {
        if (!this.isActive || this.isChoiceActive) return;

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