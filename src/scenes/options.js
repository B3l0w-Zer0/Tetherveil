import { sounds, playSound } from '../../assets/audio/sounds/sounds.js';

export default class Options extends Phaser.Scene {
    constructor() {
        super("options");

        this.defaultSettings = {
            // Audio
            masterVolume: 1.0,
            musicVolume: 0.7,
            sfxVolume: 0.8,

            // Grafik
            zoomLevel: 1.0,  // 👈 Nur Zoom
            fullscreen: false,
            showFPS: false,
            particleEffects: true,
            screenShake: true,

            // Keybindings
            keybindings: {
                moveUp: 'W',
                moveDown: 'S',
                moveLeft: 'A',
                moveRight: 'D',
                interact: 'E',
                inventory: 'I',
                map: 'M',
                pause: 'ESC',
                ability1: 'Q',
                ability2: 'R',
                sprint: 'SHIFT'
            }
        };

        this.settings = this.loadSettings();
        this.currentTab = 'audio';
        this.waitingForKey = null;
    }

    create() {
        const { width, height } = this.scale;

        this.previousScene = this.scene.settings.data?.previousScene || "Menu";

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setAlpha(0.8);

        this.add.text(width / 2, 50, "Optionen", {
            fontFamily: "serif",
            fontSize: "48px",
            color: "#ffffff"
        }).setOrigin(0.5).setScrollFactor(0);

        this.createTabs(width);
        this.optionsContainer = this.add.container(0, 0);
        this.createBackButton(width, height);
        this.switchTab('audio');
    }

