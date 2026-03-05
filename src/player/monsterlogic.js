import {MapManager} from '/src/mapping/mapManager.js';
import {giveWildMonsterBaseAttack, checkWildIfLvlUpAttack, giveWildMonstEvolveAttack} from '/src/fight/generalAttackLogic.js'

const mapMan = new MapManager();

export async function getAllMonsters() {
    const res = await fetch("./src/data/monsterData/wildMonsters.json")
    return await res.json();
}

export async function getStaticMonsters() {
    const res = await fetch("./src/data/monsterData/staticMonsters.json")
    return await res.json();
}

export function saveWildMonst(wild) {
    localStorage.setItem("wild", JSON.stringify(wild));
}

export function getWildMonst() {
    return JSON.parse(localStorage.getItem("wild") || "[]")
}

export function saveCollection(collection) {
    localStorage.setItem("collection", JSON.stringify(collection));
}

export function getCollection() {
    return JSON.parse(localStorage.getItem("collection") || "[]")
}

export function saveTeam(team) {
    localStorage.setItem("team", JSON.stringify(team));
}

export function getTeam() {
    return JSON.parse(localStorage.getItem("team") || "[]")
}

function saveUsedIDs(list) {
    localStorage.setItem("usedSurrogateIDs", JSON.stringify(list));
}

function getUsedIDs() {
    return JSON.parse(localStorage.getItem("usedSurrogateIDs") || "[]");
}

export async function createBaseMonst(monsterID, staticType, staticLevel) {
    const allMons = await getAllMonsters();
    const wildMons = getWildMonst();
    const monst = allMons.find(i => i.monsterID === monsterID);
    let wildSurrogateID;
    if (!monst) {
        console.error("Monster not in Database!");
        return null;
    } else {
        const usedWildIDs = getUsedIDs();

        // Finde die kleinste Nummer, die es noch nicht gibt
        let num = 1;

        const prefix = `${monsterID}#`;

        while (usedWildIDs.includes(`${prefix}${num}`)) {
            num++;
        }

        wildSurrogateID = `${prefix}${num}`;

        usedWildIDs.push(wildSurrogateID);
        saveUsedIDs(usedWildIDs);
    }

    let baseMonster;
    let unfinishedBaseMonster;
    const surrogateID = wildSurrogateID;
    const sortingID = monst.sortingID;
    const name = monst.name;
    const type = monst.type;
    const description = monst.description;
    const icon = monst.icon;
    const inventory = monst.inventory;
    const attacks = [];
    const statusEffects = monst.statusEffects;
    const catchrate = monst.catchrate;
    const elusiveness = monst.elusivenessFleeingProb;
    const evolLevel = monst.evolLevel;
    const nextEvol = monst.nextEvol;
    const maxLevel = monst.maxLevel;
    const necessaryEp = monst.baseNecessaryLvlUpEp;
    const increaseNecessaryLvlUpEp = monst.increaseNecessaryLvlUpEp;
    const currentEp = 0;
    const combinedEp = 0;
    const staticRandomType = staticType;
    const baseAttacks = monst.attackBaseSet;
    const lvlUpAttacks = monst.attackLearnSet;
    const staticLvlUpAttacks = monst.attackStaticSet;
    const evolveAttacks = monst.attackEvolutionSet;
    const weight = monst.weight;
    const height = monst.height;
    const strengthTier = monst.strengthTier


    switch (staticType) {
        case "completeStatic":
            console.log("Option for creation of completely Static Monster chosen.")
            unfinishedBaseMonster = await createStaticBaseMonst(monsterID);
            baseMonster = {
                ...unfinishedBaseMonster,
            }
            break;

        case "onlyLevelRandom":
            console.log("Option for creation of monster with only a randomized level chosen.")
            unfinishedBaseMonster = await createStaticBaseMonst(monsterID);
            baseMonster = {
                ...unfinishedBaseMonster,
            }
            break;

        case "onlyStatsRandom":
            console.log("Option for creation of Monster with only randomized stats chosen.")
            unfinishedBaseMonster = await createRandomBaseMonst(monsterID);
            baseMonster = {
                ...unfinishedBaseMonster,
            }
            break;

        case "completeRandom":
            console.log("Option for creation of completely random Monster chosen.")
            unfinishedBaseMonster = await createRandomBaseMonst(monsterID);
            baseMonster = {
                ...unfinishedBaseMonster,
            }
            break;

        default:
            console.error("Creation failed as no Option was given or option for creation was invalid.")
    }

    const finalBaseMonster = {
        surrogateID: surrogateID,
        sortingID: sortingID,
        staticType: staticRandomType,
        monsterID: monst.monsterID,
        name: name,
        type: type,
        description: description,
        catchrate: catchrate,
        elusiveness: elusiveness,
        inventory: inventory,
        attacks: attacks,
        evolLevel: evolLevel,
        nextEvol: nextEvol,
        icon: icon,
        statusEffects: statusEffects,
        maxLevel: maxLevel,
        necessaryEp: necessaryEp,
        increaseNecessaryLvlUpEp: increaseNecessaryLvlUpEp,
        currentEp: currentEp,
        combinedEp: combinedEp,
        baseAttacks: baseAttacks,
        lvlUpAttacks: lvlUpAttacks,
        staticLvlUpAttacks: staticLvlUpAttacks,
        evolveAttacks: evolveAttacks,
        weight: weight,
        height: height,
        level: 1,
        evolveIncreaseHealth: monst.evolveIncreaseHealth,
        evolveIncreasePhysicalAttack: monst.evolveIncreasePhysicalAttack,
        evolveIncreasePhysicalDefense: monst.evolveIncreasePhysicalDefense,
        evolveIncreaseSoulAttack: monst.evolveIncreaseSoulAttack,
        evolveIncreaseSoulDefense: monst.evolveIncreaseSoulDefense,
        evolveIncreaseSpeed: monst.evolveIncreaseSpeed,
        evolveIncreaseMana: monst.evolveIncreaseMana,
        evolveIncreaseStamina: monst.evolveIncreaseStamina,
        evolveIncreaseHealthStatic: monst.evolveIncreaseHealthStatic,
        evolveIncreasePhysicalAttackStatic: monst.evolveIncreasePhysicalAttackStatic,
        evolveIncreasePhysicalDefenseStatic: monst.evolveIncreasePhysicalDefenseStatic,
        evolveIncreaseSoulAttackStatic: monst.evolveIncreaseSoulAttackStatic,
        evolveIncreaseSoulDefenseStatic: monst.evolveIncreaseSoulDefenseStatic,
        evolveIncreaseSpeedStatic: monst.evolveIncreaseSpeedStatic,
        evolveIncreaseManaStatic: monst.evolveIncreaseManaStatic,
        evolveIncreaseStaminaStatic: monst.evolveIncreaseStaminaStatic,
        ...baseMonster

    }


    wildMons.push(finalBaseMonster)
    saveWildMonst(wildMons);

    console.log("added to wild monsters: ", monsterID, " with surrogateID: ", surrogateID);
    console.log("wild monsters after adding: ", wildMons);

    return finalBaseMonster;
}

//to create a monster which is completely static or just has its level randomized
async function createStaticBaseMonst(monsterID) {
    const allMons = await getAllMonsters();
    const monst = allMons.find(i => i.monsterID === monsterID)
    let baseStaticMonst;
    if (!monst) {
        console.error("Monster not in Database of Static Monsters");
        return null;
    } else {

        let baseHealth = monst.baseHealthStatic;
        let basePhysicalAttack = monst.basePhysicalAttackStatic;
        let basePhysicalDefense = monst.basePhysicalDefenseStatic;
        let baseSoulAttack = monst.baseSoulAttackStatic;
        let baseSoulDefense = monst.baseSoulDefenseStatic;
        let baseSpeed = monst.baseSpeedStatic;
        let baseMana = monst.baseManaStatic;
        let baseStamina = monst.baseStaminaStatic;
        const increaseHealth = monst.increaseHealthStatic;
        const increasePhysicalAttack = monst.increasePhysicalAttackStatic;
        const increasePhysicalDefense = monst.increasePhysicalDefenseStatic;
        const increaseSoulAttack = monst.increaseSoulAttackStatic;
        const increaseSoulDefense = monst.increaseSoulDefenseStatic;
        const increaseSpeed = monst.increaseSpeedStatic;
        const increaseMana = monst.increaseManaStatic;
        const increaseStamina = monst.increaseStaminaStatic;

        console.log("completely static or only level random monster chosen")


        baseStaticMonst = {
            health: baseHealth,
            physicalAttack: basePhysicalAttack,
            physicalDefense: basePhysicalDefense,
            soulAttack: baseSoulAttack,
            soulDefense: baseSoulDefense,
            speed: baseSpeed,
            mana: baseMana,
            stamina: baseStamina,
            increaseHealthStatic: increaseHealth,
            increasePhysicalAttackStatic: increasePhysicalAttack,
            increasePhysicalDefenseStatic: increasePhysicalDefense,
            increaseSoulAttackStatic: increaseSoulAttack,
            increaseSoulDefenseStatic: increaseSoulDefense,
            increaseSpeedStatic: increaseSpeed,
            increaseManaStatic: increaseMana,
            increaseStaminaStatic: increaseStamina
        }
    }
    return baseStaticMonst;
}

