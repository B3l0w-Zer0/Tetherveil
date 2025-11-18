// mapConfig.js - Konfigurationsdatei für alle Maps
export const mapConfig = {
    maps: [
        {
            key: "pallet_town",
            tilemapPath: "src/data/mapData/Fick dich.tmj",
            tilesetImage: "Fick dich", // Name in Tiled
            tilesetKey: "tiles",
            startX: 450,
            startY: 300
        },

        // Weitere Maps hier hinzufügen...
    ],

    tilesets: [
        {
            key: "tiles",
            path: "assets/tiles/ChatGPT Image 11. Nov. 2025, 23_07_43.png"
        }
        // Weitere Tilesets hier hinzufügen...
    ]
};