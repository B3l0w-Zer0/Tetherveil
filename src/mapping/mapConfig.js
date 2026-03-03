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
        {
            key: "Map 2",
            tilemapPath: "src/data/mapData/Map 2.tmj",
            tilesetImage: "Fick dich",
            tilesetKey: "tiles",
            startX: 200,
            startY: 150
        }


        // Weitere Maps hier hinzufügen...
    ],

    tilesets: [
        {
            key: "tiles",
            path: "assets/tiles/ChatGPT.png"
        }
        // Weitere Tilesets hier hinzufügen...
    ]
};