//to create a monster which is completely random or just has its stats randomized
async function createRandomBaseMonst(monsterID) {
    const allMons = await getAllMonsters();
    const monst = allMons.find(i => i.monsterID === monsterID)
    let baseRandomMonst;
    if (!monst) {
        console.error("Monster not in Database of Monsters");
        return null;
    } else {

//Block with all of the given attributes so I can use them later
        let baseHealth = randomizeMonstBaseStats(monst.baseHealth.min, monst.baseHealth.max)
        let basePhysicalAttack = randomizeMonstBaseStats(monst.basePhysicalAttack.min, monst.basePhysicalAttack.max)
        let basePhysicalDefense = randomizeMonstBaseStats(monst.basePhysicalDefense.min, monst.basePhysicalDefense.max)
        let baseSoulAttack = randomizeMonstBaseStats(monst.baseSoulAttack.min, monst.baseSoulAttack.max)
        let baseSoulDefense = randomizeMonstBaseStats(monst.baseSoulDefense.min, monst.baseSoulDefense.max)
        let baseSpeed = randomizeMonstBaseStats(monst.baseSpeed.min, monst.baseSpeed.max)
        let baseMana = randomizeMonstBaseStats(monst.baseMana.min, monst.baseMana.max)
        let baseStamina = randomizeMonstBaseStats(monst.baseStamina.min, monst.baseStamina.max)
        const increaseHealth = monst.increaseHealth;
        const increasePhysicalAttack = monst.increasePhysicalAttack;
        const increasePhysicalDefense = monst.increasePhysicalDefense;
        const increaseSoulAttack = monst.increaseSoulAttack;
        const increaseSoulDefense = monst.increaseSoulDefense;
        const increaseSpeed = monst.increaseSpeed;
        const increaseMana = monst.increaseMana;
        const increaseStamina = monst.increaseStamina;

        console.log("completely random or only stats random monster chosen")

        baseRandomMonst = {
            health: baseHealth,
            physicalAttack: basePhysicalAttack,
            physicalDefense: basePhysicalDefense,
            soulAttack: baseSoulAttack,
            soulDefense: baseSoulDefense,
            speed: baseSpeed,
            mana: baseMana,
            stamina: baseStamina,
            increaseHealth: increaseHealth,
            increasePhysicalAttack: increasePhysicalAttack,
            increasePhysicalDefense: increasePhysicalDefense,
            increaseSoulAttack: increaseSoulAttack,
            increaseSoulDefense: increaseSoulDefense,
            increaseSpeed: increaseSpeed,
            increaseMana: increaseMana,
            increaseStamina: increaseStamina

        }
    }
    return baseRandomMonst;
}


export async function createFinalMonst(surrogateID, finalLevel) {
    if (!surrogateID) {
        console.log("SurrogateID was null", surrogateID);
        return null
    }

    const wildMons = getWildMonst();
    let wildMonst
    let wildMonstIndex
    let level
    let finalMonst

    wildMonstIndex = wildMons.findIndex(i => i?.surrogateID === surrogateID)
    if (wildMonstIndex === -1) {
        console.error("monster could not be finalized")
        return null;
    } else {
        wildMonst = wildMons[wildMonstIndex];
        level = finalLevel;

        let currentSurrogateID = wildMons[wildMonstIndex].surrogateID

        for (let i = 1; i < level; i++) {
            currentSurrogateID = wildMons[wildMonstIndex].surrogateID
            finalMonst = await levelWildMonstUp(currentSurrogateID, i+1)
            if (!finalMonst) return null;
            // nach Evolution hat das Monster eine neue ID
            currentSurrogateID = finalMonst.surrogateID;
            console.log("monster ", finalMonst, " has had its stats increased as level up once more now to level ", i + 1)
            wildMons[wildMonstIndex] = finalMonst;
            saveWildMonst(wildMons);
        }
    }



    console.log("monster: ", surrogateID, " has been successfully finalized and now has the surrogateID: ", finalMonst.surrogateID, " with level: ", finalMonst.level);
    return finalMonst;
}


export async function levelWildMonstUp(surrogateID, tempNextLevel) {
    const wildMons = getWildMonst();
    let oldLevel
    let evolLevel
    let maxLevel
    let levelUpMonst


    let wildMonst;
    console.log("About to level up Monster:")

    const wildMonstIndex = wildMons.findIndex(i => i?.surrogateID === surrogateID)
    if (wildMonstIndex === -1) {
        console.error("Monster does not exist in wild monsters!", surrogateID);
        return null;
    } else {
        wildMonst = wildMons[wildMonstIndex];
        oldLevel = wildMonst.level;
        maxLevel = wildMonst.maxLevel;

        if (tempNextLevel > maxLevel) {
            console.error("Monster can not be leveled up as it has reached its current maximum level.")
        } else {
            evolLevel = wildMonst.evolLevel;
            if (!evolLevel) {
                console.log("evolution level can not be found. Normal Level up of Monster initiated!")
                levelUpMonst = increaseNormalWildLvlUpStats(surrogateID)
            } else if (tempNextLevel === evolLevel) {
                console.log("evolution level was reached, thus initiating evolution of monster: ", surrogateID)
                levelUpMonst = await evolveWildMonst(surrogateID);
            } else {
                console.log("evolution level has not been reached yet so normal Level up of Monster has been initiated!")
                levelUpMonst = increaseNormalWildLvlUpStats(surrogateID)
            }
        }

    }

    if (!levelUpMonst) {
        console.error("monster was null, terminating now");
        return null;
    } else {
        wildMons[wildMonstIndex] = levelUpMonst;
        saveWildMonst(wildMons)
        console.log("Leveled up Monster: ", wildMonst.surrogateID);
        return levelUpMonst;
    }
}