    createTabs(width) {
        const tabs = ['Audio', 'Grafik', 'Steuerung'];
        const tabWidth = 200;
        const tabSpacing = 20;
        const startX = width / 2 - (tabs.length * (tabWidth + tabSpacing)) / 2 + tabWidth / 2;

        this.tabButtons = {};

        tabs.forEach((tabName, index) => {
            const tabKey = tabName.toLowerCase();
            const x = startX + index * (tabWidth + tabSpacing);

            const button = this.add.text(x, 120, tabName, {
                fontFamily: "sans-serif",
                fontSize: "28px",
                color: "#dddddd",
                backgroundColor: "#333333",
                padding: { x: 20, y: 10 }
            })
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setInteractive({ useHandCursor: true })
                .on("pointerover", () => {
                    if (this.currentTab !== tabKey) {
                        button.setStyle({ backgroundColor: "#444444" });
                    }
                })
                .on("pointerout", () => {
                    if (this.currentTab !== tabKey) {
                        button.setStyle({ backgroundColor: "#333333" });
                    }
                })
                .on("pointerdown", () => {
                    playSound(sounds.click);
                    this.switchTab(tabKey);
                });

            this.tabButtons[tabKey] = button;
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        Object.keys(this.tabButtons).forEach(key => {
            if (key === tabName) {
                this.tabButtons[key].setStyle({ backgroundColor: "#555555", color: "#ffffff" });
            } else {
                this.tabButtons[key].setStyle({ backgroundColor: "#333333", color: "#dddddd" });
            }
        });

        this.optionsContainer.removeAll(true);

        switch (tabName) {
            case 'audio':
                this.createAudioOptions();
                break;
            case 'grafik':
                this.createGraphicsOptions();
                break;
            case 'steuerung':
                this.createControlOptions();
                break;
        }
    }

    createAudioOptions() {
        const { width } = this.scale;
        const startY = 200;
        const spacing = 100;

        this.createSlider(width / 2, startY, "Gesamtlautstärke", 'masterVolume', (value) => {
            this.settings.masterVolume = value;
            this.game.sound.volume = value;
            this.saveSettings();
        });

        this.createSlider(width / 2, startY + spacing, "Musiklautstärke", 'musicVolume', (value) => {
            this.settings.musicVolume = value;
            this.saveSettings();
        });

        this.createSlider(width / 2, startY + spacing * 2, "Effektlautstärke", 'sfxVolume', (value) => {
            this.settings.sfxVolume = value;
            this.saveSettings();
        });
    }

    createGraphicsOptions() {
        const { width } = this.scale;
        const startY = 250;
        const spacing = 80;

        // Zoom-Auswahl
        this.createZoomSelect(width / 2, startY);

        const options = [
            { label: "Vollbild", key: 'fullscreen', action: () => this.toggleFullscreen() },
            { label: "FPS anzeigen", key: 'showFPS', action: () => this.toggleFPS() },
            { label: "Partikeleffekte", key: 'particleEffects' },
            { label: "Bildschirmwackeln", key: 'screenShake' }
        ];

        options.forEach((option, index) => {
            this.createToggle(width / 2, startY + (index + 1) * spacing, option.label, option.key, option.action);
        });
    }

    createZoomSelect(x, y) {
        const zoomLevels = [
            { label: '50%', value: 0.5 },
            { label: '60%', value: 0.6 },
            { label: '70%', value: 0.7 },
            { label: '75%', value: 0.75 },
            { label: '80%', value: 0.8 },
            { label: '90%', value: 0.9 },
            { label: '100%', value: 1.0 },
            { label: '110%', value: 1.1 },
            { label: '125%', value: 1.25 },
            { label: '150%', value: 1.5 },
            { label: '175%', value: 1.75 },
            { label: '200%', value: 2.0 }
        ];

        const labelText = this.add.text(x - 300, y, "Zoom", {
            fontFamily: "sans-serif",
            fontSize: "28px",
            color: "#ffffff"
        }).setOrigin(0, 0.5);

        const currentZoom = this.settings.zoomLevel || 1.0;
        const currentLabel = zoomLevels.find(z => z.value === currentZoom)?.label || '100%';

        // Minus Button
        const minusButton = this.add.text(x + 80, y, "−", {
            fontFamily: "sans-serif",
            fontSize: "32px",
            color: "#ffffff",
            backgroundColor: "#444444",
            padding: { x: 12, y: 4 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => minusButton.setStyle({ backgroundColor: "#555555" }))
            .on("pointerout", () => minusButton.setStyle({ backgroundColor: "#444444" }))
            .on("pointerdown", () => {
                playSound(sounds.click);
                const currentIndex = zoomLevels.findIndex(z => z.value === this.settings.zoomLevel);
                if (currentIndex > 0) {
                    this.settings.zoomLevel = zoomLevels[currentIndex - 1].value;
                    zoomText.setText(zoomLevels[currentIndex - 1].label);
                    this.applyZoomToAllScenes(this.settings.zoomLevel);
                    this.saveSettings();
                }
            });

        // Zoom Anzeige
        const zoomText = this.add.text(x + 150, y, currentLabel, {
            fontFamily: "monospace",
            fontSize: "24px",
            color: "#ffffff",
            backgroundColor: "#333333",
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5);

        // Plus Button
        const plusButton = this.add.text(x + 220, y, "+", {
            fontFamily: "sans-serif",
            fontSize: "32px",
            color: "#ffffff",
            backgroundColor: "#444444",
            padding: { x: 10, y: 4 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => plusButton.setStyle({ backgroundColor: "#555555" }))
            .on("pointerout", () => plusButton.setStyle({ backgroundColor: "#444444" }))
            .on("pointerdown", () => {
                playSound(sounds.click);
                const currentIndex = zoomLevels.findIndex(z => z.value === this.settings.zoomLevel);
                if (currentIndex < zoomLevels.length - 1) {
                    this.settings.zoomLevel = zoomLevels[currentIndex + 1].value;
                    zoomText.setText(zoomLevels[currentIndex + 1].label);
                    this.applyZoomToAllScenes(this.settings.zoomLevel);
                    this.saveSettings();
                }
            });

        this.optionsContainer.add([labelText, minusButton, zoomText, plusButton]);
    }

    applyZoomToAllScenes(zoom) {
        this.game.scene.scenes.forEach(scene => {
            if (scene.cameras && scene.cameras.main && scene.scene.key !== 'FPSDisplay') {
                scene.cameras.main.setZoom(zoom);
            }
        });
    }

    createControlOptions() {
        const { width } = this.scale;
        const startY = 200;
        const spacing = 60;

        const keyLabels = {
            moveUp: "Hoch",
            moveDown: "Runter",
            moveLeft: "Links",
            moveRight: "Rechts",
            interact: "Interagieren",
            inventory: "Inventar",
            map: "Karte",
            pause: "Pause",
            ability1: "Fähigkeit 1",
            ability2: "Fähigkeit 2",
            sprint: "Rennen"
        };

        let yPos = startY;
        Object.keys(this.settings.keybindings).forEach((key, index) => {
            if (index % 2 === 0 && index > 0) {
                yPos += spacing;
            }

            const xPos = index % 2 === 0 ? width / 2 - 200 : width / 2 + 200;
            this.createKeybindButton(xPos, yPos, keyLabels[key], key);
        });

        const resetButton = this.add.text(width / 2, startY + spacing * 7, "Standard wiederherstellen", {
            fontFamily: "sans-serif",
            fontSize: "24px",
            color: "#ff6666",
            backgroundColor: "#333333",
            padding: { x: 15, y: 8 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => resetButton.setStyle({ backgroundColor: "#555555" }))
            .on("pointerout", () => resetButton.setStyle({ backgroundColor: "#333333" }))
            .on("pointerdown", () => {
                playSound(sounds.click);
                this.resetKeybindings();
            });

        this.optionsContainer.add(resetButton);
    }

    createSlider(x, y, label, settingKey, onChange) {
        const labelText = this.add.text(x - 300, y, label, {
            fontFamily: "sans-serif",
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0, 0.5);

        const sliderBg = this.add.rectangle(x + 50, y, 300, 10, 0x555555).setOrigin(0, 0.5);

        const currentValue = this.settings[settingKey];
        const sliderFill = this.add.rectangle(x + 50, y, 300 * currentValue, 10, 0x66ff66)
            .setOrigin(0, 0.5);

        const sliderKnob = this.add.circle(x + 50 + 300 * currentValue, y, 15, 0xffffff)
            .setInteractive({ useHandCursor: true, draggable: true });

        const valueText = this.add.text(x + 380, y, `${Math.round(currentValue * 100)}%`, {
            fontFamily: "sans-serif",
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0, 0.5);

        this.input.on('drag', (pointer, gameObject, dragX) => {
            if (gameObject === sliderKnob) {
                const minX = x + 50;
                const maxX = x + 350;
                const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);

                sliderKnob.x = clampedX;
                const value = (clampedX - minX) / 300;
                sliderFill.width = 300 * value;
                valueText.setText(`${Math.round(value * 100)}%`);

                if (onChange) onChange(value);
            }
        });

        this.optionsContainer.add([labelText, sliderBg, sliderFill, sliderKnob, valueText]);
    }

    createToggle(x, y, label, settingKey, onToggle) {
        const isEnabled = this.settings[settingKey];

        const labelText = this.add.text(x - 200, y, label, {
            fontFamily: "sans-serif",
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0, 0.5);

        const toggleBg = this.add.rectangle(x + 150, y, 80, 40, isEnabled ? 0x66ff66 : 0x555555)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        const toggleText = this.add.text(x + 150, y, isEnabled ? "AN" : "AUS", {
            fontFamily: "sans-serif",
            fontSize: "20px",
            color: "#000000"
        }).setOrigin(0.5);

        toggleBg.on("pointerdown", () => {
            playSound(sounds.click);
            this.settings[settingKey] = !this.settings[settingKey];

            toggleBg.setFillStyle(this.settings[settingKey] ? 0x66ff66 : 0x555555);
            toggleText.setText(this.settings[settingKey] ? "AN" : "AUS");

            if (onToggle) onToggle();
            this.saveSettings();
        });

        this.optionsContainer.add([labelText, toggleBg, toggleText]);
    }

    createKeybindButton(x, y, label, bindingKey) {
        const currentKey = this.settings.keybindings[bindingKey];

        const labelText = this.add.text(x - 80, y, label, {
            fontFamily: "sans-serif",
            fontSize: "20px",
            color: "#ffffff"
        }).setOrigin(1, 0.5);

        const keyButton = this.add.text(x + 20, y, currentKey, {
            fontFamily: "monospace",
            fontSize: "20px",
            color: "#ffffff",
            backgroundColor: "#444444",
            padding: { x: 15, y: 8 }
        })
            .setOrigin(0, 0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => {
                if (this.waitingForKey !== bindingKey) {
                    keyButton.setStyle({ backgroundColor: "#555555" });
                }
            })
            .on("pointerout", () => {
                if (this.waitingForKey !== bindingKey) {
                    keyButton.setStyle({ backgroundColor: "#444444" });
                }
            })
            .on("pointerdown", () => {
                playSound(sounds.click);
                this.waitForKeyInput(bindingKey, keyButton);
            });

        this.optionsContainer.add([labelText, keyButton]);
    }

    waitForKeyInput(bindingKey, button) {
        this.waitingForKey = bindingKey;
        button.setText("...");
        button.setStyle({ backgroundColor: "#ff8800" });

        const keyHandler = (event) => {
            event.preventDefault();

            let keyName = event.key.toUpperCase();

            if (keyName === 'ESCAPE') keyName = 'ESC';
            if (keyName === ' ') keyName = 'SPACE';
            if (keyName === 'ARROWUP') keyName = '↑';
            if (keyName === 'ARROWDOWN') keyName = '↓';
            if (keyName === 'ARROWLEFT') keyName = '←';
            if (keyName === 'ARROWRIGHT') keyName = '→';

            const existingBinding = Object.keys(this.settings.keybindings).find(
                key => key !== bindingKey && this.settings.keybindings[key] === keyName
            );

            if (existingBinding) {
                button.setText(this.settings.keybindings[bindingKey]);
                button.setStyle({ backgroundColor: "#ff0000" });

                setTimeout(() => {
                    button.setStyle({ backgroundColor: "#444444" });
                }, 500);
            } else {
                this.settings.keybindings[bindingKey] = keyName;
                button.setText(keyName);
                button.setStyle({ backgroundColor: "#66ff66" });

                setTimeout(() => {
                    button.setStyle({ backgroundColor: "#444444" });
                }, 300);

                this.saveSettings();
            }

            this.waitingForKey = null;
            this.input.keyboard.off('keydown', keyHandler);
        };

        this.input.keyboard.once('keydown', keyHandler);
    }

    resetKeybindings() {
        this.settings.keybindings = { ...this.defaultSettings.keybindings };
        this.saveSettings();
        this.switchTab('steuerung');
    }

    toggleFullscreen() {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
    }

    toggleFPS() {
        this.game.events.emit('fpsToggled', this.settings.showFPS);
    }

    createBackButton(width, height) {
        const backButton = this.add.text(width / 2, height - 60, "Zurück", {
            fontFamily: "sans-serif",
            fontSize: "28px",
            color: "#dddddd",
            backgroundColor: "#333333",
            padding: { x: 30, y: 10 }
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => backButton.setStyle({ backgroundColor: "#555555" }))
            .on("pointerout", () => backButton.setStyle({ backgroundColor: "#333333" }))
            .on("pointerdown", () => {
                playSound(sounds.click);

                // Prüfen ob vorherige Szene pausiert ist
                const prevScene = this.scene.get(this.previousScene);
                if (prevScene && prevScene.scene.isPaused()) {
                    // Options stoppen und vorherige Szene fortsetzen
                    this.scene.stop();
                    this.scene.resume(this.previousScene);
                } else {
                    // Normal zurück zum Menü
                    this.scene.start(this.previousScene);
                }
            });
    }

    saveSettings() {
        localStorage.setItem('tetherVeilSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('tetherVeilSettings');
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...this.defaultSettings, ...parsed };
        }
        return { ...this.defaultSettings };
    }

    static getSettings() {
        const saved = localStorage.getItem('tetherVeilSettings');
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    }

    static isKeyPressed(action, keyCode) {
        const settings = this.getSettings();
        if (!settings) return false;

        const boundKey = settings.keybindings[action];
        return boundKey === keyCode.toUpperCase();
    }
}