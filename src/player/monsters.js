import { MapManager } from '/src/mapping/mapManager.js';
const mapMan = new MapManager();

export async function getAllMonsters() {
    const res = await fetch("./src/data/monsterData/wildMonsters.json")
    return await res.json();
}

export function getCollection() {
    return JSON.parse(localStorage.getItem("collection") || "[]")
}

export function getTeam() {
    return JSON.parse(localStorage.getItem("team") || "[]")
}

export function getWildMonst() {
    return JSON.parse(localStorage.getItem("wild") || "[]")
}

export function saveTeam(team) {
    localStorage.setItem("team", JSON.stringify(team));
}

export function saveCollection(collection) {
    localStorage.setItem("collection", JSON.stringify(collection));
}

export function saveWildMonst(wild) {
    localStorage.setItem("wild", JSON.stringify(wild));
}

function getUsedIDs() {
    return JSON.parse(localStorage.getItem("usedSurrogateIDs") || "[]");
}

function saveUsedIDs(list) {
    localStorage.setItem("usedSurrogateIDs", JSON.stringify(list));
}

export function loadMonstInfo(surrogateID) {
    const collection = getCollection();

    const monster = collection.find(monst => monst.surrogateID === surrogateID);
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

export async function addMonstToCollection(monsterID) {
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

    const prefix = `${monsterID}#`;

    // Liste aller bisher jemals vergebenen Surrogate-IDs
    const usedIDs = getUsedIDs();

    // Finde die kleinste Nummer, die es noch nicht gibt
    let num = 1;
    while (usedIDs.includes(`${prefix}${num}`)) {
        num++;
    }

    const surrogateID = `${prefix}${num}`;

    // ID dauerhaft speichern
    usedIDs.push(surrogateID);
    saveUsedIDs(usedIDs);

    collection.push({
        surrogateID: surrogateID,
        monsterID: monDef.monsterID,
        monsterName: monDef.name,
        sortingID: monDef.sortingID,
        teamMember: false,
        isMain: false,
        type: monDef.type,
        maxHealth: monDef.maxHealth,
        currentHealth: monDef.currentHealth,
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
        // Todo level: randomizeMonstLevel() find a better way to do this shit. It shouldnt be randomized. It should be randomized earlier with the wild monster spawning in
        }
    );
    saveCollection(collection);
    console.log("added to collection: ", monsterID);
    console.log("collection after adding: ", collection);
}

export async function addMonstToTeam(surrogateID) {
    let collection = await getCollection();
    let team = getTeam();
    const monDef = collection.find(i => i.surrogateID === surrogateID);
    if (!monDef) {
        console.log("Mon nicht in Collection!", surrogateID);
        return;
    }

    // Prüfen, ob das Monster bereits im Team ist
    const alreadyInTeam = team.find(i => i.surrogateID === surrogateID);
    if (alreadyInTeam) {
        console.warn("Monster ist bereits im Team!");
        return;
    }

    if (team.length >= 5) {
        console.warn("Das Team ist voll");
        return;
    } else {
        team.push({
            surrogateID: monDef.surrogateID,
            monsterID: monDef.monsterID,
            monsterName: monDef.name,
            sortingID: monDef.sortingID,
            teamMember: true,
            type: monDef.type,
            health: monDef.health,
            currentHealth: monDef.currentHealth,
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
        });
    }
    saveTeam(team);
    console.log("added to Team: ", surrogateID);
    console.log("Team after adding: ", team);
}

export async function removeMonstFromTeam(surrogateID) {
    let team = getTeam();
    const mon = team.find(i => i.surrogateID === surrogateID);

    if (!mon) {
        console.log("Monster not in Team!");
        return;
    }

    team = team.filter(i => i.surrogateID !== surrogateID);


    saveTeam(team);
    console.log("Removed from team:", surrogateID);
    console.log("team after removing: ", team);
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

export function randomizeMonstBaseStats(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomizeWildMonstLevelUpStats(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomizeWildMonstLevel() {
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
    let randomLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

    return randomLevel;

}

export async function createBaseMonst(monsterID){
    const allMons = await getAllMonsters();
    const wildMons = getWildMonst();

    const monst = allMons.find(i => i.monsterID === monsterID);
    if (!monst) {
        console.error("Monster not in Database!");
        return null;
    }
    else {
        const usedWildIDs = getUsedIDs();

        // Finde die kleinste Nummer, die es noch nicht gibt
        let num = 1;

        const prefix = `${monsterID}#`;

        while (usedWildIDs.includes(`${prefix}${num}`)) {
            num++;
        }

        const wildSurrogateID = `${prefix}${num}`;

        usedWildIDs.push(wildSurrogateID);
        saveUsedIDs(usedWildIDs);

        const baseMonster = {
            wildSurrogateID: wildSurrogateID,
            monsterID: monst.monsterID,
            monsterName: monst.name,
            sortingID: monst.sortingID,
            teamMember: false,
            isMain: false,
            type: monst.type,
            baseHealth: monst.baseHealth,
            health: randomizeMonstBaseStats(monst.baseHealth.min, monst.baseHealth.max),
            basePhysicalAttack: monst.basePhysicalAttack,
            physicalAttack: randomizeMonstBaseStats(monst.basePhysicalAttack.min, monst.basePhysicalAttack.max),
            basePhysicalDefense: monst.basePhysicalDefense,
            physicalDefense: randomizeMonstBaseStats(monst.basePhysicalDefense.min, monst.basePhysicalDefense.max),
            baseSoulAttack: monst.baseSoulAttack,
            soulAttack: randomizeMonstBaseStats(monst.baseSoulAttack.min, monst.baseSoulAttack.max),
            baseSoulDefense: monst.baseSoulDefense,
            soulDefense: randomizeMonstBaseStats(monst.baseSoulDefense.min, monst.baseSoulDefense.max),
            baseSpeed: monst.baseSpeed,
            speed: randomizeMonstBaseStats(monst.baseSpeed.min, monst.baseSpeed.max),
            description: monst.description,
            isParalyzed: false,
            isBurnt: false,
            isAsleep: false,
            isFrozen: false,
            isPoisoned: false,
            inventory: [2],
            attacks: [4],
            level: randomizeWildMonstLevel,
            evolLevel: monst.evolLevel,
            nextEvol: monst.nextEvol
        };
        wildMons.push(baseMonster)

        saveWildMonst(wildMons);
        console.log("added to wild monsters: ", monsterID);
        console.log("wild monsters after adding: ", wildMons);
        return baseMonster.wildSurrogateID;
    }


}

export async function createFinalMonst(wildSurrogateID) {
    const wildMons = getWildMonst();
    const wildMonstIndex = wildMons.findIndex(i => i.wildSurrogateID === wildSurrogateID);
    const wildMonst = wildMons[wildMonstIndex]
    if (wildMonst === -1) {
        console.error("Mon was not created in wild monsters!", wildSurrogateID);
        return;
    }

    //initializing all variables
    const currentLevel = wildMonst.level;
    const evolutionLevel = wildMonst.evolLevel;
    let name = wildMonst.name;
    let monsterID = wildMonst.monsterID;
    let sortingID = wildMonst.sortingID;
    let description = wildMonst.description;
    let tempWildSurrogateID = wildMonst.wildSurrogateID;
    let increasedHealth = 0;
    let increasedPhysicalAttack = 0;
    let increasedPhysicalDefense = 0;
    let increasedSoulAttack = 0;
    let increasedSoulDefense = 0;
    let increasedSpeed = 0;

    //loop for leveling up and also evo
    for (let i = 1; i <= currentLevel; i++) {
        if(i === evolutionLevel){
            const evolvedMon = await evolveWildMonst(wildSurrogateID);
            name = evolvedMon.name;
            monsterID = evolvedMon.monsterID;
            sortingID = evolvedMon.sortingID;
            description = evolvedMon.description;
            tempWildSurrogateID = evolvedMon.wildSurrogateID;
            increasedHealth += 10;
            increasedPhysicalAttack += 12
            increasedPhysicalDefense += 10
            increasedSoulAttack += 17
            increasedSoulDefense += 14
            increasedSpeed += 20;
        }
        increasedHealth += randomizeWildMonstLevelUpStats(wildMonst.increaseHealth.min, wildMonst.increaseHealth.max);
        increasedPhysicalAttack += randomizeWildMonstLevelUpStats(wildMonst.increasePhysicalAttack.min, wildMonst.increasePhysicalAttack.max);
        increasedPhysicalDefense += randomizeWildMonstLevelUpStats(wildMonst.increasePhysicalDefense.min, wildMonst.increasePhysicalDefense.max);
        increasedSoulAttack += randomizeWildMonstLevelUpStats(wildMonst.increaseSoulAttack.min, wildMonst.increaseSoulAttack.max);
        increasedSoulDefense += randomizeWildMonstLevelUpStats(wildMonst.increaseSoulDefense.min, wildMonst.increaseSoulDefense.max);
        increasedSpeed += randomizeWildMonstLevelUpStats(wildMonst.increaseSpeed.min, wildMonst.increaseSpeed.max);
    }

    let finalHealth = wildMonst.health + increasedHealth;
    let finalPhysicalAttack = wildMonst.physicalAttack + increasedPhysicalAttack;
    let finalPhysicalDefense = wildMonst.physicalDefense + increasedPhysicalDefense;
    let finalSoulAttack = wildMonst.soulAttack + increasedSoulAttack;
    let finalSoulDefense = wildMonst.soulDefense + increasedSoulDefense;
    let finalSpeed = wildMonst.speed + increasedSpeed;

    const finalMonster = {
        //...wildMonst,
        name: name,
        monsterID: monsterID,
        sortingID: sortingID,
        description: description,
        wildSurrogateID: tempWildSurrogateID,

        increaseHealth: wildMonst.increaseHealth,
        increasePhysicalAttack: wildMonst.increasePhysicalAttack,
        increasePhysicalDefense: wildMonst.increasePhysicalDefense,
        increaseSoulAttack: wildMonst.increaseSoulAttack,
        increaseSoulDefense: wildMonst.increaseSoulDefense,
        increaseSpeed: wildMonst.increaseSpeed,

        health: finalHealth,
        physicalAttack: finalPhysicalAttack,
        physicalDefense: finalPhysicalDefense,
        soulAttack: finalSoulAttack,
        soulDefense: finalSoulDefense,
        speed: finalSpeed
    }
    wildMons[wildMonstIndex] = finalMonster;
    saveWildMonst(wildMons);
    console.log("Monster finally created and updated: ", wildSurrogateID);
    console.log("wild monsters after new creation: ", wildMons);
    return finalMonster;

}

//TODO find a way to still count up surrogateID after evolving, as that surrogateID is not there anymore but the other mons still have their higher surrogateID. Prüfe, ob kleinere SurrogateIDs schon vergeben sind und fülle erstmnal diese auf, bevor du ein neues Objekt erstellst was dann eine dopplung der ID herbeiführen kann

export function levelWildMonstUp(monsterID) {

    randomizeWildMonstLevelUpStats(monsterID);
}


export async function spawnMonst(monsterID) {
    const wildSurrogateID = await createBaseMonst(monsterID);

    if (!wildSurrogateID) {
        return null;
    }

    const finalMonster = createFinalMonst(wildSurrogateID);
    return finalMonster;

}

export async function evolveWildMonst(wildSurrogateID) {
    const allMons = await getAllMonsters()
    const wildMons = getWildMonst();
    const wildMonstIndex = wildMons.findIndex(i => i.wildSurrogateID === wildSurrogateID);
    const wildMonst = wildMons[wildMonstIndex]
    if (wildMonst === -1) {
        console.log("test evolution function")
        console.error("Monster does not exist in wild monsters!", wildSurrogateID);
        return;
    }

    const nextEvolution = wildMonst.nextEvol;
    if(!nextEvolution){
        console.error("Monster: ", wildSurrogateID, ", can not evolve because it has no further evolution!")
    }
    const wildMonstEvol = allMons.find(i => i.monsterID === nextEvolution);

    // Anzahl dieses Monsters in der Collection zählen
    const duplicates = wildMons.filter(i => i.monsterID === nextEvolution).length;

    // Surrogate Key erzeugen (MonsterID + laufende Nummer)
    const tempWildSurrogateID = `${nextEvolution}#${duplicates + 1}`;

    const evolvedMonster = {
        monsterID: wildMonstEvol.monsterID,
        wildSurrogateID: tempWildSurrogateID,
        name: wildMonstEvol.name,
        sortingID: wildMonstEvol.sortingID,
        description: wildMonstEvol.description,
    }

    console.log("Wild monster: ", wildSurrogateID, " has been evolved into: ", tempWildSurrogateID);
    return evolvedMonster;
}

function increaseWildMonstLevelupStats(){

}

export function giveMonstItem(itemID) {

}

export function removeMonstItem(itemID) {

}