export function increaseNormalWildLvlUpStats(surrogateID) {
    const wildMons = getWildMonst();
    let level;
    let nextLevel
    let necessaryEp
    let increaseNecessaryLvlUpEp;
    let currentEp;
    let increasedHealth
    let increasedPhysicalAttack
    let increasedPhysicalDefense
    let increasedSoulAttack
    let increasedSoulDefense
    let increasedSpeed
    let increasedMana
    let increasedStamina
    let finalHealth
    let finalPhysicalAttack
    let finalPhysicalDefense
    let finalSoulAttack
    let finalSoulDefense
    let finalSpeed
    let finalMana
    let finalStamina
    let staticRandomType;
    let wildMonst;
    let attacks
    let increaseHealth
    let increasePhysicalAttack
    let increasePhysicalDefense
    let increaseSoulAttack
    let increaseSoulDefense
    let increaseStamina
    let increaseSpeed
    let increaseMana

    const wildMonstIndex = wildMons.findIndex(i => i?.surrogateID === surrogateID)
    if (wildMonstIndex === -1) {
        console.error("Monster was not found in wild Monsters!")
        return null;
    } else {
        wildMonst = wildMons[wildMonstIndex];
        level = wildMonst.level;
        nextLevel = level + 1
        staticRandomType = wildMonst.staticType;
        attacks = checkWildIfLvlUpAttack(wildMonst, nextLevel)
        console.warn("current attacks: ", attacks)

        console.log(wildMonst)

        switch (staticRandomType) {
            case "completeStatic":
                console.log("Level Up for Monster of completely static monster chosen")
                increasedHealth = wildMonst.increaseHealthStatic;
                increasedPhysicalAttack = wildMonst.increasePhysicalAttackStatic;
                increasedPhysicalDefense = wildMonst.increasePhysicalDefenseStatic;
                increasedSoulAttack = wildMonst.increaseSoulAttackStatic;
                increasedSoulDefense = wildMonst.increaseSoulDefenseStatic;
                increasedSpeed = wildMonst.increaseSpeedStatic;
                increasedMana = wildMonst.increaseManaStatic;
                increasedStamina = wildMonst.increaseStaminaStatic;
                break;

            case "onlyLevelRandom":
                console.log("Level Up for monster with only randomized level chosen.")
                increasedHealth = wildMonst.increaseHealthStatic;
                increasedPhysicalAttack = wildMonst.increasePhysicalAttackStatic;
                increasedPhysicalDefense = wildMonst.increasePhysicalDefenseStatic;
                increasedSoulAttack = wildMonst.increaseSoulAttackStatic;
                increasedSoulDefense = wildMonst.increaseSoulDefenseStatic;
                increasedSpeed = wildMonst.increaseSpeedStatic;
                increasedMana = wildMonst.increaseManaStatic;
                increasedStamina = wildMonst.increaseStaminaStatic;
                break;

            case "onlyStatsRandom":
                console.log("Level Up for Monster with only randomized stats chosen.")
                increaseHealth = wildMonst.increaseHealth;
                increasePhysicalAttack = wildMonst.increasePhysicalAttack
                increasedHealth = randomizeMonstLevelUpStats(increaseHealth.min, increaseHealth.max);
                increasedPhysicalAttack = randomizeMonstLevelUpStats(increasePhysicalAttack.min, increasePhysicalAttack.max);
                increasedPhysicalDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalDefense.min, wildMonst.increasePhysicalDefense.max);
                increasedSoulAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulAttack.min, wildMonst.increaseSoulAttack.max);
                increasedSoulDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulDefense.min, wildMonst.increaseSoulDefense.max);
                increasedSpeed = randomizeMonstLevelUpStats(wildMonst.increaseSpeed.min, wildMonst.increaseSpeed.max);
                increasedMana = randomizeMonstLevelUpStats(wildMonst.increaseMana.min, wildMonst.increaseMana.max);
                increasedStamina = randomizeMonstLevelUpStats(wildMonst.increaseStamina.min, wildMonst.increaseStamina.max);
                break;

            case "completeRandom":
                console.log("Level Up for completely random Monster chosen.")
                increaseHealth = wildMonst.increaseHealth;
                increasePhysicalAttack = wildMonst.increasePhysicalAttack
                console.log(increasePhysicalAttack.min, "pa", increaseHealth.min, "health")
                increasedHealth = randomizeMonstLevelUpStats(increaseHealth.min, increaseHealth.max);
                increasedPhysicalAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalAttack.min, wildMonst.increasePhysicalAttack.max);
                increasedPhysicalDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalDefense.min, wildMonst.increasePhysicalDefense.max);
                increasedSoulAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulAttack.min, wildMonst.increaseSoulAttack.max);
                increasedSoulDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulDefense.min, wildMonst.increaseSoulDefense.max);
                increasedSpeed = randomizeMonstLevelUpStats(wildMonst.increaseSpeed.min, wildMonst.increaseSpeed.max);
                increasedMana = randomizeMonstLevelUpStats(wildMonst.increaseMana.min, wildMonst.increaseMana.max);
                increasedStamina = randomizeMonstLevelUpStats(wildMonst.increaseStamina.min, wildMonst.increaseStamina.max);
                break;

            default:
                console.error("Level Up failed as no Option was given or option for Level Up was invalid.")
        }
/*
        console.log("staticType:", wildMonst.staticType);
        console.log("increaseHealthStatic:", wildMonst.increaseHealthStatic);
        console.log("health:", wildMonst.health);

 */

        finalHealth = increasedHealth + wildMonst.health;
        finalPhysicalAttack = increasedPhysicalAttack + wildMonst.physicalAttack;
        finalPhysicalDefense = increasedPhysicalDefense + wildMonst.physicalDefense;
        finalSoulAttack = increasedSoulAttack + wildMonst.soulAttack;
        finalSoulDefense = increasedSoulDefense + wildMonst.soulDefense;
        finalSpeed = increasedSpeed + wildMonst.speed;
        finalMana = increasedMana + wildMonst.mana;
        finalStamina = increasedStamina + wildMonst.stamina;
        necessaryEp = wildMonst.necessaryEp * wildMonst.increaseNecessaryLvlUpEp;
        increaseNecessaryLvlUpEp = wildMonst.increaseNecessaryLvlUpEp;
        currentEp = 0;
        level = nextLevel;

    }


    const levelUpMonst = {
        ...wildMonst,
        health: finalHealth,
        physicalAttack: finalPhysicalAttack,
        physicalDefense: finalPhysicalDefense,
        soulAttack: finalSoulAttack,
        soulDefense: finalSoulDefense,
        speed: finalSpeed,
        mana: finalMana,
        stamina: finalStamina,
        necessaryEp: necessaryEp,
        increaseNecessaryLvlUpEp: increaseNecessaryLvlUpEp,
        currentEp: currentEp,
        attacks: attacks,
        level: level
    }
    console.log("Increased stats for Monster: ", levelUpMonst, " on level ", level);
    return levelUpMonst;
}

