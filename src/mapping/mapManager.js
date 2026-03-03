import { mapConfig } from './mapConfig.js';

export class MapManager {
    constructor(scene) {
        this.scene = scene;
        this.currentMap = null;
        this.currentMapKey = null;
        this.layers = {};
        this.isTransitioning = false;
        this.npcData = null; // Cache für NPC-Daten
    }

    /**
     * Lädt NPC-Daten aus JSON (einmalig)
     */
    async loadNPCData() {
        if (this.npcData) return this.npcData;

        try {
            const response = await fetch('src/data/npcs/npcData.json');
            const rawData = await response.json();

            // Konvertiere Map-basierte Struktur zu ID-basierter Struktur
            this.npcData = {};

            // Gehe durch alle Maps
            Object.values(rawData).forEach(mapNPCs => {
                if (Array.isArray(mapNPCs)) {
                    mapNPCs.forEach(npc => {
                        if (npc.id) {
                            this.npcData[npc.id] = npc;
                        }
                    });
                }
            });

            console.log('✅ NPC-Daten geladen:', Object.keys(this.npcData).length, 'NPCs');
            console.log('📋 Verfügbare NPC-IDs:', Object.keys(this.npcData));
            return this.npcData;
        } catch (error) {
            console.warn('⚠️ Konnte npcs.json nicht laden:', error);
            this.npcData = {};
            return this.npcData;
        }
    }

    /**
     * Lädt eine Map mit dem angegebenen Key
     */
    async loadMap(mapKey, spawnX = null, spawnY = null, direction = 'down') {
        console.log('🚀 LOADMAP GESTARTET FÜR:', mapKey);
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // NPC-Daten laden (falls noch nicht geladen)
        await this.loadNPCData();

        // Alte Map aufräumen
        this.cleanupCurrentMap();

        // Map-Daten aus Config holen
        const mapData = mapConfig.maps.find(m => m.key === mapKey);
        if (!mapData) {
            console.error(`Map "${mapKey}" nicht in mapConfig gefunden!`);
            this.isTransitioning = false;
            return;
        }

        // Tilemap erstellen
        this.currentMap = this.scene.make.tilemap({ key: mapKey });
        this.currentMapKey = mapKey;

        // Tileset hinzufügen
        const tileset = this.currentMap.addTilesetImage(
            mapData.tilesetImage,
            mapData.tilesetKey
        );

        // DEBUG: Tileset-Info
        console.log('Tileset geladen:', tileset);
        console.log('Map Tilesets:', this.currentMap.tilesets);
        console.log('Map Layers:', this.currentMap.layers);

        // Dynamisch alle Layer laden
        this.loadAllLayers(tileset);

        // Kollisionen einrichten
        this.setupCollisions();

        // Spieler positionieren
        const finalX = spawnX !== null ? spawnX : mapData.startX;
        const finalY = spawnY !== null ? spawnY : mapData.startY;
        this.scene.player.setPosition(finalX, finalY);

        // World bounds an Map-Größe anpassen
        this.scene.physics.world.setBounds(
            0, 0,
            this.currentMap.widthInPixels,
            this.currentMap.heightInPixels
        );

        // Kamera-Bounds setzen
        this.scene.cameras.main.setBounds(
            0, 0,
            this.currentMap.widthInPixels,
            this.currentMap.heightInPixels
        );

        // Warps parsen (Tür-Übergänge)
        this.parseWarps();

        // NPCs spawnen (aus Tiled + JSON)
        this.spawnNPCs();

        // Encounter-Zonen parsen
        this.parseEncounterZones();

        //Kamera Setup
        this.scene.setupCamera();

        // Transition beenden
        this.scene.cameras.main.fadeIn(300, 0, 0, 0);
        this.scene.time.delayedCall(300, () => {
            this.isTransitioning = false;
        });
    }

    /**
     * Lädt alle Layer aus der Tilemap dynamisch
     */
    loadAllLayers(tileset) {
        this.layers = {};

        console.log('🎨 LOADALLLAYERS GESTARTET!');
        console.log('🎨 Anzahl Layer:', this.currentMap.layers.length);

        // Alle Layer durchgehen
        this.currentMap.layers.forEach((layerData, index) => {
            const layerName = layerData.name;

            console.log(`🎨 Versuche Layer zu laden: ${layerName}`);

            // Versuche einfach den Layer zu erstellen
            try {
                const layer = this.currentMap.createLayer(layerName, tileset, 0, 0);

                if (layer) {
                    layer.setVisible(true);
                    layer.setAlpha(1);
                    layer.setDepth(index);

                    this.layers[layerName] = layer;

                    console.log(`✅ Layer geladen: ${layerName} (Depth: ${index})`);
                } else {
                    console.log(`⏭️ Kein Tile-Layer: ${layerName}`);
                }
            } catch (e) {
                console.log(`⏭️ Fehler beim Laden: ${layerName}`, e.message);
            }
        });

        // Player Depth
        this.scene.player.setDepth(100);
    }

