import { mapManager } from '/src/mapping/mapManager.js';
const mapMan = new mapManager();

export async function getAllMonsters() {
    const res = await fetch("./src/data/monsters/monsters.json")
    return await res.json();
}

export function getCollection() {
    return JSON.parse(localStorage.getItem("collection") || "[]")
}

export function getTeam() {
    return JSON.parse(localStorage.getItem("team") || "[]")
}

export function saveTeam(team) {
    localStorage.setItem("team", JSON.stringify(team));
}

export function saveCollection(collection) {
    localStorage.setItem("collection", JSON.stringify(collection));
}

export function loadMonstInfo(surrogateID) {
    const team = getTeam();

    const monster = team.find(monst => monst.surrogateID === surrogateID);
    if (!monster) {
        console.error("Monster not found!");
        return;
    }
    return monster;
}

export function catchMonster(monsterID) {
    const info = loadMonstInfo(monsterID);
    /*
    Monster catchrate in prozent umwandeln und dann randomize ob diese wahrscheinlichkeit eingehalten wird
     */

    addMonstToCollection(monsterID)
}

async function addMonstToCollection(monsterID) {
    const allMons = await getAllMonsters();
    let collection = getCollection();

    const monDef = allMons.find(i => i.monsterID === monsterID);
    if (!monDef) {
        console.log("Monster not in Database!");
        return;
    }

    const monster = collection.find(i => i.monsterID === monsterID);

    // Anzahl dieses Monsters in der Collection zählen
    const duplicates = collection.filter(i => i.monsterID === monsterID).length;

    // Surrogate Key erzeugen (MonsterID + laufende Nummer)
    const surrogateID = `${monsterID}#${duplicates + 1}`;


    collection.push({
        surrogateID: surrogateID,
        monsterID: monDef.monsterID,
        monsterName: monDef.name,
        sortingID: monDef.sortingID,
        teamMember: false,
        isMain: false,
        type: monDef.type,
        health: monDef.health,
        physicalAttack: monDef.physicalAttack,
        physicalDefense: monDef.physicalDefense,
        soulAttack: monDef.soulAttack,
        soulDefense: monDef.soulDefense,
        speed: monDef.speed,
        description: monDef.description,
        isParalyzed: false,
        isBurnt: false,
        isAsleep: false,
        isFrozen: false,
        isPoisoned: false,
        inventory: [2],
        attacks: [4],
        level: randomizeMonstLevel
        }
    );
    saveCollection(collection);
    console.log("added to collection: ", monsterID);
    console.log("collection after adding: ", collection);
}

export async function addMonstToTeam(surrogateID) {

}

export async function removeMonstFromTeam(surrogateID) {

}

export function makeMonstMain(surrogateID) {
    const team = getTeam();
    team.forEach(monst => {
        monst.isMain = false;
    })
    const currentMain = team.find(monst => monst.surrogateID === surrogateID);
    currentMain.isMain = true;

    console.log("changed current main to: ",surrogateID)
    saveTeam(team);
}

export function randomizeMonstBaseStats(monsterID) {

}

export function randomizeMonstLevelUpStats(monsterID) {
}

export function randomizeMonstLevel() {
    let currentMap = mapMan.getCurrentMapKey();
    let minLevel;
    let maxLevel;

    switch(currentMap) {
        case 'map1':
        case 'route1':
            minLevel = 2;
            maxLevel = 12;
            break;

        case 'map2':
        case 'route2':
            minLevel = 10;
            maxLevel = 20;
            break;

        case 'map3':
        case 'darkForest':
            minLevel = 18;
            maxLevel = 28;
            break;

        case 'map4':
        case 'cave':
            minLevel = 25;
            maxLevel = 35;
            break;

        default:
            // Fallback für unbekannte Maps
            minLevel = 5;
            maxLevel = 15;
            console.warn(`Unbekannte Map: ${currentMap}, nutze Standard-Level`);
            break;
    }

    // Zufälliges Level zwischen min und max generieren
    const randomLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

    return randomLevel;

}

export function levelMonstUp() {

}

export function evolveMonst() {

}

export function spawnMonst() {
    const allMonst = getAllMonsters();


}

export function giveMonstItem(itemID) {

}

export function removeMonstItem(itemID) {

}