export async function evolveWildMonst(previousWildSurrogateID) {
    const allMons = await getAllMonsters()
    const wildMons = getWildMonst();
    let newSurrogateID
    let level;
    let oldLevel
    let nextLevel
    let necessaryEp
    let increaseNecessaryLvlUpEp;
    let currentEp;
    let increasedHealth
    let increasedPhysicalAttack
    let increasedPhysicalDefense
    let increasedSoulAttack
    let increasedSoulDefense
    let increasedSpeed
    let increasedMana
    let increasedStamina
    let staticRandomType;
    let wildMonst;
    let attacks;

    const wildMonstIndex = wildMons.findIndex(i => i.surrogateID === previousWildSurrogateID);
    console.log("test evolution function");
    if (wildMonstIndex === -1) {
        console.error("Monster does not exist in wild monsters!", previousWildSurrogateID);
        return null;
    } else {
        wildMonst = wildMons[wildMonstIndex];
        const nextEvolution = wildMonst.nextEvol;
        if (!nextEvolution) {
            console.error("Monster: ", previousWildSurrogateID, ", can not evolve because it has no further evolution!")
            return null;
        } else {
            const usedWildIDs = getUsedIDs();

            // Finde die kleinste Nummer, die es noch nicht gibt
            let num = 1;

            const prefix = `${nextEvolution}#`;

            while (usedWildIDs.includes(`${prefix}${num}`)) {
                num++;
            }

            newSurrogateID = `${prefix}${num}`;

            usedWildIDs.push(newSurrogateID);
            saveUsedIDs(usedWildIDs);
        }

        const wildMonstEvol = allMons.find(i => i.monsterID === nextEvolution);
        const surrogateID = newSurrogateID;
        const sortingID = wildMonstEvol.sortingID;
        const monsterID = wildMonstEvol.monsterID;
        const name = wildMonstEvol.name;
        const type = wildMonstEvol.type;
        const description = wildMonstEvol.description;
        const icon = wildMonstEvol.icon;
        const catchrate = wildMonstEvol.catchrate;
        const evolLevel = wildMonstEvol.evolLevel;
        const nextEvol = wildMonstEvol.nextEvol;
        const maxLevel = wildMonstEvol.maxLevel;


        /*const nextEvolChangeStats = {
            monsterID: monsterID,
            surrogateID: surrogateID,
            name: name,
            type: type,
            description: description,
            icon: icon,
            catchrate: catchrate,
            evolLevel: evolLevel,
            nextEvol: nextEvol,
            maxLevel: maxLevel,
        }

         */

        level = wildMonst.level;
        nextLevel = wildMonst.level + 1
        oldLevel = wildMonst.level;
        staticRandomType = wildMonst.staticType;
        attacks = checkWildIfLvlUpAttack(wildMonst, nextLevel)
        console.warn("current attacks: ", attacks)

        if (nextLevel === wildMonst.evolLevel) {
            switch (staticRandomType) {
                case "completeStatic":
                    console.log("Level Up for Monster of completely static monster chosen")
                    increasedHealth = wildMonst.evolveIncreaseHealthStatic;
                    increasedPhysicalAttack = wildMonst.evolveIncreasePhysicalAttackStatic;
                    increasedPhysicalDefense = wildMonst.evolveIncreasePhysicalDefenseStatic;
                    increasedSoulAttack = wildMonst.evolveIncreaseSoulAttackStatic;
                    increasedSoulDefense = wildMonst.evolveIncreaseSoulDefenseStatic;
                    increasedSpeed = wildMonst.evolveIncreaseSpeedStatic;
                    increasedMana = wildMonst.evolveIncreaseManaStatic;
                    increasedStamina = wildMonst.evolveIncreaseStaminaStatic;
                    break;

                case "onlyLevelRandom":
                    console.log("Level Up for monster with only randomized level chosen.")
                    increasedHealth = wildMonst.evolveIncreaseHealthStatic;
                    increasedPhysicalAttack = wildMonst.evolveIncreasePhysicalAttackStatic;
                    increasedPhysicalDefense = wildMonst.evolveIncreasePhysicalDefenseStatic;
                    increasedSoulAttack = wildMonst.evolveIncreaseSoulAttackStatic;
                    increasedSoulDefense = wildMonst.evolveIncreaseSoulDefenseStatic;
                    increasedSpeed = wildMonst.evolveIncreaseSpeedStatic;
                    increasedMana = wildMonst.evolveIncreaseManaStatic;
                    increasedStamina = wildMonst.evolveIncreaseStaminaStatic;
                    break;

                case "onlyStatsRandom":
                    console.log("Level Up for Monster with only randomized stats chosen.")
                    increasedHealth = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseHealth.min, wildMonst.evolveIncreaseHealth.max);
                    increasedPhysicalAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalAttack.min, wildMonst.evolveIncreasePhysicalAttack.max);
                    increasedPhysicalDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalDefense.min, wildMonst.evolveIncreasePhysicalDefense.max);
                    increasedSoulAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulAttack.min, wildMonst.evolveIncreaseSoulAttack.max);
                    increasedSoulDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulDefense.min, wildMonst.evolveIncreaseSoulDefense.max);
                    increasedSpeed = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSpeed.min, wildMonst.evolveIncreaseSpeed.max);
                    increasedMana = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseMana.min, wildMonst.evolveIncreaseMana.max);
                    increasedStamina = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseStamina.min, wildMonst.evolveIncreaseStamina.max);
                    break;

                case "completeRandom":
                    console.log("Level Up for completely random Monster chosen.")
                    increasedHealth = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseHealth.min, wildMonst.evolveIncreaseHealth.max);
                    increasedPhysicalAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalAttack.min, wildMonst.evolveIncreasePhysicalAttack.max);
                    increasedPhysicalDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalDefense.min, wildMonst.evolveIncreasePhysicalDefense.max);
                    increasedSoulAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulAttack.min, wildMonst.evolveIncreaseSoulAttack.max);
                    increasedSoulDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulDefense.min, wildMonst.evolveIncreaseSoulDefense.max);
                    increasedSpeed = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSpeed.min, wildMonst.evolveIncreaseSpeed.max);
                    increasedMana = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseMana.min, wildMonst.evolveIncreaseMana.max);
                    increasedStamina = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseStamina.min, wildMonst.evolveIncreaseStamina.max);
                    break;

                default:
                    console.error("Level Up failed as no Option was given or option for Level Up was invalid.")
            }

            const finalHealth = increasedHealth + wildMonst.health;
            const finalPhysicalAttack = increasedPhysicalAttack + wildMonst.physicalAttack;
            const finalPhysicalDefense = increasedPhysicalDefense + wildMonst.physicalDefense;
            const finalSoulAttack = increasedSoulAttack + wildMonst.soulAttack;
            const finalSoulDefense = increasedSoulDefense + wildMonst.soulDefense;
            const finalSpeed = increasedSpeed + wildMonst.speed;
            const finalMana = increasedMana + wildMonst.mana;
            const finalStamina = increasedStamina + wildMonst.stamina;
            necessaryEp = wildMonst.necessaryEp * wildMonst.increaseNecessaryLvlUpEp;
            increaseNecessaryLvlUpEp = wildMonst.increaseNecessaryLvlUpEp;
            currentEp = 0;
            level = nextLevel;
            const lvlUpAttacks = wildMonstEvol.attackLearnSet;
            const staticLvlUpAttacks = wildMonstEvol.attackStaticSet;
            const evolveAttacks = wildMonstEvol.attackEvolutionSet;
            attacks = giveWildMonstEvolveAttack(wildMonst)

            const evolvedMonst = {
                ...wildMonst,

                surrogateID: surrogateID,
                sortingID: sortingID,
                staticType: staticRandomType,
                monsterID: monsterID,
                name: name,
                type: type,
                description: description,
                catchrate: catchrate,
                evolLevel: evolLevel,
                nextEvol: nextEvol,
                icon: icon,
                maxLevel: maxLevel,
                attacks: attacks,
                health: finalHealth,
                physicalAttack: finalPhysicalAttack,
                physicalDefense: finalPhysicalDefense,
                soulAttack: finalSoulAttack,
                soulDefense: finalSoulDefense,
                speed: finalSpeed,
                mana: finalMana,
                stamina: finalStamina,
                level: level,
                necessaryEp: necessaryEp,
                increaseNecessaryLvlUpEp: increaseNecessaryLvlUpEp,
                currentEp: currentEp,
                lvlUpAttacks: lvlUpAttacks,
                staticLvlUpAttacks: staticLvlUpAttacks,
                evolveAttacks: evolveAttacks,
            }
            wildMons[wildMonstIndex] = evolvedMonst;
            saveWildMonst(wildMons)
            console.log("Evolved Monster: ", wildMonst.surrogateID, " with level ", oldLevel, " to Monster: ", evolvedMonst.surrogateID, " with Level: ", level);
            return evolvedMonst;
        } else {
            console.error("Evolution and level upnot possible as the Level for evolution is not reached yet.")
            return wildMonst;
        }
    }
}

export function levelCollectionAndTeamMonstUp(surrogateID) {
    const collection = getCollection();
    let level;
    let oldLevel
    let nextLevel
    let evolLevel
    let maxLevel
    let levelUpMonst

    let collectionMonst;
    console.log("About to level up Monster:")

    const collectionMonstIndex = collection.findIndex(i => i.surrogateID === surrogateID)
    if (collectionMonstIndex === -1) {
        console.error("Monster does not exist in wild monsters!", surrogateID);
    } else {
        collectionMonst = collection[collectionMonstIndex];
        level = collectionMonst.level;
        nextLevel = collectionMonst.level + 1
        oldLevel = collectionMonst.level;
        maxLevel = collectionMonst.maxLevel;
        if (nextLevel > maxLevel) {
            console.error("Monster can not be leveled up as it has reached its current maximum level.")
        } else {
            evolLevel = collectionMonst.evolLevel;
            if (!evolLevel) {
                console.log("evolution level can not be found. Normal Level up of Monster initiated!")
                levelUpMonst = increaseNormalCollectionAndTeamLvlUpStats(surrogateID)
            } else if (nextLevel === evolLevel) {
                console.log("evolution level was reached, thus initiating evolution of monster: ", surrogateID)
                levelUpMonst = evolveCollectionAndTeamMonst(surrogateID);
            } else {
                console.log("evolution level has not been reached yet so normal Level up of Monster has been initiated!")
                levelUpMonst = increaseNormalCollectionAndTeamLvlUpStats(surrogateID)
            }
        }

    }

    collection[collectionMonstIndex] = levelUpMonst;
    saveWildMonst(collection)
    console.log("Leveled up Monster: ", collectionMonst.surrogateID, " from level ", oldLevel, " to level ", level);
    return levelUpMonst;
}