    /**
     * Richtet Kollisionen für Collision-Layer ein
     */
    setupCollisions() {
        Object.entries(this.layers).forEach(([name, layer]) => {
            if (name.toLowerCase().includes('collision') ||
                name.toLowerCase().includes('wall')) {

                // ALLE nicht-leeren Tiles werden solid
                layer.setCollisionByExclusion([-1]);

                this.scene.physics.add.collider(this.scene.player, layer);

                console.log(`✅ Kollision aktiviert für Layer: ${name}`);
            }
        });
    }

    /**
     * Parst Warp-Objekte aus der Tilemap
     */
    parseWarps() {
        const warpLayer = this.currentMap.getObjectLayer('Warps') ||
            this.currentMap.getObjectLayer('Doors') ||
            this.currentMap.getObjectLayer('Transitions');

        if (!warpLayer || !warpLayer.objects) {
            console.log('Keine Warp-Layer gefunden');
            return;
        }

        warpLayer.objects.forEach(warpObj => {
            if (typeof warpObj.x === 'undefined' ||
                typeof warpObj.y === 'undefined' ||
                typeof warpObj.width === 'undefined' ||
                typeof warpObj.height === 'undefined') {
                console.warn('Warp-Objekt hat unvollständige Daten:', warpObj);
                return;
            }

            const warp = this.scene.add.zone(
                warpObj.x + warpObj.width / 2,
                warpObj.y + warpObj.height / 2,
                warpObj.width,
                warpObj.height
            );

            this.scene.physics.world.enable(warp);
            warp.body.setAllowGravity(false);
            warp.body.moves = false;

            const props = {};
            if (warpObj.properties && Array.isArray(warpObj.properties)) {
                warpObj.properties.forEach(prop => {
                    if (prop && prop.name && prop.value !== undefined) {
                        props[prop.name] = prop.value;
                    }
                });
            }

            if (!props.targetMap) {
                console.warn('Warp hat keine targetMap Property!', warpObj);
                warp.destroy();
                return;
            }

            warp.setData('targetMap', props.targetMap);
            warp.setData('targetX', props.targetX || 0);
            warp.setData('targetY', props.targetY || 0);
            warp.setData('direction', props.direction || 'down');
            warp.setData('type', props.type || 'default');

            this.scene.physics.add.overlap(
                this.scene.player,
                warp,
                this.onWarpTriggered,
                null,
                this
            );

            console.log(`Warp erstellt: ${props.targetMap} (${props.targetX}, ${props.targetY})`);
        });
    }

    /**
     * Wird ausgelöst, wenn Spieler einen Warp betritt
     */
    onWarpTriggered(player, warp) {
        if (this.isTransitioning) return;
        //Gegen mehrfach Triggern
        if (warp.getData('used')) return;
        warp.setData('used', true);

        const targetMap = warp.getData('targetMap');
        const targetX = warp.getData('targetX');
        const targetY = warp.getData('targetY');
        const direction = warp.getData('direction');
        const type = warp.getData('type');

        if (!targetMap) {
            console.warn('Warp hat keine targetMap!');
            return;
        }

        this.playTransition(type, () => {
            this.loadMap(targetMap, targetX, targetY, direction);
        });
    }

    /**
     * Spielt Transition-Effekt ab
     */
    playTransition(type, callback) {
        const camera = this.scene.cameras.main;

        switch(type) {
            case 'door':
                camera.fadeOut(200, 0, 0, 0);
                this.scene.time.delayedCall(200, callback);
                break;

            case 'cave':
            case 'stairs':
                camera.fadeOut(400, 0, 0, 0);
                this.scene.time.delayedCall(400, callback);
                break;

            default:
                camera.fadeOut(300, 0, 0, 0);
                this.scene.time.delayedCall(300, callback);
        }
    }

