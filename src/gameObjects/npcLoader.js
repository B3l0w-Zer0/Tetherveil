export class NPCLoader {
    static async loadNPCs(scene, mapKey) {
        try {
            // JSON laden
            const response = await fetch('src/data/npcData/npc.json');
            const data = await response.json();

            // NPCs für diese Map holen
            const npcsForMap = data[mapKey] || [];

            // Alle NPCs spawnen
            npcsForMap.forEach(npcConfig => {
                scene.npcManager.addNPC(npcConfig);
            });

            console.log(`✅ Loaded ${npcsForMap.length} NPCs for ${mapKey}`);
        } catch (error) {
            console.error('❌ Failed to load NPCs:', error);
        }
    }
}