export function increaseNormalCollectionAndTeamLvlUpStats(surrogateID) {
    const collection = getCollection();
    let level;
    let nextLevel
    let necessaryEp
    let increaseNecessaryLvlUpEp;
    let currentEp;
    let increasedHealth
    let increasedPhysicalAttack
    let increasedPhysicalDefense
    let increasedSoulAttack
    let increasedSoulDefense
    let increasedSpeed
    let increasedMana
    let increasedStamina
    let finalHealth
    let finalPhysicalAttack
    let finalPhysicalDefense
    let finalSoulAttack
    let finalSoulDefense
    let finalSpeed
    let finalMana
    let finalStamina
    let staticRandomType;
    let collectionMonst;

    const collectionMonstIndex = collection.findIndex(i => i.surrogateID === surrogateID)
    if (collectionMonstIndex === -1) {
        console.error("Monster was not found in wild Monsters!")
        return null;
    } else {
        collectionMonst = collection[collectionMonstIndex];
        level = collectionMonst.level;
        nextLevel = collectionMonst.level + 1
        staticRandomType = collectionMonst.staticType;

        switch (staticRandomType) {
            case "completeStatic":
                console.log("Level Up for Monster of completely static monster chosen")
                increasedHealth = collectionMonst.increaseHealthStatic;
                increasedPhysicalAttack = collectionMonst.increasePhysicalAttackStatic;
                increasedPhysicalDefense = collectionMonst.increasePhysicalDefenseStatic;
                increasedSoulAttack = collectionMonst.increaseSoulAttackStatic;
                increasedSoulDefense = collectionMonst.increaseSoulDefenseStatic;
                increasedSpeed = collectionMonst.increaseSpeedStatic;
                increasedMana = collectionMonst.increaseManaStatic;
                increasedStamina = collectionMonst.increaseStaminaStatic;
                break;

            case "onlyLevelRandom":
                console.log("Level Up for monster with only randomized level chosen.")
                increasedHealth = collectionMonst.increaseHealthStatic;
                increasedPhysicalAttack = collectionMonst.increasePhysicalAttackStatic;
                increasedPhysicalDefense = collectionMonst.increasePhysicalDefenseStatic;
                increasedSoulAttack = collectionMonst.increaseSoulAttackStatic;
                increasedSoulDefense = collectionMonst.increaseSoulDefenseStatic;
                increasedSpeed = collectionMonst.increaseSpeedStatic;
                increasedMana = collectionMonst.increaseManaStatic;
                increasedStamina = collectionMonst.increaseStaminaStatic;
                break;

            case "onlyStatsRandom":
                console.log("Level Up for Monster with only randomized stats chosen.")
                increasedHealth = randomizeMonstLevelUpStats(collectionMonst.increaseHealth.min, collectionMonst.increaseHealth.max);
                increasedPhysicalAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalAttack.min, collectionMonst.increasePhysicalAttack.max);
                increasedPhysicalDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalDefense.min, collectionMonst.increasePhysicalDefense.max);
                increasedSoulAttack = randomizeMonstLevelUpStats(collectionMonst.increaseSoulAttack.min, collectionMonst.increaseSoulAttack.max);
                increasedSoulDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulDefense.min, collectionMonst.increaseSoulDefense.max);
                increasedSpeed = randomizeMonstLevelUpStats(collectionMonst.increaseSpeed.min, collectionMonst.increaseSpeed.max);
                increasedMana = randomizeMonstLevelUpStats(collectionMonst.increaseMana.min, collectionMonst.increaseMana.max);
                increasedStamina = randomizeMonstLevelUpStats(collectionMonst.increaseStamina.min, collectionMonst.increaseStamina.max);
                break;

            case "completeRandom":
                console.log("Level Up for completely random Monster chosen.")
                increasedHealth = randomizeMonstLevelUpStats(collectionMonst.increaseHealth.min, collectionMonst.increaseHealth.max);
                increasedPhysicalAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalAttack.min, collectionMonst.increasePhysicalAttack.max);
                increasedPhysicalDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalDefense.min, collectionMonst.increasePhysicalDefense.max);
                increasedSoulAttack = randomizeMonstLevelUpStats(collectionMonst.increaseSoulAttack.min, collectionMonst.increaseSoulAttack.max);
                increasedSoulDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulDefense.min, collectionMonst.increaseSoulDefense.max);
                increasedSpeed = randomizeMonstLevelUpStats(collectionMonst.increaseSpeed.min, collectionMonst.increaseSpeed.max);
                increasedMana = randomizeMonstLevelUpStats(collectionMonst.increaseMana.min, collectionMonst.increaseMana.max);
                increasedStamina = randomizeMonstLevelUpStats(collectionMonst.increaseStamina.min, collectionMonst.increaseStamina.max);
                break;

            default:
                console.error("Level Up failed as no Option was given or option for Level Up was invalid.")
        }

        finalHealth = increasedHealth + collectionMonst.health;
        finalPhysicalAttack = increasedPhysicalAttack + collectionMonst.physicalAttack;
        finalPhysicalDefense = increasedPhysicalDefense + collectionMonst.physicalDefense;
        finalSoulAttack = increasedSoulAttack + collectionMonst.soulAttack;
        finalSoulDefense = increasedSoulDefense + collectionMonst.soulDefense;
        finalSpeed = increasedSpeed + collectionMonst.speed;
        finalMana = increasedMana + collectionMonst.mana;
        finalStamina = increasedStamina + collectionMonst.stamina;
        necessaryEp = collectionMonst.necessaryEp * collectionMonst.increaseNecessaryLvlUpEp;
        increaseNecessaryLvlUpEp = collectionMonst.increaseNecessaryLvlUpEp;
        currentEp = 0;
        level = nextLevel;
    }


    const levelUpMonst = {
        ...collectionMonst,
        health: finalHealth,
        physicalAttack: finalPhysicalAttack,
        physicalDefense: finalPhysicalDefense,
        soulAttack: finalSoulAttack,
        soulDefense: finalSoulDefense,
        speed: finalSpeed,
        mana: finalMana,
        stamina: finalStamina,
        level: level,
        necessaryEp: necessaryEp,
        increaseNecessaryLvlUpEp: increaseNecessaryLvlUpEp,
        currentEp: currentEp
    }
    console.log("Increased stats for Monster: ", surrogateID);
    return levelUpMonst;
}