    /**
     * Spawnt NPCs aus Tiled + JSON
     * HAUPTÄNDERUNG: Lädt NPCs aus JSON basierend auf npcId
     */
    spawnNPCs() {
        const npcLayer = this.currentMap.getObjectLayer('NPCs') ||
            this.currentMap.getObjectLayer('NPC') ||
            this.currentMap.getObjectLayer('Npcs');

        if (!npcLayer || !npcLayer.objects) {
            console.log('Keine NPC-Layer gefunden');
            return;
        }

        npcLayer.objects.forEach(npcObj => {
            // Sicherheitscheck
            if (typeof npcObj.x === 'undefined' || typeof npcObj.y === 'undefined') {
                console.warn('NPC-Objekt hat keine Position:', npcObj);
                return;
            }

            // Properties aus Tiled auslesen
            const props = {};
            if (npcObj.properties && Array.isArray(npcObj.properties)) {
                npcObj.properties.forEach(prop => {
                    if (prop && prop.name && prop.value !== undefined) {
                        props[prop.name] = prop.value;
                    }
                });
            }

            // NPC-ID aus Tiled holen (wichtigste Property!)
            const npcId = props.npcId || props.id;

            // Basis-Config (Fallback wenn JSON fehlt)
            let npcConfig = {
                x: npcObj.x,
                y: npcObj.y,
                texture: props.texture || "npc",
                name: props.name || "NPC",
                dialog: props.dialog ? props.dialog.split('|') : ["..."],
                speed: props.speed || 35
            };

            // Wenn npcId vorhanden UND in JSON gefunden → JSON-Daten nutzen
            if (npcId && this.npcData && this.npcData[npcId]) {
                const jsonData = this.npcData[npcId];

                // Position aus Tiled, Rest aus JSON
                npcConfig = {
                    x: npcObj.x,
                    y: npcObj.y,
                    ...jsonData  // Überschreibt mit JSON-Daten
                };

                console.log(`✅ NPC "${npcId}" aus JSON geladen:`, npcConfig.name);
            } else if (npcId) {
                console.warn(`⚠️ NPC-ID "${npcId}" nicht in npcs.json gefunden, nutze Tiled-Properties`);
            } else {
                console.log(`ℹ️ NPC ohne ID nutzt Tiled-Properties: ${npcConfig.name}`);
            }

            // NPC über npcManager spawnen
            if (this.scene.npcManager && this.scene.npcManager.addNPC) {
                this.scene.npcManager.addNPC(npcConfig);
                console.log(`🎭 NPC spawned: ${npcConfig.name} bei (${npcObj.x}, ${npcObj.y})`);
            } else {
                console.error('❌ npcManager nicht verfügbar!');
            }
        });
    }

    /**
     * Parst Encounter-Zonen für wilde Pokémon/Gegner
     */
    parseEncounterZones() {
        const encounterLayer = this.currentMap.getObjectLayer('Encounters') ||
            this.currentMap.getObjectLayer('TallGrass');

        if (!encounterLayer || !encounterLayer.objects) {
            console.log('Keine Encounter-Layer gefunden');
            return;
        }

        encounterLayer.objects.forEach(zone => {
            if (typeof zone.x === 'undefined' ||
                typeof zone.y === 'undefined' ||
                typeof zone.width === 'undefined' ||
                typeof zone.height === 'undefined') {
                console.warn('Encounter-Zone hat unvollständige Daten:', zone);
                return;
            }

            const props = {};
            if (zone.properties && Array.isArray(zone.properties)) {
                zone.properties.forEach(prop => {
                    if (prop && prop.name && prop.value !== undefined) {
                        props[prop.name] = prop.value;
                    }
                });
            }

            const encounterZone = this.scene.add.zone(
                zone.x + zone.width / 2,
                zone.y + zone.height / 2,
                zone.width,
                zone.height
            );

            this.scene.physics.world.enable(encounterZone);
            encounterZone.body.setAllowGravity(false);
            encounterZone.body.moves = false;

            encounterZone.setData('encounterRate', props.encounterRate || 0.1);
            encounterZone.setData('pokemon', props.pokemon || 'default');

            // Hier später Encounter-System implementieren
            // this.scene.physics.add.overlap(player, encounterZone, checkEncounter)

            console.log(`⚔️ Encounter-Zone: ${props.pokemon} (Rate: ${props.encounterRate})`);
        });
    }

    /**
     * Räumt die aktuelle Map auf
     */
    cleanupCurrentMap() {
        if (!this.currentMap) return;
        // Alle Collider der Physics-World entfernen
        this.scene.physics.world.colliders.destroy();

        // Alle Layer zerstören
        Object.values(this.layers).forEach(layer => {
            if (layer) layer.destroy();
        });

        // Alle NPCs entfernen (wichtig bei Map-Wechsel!)
        if (this.scene.npcManager && this.scene.npcManager.npcs) {
            // Kopie erstellen da wir während Iteration löschen
            const npcsToRemove = [...this.scene.npcManager.npcs];
            npcsToRemove.forEach(npc => {
                this.scene.npcManager.removeNPC(npc);
            });
        }

        // Map zerstören
        this.currentMap.destroy();

        this.layers = {};
        this.currentMap = null;
    }

    /**
     * Gibt den aktuellen Map-Key zurück
     */
    getCurrentMapKey() {
        return this.currentMapKey;
    }
}