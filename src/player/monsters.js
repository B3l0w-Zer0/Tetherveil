import {getCurrentMap} from "src/player/player.js"

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

export function loadMonstInfo(monsterID) {
    const team = getTeam();

    const monster = team.find(monst => monst.monsterID === monsterID);
    if (!monster) {
        console.error("Monster not found!");
        return;
    }
    return monster;
}

export function catchMonster(monsterID) {
    const info = loadMonstInfo(monsterID);

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
        attacks: [4]
        }
    );
    saveCollection(collection);
    console.log("added to collection: ", monsterID);
    console.log("collection after adding: ", collection);
}

export async function addMonstToTeam(monsterID) {

}

export function makeMonstMain(monsterID) {

}

export function giveMonstItem(itemID) {

}

export function randomizeMonstStats(monsterID) {

}

export function levelMonstUp() {

}

export function randomizeMonstLevel() {
    const currentMap = getCurrentMap();

    /*switchcase mapID von currentmap
    map 1 -> randomize level 2 - 12;
    map 2 -> ...
     */
}

export function evolveMonst() {

}