export async function evolveCollectionAndTeamMonst(previousSurrogateID) {
    const allMons = await getAllMonsters()
    const collection = getCollection();
    let newSurrogateID
    let level;
    let oldLevel
    let nextLevel
    let nextEvol
    let necessaryEp
    let increaseNecessaryLvlUpEp;
    let currentEp;
    let increasedHealth
    let increasedPhysicalAttack
    let increasedPhysicalDefense
    let increasedSoulAttack
    let increasedSoulDefense
    let increasedSpeed
    let increasedMana
    let increasedStamina
    let staticRandomType;
    let collectionMonst;

    const collectionMonstIndex = collection.findIndex(i => i.surrogateID === previousSurrogateID);
    console.log("test evolution function");
    if (collectionMonstIndex === -1) {
        console.error("Monster does not exist in wild monsters!", previousSurrogateID);
        return null;
    } else {
        collectionMonst = collection[collectionMonstIndex];
        const nextEvolution = collectionMonst.nextEvol;
        if (!nextEvolution) {
            console.error("Monster: ", previousSurrogateID, ", can not evolve because it has no further evolution!")
            return null;
        } else {
            const usedCollectionIDs = getUsedIDs();

            // Finde die kleinste Nummer, die es noch nicht gibt
            let num = 1;

            const prefix = `${nextEvolution}#`;

            while (usedWildIDs.includes(`${prefix}${num}`)) {
                num++;
            }

            newSurrogateID = `${prefix}${num}`;

            usedCollectionIDs.push(newSurrogateID);
            saveUsedIDs(usedCollectionIDs);
        }

        const collectionMonstEvol = allMons.find(i => i.monsterID === nextEvolution);
        const surrogateID = newSurrogateID;
        const sortingID = collectionMonstEvol.sortingID;
        const monsterID = collectionMonstEvol.monsterID;
        const name = collectionMonstEvol.name;
        const type = collectionMonstEvol.type;
        const description = collectionMonstEvol.description;
        const icon = collectionMonstEvol.icon;
        const catchrate = collectionMonstEvol.catchrate;
        const evolLevel = collectionMonstEvol.evolLevel;
        const nextEvol = collectionMonstEvol.nextEvol;
        const maxLevel = collectionMonstEvol.maxLevel;


        /*const nextEvolChangeStats = {
            monsterID: monsterID,
            surrogateID: surrogateID,
            name: name,
            type: type,
            description: description,
            icon: icon,
            catchrate: catchrate,
            evolLevel: evolLevel,
            nextEvol: nextEvol,
            maxLevel: maxLevel,
        }

         */

        level = collectionMonst.level;
        nextLevel = collectionMonst.level + 1
        oldLevel = collectionMonst.level;
        staticRandomType = collectionMonst.staticType;
        if (nextLevel === collectionMonst.evolLevel) {
            switch (staticRandomType) {
                case "completeStatic":
                    console.log("Level Up for Monster of completely static monster chosen")
                    increasedHealth = collectionMonst.evolveIncreaseHealthStatic;
                    increasedPhysicalAttack = collectionMonst.evolveIncreasePhysicalAttackStatic;
                    increasedPhysicalDefense = collectionMonst.evolveIncreasePhysicalDefenseStatic;
                    increasedSoulAttack = collectionMonst.evolveIncreaseSoulAttackStatic;
                    increasedSoulDefense = collectionMonst.evolveIncreaseSoulDefenseStatic;
                    increasedSpeed = collectionMonst.evolveIncreaseSpeedStatic;
                    increasedMana = collectionMonst.evolveIncreaseManaStatic;
                    increasedStamina = collectionMonst.evolveIncreaseStaminaStatic;
                    break;

                case "onlyLevelRandom":
                    console.log("Level Up for monster with only randomized level chosen.")
                    increasedHealth = collectionMonst.evolveIncreaseHealthStatic;
                    increasedPhysicalAttack = collectionMonst.evolveIncreasePhysicalAttackStatic;
                    increasedPhysicalDefense = collectionMonst.evolveIncreasePhysicalDefenseStatic;
                    increasedSoulAttack = collectionMonst.evolveIncreaseSoulAttackStatic;
                    increasedSoulDefense = collectionMonst.evolveIncreaseSoulDefenseStatic;
                    increasedSpeed = collectionMonst.evolveIncreaseSpeedStatic;
                    increasedMana = collectionMonst.evolveIncreaseManaStatic;
                    increasedStamina = collectionMonst.evolveIncreaseStaminaStatic;
                    break;

                case "onlyStatsRandom":
                    console.log("Level Up for Monster with only randomized stats chosen.")
                    increasedHealth = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseHealth.min, collectionMonst.evolveIncreaseHealth.max);
                    increasedPhysicalAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalAttack.min, collectionMonst.evolveIncreasePhysicalAttack.max);
                    increasedPhysicalDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalDefense.min, collectionMonst.evolveIncreasePhysicalDefense.max);
                    increasedSoulAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulAttack.min, collectionMonst.evolveIncreaseSoulAttack.max);
                    increasedSoulDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulDefense.min, collectionMonst.evolveIncreaseSoulDefense.max);
                    increasedSpeed = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSpeed.min, collectionMonst.evolveIncreaseSpeed.max);
                    increasedMana = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseMana.min, collectionMonst.evolveIncreaseMana.max);
                    increasedStamina = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseStamina.min, collectionMonst.evolveIncreaseStamina.max);
                    break;

                case "completeRandom":
                    console.log("Level Up for completely random Monster chosen.")
                    increasedHealth = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseHealth.min, collectionMonst.evolveIncreaseHealth.max);
                    increasedPhysicalAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalAttack.min, collectionMonst.evolveIncreasePhysicalAttack.max);
                    increasedPhysicalDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalDefense.min, collectionMonst.evolveIncreasePhysicalDefense.max);
                    increasedSoulAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulAttack.min, collectionMonst.evolveIncreaseSoulAttack.max);
                    increasedSoulDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulDefense.min, collectionMonst.evolveIncreaseSoulDefense.max);
                    increasedSpeed = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSpeed.min, collectionMonst.evolveIncreaseSpeed.max);
                    increasedMana = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseMana.min, collectionMonst.evolveIncreaseMana.max);
                    increasedStamina = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseStamina.min, collectionMonst.evolveIncreaseStamina.max);
                    break;

                default:
                    console.error("Level Up failed as no Option was given or option for Level Up was invalid.")
            }

            const finalHealth = increasedHealth + collectionMonst.health;
            const finalPhysicalAttack = increasedPhysicalAttack + collectionMonst.physicalAttack;
            const finalPhysicalDefense = increasedPhysicalDefense + collectionMonst.physicalDefense;
            const finalSoulAttack = increasedSoulAttack + collectionMonst.soulAttack;
            const finalSoulDefense = increasedSoulDefense + collectionMonst.soulDefense;
            const finalSpeed = increasedSpeed + collectionMonst.speed;
            const finalMana = increasedMana + collectionMonst.mana;
            const finalStamina = increasedStamina + collectionMonst.stamina;
            necessaryEp = collectionMonst.necessaryEp * collectionMonst.increaseNecessaryLvlUpEp;
            increaseNecessaryLvlUpEp = collectionMonst.increaseNecessaryLvlUpEp;
            currentEp = 0;
            level = nextLevel;


            const evolvedMonst = {
                ...collectionMonst,

                surrogateID: surrogateID,
                sortingID: sortingID,
                staticType: staticRandomType,
                monsterID: monsterID,
                name: name,
                type: type,
                description: description,
                catchrate: catchrate,
                evolLevel: evolLevel,
                nextEvol: nextEvol,
                icon: icon,
                maxLevel: maxLevel,
                health: finalHealth,
                physicalAttack: finalPhysicalAttack,
                physicalDefense: finalPhysicalDefense,
                soulAttack: finalSoulAttack,
                soulDefense: finalSoulDefense,
                speed: finalSpeed,
                mana: finalMana,
                stamina: finalStamina,
                level: level,
                necessaryEp: necessaryEp,
                increaseNecessaryLvlUpEp: increaseNecessaryLvlUpEp,
                currentEp: currentEp
            }
            collection[collectionMonstIndex] = evolvedMonst;
            saveCollection(collection)
            console.log("Evolved Monster: ", collectionMonst.surrogateID, " with level ", oldLevel, " to Monster: ", evolvedMonst.surrogateID, " with Level: ", level);
            return evolvedMonst;
        } else {
            console.error("Level up not possible as the Level for evolution is not reached yet.")
            return collectionMonst;
        }
    }
}

