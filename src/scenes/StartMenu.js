import { sounds, playSound } from '../../assets/audio/sounds/sounds.js';

export default class StartMenu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    preload() {
        // Optional: Hintergrundgrafik oder Button-Assets laden
    }

    create() {
        const { width, height } = this.scale;

        this.injectStyles();
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a10);
        this.createHTMLUI(width, height);
    }

    // ------------------------------------------------------------------
    // HTML-UI: Titel + Buttons im Stil des Options-Menüs
    // ------------------------------------------------------------------
    injectStyles() {
        if (document.getElementById('menu-styles')) return;
        const style = document.createElement('style');
        style.id = 'menu-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap');

            .menu-ui-layer {
                position: absolute; inset: 0;
                display: flex; flex-direction: column; align-items: center;
                pointer-events: none;
                font-family: 'Crimson Pro', serif;
            }
            .menu-title-wrap {
                margin-top: 7%;
                text-align: center;
                animation: menu-title-in 1.6s ease-out;
            }
            .menu-eyebrow {
                font-family: 'Cinzel', serif; font-size: 12px; font-weight: 600;
                letter-spacing: 7px; text-transform: uppercase;
                color: rgba(180,150,80,0.55);
                margin: 0 0 6px 0;
            }
            .menu-title {
                font-family: 'Cinzel', serif; font-size: 58px; font-weight: 700;
                letter-spacing: 6px; color: #e8e0d0; margin: 0;
                text-shadow: 0 0 22px rgba(200,168,75,0.25), 0 2px 12px rgba(0,0,0,0.9);
            }
            .menu-divider {
                width: 160px; height: 1px; margin: 14px auto 0;
                background: linear-gradient(90deg, transparent, rgba(200,168,75,0.7), transparent);
            }
            @keyframes menu-title-in {
                from { opacity: 0; transform: translateY(-14px); letter-spacing: 14px; }
                to   { opacity: 1; transform: translateY(0); letter-spacing: 6px; }
            }

            .menu-buttons {
                margin-top: 6%;
                display: flex; flex-direction: column; gap: 14px;
                pointer-events: all;
                animation: menu-buttons-in 1.4s ease-out 0.3s both;
            }
            @keyframes menu-buttons-in {
                from { opacity: 0; transform: translateY(10px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .menu-btn {
                position: relative;
                font-family: 'Cinzel', serif; font-size: 16px; letter-spacing: 3px;
                text-transform: uppercase; text-align: center;
                color: rgba(210,196,160,0.75);
                background: rgba(10,10,16,0.55);
                border: 1px solid rgba(180,150,80,0.25);
                padding: 13px 54px; cursor: pointer;
                border-radius: 1px; overflow: hidden;
                backdrop-filter: blur(2px);
                transition: color 0.25s ease, border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease;
            }
            .menu-btn::before {
                content: ''; position: absolute; inset: 0;
                background: linear-gradient(90deg, transparent, rgba(200,168,75,0.12), transparent);
                transform: translateX(-100%); transition: transform 0.5s ease;
            }
            .menu-btn:hover::before { transform: translateX(100%); }
            .menu-btn:hover {
                color: #e8d9ab; border-color: rgba(200,168,75,0.6);
                background: rgba(20,17,10,0.65);
                box-shadow: 0 0 18px rgba(200,168,75,0.15);
                transform: translateY(-1px);
            }
            .menu-btn:active { transform: translateY(0); }

            .menu-version {
                position: absolute; bottom: 18px; right: 24px;
                font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px;
                color: rgba(180,160,120,0.3); pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    createHTMLUI() {
        this.menuDiv = document.createElement('div');
        this.menuDiv.className = 'menu-ui-layer';
        this.menuDiv.id = 'menu-overlay';

        this.menuDiv.innerHTML = `
            <div class="menu-title-wrap">
                <p class="menu-eyebrow">Ein Reich vergessener Seelen</p>
                <h1 class="menu-title">Tetherveil</h1>
                <div class="menu-divider"></div>
            </div>
            <div class="menu-buttons" id="menu-buttons"></div>
            <div class="menu-version">v0.1 — Frühe Schatten</div>
        `;

        document.getElementById('game-container').appendChild(this.menuDiv);

        const buttonData = [
            { text: "Neues Spiel", scene: "intro" },
            { text: "Schnellzugriff", scene: "startMap" },
            { text: "Spielstand laden", scene: "load" },
            { text: "Optionen", scene: "options" },
        ];

        const buttonsEl = document.getElementById('menu-buttons');
        buttonData.forEach(btn => {
            const el = document.createElement('button');
            el.className = 'menu-btn';
            el.textContent = btn.text;
            el.addEventListener('click', () => {
                playSound(sounds.click);
                this.fadeOutAndStart(btn.scene);
            });
            buttonsEl.appendChild(el);
        });

        this.events.once('shutdown', () => {
            if (this.menuDiv) this.menuDiv.remove();
        });
    }

    fadeOutAndStart(sceneKey) {
        this.menuDiv.style.transition = 'opacity 0.4s ease';
        this.menuDiv.style.opacity = '0';
        this.time.delayedCall(220, () => {
            if (sceneKey === "options") {
                this.scene.start(sceneKey, { previousScene: this.scene.key });
            } else {
                this.scene.start(sceneKey);
            }
        });
    }
}