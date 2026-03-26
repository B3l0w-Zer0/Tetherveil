import { sounds, playSound } from '../../assets/audio/sounds/sounds.js';

export default class Options extends Phaser.Scene {
    constructor() {
        super("options");

        this.defaultSettings = {
            masterVolume: 1.0,
            musicVolume: 0.7,
            sfxVolume: 0.8,
            voiceVolume: 1.0,
            muteAll: false,
            zoomLevel: 1.0,
            fullscreen: false,
            showFPS: false,
            particleEffects: true,
            screenShake: true,
            brightness: 1.0,
            colorblindMode: 'none',
            pixelFilter: false,
            textSpeed: 'normal',
            difficulty: 'normal',
            autoSave: true,
            showNotifications: true,
            language: 'de',
            largeText: false,
            highContrast: false,
            reduceAnimations: false,
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
        this.injectStyles();
        this.createHTMLUI(width, height);
        this.input.enabled = false;
    }

    addTitle(el, text) {
        const t = document.createElement('div');
        t.className = 'opt-section-title';
        t.textContent = text;
        el.appendChild(t);
    }

    injectStyles() {
        if (document.getElementById('options-styles')) return;
        const style = document.createElement('style');
        style.id = 'options-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap');
            .opt-overlay {
                position: absolute; inset: 0;
                background: radial-gradient(ellipse at 20% 50%, #0d0d1a 0%, #050508 60%, #000 100%);
                display: flex; align-items: center; justify-content: center;
                z-index: 5000; pointer-events: all;
                font-family: 'Crimson Pro', serif;
            }
            .opt-overlay::before {
                content: ''; position: absolute; inset: 0;
                background-image:
                    repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 41px),
                    repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 41px);
                pointer-events: none;
            }
            .opt-panel {
                width: 820px; max-height: 88vh;
                background: linear-gradient(160deg, #0e0e1c 0%, #080810 100%);
                border: 1px solid rgba(180,150,80,0.3); border-radius: 2px;
                box-shadow: 0 0 0 1px rgba(180,150,80,0.08), 0 0 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(180,150,80,0.15);
                display: flex; flex-direction: column; overflow: hidden; position: relative;
            }
            .opt-panel::before {
                content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
                background: linear-gradient(90deg, transparent, rgba(180,150,80,0.6), rgba(220,190,100,0.8), rgba(180,150,80,0.6), transparent);
            }
            .opt-header { padding: 28px 40px 20px; border-bottom: 1px solid rgba(180,150,80,0.12); }
            .opt-title {
                font-family: 'Cinzel', serif; font-size: 11px; font-weight: 600;
                letter-spacing: 6px; text-transform: uppercase; color: rgba(180,150,80,0.7); margin: 0 0 4px 0;
            }
            .opt-subtitle { font-family: 'Cinzel', serif; font-size: 26px; font-weight: 700; color: #e8e0d0; margin: 0; letter-spacing: 2px; }
            .opt-tabs { display: flex; padding: 0 40px; border-bottom: 1px solid rgba(180,150,80,0.1); overflow-x: auto; }
            .opt-tab {
                font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
                color: rgba(200,180,140,0.45); padding: 14px 20px; cursor: pointer;
                border: none; background: none; border-bottom: 2px solid transparent;
                margin-bottom: -1px; transition: all 0.2s ease; white-space: nowrap;
            }
            .opt-tab:hover { color: rgba(200,180,140,0.75); }
            .opt-tab.active { color: #c8a84b; border-bottom-color: #c8a84b; }
            .opt-content { flex: 1; overflow-y: auto; padding: 32px 40px; display: flex; flex-direction: column; gap: 6px; }
            .opt-content::-webkit-scrollbar { width: 4px; }
            .opt-content::-webkit-scrollbar-thumb { background: rgba(180,150,80,0.3); border-radius: 2px; }
            .opt-section-title {
                font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 4px; text-transform: uppercase;
                color: rgba(180,150,80,0.5); margin: 20px 0 10px; padding-bottom: 6px;
                border-bottom: 1px solid rgba(180,150,80,0.08);
            }
            .opt-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.03); gap: 20px; }
            .opt-row:last-child { border-bottom: none; }
            .opt-label { font-size: 16px; color: #c8c0b0; font-weight: 300; flex: 1; letter-spacing: 0.3px; }
            .opt-desc { font-size: 12px; color: rgba(180,160,120,0.4); font-style: italic; margin-top: 2px; }
            .opt-label-wrap { display: flex; flex-direction: column; flex: 1; }
            .opt-slider-wrap { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
            .opt-slider { -webkit-appearance: none; width: 180px; height: 2px; outline: none; border-radius: 1px; cursor: pointer; }
            .opt-slider::-webkit-slider-thumb {
                -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%;
                background: #c8a84b; cursor: pointer; box-shadow: 0 0 8px rgba(200,168,75,0.5); transition: transform 0.15s;
            }
            .opt-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
            .opt-slider-val { font-family: 'Cinzel', serif; font-size: 12px; color: #c8a84b; width: 36px; text-align: right; }
            .opt-toggle {
                width: 44px; height: 24px; background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
                cursor: pointer; position: relative; transition: all 0.25s ease; flex-shrink: 0;
            }
            .opt-toggle.on { background: rgba(200,168,75,0.25); border-color: rgba(200,168,75,0.5); }
            .opt-toggle::after {
                content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px;
                border-radius: 50%; background: rgba(255,255,255,0.3); transition: all 0.25s ease;
            }
            .opt-toggle.on::after { left: 23px; background: #c8a84b; box-shadow: 0 0 6px rgba(200,168,75,0.6); }
            .opt-select-group { display: flex; gap: 4px; flex-shrink: 0; }
            .opt-select-btn {
                font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 1px; padding: 6px 12px;
                background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
                color: rgba(200,180,140,0.5); cursor: pointer; transition: all 0.15s; border-radius: 1px;
            }
            .opt-select-btn:hover { background: rgba(255,255,255,0.08); color: rgba(200,180,140,0.8); }
            .opt-select-btn.active { background: rgba(200,168,75,0.15); border-color: rgba(200,168,75,0.5); color: #c8a84b; }
            .opt-zoom-ctrl { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
            .opt-zoom-btn {
                width: 28px; height: 28px; background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1); color: rgba(200,180,140,0.7);
                cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;
                transition: all 0.15s; border-radius: 1px;
            }
            .opt-zoom-btn:hover { background: rgba(200,168,75,0.15); border-color: rgba(200,168,75,0.4); color: #c8a84b; }
            .opt-zoom-val {
                font-family: 'Cinzel', serif; font-size: 13px; color: #c8a84b;
                width: 52px; text-align: center; border: 1px solid rgba(200,168,75,0.2);
                padding: 4px 0; background: rgba(200,168,75,0.05);
            }
            .opt-keybind { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
            .opt-keybind-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
            .opt-keybind-label { font-size: 14px; color: rgba(200,180,140,0.6); font-weight: 300; }
            .opt-key-btn {
                font-family: 'Cinzel', serif; font-size: 11px; padding: 5px 12px;
                background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
                color: #c8c0b0; cursor: pointer; min-width: 52px; text-align: center;
                transition: all 0.15s; letter-spacing: 1px; border-radius: 1px;
            }
            .opt-key-btn:hover { background: rgba(200,168,75,0.1); border-color: rgba(200,168,75,0.3); }
            .opt-key-btn.waiting { background: rgba(200,168,75,0.15); border-color: #c8a84b; color: #c8a84b; animation: pulse-gold 1s infinite; }
            @keyframes pulse-gold {
                0%, 100% { box-shadow: 0 0 0 rgba(200,168,75,0); }
                50% { box-shadow: 0 0 8px rgba(200,168,75,0.4); }
            }
            .opt-footer { padding: 16px 40px 24px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(180,150,80,0.1); }
            .opt-btn-reset {
                font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
                color: rgba(200,100,80,0.5); background: none; border: 1px solid rgba(200,100,80,0.2);
                padding: 8px 16px; cursor: pointer; transition: all 0.2s; border-radius: 1px;
            }
            .opt-btn-reset:hover { color: rgba(200,100,80,0.8); border-color: rgba(200,100,80,0.4); background: rgba(200,100,80,0.05); }
            .opt-btn-back {
                font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
                color: #c8a84b; background: rgba(200,168,75,0.08); border: 1px solid rgba(200,168,75,0.3);
                padding: 10px 28px; cursor: pointer; transition: all 0.2s; border-radius: 1px; position: relative; overflow: hidden;
            }
            .opt-btn-back::before {
                content: ''; position: absolute; inset: 0;
                background: linear-gradient(90deg, transparent, rgba(200,168,75,0.1), transparent);
                transform: translateX(-100%); transition: transform 0.3s ease;
            }
            .opt-btn-back:hover::before { transform: translateX(100%); }
            .opt-btn-back:hover { background: rgba(200,168,75,0.14); border-color: rgba(200,168,75,0.6); box-shadow: 0 0 16px rgba(200,168,75,0.15); }
        `;
        document.head.appendChild(style);
    }

    createHTMLUI(width, height) {
        this.optDiv = document.createElement('div');
        this.optDiv.classList.add('opt-overlay');
        this.optDiv.id = 'options-overlay';

        this.optDiv.innerHTML = `
            <div class="opt-panel">
                <div class="opt-header">
                    <p class="opt-title">Tether Veil</p>
                    <h1 class="opt-subtitle">Einstellungen</h1>
                </div>
                <div class="opt-tabs" id="opt-tabs"></div>
                <div class="opt-content" id="opt-content"></div>
                <div class="opt-footer">
                    <button class="opt-btn-reset" id="opt-reset">Standard wiederherstellen</button>
                    <button class="opt-btn-back" id="opt-back">Zurück</button>
                </div>
            </div>
        `;

        document.getElementById('game-container').appendChild(this.optDiv);
        this.buildTabs();
        this.showTab('audio');
        document.getElementById('opt-back').addEventListener('click', () => this.goBack());
        document.getElementById('opt-reset').addEventListener('click', () => this.resetAll());
    }

    buildTabs() {
        const tabs = [
            { key: 'audio',            label: 'Audio' },
            { key: 'grafik',           label: 'Grafik' },
            { key: 'gameplay',         label: 'Gameplay' },
            { key: 'steuerung',        label: 'Steuerung' },
            { key: 'barrierefreiheit', label: 'Barrierefreiheit' },
        ];

        const tabsEl = document.getElementById('opt-tabs');
        tabs.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'opt-tab';
            btn.textContent = t.label;
            btn.dataset.tab = t.key;
            btn.addEventListener('click', () => this.showTab(t.key));
            tabsEl.appendChild(btn);
        });
    }

    showTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.opt-tab').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === tab);
        });

        const content = document.getElementById('opt-content');
        content.innerHTML = '';

        switch(tab) {
            case 'audio':            this.buildAudio(content); break;
            case 'grafik':           this.buildGrafik(content); break;
            case 'gameplay':         this.buildGameplay(content); break;
            case 'steuerung':        this.buildSteuerung(content); break;
            case 'barrierefreiheit': this.buildBarrierefreiheit(content); break;
        }
    }

    buildAudio(el) {
        this.addTitle(el, 'Lautstärke');
        this.addSlider(el, 'Gesamtlautstärke', 'masterVolume', v => { this.game.sound.volume = v; });
        this.addSlider(el, 'Musik', 'musicVolume');
        this.addSlider(el, 'Soundeffekte', 'sfxVolume');
        this.addSlider(el, 'Stimmen', 'voiceVolume');
        this.addTitle(el, 'Optionen');
        this.addToggle(el, 'Alles stummschalten', 'muteAll', '', v => { this.game.sound.mute = v; });
    }

    buildGrafik(el) {
        this.addTitle(el, 'Anzeige');
        this.addZoom(el);
        this.addSlider(el, 'Helligkeit', 'brightness', v => {
            document.getElementById('game-container').style.filter = `brightness(${v})`;
        });
        this.addToggle(el, 'Vollbild', 'fullscreen', '', () => this.toggleFullscreen());
        this.addTitle(el, 'Effekte');
        this.addToggle(el, 'Partikeleffekte', 'particleEffects');
        this.addToggle(el, 'Bildschirmwackeln', 'screenShake');
        this.addToggle(el, 'Pixel-Filter', 'pixelFilter', 'Retro-Look für Sprites');
        this.addToggle(el, 'FPS anzeigen', 'showFPS', '', () => {
            this.game.events.emit('fpsToggled', this.settings.showFPS);
        });
        this.addTitle(el, 'Farbmodus');
        this.addSelect(el, 'Farbenblind-Modus', 'colorblindMode', [
            { label: 'Aus',          value: 'none' },
            { label: 'Deuteranopie', value: 'deuteranopia' },
            { label: 'Protanopie',   value: 'protanopia' },
            { label: 'Tritanopie',   value: 'tritanopia' },
        ]);
    }

    buildGameplay(el) {
        this.addTitle(el, 'Spielerfahrung');
        this.addSelect(el, 'Textgeschwindigkeit', 'textSpeed', [
            { label: 'Langsam', value: 'slow' },
            { label: 'Normal',  value: 'normal' },
            { label: 'Schnell', value: 'fast' },
            { label: 'Sofort',  value: 'instant' },
        ]);
        this.addSelect(el, 'Schwierigkeit', 'difficulty', [
            { label: 'Leicht', value: 'easy' },
            { label: 'Normal', value: 'normal' },
            { label: 'Schwer', value: 'hard' },
        ]);
        this.addSelect(el, 'Sprache', 'language', [
            { label: 'Deutsch', value: 'de' },
            { label: 'English', value: 'en' },
        ]);
        this.addTitle(el, 'System');
        this.addToggle(el, 'Auto-Speichern', 'autoSave', 'Speichert automatisch beim Betreten neuer Gebiete');
        this.addToggle(el, 'Benachrichtigungen', 'showNotifications', 'Quest- und Item-Meldungen anzeigen');
    }

    buildSteuerung(el) {
        this.addTitle(el, 'Tastenbelegung');

        const keyLabels = {
            moveUp:    'Hoch',
            moveDown:  'Runter',
            moveLeft:  'Links',
            moveRight: 'Rechts',
            interact:  'Interagieren',
            inventory: 'Inventar',
            map:       'Karte',
            pause:     'Pause',
            ability1:  'Fähigkeit 1',
            ability2:  'Fähigkeit 2',
            sprint:    'Rennen'
        };

        const grid = document.createElement('div');
        grid.className = 'opt-keybind';
        el.appendChild(grid);

        Object.entries(keyLabels).forEach(([key, label]) => {
            const row = document.createElement('div');
            row.className = 'opt-keybind-row';

            const labelEl = document.createElement('span');
            labelEl.className = 'opt-keybind-label';
            labelEl.textContent = label;

            const btn = document.createElement('button');
            btn.className = 'opt-key-btn';
            btn.dataset.key = key;
            btn.textContent = this.settings.keybindings[key];
            btn.addEventListener('click', () => this.waitForKey(key, btn));

            row.appendChild(labelEl);
            row.appendChild(btn);
            grid.appendChild(row);
        });
    }

    buildBarrierefreiheit(el) {
        this.addTitle(el, 'Lesbarkeit');
        this.addToggle(el, 'Große Schrift', 'largeText', 'Vergrößert alle Texte im Spiel');
        this.addToggle(el, 'Hoher Kontrast', 'highContrast', 'Erhöht den Kontrast für bessere Sichtbarkeit');
        this.addTitle(el, 'Bewegung');
        this.addToggle(el, 'Animationen reduzieren', 'reduceAnimations', 'Verringert Bildschirmeffekte und Animationen');
    }

    addSlider(el, label, key, onChange) {
        const val = this.settings[key] ?? 1.0;

        const row = document.createElement('div');
        row.className = 'opt-row';

        const labelEl = document.createElement('span');
        labelEl.className = 'opt-label';
        labelEl.textContent = label;

        const wrap = document.createElement('div');
        wrap.className = 'opt-slider-wrap';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'opt-slider';
        slider.min = '0';
        slider.max = '1';
        slider.step = '0.01';
        slider.value = String(val);

        const valEl = document.createElement('span');
        valEl.className = 'opt-slider-val';
        valEl.textContent = Math.round(val * 100) + '%';

        wrap.appendChild(slider);
        wrap.appendChild(valEl);
        row.appendChild(labelEl);
        row.appendChild(wrap);
        el.appendChild(row);

        const updateFill = v => {
            slider.style.background = `linear-gradient(90deg, rgba(200,168,75,0.6) ${v*100}%, rgba(255,255,255,0.08) ${v*100}%)`;
        };
        updateFill(val);

        const handler = () => {
            const v = parseFloat(slider.value);
            valEl.textContent = Math.round(v * 100) + '%';
            updateFill(v);
            this.settings[key] = v;
            if (onChange) onChange(v);
            this.saveSettings();
        };

        slider.addEventListener('input', handler);
        slider.addEventListener('change', handler);
        slider.addEventListener('mouseup', handler);
    }

    addToggle(el, label, key, desc = '', onChange) {
        const val = this.settings[key] ?? false;

        const row = document.createElement('div');
        row.className = 'opt-row';

        const labelWrap = document.createElement('div');
        labelWrap.className = 'opt-label-wrap';

        const labelEl = document.createElement('span');
        labelEl.className = 'opt-label';
        labelEl.textContent = label;
        labelWrap.appendChild(labelEl);

        if (desc) {
            const descEl = document.createElement('span');
            descEl.className = 'opt-desc';
            descEl.textContent = desc;
            labelWrap.appendChild(descEl);
        }

        const toggle = document.createElement('div');
        toggle.className = 'opt-toggle' + (val ? ' on' : '');
        toggle.addEventListener('click', () => {
            this.settings[key] = !this.settings[key];
            toggle.classList.toggle('on', this.settings[key]);
            if (onChange) onChange(this.settings[key]);
            this.saveSettings();
        });

        row.appendChild(labelWrap);
        row.appendChild(toggle);
        el.appendChild(row);
    }

    addSelect(el, label, key, options) {
        const val = this.settings[key];

        const row = document.createElement('div');
        row.className = 'opt-row';

        const labelEl = document.createElement('span');
        labelEl.className = 'opt-label';
        labelEl.textContent = label;

        const group = document.createElement('div');
        group.className = 'opt-select-group';

        options.forEach(o => {
            const btn = document.createElement('button');
            btn.className = 'opt-select-btn' + (o.value === val ? ' active' : '');
            btn.dataset.val = o.value;
            btn.textContent = o.label;
            btn.addEventListener('click', () => {
                group.querySelectorAll('.opt-select-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings[key] = o.value;
                this.saveSettings();
                this.game.events.emit(`setting-changed-${key}`, this.settings[key]);
            });
            group.appendChild(btn);
        });

        row.appendChild(labelEl);
        row.appendChild(group);
        el.appendChild(row);
    }

    addZoom(el) {
        const zoomLevels = [0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0];
        const labels     = ['50%','60%','70%','75%','80%','90%','100%','110%','125%','150%','175%','200%'];
        let idx = zoomLevels.indexOf(this.settings.zoomLevel);
        if (idx === -1) idx = 6;

        const row = document.createElement('div');
        row.className = 'opt-row';

        const labelEl = document.createElement('span');
        labelEl.className = 'opt-label';
        labelEl.textContent = 'Zoom';

        const ctrl = document.createElement('div');
        ctrl.className = 'opt-zoom-ctrl';

        const minusBtn = document.createElement('button');
        minusBtn.className = 'opt-zoom-btn';
        minusBtn.textContent = '−';

        const valEl = document.createElement('span');
        valEl.className = 'opt-zoom-val';
        valEl.textContent = labels[idx];

        const plusBtn = document.createElement('button');
        plusBtn.className = 'opt-zoom-btn';
        plusBtn.textContent = '+';

        minusBtn.addEventListener('click', () => {
            if (idx > 0) {
                idx--;
                this.settings.zoomLevel = zoomLevels[idx];
                valEl.textContent = labels[idx];
                this.applyZoom(this.settings.zoomLevel);
                this.saveSettings();
            }
        });

        plusBtn.addEventListener('click', () => {
            if (idx < zoomLevels.length - 1) {
                idx++;
                this.settings.zoomLevel = zoomLevels[idx];
                valEl.textContent = labels[idx];
                this.applyZoom(this.settings.zoomLevel);
                this.saveSettings();
            }
        });

        ctrl.appendChild(minusBtn);
        ctrl.appendChild(valEl);
        ctrl.appendChild(plusBtn);
        row.appendChild(labelEl);
        row.appendChild(ctrl);
        el.appendChild(row);
    }

    applyZoom(zoom) {
        this.game.scene.scenes.forEach(scene => {
            if (scene.cameras?.main && scene.scene.key !== 'FPSDisplay') {
                scene.cameras.main.setZoom(zoom);
            }
        });
    }

    waitForKey(bindingKey, btn) {
        if (this.waitingForKey) return;
        this.waitingForKey = bindingKey;
        btn.textContent = '...';
        btn.classList.add('waiting');

        const handler = (e) => {
            e.preventDefault();
            let key = e.key.toUpperCase();
            if (key === 'ESCAPE')     key = 'ESC';
            if (key === ' ')          key = 'SPACE';
            if (key === 'ARROWUP')    key = '↑';
            if (key === 'ARROWDOWN')  key = '↓';
            if (key === 'ARROWLEFT')  key = '←';
            if (key === 'ARROWRIGHT') key = '→';

            const conflict = Object.entries(this.settings.keybindings)
                .find(([k, v]) => k !== bindingKey && v === key);

            btn.classList.remove('waiting');
            this.waitingForKey = null;
            window.removeEventListener('keydown', handler);

            if (conflict) {
                btn.textContent = this.settings.keybindings[bindingKey];
                btn.style.borderColor = 'rgba(200,80,60,0.6)';
                setTimeout(() => btn.style.borderColor = '', 800);
            } else {
                this.settings.keybindings[bindingKey] = key;
                btn.textContent = key;
                btn.style.borderColor = 'rgba(215,159,47,0.6)';
                setTimeout(() => btn.style.borderColor = '', 500);
                this.saveSettings();
            }
        };

        window.addEventListener('keydown', handler);
    }

    toggleFullscreen() {
        if (this.scale.isFullscreen) this.scale.stopFullscreen();
        else this.scale.startFullscreen();
    }

    resetAll() {
        this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
        this.saveSettings();
        this.showTab(this.currentTab);
    }

    goBack() {
        this.optDiv.remove();
        const prevScene = this.scene.get(this.previousScene);
        if (prevScene?.scene.isPaused()) {
            prevScene.input.enabled = true;
            this.scene.stop();
            this.scene.resume(this.previousScene);
        } else {
            this.scene.start(this.previousScene);
        }
    }

    saveSettings() {
        localStorage.setItem('tetherVeilSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('tetherVeilSettings');
        if (saved) {
            try { return { ...this.defaultSettings, ...JSON.parse(saved) }; }
            catch { return { ...this.defaultSettings }; }
        }
        return { ...this.defaultSettings };
    }

    static getSettings() {
        const saved = localStorage.getItem('tetherVeilSettings');
        if (saved) {
            try { return JSON.parse(saved); } catch { return null; }
        }
        return null;
    }

    static isKeyPressed(action, keyCode) {
        const s = Options.getSettings();
        return s?.keybindings?.[action] === keyCode.toUpperCase();
    }
}