/*
export function levelCollectionAndTeamMonstUp(surrogateID) {
    const collection = getCollection();
    const team = getTeam()
    let level;
    let necessaryEp
    let increaseNecessaryLvlUpEp
    let currentEp
    let increasedHealth
    let increasedPhysicalAttack
    let increasedPhysicalDefense
    let increasedSoulAttack
    let increasedSoulDefense
    let increasedSpeed
    let increasedMana
    let increasedStamina

    let staticRandomType;
    let monst;

    console.log("About to level up Monster: ", surrogateID);

    const collectionMonstIndex = collection.findIndex(i => i.surrogateID === surrogateID)
    if (collectionMonstIndex === -1) {
        console.error("Monster does not exist in collection", surrogateID);
        return null;
    } else {

        monst = collection[collectionMonstIndex];
        level = monst.level;
        staticRandomType = monst.staticType;

        switch (staticRandomType) {
            case "completeStatic":
                console.log("Level Up for Monster of completely static monster chosen")
                increasedHealth = monst.increaseHealthStatic;
                increasedPhysicalAttack = monst.increasePhysicalAttackStatic;
                increasedPhysicalDefense = monst.increasePhysicalDefenseStatic;
                increasedSoulAttack = monst.increaseSoulAttackStatic;
                increasedSoulDefense = monst.increaseSoulDefenseStatic;
                increasedSpeed = monst.increaseSpeedStatic;
                increasedMana = monst.increaseManaStatic;
                increasedStamina = monst.increaseStaminaStatic;
                break;

            case "onlyLevelRandom":
                console.log("Level Up for monster with only randomized level chosen.")
                increasedHealth = monst.increaseHealthStatic;
                increasedPhysicalAttack = monst.increasePhysicalAttackStatic;
                increasedPhysicalDefense = monst.increasePhysicalDefenseStatic;
                increasedSoulAttack = monst.increaseSoulAttackStatic;
                increasedSoulDefense = monst.increaseSoulDefenseStatic;
                increasedSpeed = monst.increaseSpeedStatic;
                increasedMana = monst.increaseManaStatic;
                increasedStamina = monst.increaseStaminaStatic;
                break;

            case "onlyStatsRandom":
                console.log("Level Up for Monster with only randomized stats chosen.")
                increasedHealth = randomizeMonstLevelUpStats(monst.increaseHealth.min, monst.increaseHealth.max);
                increasedPhysicalAttack = randomizeMonstLevelUpStats(monst.increasePhysicalAttack.min, monst.increasePhysicalAttack.max);
                increasedPhysicalDefense = randomizeMonstLevelUpStats(monst.increasePhysicalDefense.min, monst.increasePhysicalDefense.max);
                increasedSoulAttack = randomizeMonstLevelUpStats(monst.increaseSoulAttack.min, monst.increaseSoulAttack.max);
                increasedSoulDefense = randomizeMonstLevelUpStats(monst.increaseSoulDefense.min, monst.increaseSoulDefense.max);
                increasedSpeed = randomizeMonstLevelUpStats(monst.increaseSpeed.min, monst.increaseSpeed.max);
                increasedMana = randomizeMonstLevelUpStats(monst.increaseMana.min, monst.increaseMana.max);
                increasedStamina = randomizeMonstLevelUpStats(monst.increaseStamina.min, monst.increaseStamina.max);
                break;

            case "completeRandom":
                console.log("Level Up for completely random Monster chosen.")
                increasedHealth = randomizeMonstLevelUpStats(monst.increaseHealth.min, monst.increaseHealth.max);
                increasedPhysicalAttack = randomizeMonstLevelUpStats(monst.increasePhysicalAttack.min, monst.increasePhysicalAttack.max);
                increasedPhysicalDefense = randomizeMonstLevelUpStats(monst.increasePhysicalDefense.min, monst.increasePhysicalDefense.max);
                increasedSoulAttack = randomizeMonstLevelUpStats(monst.increaseSoulAttack.min, monst.increaseSoulAttack.max);
                increasedSoulDefense = randomizeMonstLevelUpStats(monst.increaseSoulDefense.min, monst.increaseSoulDefense.max);
                increasedSpeed = randomizeMonstLevelUpStats(monst.increaseSpeed.min, monst.increaseSpeed.max);
                increasedMana = randomizeMonstLevelUpStats(monst.increaseMana.min, monst.increaseMana.max);
                increasedStamina = randomizeMonstLevelUpStats(monst.increaseStamina.min, monst.increaseStamina.max);
                break;

            default:
                console.error("Level Up failed as no Option was given or option for Level Up was invalid.")
                return null;
        }
    }
    const finalHealth = increasedHealth + monst.health;
    const finalPhysicalAttack = increasedPhysicalAttack + monst.physicalAttack;
    const finalPhysicalDefense = increasedPhysicalDefense + monst.physicalDefense;
    const finalSoulAttack = increasedSoulAttack + monst.soulAttack;
    const finalSoulDefense = increasedSoulDefense + monst.soulDefense;
    const finalSpeed = increasedSpeed + monst.speed;
    const finalMana = increasedMana + monst.mana;
    const finalStamina = increasedStamina + monst.stamina;
    necessaryEp = monst.necessaryEp * monst.increaseNecessaryLvlUpEp;
    increaseNecessaryLvlUpEp = monst.increaseNecessaryLvlUpEp;
    currentEp = 0;
    level += 1;

    const levelUpMonst = {
        ...monst,
        health: finalHealth,
        physicalAttack: finalPhysicalAttack,
        physicalDefense: finalPhysicalDefense,
        soulAttack: finalSoulAttack,
        soulDefense: finalSoulDefense,
        speed: finalSpeed,
        mana: finalMana,
        stamina: finalStamina,
        level: level,
        necessaryEp: necessaryEp,
        increaseNecessaryLvlUpEp: increaseNecessaryLvlUpEp,
        currentEp: currentEp
    }

    const teamMonstIndex = team.findIndex(i => i.surrogateID === surrogateID)
    if (teamMonstIndex === -1) {
        console.log("Will not also be leveled up in team as it is not there.")
    } else {
        team[teamMonstIndex] = levelUpMonst
        saveTeam(team)
    }

    collection[collectionMonstIndex] = levelUpMonst;
    saveCollection(collection)
    console.log("Leveled up Monster: ", monst.surrogateID, " from level ", monst.level, " to level ", level);
    return levelUpMonst;
}


 */

export function increaseEp(surrogateID, epValue) {
    const collection = getCollection();
    let epIncrease = epValue;
    let monst
    let currentEp
    let necessaryEp
    let epLeftForLevelUp
    let leveledMonst
    let combinedEp;

    const collectionMonstIndex = collection.findIndex(i => i.surrogateID === surrogateID)
    if (collectionMonstIndex === -1) {
        console.log("Monster can not have its EP value risen as it does not exist.")
    } else {
        monst = collection[collectionMonstIndex];
        currentEp = monst.currentEp;
        combinedEp = monst.combinedEp
        if (epIncrease > 0) {
            combinedEp += epIncrease;
            necessaryEp = monst.necessaryEp;
            epLeftForLevelUp = necessaryEp - currentEp;
            if (epIncrease >= epLeftForLevelUp) {
                while (epIncrease >= epLeftForLevelUp) {
                    epIncrease = epIncrease - epLeftForLevelUp;
                    leveledMonst = levelCollectionAndTeamMonstUp(surrogateID);
                    if (!leveledMonst) {
                        console.error("Level up failed.");
                        return null;
                    }
                    epLeftForLevelUp = leveledMonst.necessaryEp;

                }
                currentEp = leveledMonst.currentEp + epIncrease;
            } else {
                currentEp = currentEp + epIncrease;
            }
            epIncrease = 0;
        } else {
            console.error("Congratulations dipshit, you just got literal zero or even negative EP. Great Accomplishment. Like actually! Your monster is so happy about literally nothing happening! (:")
            return null;
        }
        const updatedCollection = getCollection();
        const updatedCollectionIndex = updatedCollection.findIndex(i => i.surrogateID === surrogateID);
        updatedCollection[updatedCollectionIndex].currentEp = currentEp;
        updatedCollection[updatedCollectionIndex].combinedEp = combinedEp;
        saveCollection(updatedCollection);

        const updatedTeam = getTeam();
        const updatedTeamIndex = updatedTeam.findIndex(i => i.surrogateID === surrogateID);
        if (updatedTeamIndex !== -1) {
            updatedTeam[updatedTeamIndex].currentEp = currentEp;
            updatedTeam[updatedTeamIndex].combinedEp = combinedEp;
            saveTeam(updatedTeam);
        }
    }
    return surrogateID

}


export function loadMonstInfo(surrogateID) {
    const collection = getCollection();

    const monst = collection.find(monst => monst.surrogateID === surrogateID);
    if (!monst) {
        console.error("Monster not found!");
        return;
    }
    console.log("Test to show information for monster: ", monst.name, " with surrogateID: ", monst.surrogateID);
    return monst;
}

export function loadWildMonstInfo(surrogateID) {
    const wildMons = getWildMonst();

    const monst = wildMons.find(monst => monst.surrogateID === surrogateID);
    if (!monst) {
        console.error("Monster not in wild monsters database!")
        return;
    }
    console.log("Test to show information for monster: ", monst.name, " with surrogateID: ", monst.surrogateID);
    return monst;
}

export async function createCompleteStaticMonster(monsterID, staticLevel) {
    const baseMonst = await createBaseMonst(monsterID, "completeStatic", staticLevel);
    const surrogateID = baseMonst.surrogateID;
    console.log(surrogateID)
    const attacks = giveWildMonsterBaseAttack(surrogateID)
    let level = staticLevel
    console.log("monster is going to be created with level ", level)

    const wildMons = getWildMonst();
    const monstIndex = wildMons.findIndex(i => i.surrogateID === surrogateID);

    if (monstIndex === -1) {
        console.error("monster does not exist")
        return null;
    } else {
        wildMons[monstIndex].attacks = attacks;
        saveWildMonst(wildMons);
        console.log(wildMons)

        const finalMonst = await createFinalMonst(surrogateID, level)
        console.log("monster ", finalMonst, " was created")
        return finalMonst;
    }
}

