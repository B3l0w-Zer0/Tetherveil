export class intro extends Phaser.Scene {
    constructor() {
        super("intro");
    }

    preload() {

    }
    create() {

        //Wrapper für Text
        let aktuellerIndex = 0;
        this.wrapper = document.createElement('div');
        this.wrapper.style.position = "absolute";
        this.wrapper.style.top = "50%";
        this.wrapper.style.left = "50%";
        this.wrapper.style.transform = "translate(-50%, -50%)";
        this.wrapper.style.color = "white";
        this.wrapper.style.fontSize = "24px";
        this.wrapper.style.textAlign = "center";
        this.wrapper.style.width = "60%";
        this.wrapper.style.zindex = "1000";
        this.textElement = document.createElement('p');
        this.wrapper.appendChild(this.textElement);
        document.getElementById('game-container').appendChild(this.wrapper);

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
            "until nothing remained but hunger, wrath… and sorrow",
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
            "A whisper stirs in the dust.\n",
            "Not a calling...\n",
            "...but a remembering.\""
        ];

        // Anfangstext setzen
        this.textElement.textContent = this.textAbschnitte[aktuellerIndex];

        const showNextText = () => {
            aktuellerIndex++;
            if (aktuellerIndex < this.textAbschnitte.length) {
                this.textElement.textContent = this.textAbschnitte[aktuellerIndex];
            } else {
                // Listener entfernen
                this.wrapper.removeEventListener('click', showNextText);
                window.removeEventListener('keydown', handleKey);
                this.wrapper.remove(); // HTML wieder entfernen
                this.scene.start("startMap");
            }
        };

        // Enter-Taste behandeln
        const handleKey = (event) => {
            if (event.key === "Enter") {
                showNextText();
            }
        };

        // Eventlistener hinzufügen
        this.wrapper.addEventListener('click', showNextText);
        window.addEventListener('keydown', handleKey);

    }

    update() {

    }
}