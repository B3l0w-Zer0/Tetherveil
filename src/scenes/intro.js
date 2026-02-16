export class intro extends Phaser.Scene {
    constructor() {
        super("intro");
    }

    preload() {
        // Optional: Lade Audio-Dateien
        // this.load.audio('ambience', 'assets/audio/ambience.mp3');
        // this.load.audio('textSound', 'assets/audio/click.mp3');
    }

    create() {
        // Hintergrund
        this.cameras.main.setBackgroundColor('#0a0a0a');

        // Pixel-Lagerfeuer Animation erstellen
        this.createCampfire();

        // Optional: Ambient Sound
        // this.ambience = this.sound.add('ambience', { loop: true, volume: 0.3 });
        // this.ambience.play();

        // Variablen
        let aktuellerIndex = 0;
        this.isTyping = false;
        this.skipIntro = false;

        // Wrapper für Text erstellen
        this.wrapper = document.createElement('div');
        this.wrapper.style.position = "absolute";
        this.wrapper.style.top = "50%";
        this.wrapper.style.left = "50%";
        this.wrapper.style.transform = "translate(-50%, -50%)";
        this.wrapper.style.color = "#e0e0e0";
        this.wrapper.style.fontSize = "24px";
        this.wrapper.style.textAlign = "center";
        this.wrapper.style.width = "60%";
        this.wrapper.style.maxWidth = "800px";
        this.wrapper.style.zIndex = "1000";
        this.wrapper.style.fontFamily = "Georgia, serif";
        this.wrapper.style.lineHeight = "1.6";
        this.wrapper.style.textShadow = "2px 2px 4px rgba(0,0,0,0.8)";
        this.wrapper.style.transition = "opacity 0.8s ease-in-out";
        this.wrapper.style.opacity = "0";
        this.wrapper.style.pointerEvents = "none"; // WICHTIG: Damit Klicks durchgehen!

        // Text Element
        this.textElement = document.createElement('p');
        this.textElement.style.minHeight = "200px";
        this.textElement.style.display = "flex";
        this.textElement.style.alignItems = "center";
        this.textElement.style.justifyContent = "center";
        this.textElement.style.margin = "0";
        this.wrapper.appendChild(this.textElement);

        // Hinweis zum Fortfahren
        this.hintElement = document.createElement('p');
        this.hintElement.innerHTML = "Press <strong>ENTER</strong> or <strong>CLICK</strong> to continue<br><span style='font-size: 14px; opacity: 0.7;'>Press <strong>ESC</strong> to skip</span>";
        this.hintElement.style.fontSize = "16px";
        this.hintElement.style.opacity = "0.5";
        this.hintElement.style.marginTop = "30px";
        this.hintElement.style.fontFamily = "Arial, sans-serif";
        this.hintElement.style.animation = "pulse 2s ease-in-out infinite";
        this.wrapper.appendChild(this.hintElement);

        // Fortschrittsanzeige
        this.progressElement = document.createElement('p');
        this.progressElement.style.fontSize = "14px";
        this.progressElement.style.opacity = "0.3";
        this.progressElement.style.marginTop = "10px";
        this.progressElement.style.fontFamily = "Arial, sans-serif";
        this.wrapper.appendChild(this.progressElement);

        // CSS Animation für Pulse-Effekt hinzufügen
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);

        document.getElementById('game-container').appendChild(this.wrapper);

        // Text-Abschnitte
        this.textAbschnitte = [
            "Once, the heavens bore more than clouds...\n" +
            "...they carried memory.",
            "The world turned beneath a silent vow:\n" +
            "That every soul, when its end had come, would rise…\n" +
            "and be received.",
            "But something shattered.\n" +
            "Not with thunder —\n" +
            "but with silence.",
            "And from that silence, the forgotten fell.\n" +
            "Souls without tether,\n" +
            "without purpose,\n" +
            "lost between life and forgetting.",
            "No fire consumed their bodies.\n" +
            "No grave bore their names.\n" +
            "Only longing remained —\n" +
            "and the slow rotting of meaning.",
            "But time is no mercy.\n" +
            "What does not rest begins to change.\n" +
            "And so eternity gnawed at their thoughts,\n" +
            "until nothing remained but hunger, wrath… and sorrow.",
            "Some clung to objects —\n" +
            "to shadows, to beasts, to ruins,\n" +
            "forgetting who — or what — they once were.",
            "The land itself grew ill.\n" +
            "Roads refused the light.\n" +
            "Cities whispered in silence,\n" +
            "and from the stone crawled screams whose origins no longer had names.",
            "Now, the earth bends beneath their weight.\n" +
            "Forms twist. Voices fade.\n" +
            "The old paths crumble,\n" +
            "and the stars turn their gaze away.",
            "You awaken in this time of unraveling.\n" +
            "A whisper stirs in the dust.",
            "Not a calling...",
            "...but a remembering."
        ];

        // Typing Effekt Funktion
        const typeText = (text, onComplete) => {
            this.isTyping = true;
            let i = 0;
            this.textElement.textContent = "";

            const typingEvent = this.time.addEvent({
                delay: 30, // Geschwindigkeit des Tippens (höher = langsamer, z.B. 50-80 für dramatischer)
                callback: () => {
                    if (this.skipIntro) {
                        this.textElement.textContent = text;
                        typingEvent.remove();
                        this.isTyping = false;
                        if (onComplete) onComplete();
                        return;
                    }

                    this.textElement.textContent += text[i];
                    i++;

                    // Optional: Sound-Effekt
                    // if (i % 3 === 0 && this.sound.get('textSound')) {
                    //     this.sound.play('textSound', { volume: 0.1 });
                    // }

                    if (i >= text.length) {
                        typingEvent.remove();
                        this.isTyping = false;
                        if (onComplete) onComplete();
                    }
                },
                repeat: text.length - 1
            });
        };

        // Nächsten Text anzeigen
        const showNextText = () => {
            // Verhindere Spam-Klicks während des Tippens
            if (this.isTyping) {
                // Optional: Tippen sofort beenden
                this.skipIntro = true;
                return;
            }

            this.skipIntro = false;

            // Fade out
            this.wrapper.style.opacity = "0";

            this.time.delayedCall(800, () => {
                aktuellerIndex++;

                if (aktuellerIndex < this.textAbschnitte.length) {
                    // Fortschritt aktualisieren
                    this.progressElement.textContent = `${aktuellerIndex + 1} / ${this.textAbschnitte.length}`;

                    // Wrapper wieder sichtbar machen
                    this.wrapper.style.opacity = "1";

                    // Neuen Text mit Typing-Effekt anzeigen
                    typeText(this.textAbschnitte[aktuellerIndex]);
                } else {
                    // Intro beendet
                    cleanup();
                    this.scene.start("startMap");
                }
            });
        };

        // Gesamte Intro überspringen
        const skipToGame = () => {
            cleanup();
            this.scene.start("startMap");
        };

        // Tastatur-Handler
        const handleKey = (event) => {
            if (event.key === "Enter" || event.key === "Space") {
                showNextText();
            }
            if (event.key === "Escape") {
                skipToGame();
            }
        };

        // Cleanup-Funktion
        const cleanup = () => {
            window.removeEventListener('keydown', handleKey);
            this.input.off('pointerdown', showNextText);

            // Fade out vor dem Entfernen
            this.wrapper.style.opacity = "0";
            this.time.delayedCall(500, () => {
                this.wrapper.remove();
            });

            // Optional: Sound stoppen
            // if (this.ambience) this.ambience.stop();

            // Style-Tag entfernen
            if (style.parentNode) {
                style.remove();
            }
        };

        // Event-Listener aktivieren (mit Verzögerung gegen Menü-Durchklick)
        this.time.delayedCall(100, () => {
            window.addEventListener('keydown', handleKey);
        });

        // Maus-Klick separat aktivieren
        this.time.delayedCall(0, () => {
            this.input.on('pointerdown', showNextText);
        });

        // Ersten Text sofort anzeigen
        this.progressElement.textContent = `1 / ${this.textAbschnitte.length}`;

        // WICHTIG: Wrapper sichtbar machen BEVOR das Tippen startet
        this.wrapper.style.opacity = "1";

        // Jetzt mit Typing-Effekt starten
        typeText(this.textAbschnitte[0]);

        // Cleanup bei Scene-Shutdown
        this.events.once('shutdown', cleanup);
    }

    createCampfire() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2 + 200; // Unten in der Mitte

        // Feuer-Farben
        const fireColors = [
            0xff4500, // Orange-Rot
            0xff6b00, // Orange
            0xffa500, // Helles Orange
            0xffff00, // Gelb
            0xff8c00  // Dunkelorange
        ];

        // Holzscheite (statisch) - mit Rectangles statt Graphics
        // Unterer Holzscheit (horizontal)
        const log1 = this.add.rectangle(centerX, centerY + 14, 60, 8, 0x4a2511);

        // Linker Holzscheit (schräg)
        const log2 = this.add.rectangle(centerX - 20, centerY + 5, 50, 7, 0x4a2511);
        log2.setRotation(-0.3);

        // Rechter Holzscheit (schräg)
        const log3 = this.add.rectangle(centerX + 20, centerY + 5, 50, 7, 0x4a2511);
        log3.setRotation(0.3);

        // Feuer-Partikel Container
        this.fireParticles = [];

        // Partikel erstellen
        for (let i = 0; i < 20; i++) {
            const particle = this.add.rectangle(
                centerX + Phaser.Math.Between(-20, 20),
                centerY,
                Phaser.Math.Between(3, 6),
                Phaser.Math.Between(3, 6),
                fireColors[Phaser.Math.Between(0, fireColors.length - 1)]
            );
            particle.alpha = 0;

            this.fireParticles.push({
                sprite: particle,
                baseX: centerX + Phaser.Math.Between(-20, 20),
                baseY: centerY,
                lifetime: 0,
                maxLifetime: Phaser.Math.Between(30, 60),
                speed: Phaser.Math.FloatBetween(1, 2.5),
                wobble: Phaser.Math.FloatBetween(0, Math.PI * 2)
            });
        }

        // Glühende Kohlen (flackern)
        this.embers = [];
        for (let i = 0; i < 8; i++) {
            const ember = this.add.rectangle(
                centerX + Phaser.Math.Between(-25, 25),
                centerY + Phaser.Math.Between(8, 15),
                Phaser.Math.Between(2, 4),
                Phaser.Math.Between(2, 4),
                0xff4500
            );
            ember.alpha = Phaser.Math.FloatBetween(0.3, 0.7);
            this.embers.push(ember);
        }

        // Funken (gelegentlich aufsteigend)
        this.sparks = [];
        this.sparkTimer = 0;
    }

    update() {
        // Lagerfeuer Animation
        if (this.fireParticles) {
            // Feuer-Partikel animieren
            this.fireParticles.forEach((particle, index) => {
                particle.lifetime++;

                if (particle.lifetime >= particle.maxLifetime) {
                    // Partikel zurücksetzen
                    particle.lifetime = 0;
                    particle.maxLifetime = Phaser.Math.Between(30, 60);
                    particle.sprite.x = particle.baseX;
                    particle.sprite.y = particle.baseY;
                    particle.sprite.alpha = 0;
                    particle.wobble = Phaser.Math.FloatBetween(0, Math.PI * 2);

                    // Neue Farbe
                    const fireColors = [0xff4500, 0xff6b00, 0xffa500, 0xffff00, 0xff8c00];
                    particle.sprite.fillColor = fireColors[Phaser.Math.Between(0, fireColors.length - 1)];
                }

                // Nach oben bewegen mit Wobble-Effekt
                particle.sprite.y -= particle.speed;
                particle.wobble += 0.1;
                particle.sprite.x = particle.baseX + Math.sin(particle.wobble) * 5;

                // Alpha-Fade (erscheinen und verschwinden)
                const progress = particle.lifetime / particle.maxLifetime;
                if (progress < 0.2) {
                    particle.sprite.alpha = progress * 5; // Fade in
                } else if (progress > 0.7) {
                    particle.sprite.alpha = (1 - progress) * 3.33; // Fade out
                } else {
                    particle.sprite.alpha = 1;
                }

                // Größe variieren
                const scale = 1 + Math.sin(particle.lifetime * 0.2) * 0.3;
                particle.sprite.setScale(scale);
            });

            // Kohlen flackern lassen
            if (this.embers) {
                this.embers.forEach(ember => {
                    ember.alpha = Phaser.Math.FloatBetween(0.3, 0.8);
                });
            }

            // Gelegentlich Funken erzeugen
            this.sparkTimer++;
            if (this.sparkTimer > 30) {
                this.sparkTimer = 0;

                if (Phaser.Math.Between(0, 100) > 70) { // 30% Chance
                    const centerX = this.cameras.main.width / 2;
                    const centerY = this.cameras.main.height / 2 + 200;

                    const spark = this.add.rectangle(
                        centerX + Phaser.Math.Between(-15, 15),
                        centerY + 5,
                        2,
                        2,
                        0xffff00
                    );

                    this.sparks.push({
                        sprite: spark,
                        lifetime: 0,
                        maxLifetime: Phaser.Math.Between(20, 40),
                        speedX: Phaser.Math.FloatBetween(-0.5, 0.5),
                        speedY: Phaser.Math.FloatBetween(-2, -3)
                    });
                }
            }

            // Funken animieren
            if (this.sparks) {
                this.sparks = this.sparks.filter(spark => {
                    spark.lifetime++;

                    if (spark.lifetime >= spark.maxLifetime) {
                        spark.sprite.destroy();
                        return false;
                    }

                    spark.sprite.x += spark.speedX;
                    spark.sprite.y += spark.speedY;
                    spark.speedY += 0.05; // Leichte Gravität

                    spark.sprite.alpha = 1 - (spark.lifetime / spark.maxLifetime);

                    return true;
                });
            }
        }
    }
}