export async function createOnlyLevelRandomMonster(monsterID) {
    const baseMonst = await createBaseMonst(monsterID, "onlyLevelRandom", 0);
    const surrogateID = baseMonst.surrogateID;
    const attacks = giveWildMonsterBaseAttack(surrogateID)
    let level = randomizeMonstBaseLevel();
    console.log("monster is going to be created with level ", level)


    const wildMons = getWildMonst();
    const monstIndex = wildMons.findIndex(i => i.surrogateID === surrogateID);

    if (monstIndex === -1) {
        console.error("monster does not exist")
        return null;
    } else {
        wildMons[monstIndex].attacks = attacks;
        saveWildMonst(wildMons);
        console.log(wildMons)

        const finalMonst = await createFinalMonst(surrogateID, level)
        console.log("monster ", finalMonst, " was created")
        return finalMonst;
    }
}

export async function createOnlyStatsRandomMonster(monsterID, staticLevel) {
    const baseMonst = await createBaseMonst(monsterID, "onlyStatsRandom", staticLevel);
    const surrogateID = baseMonst.surrogateID;
    const attacks = giveWildMonsterBaseAttack(surrogateID)
    let level = staticLevel
    console.log("monster is going to be created with level ", level)


    const wildMons = getWildMonst();
    const monstIndex = wildMons.findIndex(i => i.surrogateID === surrogateID);

    if (monstIndex === -1) {
        console.error("monster does not exist")
        return null;
    } else {
        wildMons[monstIndex].attacks = attacks;
        saveWildMonst(wildMons);
        console.log(wildMons)

        const finalMonst = await createFinalMonst(surrogateID, level)
        console.log("monster ", finalMonst, " was created")
        return finalMonst;
    }
}

export async function createCompleteRandomMonster(monsterID) {
    const baseMonst = await createBaseMonst(monsterID, "completeRandom", 0);
    const surrogateID = baseMonst.surrogateID;
    console.log(surrogateID)
    const attacks = giveWildMonsterBaseAttack(surrogateID)
    let level = randomizeMonstBaseLevel();
    console.log("monster is going to be created with level ", level)


    const wildMons = getWildMonst();
    const monstIndex = wildMons.findIndex(i => i && i.surrogateID === surrogateID);

    if (monstIndex === -1) {
        console.error("monster does not exist")
        return null;
    } else {
        wildMons[monstIndex].attacks = attacks;

        saveWildMonst(wildMons);
        console.log(wildMons)

        const finalMonst = await createFinalMonst(surrogateID, level)
        console.log("monster ", finalMonst, " was created")
        return finalMonst;
    }
}

export function catchMonster(surrogateID) {
    const wildMons = getWildMonst();
    const monst = loadWildMonstInfo(surrogateID);
    const wildMonstIndex = wildMons.findIndex(i => i?.surrogateID === surrogateID)
    if (wildMonstIndex === -1) {
        console.log("Monster was not created in wild Monsters.")
        return null;
    } else {
        const catchrate = monst.catchrate / 100;
        const actualCatch = Math.random();
        if (catchrate > actualCatch) {
            addMonstToCollection(surrogateID)
            console.log("Player Caught: ", monst.name)
            wildMons.splice(wildMonstIndex, 1);

        } else {
            console.log(monst.name, " could not be caught")
        }

        saveWildMonst(wildMons);
    }
}

//todo in fight scene after fight clear all wildMons. also when monster flees so that it can not be brought back

/*
export function addMonstToCollection(surrogateID) {
    console.log("test for adding Monster to collection");
    const wildMons = getWildMonst();
    let collection = getCollection();

    const monst = wildMons.find(i => i.surrogateID === surrogateID);
    if (!monst) {
        console.log("Monster not in Wild Monsters Database (Test for adding to collection)")
        return null;
    } else {
        const alreadyInCollection = collection.find(i => i.surrogateID === surrogateID);
        if (alreadyInCollection) {
            console.warn("Monster is already in Collection! Either Error in SurrogateID calculation or invalid function call (that should not be there. Possibly player cheat input)");
            return null;
        } else {
            const collectionMonst = {
                ...monst,
                teamMember: false,
                isMain: false
            }
            collection.push(collectionMonst);
            saveCollection(collection);
            console.log("Monster added to Collection: ", surrogateID)
        }
        console.log("Collection after adding: ", collection)
    }
}

/*
export async function addMonstToCollection(monsterID) {
    const allMons = await getAllMonsters();
    const wildMons = await getWildMonst();
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
        }
    );
    saveCollection(collection);
    console.log("added to collection: ", monsterID);
    console.log("collection after adding: ", collection);
}
 */

/*export function addMonstToTeam(surrogateID) {
    let collection = getCollection();
    let team = getTeam();
    const monst = collection.find(i => i.surrogateID === surrogateID)
    if (!monst) {
        console.log("Monster is not in Collection: ", surrogateID)
        return null;
    } else {
        const alreadyInTeam = team.find(i => i.surrogateID === surrogateID);
        if (alreadyInTeam) {
            console.warn("Monster is already in Team!");
            return null;
        } else if (team.length >= 5) {
            console.warn("Team capacity is full.");
            return null;
        } else {
            const teamMonst = {
                ...monst,
                teamMonst: true,
                isMain: false
            }
            team.push(teamMonst)
            saveTeam(team);
        }
    }
}

/*
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

 */

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

    console.log("changed current main to: ", surrogateID)
    saveTeam(team);
}

export function randomizeMonstBaseStats(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomizeMonstLevelUpStats(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomizeMonstLevel(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomizeMonstBaseLevel() {
    let currentMap = mapMan.getCurrentMapKey();
    let minLevel;
    let maxLevel;

    switch (currentMap) {
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


export async function spawnMonst(monsterID) {
    const wildSurrogateID = await createBaseMonst(monsterID);

    if (!wildSurrogateID) {
        return null;
    }

    const finalMonster = createFinalMonst(wildSurrogateID);
    console.log("monster ", finalMonster, " was just spawned")
    return finalMonster;

}


function increaseWildMonstLevelupStats() {

}

export function giveMonstItem(itemID) {

}

export function removeMonstItem(itemID) {

}

/*Todo:
1. scrap all of this shit
2. rewrite to make it correct order of following:
    - create Base monster
    - create final monster
    - !! very important: make it with a parameter to only randomize certain things
        1. c -> completely random
        2. s -> only stats random
        3. l -> only level random
        4. n -> not randomized for static monsters -> make another single json file where you put these monsters and write the catchrate as specific number or just also put this in final method
    --> create new method for each one of these just like the spawn monster function to just call it and automatically generate the monster of choice with the wanted parameter
        -> when level not randomized -> make another input value for that function so that the level gets called and put right in !! BUT BEFORE THE STATS ARE CALCULATED DEPENDING ON LEVEL !!
    - put in catchrate and also implement catch monster for monsters in wild monster list.
    - create new lists for each one of those parameters from which we can choose and divide the different monster types. Still look at only using unique and not yet used SurrogateIDs
    - write method for automatically adding monster to collection -> look at eggs or such from pokemon that you can collect and get the monster. But put in a parameter that lets me decide,
        if i want the option 1: let player decide if he wants to keep or leave monster or Option 2: force monster into player collection as part of a quest, story or such which he can not leave or let out of his team
        -> create new boolean for that which is probably saved in story monsters.json or such or just add that if the parameter is on and then check for that boolean triggered by the parameter.
        Tldr: add parameter which enables player decision -> keep it or leave it or just force him to have it -> triggers boolean which is checked if player wants to remove monster from team or collection -> important story monsters
        also: add parameter for static monsters which can not be caught -> triggers another boolean and sets catchrate at 0 or even triggers text like "this monster is too mighty to be caught"

3. add monster to collection and to team -> be able to remove it from collection and team
4. give monster
last updated: 17.02.2026 14:55
 */