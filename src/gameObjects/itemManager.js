import { WorldItem } from './worldItem.js';

/**
 * ItemManager
 * Verwaltet alle Items die auf der Map liegen.
 * Lädt Items aus Tiled-Objekt-Layer ODER manuell per spawnItem().
 * Prüft Aufsammel-Radius und feuert Events.
 */
export class ItemManager {
    constructor(scene) {
        this.scene = scene;
        this.items = [];
        this.itemDefinitions = {}; // aus itemData.json
        this.pickupRadius = 32;    // Pixel-Radius zum Aufsammeln
        this.tooltipRadius = 60;   // Radius für Tooltip-Anzeige

        this.loadItemData();
    }

    // ─────────────────────────────────────────
    // LADEN
    // ─────────────────────────────────────────

    loadItemData() {
        return fetch('src/data/itemData/items.json')
            .then(r => r.json())
            .then(data => {
                this.itemDefinitions = data;
                console.log('✅ Item-Daten geladen:', Object.keys(this.itemDefinitions).length, 'Items');
            })
            .catch(error => {
                console.warn('⚠️ Konnte items.json nicht laden:', error);
                this.itemDefinitions = {};
            });
    }

    // ─────────────────────────────────────────
    // ITEMS AUS TILED LADEN
    // Erwartet einen Object-Layer namens "Items" in Tiled.
    // Jedes Objekt braucht eine Custom-Property "itemId" (z.B. "potion")
    // ─────────────────────────────────────────

    loadFromTilemap(tilemap) {
        const itemLayer = tilemap.getObjectLayer('Items');
        if (!itemLayer) {
            console.log('ℹ️ Kein "Items"-Layer in der Tilemap gefunden.');
            return;
        }

        itemLayer.objects.forEach(obj => {
            const itemId = obj.properties?.find(p => p.name === 'itemId')?.value;
            if (!itemId) {
                console.warn('⚠️ Item-Objekt ohne itemId:', obj.name);
                return;
            }

            // Tiled Y-Position ist Unterkante des Objekts
            this.spawnItem(obj.x, obj.y - (obj.height || 0), itemId);
        });

        console.log(`✅ ${this.items.length} Items aus Tilemap geladen`);
    }

    // ─────────────────────────────────────────
    // ITEM MANUELL SPAWNEN
    // ─────────────────────────────────────────

    spawnItem(x, y, itemId) {
        const itemData = this.itemDefinitions[itemId];
        if (!itemData) {
            console.warn(`⚠️ Unbekannte Item-ID: "${itemId}"`);
            return null;
        }

        const worldItem = new WorldItem(this.scene, x, y, itemId, itemData);
        this.items.push(worldItem);
        return worldItem;
    }

    // ─────────────────────────────────────────
    // UPDATE - prüft Spieler-Nähe
    // ─────────────────────────────────────────

    update(player, eKeyJustDown = false, interactX = null, interactY = null) {
        if (!player) return;

        const checkX = interactX ?? player.x;
        const checkY = interactY ?? player.y;

        this.items.forEach(item => {
            if (item.collected) return;

            const px = player.x;
            const py = player.y;

            const dx = px - item.x;
            const dy = py - item.y;
            const dist2 = dx * dx + dy * dy;

            // Tooltip anzeigen wenn in der Nähe
            item.showTooltip(dist2 <= this.tooltipRadius * this.tooltipRadius);

            if (eKeyJustDown) {
                const ix = checkX - item.x;
                const iy = checkY - item.y;
                if ((ix * ix + iy * iy) <= this.pickupRadius * this.pickupRadius) {
                    this.pickupItem(item);
                }
            }
        });

        // Aufgesammelte Items aus der Liste entfernen
        this.items = this.items.filter(item => !item.collected);
    }

    // ─────────────────────────────────────────
    // AUFSAMMELN
    // ─────────────────────────────────────────

    pickupItem(worldItem, player) {
        if (worldItem.collected) return;

        const itemData = worldItem.itemData;

        worldItem.collect(() => {
            // Event feuern → Inventar-System deines Freundes fängt das ab
            this.scene.events.emit('item-received', worldItem.itemId, itemData);

            // Quest-Fortschritt updaten
            if (this.scene.questManager) {
                this.scene.questManager.updateProgress('collect', worldItem.itemId);
            }

            // Aufsammel-Text anzeigen
            this.showPickupText(worldItem.x, worldItem.y, itemData.name);

            console.log(`🎒 Aufgesammelt: ${itemData.name}`);
        });
    }

    // ─────────────────────────────────────────
    // PICKUP-TEXT ("+Trank" über dem Spieler)
    // ─────────────────────────────────────────

    showPickupText(x, y, itemName) {
        const text = this.scene.add.text(x, y - 10, `+${itemName}`, {
            fontFamily: 'sans-serif',
            fontSize: '16px',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(600);

        this.scene.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => text.destroy()
        });
    }

    // ─────────────────────────────────────────
    // ALLE ITEMS ENTFERNEN (beim Map-Wechsel)
    // ─────────────────────────────────────────

    clearItems() {
        this.items.forEach(item => item.destroy());
        this.items = [];
    }
}