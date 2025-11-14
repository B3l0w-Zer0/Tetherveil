export const sounds = {
    click: new Audio('./assets/audio/sounds/click.mp3'),
    //mapChange: new Audio('./assets/audio/sounds/mapChange.mp3')
};

// optional Lautstärke einstellen
sounds.click.volume = 0.5;
//sounds.mapChange.volume = 0.5;

export function playSound(audio) {
    if (!audio) return;

    // Erstmal resetten
    audio.pause();
    audio.currentTime = 0;

    // Dann neu starten, Fehler abfangen
    audio.play().catch(err => {
        if (err.name !== "AbortError") {
            console.error("Audio play error:", err);
        }
    });
}