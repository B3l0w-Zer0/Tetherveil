import {MapManager} from '/src/mapping/mapManager.js';
import {
    giveWildMonsterBaseAttack,
    checkWildIfLvlUpAttack,
    giveWildMonstEvolveAttack
} from '/src/fight/generalAttackLogic.js'

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
    const items = [];


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
        strengthTier: strengthTier,
        beatenEP: randomizeMonstBaseStats(monst.baseBeatenEP.min, monst.baseBeatenEP.max),
        beatenEPMultiplier: monst.beatenEPMultiplier,
        items: items,
        ...baseMonster
//todo hier noch den rest der stats durch evolution zuweisen. Die müssen in Die static function noch rein, weil ich sie hier abstrahiert habe und in der funktion hier nicht mehr drin. einfach wie in random monster auch :)
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

        let basePhysicalMeeleeAttack = monst.basePhysicalMeeleeAttackStatic
        let basePhysicalRangeAttack = monst.basePhysicalRangeAttackStatic
        let basePhysicalSpecialAttack = monst.basePhysicalSpecialAttackStatic
        let basePhysicalBluntAttack = monst.basePhysicalBluntAttackStatic
        let basePhysicalSlashingAttack = monst.basePhysicalSlashingAttackStatic
        let basePhysicalPierceAttack = monst.basePhysicalPierceAttackStatic

        let baseSoulMeeleeAttack = monst.baseSoulMeeleeAttackStatic
        let baseSoulRangeAttack = monst.baseSoulRangeAttackStatic
        let baseSoulSpecialAttack = monst.baseSoulSpecialAttackStatic
        let baseSoulBluntAttack = monst.baseSoulBluntAttackStatic
        let baseSoulSlashingAttack = monst.baseSoulSlashingAttackStatic
        let baseSoulPierceAttack = monst.baseSoulPierceAttackStatic

        let basePhysicalMeeleeDefense = monst.basePhysicalMeeleeDefenseStatic
        let basePhysicalRangeDefense = monst.basePhysicalRangeDefenseStatic
        let basePhysicalSpecialDefense = monst.basePhysicalSpecialDefenseStatic
        let basePhysicalBluntDefense = monst.basePhysicalBluntDefenseStatic
        let basePhysicalSlashingDefense = monst.basePhysicalSlashingDefenseStatic
        let basePhysicalPierceDefense = monst.basePhysicalPierceDefenseStatic

        let baseSoulMeeleeDefense = monst.baseSoulMeeleeDefenseStatic
        let baseSoulRangeDefense = monst.baseSoulRangeDefenseStatic
        let baseSoulSpecialDefense = monst.baseSoulSpecialDefenseStatic
        let baseSoulBluntDefense = monst.baseSoulBluntDefenseStatic
        let baseSoulSlashingDefense = monst.baseSoulSlashingDefenseStatic
        let baseSoulPierceDefense = monst.baseSoulPierceDefenseStatic

        const increaseHealth = monst.increaseHealthStatic;
        const increasePhysicalAttack = monst.increasePhysicalAttackStatic;
        const increasePhysicalDefense = monst.increasePhysicalDefenseStatic;
        const increaseSoulAttack = monst.increaseSoulAttackStatic;
        const increaseSoulDefense = monst.increaseSoulDefenseStatic;
        const increaseSpeed = monst.increaseSpeedStatic;
        const increaseMana = monst.increaseManaStatic;
        const increaseStamina = monst.increaseStaminaStatic;

        const increasePhysicalMeeleeAttack = monst.increasePhysicalMeeleeAttackStatic
        const increasePhysicalRangeAttack = monst.increasePhysicalRangeAttackStatic
        const increasePhysicalSpecialAttack = monst.increasePhysicalSpecialAttackStatic
        const increasePhysicalBluntAttack = monst.increasePhysicalBluntAttackStatic
        const increasePhysicalSlashingAttack = monst.increasePhysicalSlashingAttackStatic
        const increasePhysicalPierceAttack = monst.increasePhysicalPierceAttackStatic

        const increaseSoulMeeleeAttack = monst.increaseSoulMeeleeAttackStatic
        const increaseSoulRangeAttack = monst.increaseSoulRangeAttackStatic
        const increaseSoulSpecialAttack = monst.increaseSoulSpecialAttackStatic
        const increaseSoulBluntAttack = monst.increaseSoulBluntAttackStatic
        const increaseSoulSlashingAttack = monst.increaseSoulSlashingAttackStatic
        const increaseSoulPierceAttack = monst.increaseSoulPierceAttackStatic

        const increasePhysicalMeeleeDefense = monst.increasePhysicalMeeleeDefenseStatic
        const increasePhysicalRangeDefense = monst.increasePhysicalRangeDefenseStatic
        const increasePhysicalSpecialDefense = monst.increasePhysicalSpecialDefenseStatic
        const increasePhysicalBluntDefense = monst.increasePhysicalBluntDefenseStatic
        const increasePhysicalSlashingDefense = monst.increasePhysicalSlashingDefenseStatic
        const increasePhysicalPierceDefense = monst.increasePhysicalPierceDefenseStatic

        const increaseSoulMeeleeDefense = monst.increaseSoulMeeleeDefenseStatic
        const increaseSoulRangeDefense = monst.increaseSoulRangeDefenseStatic
        const increaseSoulSpecialDefense = monst.increaseSoulSpecialDefenseStatic
        const increaseSoulBluntDefense = monst.increaseSoulBluntDefenseStatic
        const increaseSoulSlashingDefense = monst.increaseSoulSlashingDefenseStatic
        const increaseSoulPierceDefense = monst.increaseSoulPierceDefenseStatic

        console.log("completely static or only level random monster chosen")

        console.log("all assigned base stats: ", basePhysicalMeeleeAttack,
            basePhysicalRangeAttack,
            basePhysicalSpecialAttack,
            basePhysicalBluntAttack,
            basePhysicalSlashingAttack,
            basePhysicalPierceAttack,
            baseSoulMeeleeAttack,
            baseSoulRangeAttack,
            baseSoulSpecialAttack,
            baseSoulBluntAttack,
            baseSoulSlashingAttack,
            baseSoulPierceAttack,
            basePhysicalMeeleeDefense,
            basePhysicalRangeDefense,
            basePhysicalSpecialDefense,
            basePhysicalBluntDefense,
            basePhysicalSlashingDefense,
            basePhysicalPierceDefense,
            baseSoulMeeleeDefense,
            baseSoulRangeDefense,
            baseSoulSpecialDefense,
            baseSoulBluntDefense,
            baseSoulSlashingDefense,
            baseSoulPierceDefense,
            increasePhysicalMeeleeAttack,
        increasePhysicalRangeAttack,
        increasePhysicalSpecialAttack,
        increasePhysicalBluntAttack,
        increasePhysicalSlashingAttack,
        increasePhysicalPierceAttack,
        increaseSoulMeeleeAttack,
        increaseSoulRangeAttack,
            increaseSoulSpecialAttack,
        increaseSoulBluntAttack,
            increaseSoulSlashingAttack,
        increaseSoulPierceAttack,
        increasePhysicalMeeleeDefense,
        increasePhysicalRangeDefense,
        increasePhysicalSpecialDefense,
        increasePhysicalBluntDefense,
        increasePhysicalSlashingDefense,
        increasePhysicalPierceDefense,
        increaseSoulMeeleeDefense,
        increaseSoulRangeDefense,
        increaseSoulSpecialDefense,
        increaseSoulBluntDefense,
        increaseSoulSlashingDefense,
        increaseSoulPierceDefense,
        )

        baseStaticMonst = {
            health: baseHealth,
            maxHealth: baseHealth,
            physicalAttack: basePhysicalAttack,
            physicalDefense: basePhysicalDefense,
            soulAttack: baseSoulAttack,
            soulDefense: baseSoulDefense,
            speed: baseSpeed,
            mana: baseMana,
            stamina: baseStamina,

            physicalMeeleeAttack: basePhysicalMeeleeAttack,
            physicalRangeAttack: basePhysicalRangeAttack,
            physicalSpecialAttack: basePhysicalSpecialAttack,
            physicalBluntAttack: basePhysicalBluntAttack,
            physicalSlashingAttack: basePhysicalSlashingAttack,
            physicalPierceAttack: basePhysicalPierceAttack,

            soulMeeleeAttack: baseSoulMeeleeAttack,
            soulRangeAttack: baseSoulRangeAttack,
            soulSpecialAttack: baseSoulSpecialAttack,
            soulBluntAttack: baseSoulBluntAttack,
            soulSlashingAttack: baseSoulSlashingAttack,
            soulPierceAttack: baseSoulPierceAttack,

            physicalMeeleeDefense: basePhysicalMeeleeDefense,
            physicalRangeDefense: basePhysicalRangeDefense,
            physicalSpecialDefense: basePhysicalSpecialDefense,
            physicalBluntDefense: basePhysicalBluntDefense,
            physicalSlashingDefense: basePhysicalSlashingDefense,
            physicalPierceDefense: basePhysicalPierceDefense,

            soulMeeleeDefense: baseSoulMeeleeDefense,
            soulRangeDefense: baseSoulRangeDefense,
            soulSpecialDefense: baseSoulSpecialDefense,
            soulBluntDefense: baseSoulBluntDefense,
            soulSlashingDefense: baseSoulSlashingDefense,
            soulPierceDefense: baseSoulPierceDefense,

            increaseHealthStatic: increaseHealth,
            increasePhysicalAttackStatic: increasePhysicalAttack,
            increasePhysicalDefenseStatic: increasePhysicalDefense,
            increaseSoulAttackStatic: increaseSoulAttack,
            increaseSoulDefenseStatic: increaseSoulDefense,
            increaseSpeedStatic: increaseSpeed,
            increaseManaStatic: increaseMana,
            increaseStaminaStatic: increaseStamina,

            increasePhysicalMeeleeAttackStatic: increasePhysicalMeeleeAttack,
            increasePhysicalRangeAttackStatic: increasePhysicalRangeAttack,
            increasePhysicalSpecialAttackStatic: increasePhysicalSpecialAttack,
            increasePhysicalBluntAttackStatic: increasePhysicalBluntAttack,
            increasePhysicalSlashingAttackStatic: increasePhysicalSlashingAttack,
            increasePhysicalPierceAttackStatic: increasePhysicalPierceAttack,

            increaseSoulMeeleeAttackStatic: increaseSoulMeeleeAttack,
            increaseSoulRangeAttackStatic: increaseSoulRangeAttack,
            increaseSoulSpecialAttackStatic: increaseSoulSpecialAttack,
            increaseSoulBluntAttackStatic: increaseSoulBluntAttack,
            increaseSoulSlashingAttackStatic: increaseSoulSlashingAttack,
            increaseSoulPierceAttackStatic: increaseSoulPierceAttack,

            increasePhysicalMeeleeDefenseStatic: increasePhysicalMeeleeDefense,
            increasePhysicalRangeDefenseStatic: increasePhysicalRangeDefense,
            increasePhysicalSpecialDefenseStatic: increasePhysicalSpecialDefense,
            increasePhysicalBluntDefenseStatic: increasePhysicalBluntDefense,
            increasePhysicalSlashingDefenseStatic: increasePhysicalSlashingDefense,
            increasePhysicalPierceDefenseStatic: increasePhysicalPierceDefense,

            increaseSoulMeeleeDefenseStatic: increaseSoulMeeleeDefense,
            increaseSoulRangeDefenseStatic: increaseSoulRangeDefense,
            increaseSoulSpecialDefenseStatic: increaseSoulSpecialDefense,
            increaseSoulBluntDefenseStatic: increaseSoulBluntDefense,
            increaseSoulSlashingDefenseStatic: increaseSoulSlashingDefense,
            increaseSoulPierceDefenseStatic: increaseSoulPierceDefense,

            evolveIncreaseHealthStatic: monst.evolveIncreaseHealthStatic,
            evolveIncreasePhysicalAttackStatic: monst.evolveIncreasePhysicalAttackStatic,
            evolveIncreasePhysicalDefenseStatic: monst.evolveIncreasePhysicalDefenseStatic,
            evolveIncreaseSoulAttackStatic: monst.evolveIncreaseSoulAttackStatic,
            evolveIncreaseSoulDefenseStatic: monst.evolveIncreaseSoulDefenseStatic,
            evolveIncreaseSpeedStatic: monst.evolveIncreaseSpeedStatic,
            evolveIncreaseManaStatic: monst.evolveIncreaseManaStatic,
            evolveIncreaseStaminaStatic: monst.evolveIncreaseStaminaStatic,

            evolveIncreasePhysicalMeeleeAttackStatic: monst.evolveIncreasePhysicalMeeleeAttackStatic,
            evolveIncreasePhysicalRangeAttackStatic: monst.evolveIncreasePhysicalRangeAttackStatic,
            evolveIncreasePhysicalSpecialAttackStatic: monst.evolveIncreasePhysicalSpecialAttackStatic,
            evolveIncreasePhysicalBluntAttackStatic: monst.evolveIncreasePhysicalBluntAttackStatic,
            evolveIncreasePhysicalSlashingAttackStatic: monst.evolveIncreasePhysicalSlashingAttackStatic,
            evolveIncreasePhysicalPierceAttackStatic: monst.evolveIncreasePhysicalPierceAttackStatic,

            evolveIncreaseSoulMeeleeAttackStatic: monst.evolveIncreaseSoulMeeleeAttackStatic,
            evolveIncreaseSoulRangeAttackStatic: monst.evolveIncreaseSoulRangeAttackStatic,
            evolveIncreaseSoulSpecialAttackStatic: monst.evolveIncreaseSoulSpecialAttackStatic,
            evolveIncreaseSoulBluntAttackStatic: monst.evolveIncreaseSoulBluntAttackStatic,
            evolveIncreaseSoulSlashingAttackStatic: monst.evolveIncreaseSoulSlashingAttackStatic,
            evolveIncreaseSoulPierceAttackStatic: monst.evolveIncreaseSoulPierceAttackStatic,

            evolveIncreasePhysicalMeeleeDefenseStatic: monst.evolveIncreasePhysicalMeeleeDefenseStatic,
            evolveIncreasePhysicalRangeDefenseStatic: monst.evolveIncreasePhysicalRangeDefenseStatic,
            evolveIncreasePhysicalSpecialDefenseStatic: monst.evolveIncreasePhysicalSpecialDefenseStatic,
            evolveIncreasePhysicalBluntDefenseStatic: monst.evolveIncreasePhysicalBluntDefenseStatic,
            evolveIncreasePhysicalSlashingDefenseStatic: monst.evolveIncreasePhysicalSlashingDefenseStatic,
            evolveIncreasePhysicalPierceDefenseStatic: monst.evolveIncreasePhysicalPierceDefenseStatic,

            evolveIncreaseSoulMeeleeDefenseStatic: monst.evolveIncreaseSoulMeeleeDefenseStatic,
            evolveIncreaseSoulRangeDefenseStatic: monst.evolveIncreaseSoulRangeDefenseStatic,
            evolveIncreaseSoulSpecialDefenseStatic: monst.evolveIncreaseSoulSpecialDefenseStatic,
            evolveIncreaseSoulBluntDefenseStatic: monst.evolveIncreaseSoulBluntDefenseStatic,
            evolveIncreaseSoulSlashingDefenseStatic: monst.evolveIncreaseSoulSlashingDefenseStatic,
            evolveIncreaseSoulPierceDefenseStatic: monst.evolveIncreaseSoulPierceDefenseStatic,
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

        let basePhysicalMeeleeAttack = randomizeMonstBaseStats(monst.basePhysicalMeeleeAttack.min, monst.basePhysicalMeeleeAttack.max)
        let basePhysicalRangeAttack = randomizeMonstBaseStats(monst.basePhysicalRangeAttack.min, monst.basePhysicalRangeAttack.max)
        let basePhysicalSpecialAttack = randomizeMonstBaseStats(monst.basePhysicalSpecialAttack.min, monst.basePhysicalSpecialAttack.max)
        let basePhysicalBluntAttack = randomizeMonstBaseStats(monst.basePhysicalBluntAttack.min, monst.basePhysicalBluntAttack.max)
        let basePhysicalSlashingAttack = randomizeMonstBaseStats(monst.basePhysicalSlashingAttack.min, monst.basePhysicalSlashingAttack.max)
        let basePhysicalPierceAttack = randomizeMonstBaseStats(monst.basePhysicalPierceAttack.min, monst.basePhysicalPierceAttack.max)

        let baseSoulMeeleeAttack = randomizeMonstBaseStats(monst.baseSoulMeeleeAttack.min, monst.baseSoulMeeleeAttack.max)
        let baseSoulRangeAttack = randomizeMonstBaseStats(monst.baseSoulRangeAttack.min, monst.baseSoulRangeAttack.max)
        let baseSoulSpecialAttack = randomizeMonstBaseStats(monst.baseSoulSpecialAttack.min, monst.baseSoulSpecialAttack.max)
        let baseSoulBluntAttack = randomizeMonstBaseStats(monst.baseSoulBluntAttack.min, monst.baseSoulBluntAttack.max)
        let baseSoulSlashingAttack = randomizeMonstBaseStats(monst.baseSoulSlashingAttack.min, monst.baseSoulSlashingAttack.max)
        let baseSoulPierceAttack = randomizeMonstBaseStats(monst.baseSoulPierceAttack.min, monst.baseSoulPierceAttack.max)

        let basePhysicalMeeleeDefense = randomizeMonstBaseStats(monst.basePhysicalMeeleeDefense.min, monst.basePhysicalMeeleeDefense.max)
        let basePhysicalRangeDefense = randomizeMonstBaseStats(monst.basePhysicalRangeDefense.min, monst.basePhysicalRangeDefense.max)
        let basePhysicalSpecialDefense = randomizeMonstBaseStats(monst.basePhysicalSpecialDefense.min, monst.basePhysicalSpecialDefense.max)
        let basePhysicalBluntDefense = randomizeMonstBaseStats(monst.basePhysicalBluntDefense.min, monst.basePhysicalBluntDefense.max)
        let basePhysicalSlashingDefense = randomizeMonstBaseStats(monst.basePhysicalSlashingDefense.min, monst.basePhysicalSlashingAttack.max)
        let basePhysicalPierceDefense = randomizeMonstBaseStats(monst.basePhysicalPierceDefense.min, monst.basePhysicalPierceDefense.max)

        let baseSoulMeeleeDefense = randomizeMonstBaseStats(monst.baseSoulMeeleeDefense.min, monst.baseSoulMeeleeDefense.max)
        let baseSoulRangeDefense = randomizeMonstBaseStats(monst.baseSoulRangeDefense.min, monst.baseSoulRangeDefense.max)
        let baseSoulSpecialDefense = randomizeMonstBaseStats(monst.baseSoulSpecialDefense.min, monst.baseSoulSpecialDefense.max)
        let baseSoulBluntDefense = randomizeMonstBaseStats(monst.baseSoulBluntDefense.min, monst.baseSoulBluntDefense.max)
        let baseSoulSlashingDefense = randomizeMonstBaseStats(monst.baseSoulSlashingDefense.min, monst.baseSoulSlashingDefense.max)
        let baseSoulPierceDefense = randomizeMonstBaseStats(monst.baseSoulPierceDefense.min, monst.baseSoulPierceDefense.max)

        const increaseHealth = monst.increaseHealth;
        const increasePhysicalAttack = monst.increasePhysicalAttack;
        const increasePhysicalDefense = monst.increasePhysicalDefense;
        const increaseSoulAttack = monst.increaseSoulAttack;
        const increaseSoulDefense = monst.increaseSoulDefense;
        const increaseSpeed = monst.increaseSpeed;
        const increaseMana = monst.increaseMana;
        const increaseStamina = monst.increaseStamina;

        const increasePhysicalMeeleeAttack = monst.increasePhysicalMeeleeAttack
        const increasePhysicalRangeAttack = monst.increasePhysicalRangeAttack
        const increasePhysicalSpecialAttack = monst.increasePhysicalSpecialAttack
        const increasePhysicalBluntAttack = monst.increasePhysicalBluntAttack
        const increasePhysicalSlashingAttack = monst.increasePhysicalSlashingAttack
        const increasePhysicalPierceAttack = monst.increasePhysicalPierceAttack

        const increaseSoulMeeleeAttack = monst.increaseSoulMeeleeAttack
        const increaseSoulRangeAttack = monst.increaseSoulRangeAttack
        const increaseSoulSpecialAttack = monst.increaseSoulSpecialAttack
        const increaseSoulBluntAttack = monst.increaseSoulBluntAttack
        const increaseSoulSlashingAttack = monst.increaseSoulSlashingAttack
        const increaseSoulPierceAttack = monst.increaseSoulPierceAttack

        const increasePhysicalMeeleeDefense = monst.increasePhysicalMeeleeDefense
        const increasePhysicalRangeDefense = monst.increasePhysicalRangeDefense
        const increasePhysicalSpecialDefense = monst.increasePhysicalSpecialDefense
        const increasePhysicalBluntDefense = monst.increasePhysicalBluntDefense
        const increasePhysicalSlashingDefense = monst.increasePhysicalSlashingDefense
        const increasePhysicalPierceDefense = monst.increasePhysicalPierceDefense

        const increaseSoulMeeleeDefense = monst.increaseSoulMeeleeDefense
        const increaseSoulRangeDefense = monst.increaseSoulRangeDefense
        const increaseSoulSpecialDefense = monst.increaseSoulSpecialDefense
        const increaseSoulBluntDefense = monst.increaseSoulBluntDefense
        const increaseSoulSlashingDefense = monst.increaseSoulSlashingDefense
        const increaseSoulPierceDefense = monst.increaseSoulPierceDefense

        console.log("completely random or only stats random monster chosen")

        baseRandomMonst = {
            health: baseHealth,
            maxHealth: baseHealth,
            physicalAttack: basePhysicalAttack,
            physicalDefense: basePhysicalDefense,
            soulAttack: baseSoulAttack,
            soulDefense: baseSoulDefense,
            speed: baseSpeed,
            mana: baseMana,
            stamina: baseStamina,

            physicalMeeleeAttack: basePhysicalMeeleeAttack,
            physicalRangeAttack: basePhysicalRangeAttack,
            physicalSpecialAttack: basePhysicalSpecialAttack,
            physicalBluntAttack: basePhysicalBluntAttack,
            physicalSlashingAttack: basePhysicalSlashingAttack,
            physicalPierceAttack: basePhysicalPierceAttack,

            soulMeeleeAttack: baseSoulMeeleeAttack,
            soulRangeAttack: baseSoulRangeAttack,
            soulSpecialAttack: baseSoulSpecialAttack,
            soulBluntAttack: baseSoulBluntAttack,
            soulSlashingAttack: baseSoulSlashingAttack,
            soulPierceAttack: baseSoulPierceAttack,

            physicalMeeleeDefense: basePhysicalMeeleeDefense,
            physicalRangeDefense: basePhysicalRangeDefense,
            physicalSpecialDefense: basePhysicalSpecialDefense,
            physicalBluntDefense: basePhysicalBluntDefense,
            physicalSlashingDefense: basePhysicalSlashingDefense,
            physicalPierceDefense: basePhysicalPierceDefense,

            soulMeeleeDefense: baseSoulMeeleeDefense,
            soulRangeDefense: baseSoulRangeDefense,
            soulSpecialDefense: baseSoulSpecialDefense,
            soulBluntDefense: baseSoulBluntDefense,
            soulSlashingDefense: baseSoulSlashingDefense,
            soulPierceDefense: baseSoulPierceDefense,

            increaseHealth: increaseHealth,
            increasePhysicalAttack: increasePhysicalAttack,
            increasePhysicalDefense: increasePhysicalDefense,
            increaseSoulAttack: increaseSoulAttack,
            increaseSoulDefense: increaseSoulDefense,
            increaseSpeed: increaseSpeed,
            increaseMana: increaseMana,
            increaseStamina: increaseStamina,

            increasePhysicalMeeleeAttack: increasePhysicalMeeleeAttack,
            increasePhysicalRangeAttack: increasePhysicalRangeAttack,
            increasePhysicalSpecialAttack: increasePhysicalSpecialAttack,
            increasePhysicalBluntAttack: increasePhysicalBluntAttack,
            increasePhysicalSlashingAttack: increasePhysicalSlashingAttack,
            increasePhysicalPierceAttack: increasePhysicalPierceAttack,

            increaseSoulMeeleeAttack: increaseSoulMeeleeAttack,
            increaseSoulRangeAttack: increaseSoulRangeAttack,
            increaseSoulSpecialAttack: increaseSoulSpecialAttack,
            increaseSoulBluntAttack: increaseSoulBluntAttack,
            increaseSoulSlashingAttack: increaseSoulSlashingAttack,
            increaseSoulPierceAttack: increaseSoulPierceAttack,

            increasePhysicalMeeleeDefense: increasePhysicalMeeleeDefense,
            increasePhysicalRangeDefense: increasePhysicalRangeDefense,
            increasePhysicalSpecialDefense: increasePhysicalSpecialDefense,
            increasePhysicalBluntDefense: increasePhysicalBluntDefense,
            increasePhysicalSlashingDefense: increasePhysicalSlashingDefense,
            increasePhysicalPierceDefense: increasePhysicalPierceDefense,

            increaseSoulMeeleeDefense: increaseSoulMeeleeDefense,
            increaseSoulRangeDefense: increaseSoulRangeDefense,
            increaseSoulSpecialDefense: increaseSoulSpecialDefense,
            increaseSoulBluntDefense: increaseSoulBluntDefense,
            increaseSoulSlashingDefense: increaseSoulSlashingDefense,
            increaseSoulPierceDefense: increaseSoulPierceDefense,

            evolveIncreaseHealth: monst.evolveIncreaseHealth,
            evolveIncreasePhysicalAttack: monst.evolveIncreasePhysicalAttack,
            evolveIncreasePhysicalDefense: monst.evolveIncreasePhysicalDefense,
            evolveIncreaseSoulAttack: monst.evolveIncreaseSoulAttack,
            evolveIncreaseSoulDefense: monst.evolveIncreaseSoulDefense,
            evolveIncreaseSpeed: monst.evolveIncreaseSpeed,
            evolveIncreaseMana: monst.evolveIncreaseMana,
            evolveIncreaseStamina: monst.evolveIncreaseStamina,

            evolveIncreasePhysicalMeeleeAttack: monst.evolveIncreasePhysicalMeeleeAttack,
            evolveIncreasePhysicalRangeAttack: monst.evolveIncreasePhysicalRangeAttack,
            evolveIncreasePhysicalSpecialAttack: monst.evolveIncreasePhysicalSpecialAttack,
            evolveIncreasePhysicalBluntAttack: monst.evolveIncreasePhysicalBluntAttack,
            evolveIncreasePhysicalSlashingAttack: monst.evolveIncreasePhysicalSlashingAttack,
            evolveIncreasePhysicalPierceAttack: monst.evolveIncreasePhysicalPierceAttack,

            evolveIncreaseSoulMeeleeAttack: monst.evolveIncreaseSoulMeeleeAttack,
            evolveIncreaseSoulRangeAttack: monst.evolveIncreaseSoulRangeAttack,
            evolveIncreaseSoulSpecialAttack: monst.evolveIncreaseSoulSpecialAttack,
            evolveIncreaseSoulBluntAttack: monst.evolveIncreaseSoulBluntAttack,
            evolveIncreaseSoulSlashingAttack: monst.evolveIncreaseSoulSlashingAttack,
            evolveIncreaseSoulPierceAttack: monst.evolveIncreaseSoulPierceAttack,

            evolveIncreasePhysicalMeeleeDefense: monst.evolveIncreasePhysicalMeeleeDefense,
            evolveIncreasePhysicalRangeDefense: monst.evolveIncreasePhysicalRangeAttack,
            evolveIncreasePhysicalSpecialDefense: monst.evolveIncreasePhysicalSpecialAttack,
            evolveIncreasePhysicalBluntDefense: monst.evolveIncreasePhysicalBluntAttack,
            evolveIncreasePhysicalSlashingDefense: monst.evolveIncreasePhysicalSlashingAttack,
            evolveIncreasePhysicalPierceDefense: monst.evolveIncreasePhysicalPierceAttack,

            evolveIncreaseSoulMeeleeDefense: monst.evolveIncreaseSoulMeeleeDefense,
            evolveIncreaseSoulRangeDefense: monst.evolveIncreaseSoulRangeDefense,
            evolveIncreaseSoulSpecialDefense: monst.evolveIncreaseSoulSpecialDefense,
            evolveIncreaseSoulBluntDefense: monst.evolveIncreaseSoulBluntDefense,
            evolveIncreaseSoulSlashingDefense: monst.evolveIncreaseSoulSlashingDefense,
            evolveIncreaseSoulPierceDefense: monst.evolveIncreaseSoulPierceDefense,

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
            finalMonst = await levelWildMonstUp(currentSurrogateID, i + 1)
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
    let beatenEP
    let currentEp;

    let staticRandomType;
    let wildMonst;
    let attacks

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

    let increaseHealth
    let increasePhysicalAttack
    let increasePhysicalDefense
    let increaseSoulAttack
    let increaseSoulDefense
    let increaseStamina
    let increaseSpeed
    let increaseMana

    let increasedPhysicalMeeleeAttack
    let increasedPhysicalRangeAttack
    let increasedPhysicalSpecialAttack
    let increasedPhysicalBluntAttack
    let increasedPhysicalSlashingAttack
    let increasedPhysicalPierceAttack

    let increasedSoulMeeleeAttack
    let increasedSoulRangeAttack
    let increasedSoulSpecialAttack
    let increasedSoulBluntAttack
    let increasedSoulSlashingAttack
    let increasedSoulPierceAttack

    let increasedPhysicalMeeleeDefense
    let increasedPhysicalRangeDefense
    let increasedPhysicalSpecialDefense
    let increasedPhysicalBluntDefense
    let increasedPhysicalSlashingDefense
    let increasedPhysicalPierceDefense

    let increasedSoulMeeleeDefense
    let increasedSoulRangeDefense
    let increasedSoulSpecialDefense
    let increasedSoulBluntDefense
    let increasedSoulSlashingDefense
    let increasedSoulPierceDefense

    let finalPhysicalMeeleeAttack
    let finalPhysicalRangeAttack
    let finalPhysicalSpecialAttack
    let finalPhysicalBluntAttack
    let finalPhysicalSlashingAttack
    let finalPhysicalPierceAttack

    let finalSoulMeeleeAttack
    let finalSoulRangeAttack
    let finalSoulSpecialAttack
    let finalSoulBluntAttack
    let finalSoulSlashingAttack
    let finalSoulPierceAttack

    let finalPhysicalMeeleeDefense
    let finalPhysicalRangeDefense
    let finalPhysicalSpecialDefense
    let finalPhysicalBluntDefense
    let finalPhysicalSlashingDefense
    let finalPhysicalPierceDefense

    let finalSoulMeeleeDefense
    let finalSoulRangeDefense
    let finalSoulSpecialDefense
    let finalSoulBluntDefense
    let finalSoulSlashingDefense
    let finalSoulPierceDefense

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

                increasedPhysicalMeeleeAttack = wildMonst.increasePhysicalMeeleeAttackStatic
                increasedPhysicalRangeAttack = wildMonst.increasePhysicalRangeAttackStatic
                increasedPhysicalSpecialAttack = wildMonst.increasePhysicalSpecialAttackStatic
                increasedPhysicalBluntAttack = wildMonst.increasePhysicalBluntAttackStatic
                increasedPhysicalSlashingAttack = wildMonst.increasePhysicalSlashingAttackStatic
                increasedPhysicalPierceAttack = wildMonst.increasePhysicalPierceAttackStatic

                increasedSoulMeeleeAttack = wildMonst.increaseSoulMeeleeAttackStatic
                increasedSoulRangeAttack = wildMonst.increaseSoulRangeAttackStatic
                increasedSoulSpecialAttack = wildMonst.increaseSoulSpecialAttackStatic
                increasedSoulBluntAttack = wildMonst.increaseSoulBluntAttackStatic
                increasedSoulSlashingAttack = wildMonst.increaseSoulSlashingAttackStatic
                increasedSoulPierceAttack = wildMonst.increaseSoulPierceAttackStatic

                increasedPhysicalMeeleeDefense = wildMonst.increasePhysicalMeeleeDefenseStatic
                increasedPhysicalRangeDefense = wildMonst.increasePhysicalRangeDefenseStatic
                increasedPhysicalSpecialDefense = wildMonst.increasePhysicalSpecialDefenseStatic
                increasedPhysicalBluntDefense = wildMonst.increasePhysicalBluntDefenseStatic
                increasedPhysicalSlashingDefense = wildMonst.increasePhysicalSlashingDefenseStatic
                increasedPhysicalPierceDefense = wildMonst.increasePhysicalPierceDefenseStatic

                increasedSoulMeeleeDefense = wildMonst.increaseSoulMeeleeDefenseStatic
                increasedSoulRangeDefense = wildMonst.increaseSoulRangeDefenseStatic
                increasedSoulSpecialDefense = wildMonst.increaseSoulSpecialDefenseStatic
                increasedSoulBluntDefense = wildMonst.increaseSoulBluntDefenseStatic
                increasedSoulSlashingDefense = wildMonst.increaseSoulSlashingDefenseStatic
                increasedSoulPierceDefense = wildMonst.increaseSoulPierceDefenseStatic
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

                increasedPhysicalMeeleeAttack = wildMonst.increasePhysicalMeeleeAttackStatic
                increasedPhysicalRangeAttack = wildMonst.increasePhysicalRangeAttackStatic
                increasedPhysicalSpecialAttack = wildMonst.increasePhysicalSpecialAttackStatic;
                increasedPhysicalBluntAttack = wildMonst.increasePhysicalBluntAttackStatic;
                increasedPhysicalSlashingAttack = wildMonst.increasePhysicalSlashingAttackStatic
                increasedPhysicalPierceAttack = wildMonst.increasePhysicalPierceAttackStatic

                increasedSoulMeeleeAttack = wildMonst.increaseSoulMeeleeAttackStatic
                increasedSoulRangeAttack = wildMonst.increaseSoulRangeAttackStatic
                increasedSoulSpecialAttack = wildMonst.increaseSoulSpecialAttackStatic
                increasedSoulBluntAttack = wildMonst.increaseSoulBluntAttackStatic
                increasedSoulSlashingAttack = wildMonst.increaseSoulSlashingAttackStatic
                increasedSoulPierceAttack = wildMonst.increaseSoulPierceAttackStatic

                increasedPhysicalMeeleeDefense = wildMonst.increasePhysicalMeeleeDefenseStatic
                increasedPhysicalRangeDefense = wildMonst.increasePhysicalRangeDefenseStatic
                increasedPhysicalSpecialDefense = wildMonst.increasePhysicalSpecialDefenseStatic
                increasedPhysicalBluntDefense = wildMonst.increasePhysicalBluntDefenseStatic
                increasedPhysicalSlashingDefense = wildMonst.increasePhysicalSlashingDefenseStatic
                increasedPhysicalPierceDefense = wildMonst.increasePhysicalPierceDefenseStatic

                increasedSoulMeeleeDefense = wildMonst.increaseSoulMeeleeDefenseStatic
                increasedSoulRangeDefense = wildMonst.increaseSoulRangeDefenseStatic
                increasedSoulSpecialDefense = wildMonst.increaseSoulSpecialDefenseStatic
                increasedSoulBluntDefense = wildMonst.increaseSoulBluntDefenseStatic
                increasedSoulSlashingDefense = wildMonst.increaseSoulSlashingDefenseStatic
                increasedSoulPierceDefense = wildMonst.increaseSoulPierceDefenseStatic
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

                increasedPhysicalMeeleeAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalMeeleeAttack.min, wildMonst.increasePhysicalMeeleeAttack.max);
                increasedPhysicalRangeAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalRangeAttack.min, wildMonst.increasePhysicalRangeAttack.max);
                increasedPhysicalSpecialAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalSpecialAttack.min, wildMonst.increasePhysicalSpecialAttack.max);
                increasedPhysicalBluntAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalBluntAttack.min, wildMonst.increasePhysicalBluntAttack.max);
                increasedPhysicalSlashingAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalSlashingAttack.min, wildMonst.increasePhysicalSlashingAttack.max);
                increasedPhysicalPierceAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalPierceAttack.min, wildMonst.increasePhysicalPierceAttack.max);

                increasedSoulMeeleeAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulMeeleeAttack.min, wildMonst.increaseSoulMeeleeAttack.max);
                increasedSoulRangeAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulRangeAttack.min, wildMonst.increaseSoulRangeAttack.max);
                increasedSoulSpecialAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulSpecialAttack.min, wildMonst.increaseSoulSpecialAttack.max);
                increasedSoulBluntAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulBluntAttack.min, wildMonst.increaseSoulBluntAttack.max);
                increasedSoulSlashingAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulSlashingAttack.min, wildMonst.increaseSoulSlashingAttack.max);
                increasedSoulPierceAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulPierceAttack.min, wildMonst.increaseSoulPierceAttack.max);

                increasedPhysicalMeeleeDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalMeeleeDefense.min, wildMonst.increasePhysicalMeeleeDefense.max);
                increasedPhysicalRangeDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalRangeDefense.min, wildMonst.increasePhysicalRangeDefense.max);
                increasedPhysicalSpecialDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalSpecialDefense.min, wildMonst.increasePhysicalSpecialDefense.max);
                increasedPhysicalBluntDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalBluntDefense.min, wildMonst.increasePhysicalBluntDefense.max);
                increasedPhysicalSlashingDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalSlashingDefense.min, wildMonst.increasePhysicalSlashingDefense.max);
                increasedPhysicalPierceDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalPierceDefense.min, wildMonst.increasePhysicalPierceDefense.max);

                increasedSoulMeeleeDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulMeeleeDefense.min, wildMonst.increaseSoulMeeleeDefense.max);
                increasedSoulRangeDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulRangeDefense.min, wildMonst.increaseSoulRangeDefense.max);
                increasedSoulSpecialDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulSpecialDefense.min, wildMonst.increaseSoulSpecialDefense.max);
                increasedSoulBluntDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulBluntDefense.min, wildMonst.increaseSoulBluntDefense.max);
                increasedSoulSlashingDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulSlashingDefense.min, wildMonst.increaseSoulSlashingDefense.max);
                increasedSoulPierceDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulPierceDefense.min, wildMonst.increaseSoulPierceDefense.max);
                break;

            case "completeRandom":
                console.log("Level Up for completely random Monster chosen.")
                increaseHealth = wildMonst.increaseHealth;
                increasePhysicalAttack = wildMonst.increasePhysicalAttack
                increasedHealth = randomizeMonstLevelUpStats(increaseHealth.min, increaseHealth.max);
                increasedPhysicalAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalAttack.min, wildMonst.increasePhysicalAttack.max);
                increasedPhysicalDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalDefense.min, wildMonst.increasePhysicalDefense.max);
                increasedSoulAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulAttack.min, wildMonst.increaseSoulAttack.max);
                increasedSoulDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulDefense.min, wildMonst.increaseSoulDefense.max);
                increasedSpeed = randomizeMonstLevelUpStats(wildMonst.increaseSpeed.min, wildMonst.increaseSpeed.max);
                increasedMana = randomizeMonstLevelUpStats(wildMonst.increaseMana.min, wildMonst.increaseMana.max);
                increasedStamina = randomizeMonstLevelUpStats(wildMonst.increaseStamina.min, wildMonst.increaseStamina.max);

                increasedPhysicalMeeleeAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalMeeleeAttack.min, wildMonst.increasePhysicalMeeleeAttack.max);
                increasedPhysicalRangeAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalRangeAttack.min, wildMonst.increasePhysicalRangeAttack.max);
                increasedPhysicalSpecialAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalSpecialAttack.min, wildMonst.increasePhysicalSpecialAttack.max);
                increasedPhysicalBluntAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalBluntAttack.min, wildMonst.increasePhysicalBluntAttack.max);
                increasedPhysicalSlashingAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalSlashingAttack.min, wildMonst.increasePhysicalSlashingAttack.max);
                increasedPhysicalPierceAttack = randomizeMonstLevelUpStats(wildMonst.increasePhysicalPierceAttack.min, wildMonst.increasePhysicalPierceAttack.max);

                increasedSoulMeeleeAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulMeeleeAttack.min, wildMonst.increaseSoulMeeleeAttack.max);
                increasedSoulRangeAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulRangeAttack.min, wildMonst.increaseSoulRangeAttack.max);
                increasedSoulSpecialAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulSpecialAttack.min, wildMonst.increaseSoulSpecialAttack.max);
                increasedSoulBluntAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulBluntAttack.min, wildMonst.increaseSoulBluntAttack.max);
                increasedSoulSlashingAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulSlashingAttack.min, wildMonst.increaseSoulSlashingAttack.max);
                increasedSoulPierceAttack = randomizeMonstLevelUpStats(wildMonst.increaseSoulPierceAttack.min, wildMonst.increaseSoulPierceAttack.max);

                increasedPhysicalMeeleeDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalMeeleeDefense.min, wildMonst.increasePhysicalMeeleeDefense.max);
                increasedPhysicalRangeDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalRangeDefense.min, wildMonst.increasePhysicalRangeDefense.max);
                increasedPhysicalSpecialDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalSpecialDefense.min, wildMonst.increasePhysicalSpecialDefense.max);
                increasedPhysicalBluntDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalBluntDefense.min, wildMonst.increasePhysicalBluntDefense.max);
                increasedPhysicalSlashingDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalSlashingDefense.min, wildMonst.increasePhysicalSlashingDefense.max);
                increasedPhysicalPierceDefense = randomizeMonstLevelUpStats(wildMonst.increasePhysicalPierceDefense.min, wildMonst.increasePhysicalPierceDefense.max);

                increasedSoulMeeleeDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulMeeleeDefense.min, wildMonst.increaseSoulMeeleeDefense.max);
                increasedSoulRangeDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulRangeDefense.min, wildMonst.increaseSoulRangeDefense.max);
                increasedSoulSpecialDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulSpecialDefense.min, wildMonst.increaseSoulSpecialDefense.max);
                increasedSoulBluntDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulBluntDefense.min, wildMonst.increaseSoulBluntDefense.max);
                increasedSoulSlashingDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulSlashingDefense.min, wildMonst.increaseSoulSlashingDefense.max);
                increasedSoulPierceDefense = randomizeMonstLevelUpStats(wildMonst.increaseSoulPierceDefense.min, wildMonst.increaseSoulPierceDefense.max);
                break;

            default:
                console.error("Level Up failed as no Option was given or option for Level Up was invalid.")
        }
        /*
                console.log("staticType:", wildMonst.staticType);
                console.log("increaseHealthStatic:", wildMonst.increaseHealthStatic);
                console.log("health:", wildMonst.health);

         */
        console.log("increasedStats:", increasedSoulMeeleeDefense,
            increasedSoulRangeDefense,
            increasedSoulSpecialDefense,
            increasedSoulBluntDefense,
            increasedSoulSlashingDefense,
            increasedSoulPierceDefense)

        finalHealth = increasedHealth + wildMonst.health;
        finalPhysicalAttack = increasedPhysicalAttack + wildMonst.physicalAttack;
        finalPhysicalDefense = increasedPhysicalDefense + wildMonst.physicalDefense;
        finalSoulAttack = increasedSoulAttack + wildMonst.soulAttack;
        finalSoulDefense = increasedSoulDefense + wildMonst.soulDefense;
        finalSpeed = increasedSpeed + wildMonst.speed;
        finalMana = increasedMana + wildMonst.mana;
        finalStamina = increasedStamina + wildMonst.stamina;

        finalPhysicalMeeleeAttack = increasedPhysicalMeeleeAttack + wildMonst.physicalMeeleeAttack
        finalPhysicalRangeAttack = increasedPhysicalRangeAttack + wildMonst.physicalRangeAttack
        finalPhysicalSpecialAttack = increasedPhysicalSpecialAttack + wildMonst.physicalSpecialAttack
        finalPhysicalBluntAttack = increasedPhysicalBluntAttack + wildMonst.physicalBluntAttack
        finalPhysicalSlashingAttack = increasedPhysicalSlashingAttack + wildMonst.physicalSlashingAttack
        finalPhysicalPierceAttack = increasedPhysicalPierceAttack + wildMonst.physicalPierceAttack

        finalSoulMeeleeAttack = increasedSoulMeeleeAttack + wildMonst.soulMeeleeAttack
        finalSoulRangeAttack = increasedSoulRangeAttack + wildMonst.soulRangeAttack
        finalSoulSpecialAttack = increasedSoulSpecialAttack + wildMonst.soulSpecialAttack
        finalSoulBluntAttack = increasedSoulBluntAttack + wildMonst.soulBluntAttack
        finalSoulSlashingAttack = increasedSoulSlashingAttack + wildMonst.soulSlashingAttack
        finalSoulPierceAttack = increasedSoulPierceAttack + wildMonst.soulPierceAttack

        finalPhysicalMeeleeDefense = increasedPhysicalMeeleeDefense + wildMonst.physicalMeeleeDefense
        finalPhysicalRangeDefense = increasedPhysicalRangeDefense + wildMonst.physicalRangeDefense
        finalPhysicalSpecialDefense = increasedPhysicalSpecialDefense + wildMonst.physicalSpecialDefense
        finalPhysicalBluntDefense = increasedPhysicalBluntDefense + wildMonst.physicalBluntDefense
        finalPhysicalSlashingDefense = increasedPhysicalSlashingDefense + wildMonst.physicalSlashingDefense
        finalPhysicalPierceDefense = increasedPhysicalPierceDefense + wildMonst.physicalPierceDefense

        finalSoulMeeleeDefense = increasedSoulMeeleeDefense + wildMonst.soulMeeleeDefense
        finalSoulRangeDefense = increasedSoulRangeDefense + wildMonst.soulRangeDefense
        finalSoulSpecialDefense = increasedSoulSpecialDefense + wildMonst.soulSpecialDefense
        finalSoulBluntDefense = increasedSoulBluntDefense + wildMonst.soulBluntDefense
        finalSoulSlashingDefense = increasedSoulSlashingDefense + wildMonst.soulSlashingDefense
        finalSoulPierceDefense = increasedSoulPierceDefense + wildMonst.soulPierceDefense

        necessaryEp = wildMonst.necessaryEp * wildMonst.increaseNecessaryLvlUpEp;
        beatenEP = wildMonst.beatenEP * wildMonst.beatenEPMultiplier;
        increaseNecessaryLvlUpEp = wildMonst.increaseNecessaryLvlUpEp;
        currentEp = 0;
        level = nextLevel;

        console.log("all increased stats: ", finalPhysicalMeeleeAttack,
            finalPhysicalRangeAttack,
            finalPhysicalSpecialAttack,
            finalPhysicalBluntAttack,
            finalPhysicalSlashingAttack,
            finalPhysicalPierceAttack,
            finalSoulMeeleeAttack,
            finalSoulRangeAttack,
            finalSoulSpecialAttack,
            finalSoulBluntAttack,
            finalSoulSlashingAttack,
            finalSoulPierceAttack,
            finalPhysicalMeeleeDefense,
            finalPhysicalRangeDefense,
            finalPhysicalSpecialDefense,
            finalPhysicalBluntDefense,
            finalPhysicalSlashingDefense,
            finalPhysicalPierceDefense,
            finalSoulMeeleeDefense,
            finalSoulRangeDefense,
            finalSoulSpecialDefense,
            finalSoulBluntDefense,
            finalSoulSlashingDefense,
            finalSoulPierceDefense,
        )
    }


    const levelUpMonst = {
        ...wildMonst,
        health: finalHealth,
        maxHealth: finalHealth,
        physicalAttack: finalPhysicalAttack,
        physicalDefense: finalPhysicalDefense,
        soulAttack: finalSoulAttack,
        soulDefense: finalSoulDefense,
        speed: finalSpeed,
        mana: finalMana,
        stamina: finalStamina,

        physicalMeeleeAttack: finalPhysicalMeeleeAttack,
        physicalRangeAttack: finalPhysicalRangeAttack,
        physicalSpecialAttack: finalPhysicalSpecialAttack,
        physicalBluntAttack: finalPhysicalBluntAttack,
        physicalSlashingAttack: finalPhysicalSlashingAttack,
        physicalPierceAttack: finalPhysicalPierceAttack,

        soulMeeleeAttack: finalSoulMeeleeAttack,
        soulRangeAttack: finalSoulRangeAttack,
        soulSpecialAttack: finalSoulSpecialAttack,
        soulBluntAttack: finalSoulBluntAttack,
        soulSlashingAttack: finalSoulSlashingAttack,
        soulPierceAttack: finalSoulPierceAttack,

        physicalMeeleeDefense: finalPhysicalMeeleeDefense,
        physicalRangeDefense: finalPhysicalRangeDefense,
        physicalSpecialDefense: finalPhysicalSpecialDefense,
        physicalBluntDefense: finalPhysicalBluntDefense,
        physicalSlashingDefense: finalPhysicalSlashingDefense,
        physicalPierceDefense: finalPhysicalPierceDefense,

        soulMeeleeDefense: finalSoulMeeleeDefense,
        soulRangeDefense: finalSoulRangeDefense,
        soulSpecialDefense: finalSoulSpecialDefense,
        soulBluntDefense: finalSoulBluntDefense,
        soulSlashingDefense: finalSoulSlashingDefense,
        soulPierceDefense: finalSoulPierceDefense,

        necessaryEp: necessaryEp,
        increaseNecessaryLvlUpEp: increaseNecessaryLvlUpEp,
        currentEp: currentEp,
        beatenEP: beatenEP,
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
    let beatenEP;
    let beatenEPMultiplier;

    let staticRandomType;
    let wildMonst;
    let attacks;

    let increasedHealth
    let increasedPhysicalAttack
    let increasedPhysicalDefense
    let increasedSoulAttack
    let increasedSoulDefense
    let increasedSpeed
    let increasedMana
    let increasedStamina

    let increasedPhysicalMeeleeAttack
    let increasedPhysicalRangeAttack
    let increasedPhysicalSpecialAttack
    let increasedPhysicalBluntAttack
    let increasedPhysicalSlashingAttack
    let increasedPhysicalPierceAttack

    let increasedSoulMeeleeAttack
    let increasedSoulRangeAttack
    let increasedSoulSpecialAttack
    let increasedSoulBluntAttack
    let increasedSoulSlashingAttack
    let increasedSoulPierceAttack

    let increasedPhysicalMeeleeDefense
    let increasedPhysicalRangeDefense
    let increasedPhysicalSpecialDefense
    let increasedPhysicalBluntDefense
    let increasedPhysicalSlashingDefense
    let increasedPhysicalPierceDefense

    let increasedSoulMeeleeDefense
    let increasedSoulRangeDefense
    let increasedSoulSpecialDefense
    let increasedSoulBluntDefense
    let increasedSoulSlashingDefense
    let increasedSoulPierceDefense

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

        beatenEPMultiplier = wildMonstEvol.beatenEPMultiplier
        beatenEP = wildMonst.beatenEP * beatenEPMultiplier
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

                    increasedPhysicalMeeleeAttack = wildMonst.evolveIncreasePhysicalMeeleeAttackStatic
                    increasedPhysicalRangeAttack = wildMonst.evolveIncreasePhysicalRangeAttackStatic
                    increasedPhysicalSpecialAttack = wildMonst.evolveIncreasePhysicalSpecialAttackStatic
                    increasedPhysicalBluntAttack = wildMonst.evolveIncreasePhysicalBluntAttackStatic
                    increasedPhysicalSlashingAttack = wildMonst.evolveIncreasePhysicalSlashingAttackStatic
                    increasedPhysicalPierceAttack = wildMonst.evolveIncreasePhysicalPierceAttackStatic

                    increasedSoulMeeleeAttack = wildMonst.evolveIncreaseSoulMeeleeAttackStatic
                    increasedSoulRangeAttack = wildMonst.evolveIncreaseSoulRangeAttackStatic
                    increasedSoulSpecialAttack = wildMonst.evolveIncreaseSoulSpecialAttackStatic
                    increasedSoulBluntAttack = wildMonst.evolveIncreaseSoulBluntAttackStatic
                    increasedSoulSlashingAttack = wildMonst.evolveIncreaseSoulSlashingAttackStatic
                    increasedSoulPierceAttack = wildMonst.evolveIncreaseSoulPierceAttackStatic

                    increasedPhysicalMeeleeDefense = wildMonst.evolveIncreasePhysicalMeeleeDefenseStatic
                    increasedPhysicalRangeDefense = wildMonst.evolveIncreasePhysicalRangeDefenseStatic
                    increasedPhysicalSpecialDefense = wildMonst.evolveIncreasePhysicalSpecialDefenseStatic
                    increasedPhysicalBluntDefense = wildMonst.evolveIncreasePhysicalBluntDefenseStatic
                    increasedPhysicalSlashingDefense = wildMonst.evolveIncreasePhysicalSlashingDefenseStatic
                    increasedPhysicalPierceDefense = wildMonst.evolveIncreasePhysicalPierceDefenseStatic

                    increasedSoulMeeleeDefense = wildMonst.evolveIncreaseSoulMeeleeDefenseStatic
                    increasedSoulRangeDefense = wildMonst.evolveIncreaseSoulRangeDefenseStatic
                    increasedSoulSpecialDefense = wildMonst.evolveIncreaseSoulSpecialDefenseStatic
                    increasedSoulBluntDefense = wildMonst.evolveIncreaseSoulBluntDefenseStatic
                    increasedSoulSlashingDefense = wildMonst.evolveIncreaseSoulSlashingDefenseStatic
                    increasedSoulPierceDefense = wildMonst.evolveIncreaseSoulPierceDefenseStatic
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

                    increasedPhysicalMeeleeAttack = wildMonst.evolveIncreasePhysicalMeeleeAttackStatic
                    increasedPhysicalRangeAttack = wildMonst.evolveIncreasePhysicalRangeAttackStatic
                    increasedPhysicalSpecialAttack = wildMonst.evolveIncreasePhysicalSpecialAttackStatic
                    increasedPhysicalBluntAttack = wildMonst.evolveIncreasePhysicalBluntAttackStatic
                    increasedPhysicalSlashingAttack = wildMonst.evolveIncreasePhysicalSlashingAttackStatic
                    increasedPhysicalPierceAttack = wildMonst.evolveIncreasePhysicalPierceAttackStatic

                    increasedSoulMeeleeAttack = wildMonst.evolveIncreaseSoulMeeleeAttackStatic
                    increasedSoulRangeAttack = wildMonst.evolveIncreaseSoulRangeAttackStatic
                    increasedSoulSpecialAttack = wildMonst.evolveIncreaseSoulSpecialAttackStatic
                    increasedSoulBluntAttack = wildMonst.evolveIncreaseSoulBluntAttackStatic
                    increasedSoulSlashingAttack = wildMonst.evolveIncreaseSoulSlashingAttackStatic
                    increasedSoulPierceAttack = wildMonst.evolveIncreaseSoulPierceAttackStatic

                    increasedPhysicalMeeleeDefense = wildMonst.evolveIncreasePhysicalMeeleeDefenseStatic
                    increasedPhysicalRangeDefense = wildMonst.evolveIncreasePhysicalRangeDefenseStatic
                    increasedPhysicalSpecialDefense = wildMonst.evolveIncreasePhysicalSpecialDefenseStatic
                    increasedPhysicalBluntDefense = wildMonst.evolveIncreasePhysicalBluntDefenseStatic
                    increasedPhysicalSlashingDefense = wildMonst.evolveIncreasePhysicalSlashingDefenseStatic
                    increasedPhysicalPierceDefense = wildMonst.evolveIncreasePhysicalPierceDefenseStatic

                    increasedSoulMeeleeDefense = wildMonst.evolveIncreaseSoulMeeleeDefenseStatic
                    increasedSoulRangeDefense = wildMonst.evolveIncreaseSoulRangeDefenseStatic
                    increasedSoulSpecialDefense = wildMonst.evolveIncreaseSoulSpecialDefenseStatic
                    increasedSoulBluntDefense = wildMonst.evolveIncreaseSoulBluntDefenseStatic
                    increasedSoulSlashingDefense = wildMonst.evolveIncreaseSoulSlashingDefenseStatic
                    increasedSoulPierceDefense = wildMonst.evolveIncreaseSoulPierceDefenseStatic
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

                    increasedPhysicalMeeleeAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalMeeleeAttack.min, wildMonst.evolveIncreasePhysicalMeeleeAttack.max);
                    increasedPhysicalRangeAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalRangeAttack.min, wildMonst.evolveIncreasePhysicalRangeAttack.max);
                    increasedPhysicalSpecialAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalSpecialAttack.min, wildMonst.evolveIncreasePhysicalSpecialAttack.max);
                    increasedPhysicalBluntAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalBluntAttack.min, wildMonst.evolveIncreasePhysicalBluntAttack.max);
                    increasedPhysicalSlashingAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalSlashingAttack.min, wildMonst.evolveIncreasePhysicalSlashingAttack.max);
                    increasedPhysicalPierceAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalPierceAttack.min, wildMonst.evolveIncreasePhysicalPierceAttack.max);

                    increasedSoulMeeleeAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulMeeleeAttack.min, wildMonst.evolveIncreaseSoulMeeleeAttack.max);
                    increasedSoulRangeAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulRangeAttack.min, wildMonst.evolveIncreaseSoulRangeAttack.max);
                    increasedSoulSpecialAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulSpecialAttack.min, wildMonst.evolveIncreaseSoulSpecialAttack.max);
                    increasedSoulBluntAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulBluntAttack.min, wildMonst.evolveIncreaseSoulBluntAttack.max);
                    increasedSoulSlashingAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulSlashingAttack.min, wildMonst.evolveIncreaseSoulSlashingAttack.max);
                    increasedSoulPierceAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulPierceAttack.min, wildMonst.evolveIncreaseSoulPierceAttack.max);

                    increasedPhysicalMeeleeDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalMeeleeDefense.min, wildMonst.evolveIncreasePhysicalMeeleeDefense.max);
                    increasedPhysicalRangeDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalRangeDefense.min, wildMonst.evolveIncreasePhysicalRangeDefense.max);
                    increasedPhysicalSpecialDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalSpecialDefense.min, wildMonst.evolveIncreasePhysicalSpecialDefense.max);
                    increasedPhysicalBluntDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalBluntDefense.min, wildMonst.evolveIncreasePhysicalBluntDefense.max);
                    increasedPhysicalSlashingDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalSlashingDefense.min, wildMonst.evolveIncreasePhysicalSlashingDefense.max);
                    increasedPhysicalPierceDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalPierceDefense.min, wildMonst.evolveIncreasePhysicalPierceDefense.max);

                    increasedSoulMeeleeDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulMeeleeDefense.min, wildMonst.evolveIncreaseSoulMeeleeDefense.max);
                    increasedSoulRangeDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulRangeDefense.min, wildMonst.evolveIncreaseSoulRangeDefense.max);
                    increasedSoulSpecialDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulSpecialDefense.min, wildMonst.evolveIncreaseSoulSpecialDefense.max);
                    increasedSoulBluntDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulBluntDefense.min, wildMonst.evolveIncreaseSoulBluntDefense.max);
                    increasedSoulSlashingDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulSlashingDefense.min, wildMonst.evolveIncreaseSoulSlashingDefense.max);
                    increasedSoulPierceDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulPierceDefense.min, wildMonst.evolveIncreaseSoulPierceDefense.max);
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

                    increasedPhysicalMeeleeAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalMeeleeAttack.min, wildMonst.evolveIncreasePhysicalMeeleeAttack.max);
                    increasedPhysicalRangeAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalRangeAttack.min, wildMonst.evolveIncreasePhysicalRangeAttack.max);
                    increasedPhysicalSpecialAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalSpecialAttack.min, wildMonst.evolveIncreasePhysicalSpecialAttack.max);
                    increasedPhysicalBluntAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalBluntAttack.min, wildMonst.evolveIncreasePhysicalBluntAttack.max);
                    increasedPhysicalSlashingAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalSlashingAttack.min, wildMonst.evolveIncreasePhysicalSlashingAttack.max);
                    increasedPhysicalPierceAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalPierceAttack.min, wildMonst.evolveIncreasePhysicalPierceAttack.max);

                    increasedSoulMeeleeAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulMeeleeAttack.min, wildMonst.evolveIncreaseSoulMeeleeAttack.max);
                    increasedSoulRangeAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulRangeAttack.min, wildMonst.evolveIncreaseSoulRangeAttack.max);
                    increasedSoulSpecialAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulSpecialAttack.min, wildMonst.evolveIncreaseSoulSpecialAttack.max);
                    increasedSoulBluntAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulBluntAttack.min, wildMonst.evolveIncreaseSoulBluntAttack.max);
                    increasedSoulSlashingAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulSlashingAttack.min, wildMonst.evolveIncreaseSoulSlashingAttack.max);
                    increasedSoulPierceAttack = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulPierceAttack.min, wildMonst.evolveIncreaseSoulPierceAttack.max);

                    increasedPhysicalMeeleeDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalMeeleeDefense.min, wildMonst.evolveIncreasePhysicalMeeleeDefense.max);
                    increasedPhysicalRangeDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalRangeDefense.min, wildMonst.evolveIncreasePhysicalRangeDefense.max);
                    increasedPhysicalSpecialDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalSpecialDefense.min, wildMonst.evolveIncreasePhysicalSpecialDefense.max);
                    increasedPhysicalBluntDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalBluntDefense.min, wildMonst.evolveIncreasePhysicalBluntDefense.max);
                    increasedPhysicalSlashingDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalSlashingDefense.min, wildMonst.evolveIncreasePhysicalSlashingDefense.max);
                    increasedPhysicalPierceDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreasePhysicalPierceDefense.min, wildMonst.evolveIncreasePhysicalPierceDefense.max);

                    increasedSoulMeeleeDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulMeeleeDefense.min, wildMonst.evolveIncreaseSoulMeeleeDefense.max);
                    increasedSoulRangeDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulRangeDefense.min, wildMonst.evolveIncreaseSoulRangeDefense.max);
                    increasedSoulSpecialDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulSpecialDefense.min, wildMonst.evolveIncreaseSoulSpecialDefense.max);
                    increasedSoulBluntDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulBluntDefense.min, wildMonst.evolveIncreaseSoulBluntDefense.max);
                    increasedSoulSlashingDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulSlashingDefense.min, wildMonst.evolveIncreaseSoulSlashingDefense.max);
                    increasedSoulPierceDefense = randomizeMonstLevelUpStats(wildMonst.evolveIncreaseSoulPierceDefense.min, wildMonst.evolveIncreaseSoulPierceDefense.max);
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

            const finalPhysicalMeeleeAttack = increasedPhysicalMeeleeAttack + wildMonst.physicalMeeleeAttack
            const finalPhysicalRangeAttack = increasedPhysicalRangeAttack + wildMonst.physicalRangeAttack
            const finalPhysicalSpecialAttack = increasedPhysicalSpecialAttack + wildMonst.physicalSpecialAttack
            const finalPhysicalBluntAttack = increasedPhysicalBluntAttack + wildMonst.physicalBluntAttack
            const finalPhysicalSlashingAttack = increasedPhysicalSlashingAttack + wildMonst.physicalSlashingAttack
            const finalPhysicalPierceAttack = increasedPhysicalPierceAttack + wildMonst.physicalPierceAttack

            const finalSoulMeeleeAttack = increasedSoulMeeleeAttack + wildMonst.soulMeeleeAttack
            const finalSoulRangeAttack = increasedSoulRangeAttack + wildMonst.soulRangeAttack
            const finalSoulSpecialAttack = increasedSoulSpecialAttack + wildMonst.soulSpecialAttack
            const finalSoulBluntAttack = increasedSoulBluntAttack + wildMonst.soulBluntAttack
            const finalSoulSlashingAttack = increasedSoulSlashingAttack + wildMonst.soulSlashingAttack
            const finalSoulPierceAttack = increasedSoulPierceAttack + wildMonst.soulPierceAttack

            const finalPhysicalMeeleeDefense = increasedPhysicalMeeleeDefense + wildMonst.physicalMeeleeDefense
            const finalPhysicalRangeDefense = increasedPhysicalRangeDefense + wildMonst.physicalRangeDefense
            const finalPhysicalSpecialDefense = increasedPhysicalSpecialDefense + wildMonst.physicalSpecialDefense
            const finalPhysicalBluntDefense = increasedPhysicalBluntDefense + wildMonst.physicalBluntDefense
            const finalPhysicalSlashingDefense = increasedPhysicalSlashingDefense + wildMonst.physicalSlashingDefense
            const finalPhysicalPierceDefense = increasedPhysicalPierceDefense + wildMonst.physicalPierceDefense

            const finalSoulMeeleeDefense = increasedSoulMeeleeDefense + wildMonst.soulMeeleeDefense
            const finalSoulRangeDefense = increasedSoulRangeDefense + wildMonst.soulRangeDefense
            const finalSoulSpecialDefense = increasedSoulSpecialDefense + wildMonst.soulSpecialDefense
            const finalSoulBluntDefense = increasedSoulBluntDefense + wildMonst.soulBluntDefense
            const finalSoulSlashingDefense = increasedSoulSlashingDefense + wildMonst.soulSlashingDefense
            const finalSoulPierceDefense = increasedSoulPierceDefense + wildMonst.soulPierceDefense

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
                maxHealth: finalHealth,
                physicalAttack: finalPhysicalAttack,
                physicalDefense: finalPhysicalDefense,
                soulAttack: finalSoulAttack,
                soulDefense: finalSoulDefense,
                speed: finalSpeed,
                mana: finalMana,
                stamina: finalStamina,

                physicalMeeleeAttack: finalPhysicalMeeleeAttack,
                physicalRangeAttack: finalPhysicalRangeAttack,
                physicalSpecialAttack: finalPhysicalSpecialAttack,
                physicalBluntAttack: finalPhysicalBluntAttack,
                physicalSlashingAttack: finalPhysicalSlashingAttack,
                physicalPierceAttack: finalPhysicalPierceAttack,

                soulMeeleeAttack: finalSoulMeeleeAttack,
                soulRangeAttack: finalSoulRangeAttack,
                soulSpecialAttack: finalSoulSpecialAttack,
                soulBluntAttack: finalSoulBluntAttack,
                soulSlashingAttack: finalSoulSlashingAttack,
                soulPierceAttack: finalSoulPierceAttack,

                physicalMeeleeDefense: finalPhysicalMeeleeDefense,
                physicalRangeDefense: finalPhysicalRangeDefense,
                physicalSpecialDefense: finalPhysicalSpecialDefense,
                physicalBluntDefense: finalPhysicalBluntDefense,
                physicalSlashingDefense: finalPhysicalSlashingDefense,
                physicalPierceDefense: finalPhysicalPierceDefense,

                soulMeeleeDefense: finalSoulMeeleeDefense,
                soulRangeDefense: finalSoulRangeDefense,
                soulSpecialDefense: finalSoulSpecialDefense,
                soulBluntDefense: finalSoulBluntDefense,
                soulSlashingDefense: finalSoulSlashingDefense,
                soulPierceDefense: finalSoulPierceDefense,

                level: level,
                necessaryEp: necessaryEp,
                increaseNecessaryLvlUpEp: increaseNecessaryLvlUpEp,
                currentEp: currentEp,
                beatenEP: beatenEP,
                beatenEPMultiplier: beatenEPMultiplier,
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

    let staticRandomType;
    let collectionMonst;
    let attacks

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

    let increaseHealth
    let increasePhysicalAttack
    let increasePhysicalDefense
    let increaseSoulAttack
    let increaseSoulDefense
    let increaseStamina
    let increaseSpeed
    let increaseMana

    let increasedPhysicalMeeleeAttack
    let increasedPhysicalRangeAttack
    let increasedPhysicalSpecialAttack
    let increasedPhysicalBluntAttack
    let increasedPhysicalSlashingAttack
    let increasedPhysicalPierceAttack

    let increasedSoulMeeleeAttack
    let increasedSoulRangeAttack
    let increasedSoulSpecialAttack
    let increasedSoulBluntAttack
    let increasedSoulSlashingAttack
    let increasedSoulPierceAttack

    let increasedPhysicalMeeleeDefense
    let increasedPhysicalRangeDefense
    let increasedPhysicalSpecialDefense
    let increasedPhysicalBluntDefense
    let increasedPhysicalSlashingDefense
    let increasedPhysicalPierceDefense

    let increasedSoulMeeleeDefense
    let increasedSoulRangeDefense
    let increasedSoulSpecialDefense
    let increasedSoulBluntDefense
    let increasedSoulSlashingDefense
    let increasedSoulPierceDefense

    let finalPhysicalMeeleeAttack
    let finalPhysicalRangeAttack
    let finalPhysicalSpecialAttack
    let finalPhysicalBluntAttack
    let finalPhysicalSlashingAttack
    let finalPhysicalPierceAttack

    let finalSoulMeeleeAttack
    let finalSoulRangeAttack
    let finalSoulSpecialAttack
    let finalSoulBluntAttack
    let finalSoulSlashingAttack
    let finalSoulPierceAttack

    let finalPhysicalMeeleeDefense
    let finalPhysicalRangeDefense
    let finalPhysicalSpecialDefense
    let finalPhysicalBluntDefense
    let finalPhysicalSlashingDefense
    let finalPhysicalPierceDefense

    let finalSoulMeeleeDefense
    let finalSoulRangeDefense
    let finalSoulSpecialDefense
    let finalSoulBluntDefense
    let finalSoulSlashingDefense
    let finalSoulPierceDefense

    const collectionMonstIndex = collection.findIndex(i => i?.surrogateID === surrogateID)
    if (collectionMonstIndex === -1) {
        console.error("Monster was not found in wild Monsters!")
        return null;
    } else {
        collectionMonst = collection[collectionMonstIndex];
        level = collectionMonst.level;
        nextLevel = level + 1
        staticRandomType = collectionMonst.staticType;
        attacks = checkWildIfLvlUpAttack(collectionMonst, nextLevel)
        console.warn("current attacks: ", attacks)

        console.log(collectionMonst)

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

                increasedPhysicalMeeleeAttack = collectionMonst.increasePhysicalMeeleeAttackStatic
                increasedPhysicalRangeAttack = collectionMonst.increasePhysicalRangeAttackStatic
                increasedPhysicalSpecialAttack = collectionMonst.increasePhysicalSpecialAttackStatic
                increasedPhysicalBluntAttack = collectionMonst.increasePhysicalBluntAttackStatic
                increasedPhysicalSlashingAttack = collectionMonst.increasePhysicalSlashingAttackStatic
                increasedPhysicalPierceAttack = collectionMonst.increasePhysicalPierceAttackStatic

                increasedSoulMeeleeAttack = collectionMonst.increaseSoulMeeleeAttackStatic
                increasedSoulRangeAttack = collectionMonst.increaseSoulRangeAttackStatic
                increasedSoulSpecialAttack = collectionMonst.increaseSoulSpecialAttackStatic
                increasedSoulBluntAttack = collectionMonst.increaseSoulBluntAttackStatic
                increasedSoulSlashingAttack = collectionMonst.increaseSoulSlashingAttackStatic
                increasedSoulPierceAttack = collectionMonst.increaseSoulPierceAttackStatic

                increasedPhysicalMeeleeDefense = collectionMonst.increasePhysicalMeeleeDefenseStatic
                increasedPhysicalRangeDefense = collectionMonst.increasePhysicalRangeDefenseStatic
                increasedPhysicalSpecialDefense = collectionMonst.increasePhysicalSpecialDefenseStatic
                increasedPhysicalBluntDefense = collectionMonst.increasePhysicalBluntDefenseStatic
                increasedPhysicalSlashingDefense = collectionMonst.increasePhysicalSlashingDefenseStatic
                increasedPhysicalPierceDefense = collectionMonst.increasePhysicalPierceDefenseStatic

                increasedSoulMeeleeDefense = collectionMonst.increaseSoulMeeleeDefenseStatic
                increasedSoulRangeDefense = collectionMonst.increaseSoulRangeDefenseStatic
                increasedSoulSpecialDefense = collectionMonst.increaseSoulSpecialDefenseStatic
                increasedSoulBluntDefense = collectionMonst.increaseSoulBluntDefenseStatic
                increasedSoulSlashingDefense = collectionMonst.increaseSoulSlashingDefenseStatic
                increasedSoulPierceDefense = collectionMonst.increaseSoulPierceDefenseStatic
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

                increasedPhysicalMeeleeAttack = collectionMonst.increasePhysicalMeeleeAttackStatic
                increasedPhysicalRangeAttack = collectionMonst.increasePhysicalRangeAttackStatic
                increasedPhysicalSpecialAttack = collectionMonst.increasePhysicalSpecialAttackStatic
                increasedPhysicalBluntAttack = collectionMonst.increasePhysicalBluntAttackStatic
                increasedPhysicalSlashingAttack = collectionMonst.increasePhysicalSlashingAttackStatic
                increasedPhysicalPierceAttack = collectionMonst.increasePhysicalPierceAttackStatic

                increasedSoulMeeleeAttack = collectionMonst.increaseSoulMeeleeAttackStatic
                increasedSoulRangeAttack = collectionMonst.increaseSoulRangeAttackStatic
                increasedSoulSpecialAttack = collectionMonst.increaseSoulSpecialAttackStatic
                increasedSoulBluntAttack = collectionMonst.increaseSoulBluntAttackStatic
                increasedSoulSlashingAttack = collectionMonst.increaseSoulSlashingAttackStatic
                increasedSoulPierceAttack = collectionMonst.increaseSoulPierceAttackStatic

                increasedPhysicalMeeleeDefense = collectionMonst.increasePhysicalMeeleeDefenseStatic
                increasedPhysicalRangeDefense = collectionMonst.increasePhysicalRangeDefenseStatic
                increasedPhysicalSpecialDefense = collectionMonst.increasePhysicalSpecialDefenseStatic
                increasedPhysicalBluntDefense = collectionMonst.increasePhysicalBluntDefenseStatic
                increasedPhysicalSlashingDefense = collectionMonst.increasePhysicalSlashingDefenseStatic
                increasedPhysicalPierceDefense = collectionMonst.increasePhysicalPierceDefenseStatic

                increasedSoulMeeleeDefense = collectionMonst.increaseSoulMeeleeDefenseStatic
                increasedSoulRangeDefense = collectionMonst.increaseSoulRangeDefenseStatic
                increasedSoulSpecialDefense = collectionMonst.increaseSoulSpecialDefenseStatic
                increasedSoulBluntDefense = collectionMonst.increaseSoulBluntDefenseStatic
                increasedSoulSlashingDefense = collectionMonst.increaseSoulSlashingDefenseStatic
                increasedSoulPierceDefense = collectionMonst.increaseSoulPierceDefenseStatic
                break;

            case "onlyStatsRandom":
                console.log("Level Up for Monster with only randomized stats chosen.")
                increaseHealth = collectionMonst.increaseHealth;
                increasePhysicalAttack = collectionMonst.increasePhysicalAttack
                increasedHealth = randomizeMonstLevelUpStats(increaseHealth.min, increaseHealth.max);
                increasedPhysicalAttack = randomizeMonstLevelUpStats(increasePhysicalAttack.min, increasePhysicalAttack.max);
                increasedPhysicalDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalDefense.min, collectionMonst.increasePhysicalDefense.max);
                increasedSoulAttack = randomizeMonstLevelUpStats(collectionMonst.increaseSoulAttack.min, collectionMonst.increaseSoulAttack.max);
                increasedSoulDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulDefense.min, collectionMonst.increaseSoulDefense.max);
                increasedSpeed = randomizeMonstLevelUpStats(collectionMonst.increaseSpeed.min, collectionMonst.increaseSpeed.max);
                increasedMana = randomizeMonstLevelUpStats(collectionMonst.increaseMana.min, collectionMonst.increaseMana.max);
                increasedStamina = randomizeMonstLevelUpStats(collectionMonst.increaseStamina.min, collectionMonst.increaseStamina.max);

                increasedPhysicalMeeleeAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalMeeleeAttack.min, collectionMonst.increasePhysicalMeeleeAttack.max);
                increasedPhysicalRangeAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalRangeAttack.min, collectionMonst.increasePhysicalRangeAttack.max);
                increasedPhysicalSpecialAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalSpecialAttack.min, collectionMonst.increasePhysicalSpecialAttack.max);
                increasedPhysicalBluntAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalBluntAttack.min, collectionMonst.increasePhysicalBluntAttack.max);
                increasedPhysicalSlashingAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalSlashingAttack.min, collectionMonst.increasePhysicalSlashingAttack.max);
                increasedPhysicalPierceAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalPierceAttack.min, collectionMonst.increasePhysicalPierceAttack.max);

                increasedSoulMeeleeAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalMeeleeAttack.min, collectionMonst.increasePhysicalMeeleeAttack.max);
                increasedSoulRangeAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalRangeAttack.min, collectionMonst.increasePhysicalRangeAttack.max);
                increasedSoulSpecialAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalSpecialAttack.min, collectionMonst.increasePhysicalSpecialAttack.max);
                increasedSoulBluntAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalBluntAttack.min, collectionMonst.increasePhysicalBluntAttack.max);
                increasedSoulSlashingAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalSlashingAttack.min, collectionMonst.increasePhysicalSlashingAttack.max);
                increasedSoulPierceAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalPierceAttack.min, collectionMonst.increasePhysicalPierceAttack.max);

                increasedPhysicalMeeleeDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalMeeleeDefense.min, collectionMonst.increasePhysicalMeeleeDefense.max);
                increasedPhysicalRangeDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalRangeDefense.min, collectionMonst.increasePhysicalRangeDefense.max);
                increasedPhysicalSpecialDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalSpecialDefense.min, collectionMonst.increasePhysicalSpecialDefense.max);
                increasedPhysicalBluntDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalBluntDefense.min, collectionMonst.increasePhysicalBluntDefense.max);
                increasedPhysicalSlashingDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalSlashingDefense.min, collectionMonst.increasePhysicalSlashingDefense.max);
                increasedPhysicalPierceDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalPierceDefense.min, collectionMonst.increasePhysicalPierceDefense.max);

                increasedSoulMeeleeDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulMeeleeDefense.min, collectionMonst.increaseSoulMeeleeDefense.max);
                increasedSoulRangeDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulRangeDefense.min, collectionMonst.increaseSoulRangeDefense.max);
                increasedSoulSpecialDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulSpecialDefense.min, collectionMonst.increaseSoulSpecialDefense.max);
                increasedSoulBluntDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulBluntDefense.min, collectionMonst.increaseSoulBluntDefense.max);
                increasedSoulSlashingDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulSlashingDefense.min, collectionMonst.increaseSoulSlashingDefense.max);
                increasedSoulPierceDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulPierceDefense.min, collectionMonst.increaseSoulPierceDefense.max);
                break;

            case "completeRandom":
                console.log("Level Up for completely random Monster chosen.")
                increaseHealth = collectionMonst.increaseHealth;
                increasePhysicalAttack = collectionMonst.increasePhysicalAttack
                increasedHealth = randomizeMonstLevelUpStats(increaseHealth.min, increaseHealth.max);
                increasedPhysicalAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalAttack.min, collectionMonst.increasePhysicalAttack.max);
                increasedPhysicalDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalDefense.min, collectionMonst.increasePhysicalDefense.max);
                increasedSoulAttack = randomizeMonstLevelUpStats(collectionMonst.increaseSoulAttack.min, collectionMonst.increaseSoulAttack.max);
                increasedSoulDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulDefense.min, collectionMonst.increaseSoulDefense.max);
                increasedSpeed = randomizeMonstLevelUpStats(collectionMonst.increaseSpeed.min, collectionMonst.increaseSpeed.max);
                increasedMana = randomizeMonstLevelUpStats(collectionMonst.increaseMana.min, collectionMonst.increaseMana.max);
                increasedStamina = randomizeMonstLevelUpStats(collectionMonst.increaseStamina.min, collectionMonst.increaseStamina.max);

                increasedPhysicalMeeleeAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalMeeleeAttack.min, collectionMonst.increasePhysicalMeeleeAttack.max);
                increasedPhysicalRangeAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalRangeAttack.min, collectionMonst.increasePhysicalRangeAttack.max);
                increasedPhysicalSpecialAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalSpecialAttack.min, collectionMonst.increasePhysicalSpecialAttack.max);
                increasedPhysicalBluntAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalBluntAttack.min, collectionMonst.increasePhysicalBluntAttack.max);
                increasedPhysicalSlashingAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalSlashingAttack.min, collectionMonst.increasePhysicalSlashingAttack.max);
                increasedPhysicalPierceAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalPierceAttack.min, collectionMonst.increasePhysicalPierceAttack.max);

                increasedSoulMeeleeAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalMeeleeAttack.min, collectionMonst.increasePhysicalMeeleeAttack.max);
                increasedSoulRangeAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalRangeAttack.min, collectionMonst.increasePhysicalRangeAttack.max);
                increasedSoulSpecialAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalSpecialAttack.min, collectionMonst.increasePhysicalSpecialAttack.max);
                increasedSoulBluntAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalBluntAttack.min, collectionMonst.increasePhysicalBluntAttack.max);
                increasedSoulSlashingAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalSlashingAttack.min, collectionMonst.increasePhysicalSlashingAttack.max);
                increasedSoulPierceAttack = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalPierceAttack.min, collectionMonst.increasePhysicalPierceAttack.max);

                increasedPhysicalMeeleeDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalMeeleeDefense.min, collectionMonst.increasePhysicalMeeleeDefense.max);
                increasedPhysicalRangeDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalRangeDefense.min, collectionMonst.increasePhysicalRangeDefense.max);
                increasedPhysicalSpecialDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalSpecialDefense.min, collectionMonst.increasePhysicalSpecialDefense.max);
                increasedPhysicalBluntDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalBluntDefense.min, collectionMonst.increasePhysicalBluntDefense.max);
                increasedPhysicalSlashingDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalSlashingDefense.min, collectionMonst.increasePhysicalSlashingDefense.max);
                increasedPhysicalPierceDefense = randomizeMonstLevelUpStats(collectionMonst.increasePhysicalPierceDefense.min, collectionMonst.increasePhysicalPierceDefense.max);

                increasedSoulMeeleeDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulMeeleeDefense.min, collectionMonst.increaseSoulMeeleeDefense.max);
                increasedSoulRangeDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulRangeDefense.min, collectionMonst.increaseSoulRangeDefense.max);
                increasedSoulSpecialDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulSpecialDefense.min, collectionMonst.increaseSoulSpecialDefense.max);
                increasedSoulBluntDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulBluntDefense.min, collectionMonst.increaseSoulBluntDefense.max);
                increasedSoulSlashingDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulSlashingDefense.min, collectionMonst.increaseSoulSlashingDefense.max);
                increasedSoulPierceDefense = randomizeMonstLevelUpStats(collectionMonst.increaseSoulPierceDefense.min, collectionMonst.increaseSoulPierceDefense.max);
                break;

            default:
                console.error("Level Up failed as no Option was given or option for Level Up was invalid.")
        }
        /*
                console.log("staticType:", wildMonst.staticType);
                console.log("increaseHealthStatic:", wildMonst.increaseHealthStatic);
                console.log("health:", wildMonst.health);

         */

        finalHealth = increasedHealth + collectionMonst.health;
        finalPhysicalAttack = increasedPhysicalAttack + collectionMonst.physicalAttack;
        finalPhysicalDefense = increasedPhysicalDefense + collectionMonst.physicalDefense;
        finalSoulAttack = increasedSoulAttack + collectionMonst.soulAttack;
        finalSoulDefense = increasedSoulDefense + collectionMonst.soulDefense;
        finalSpeed = increasedSpeed + collectionMonst.speed;
        finalMana = increasedMana + collectionMonst.mana;
        finalStamina = increasedStamina + collectionMonst.stamina;

        finalPhysicalMeeleeAttack = increasedPhysicalMeeleeAttack + collectionMonst.physicalMeeleeAttack
        finalPhysicalRangeAttack = increasedPhysicalRangeAttack + collectionMonst.physicalRangeAttack
        finalPhysicalSpecialAttack = increasedPhysicalSpecialAttack + collectionMonst.physicalSpecialAttack
        finalPhysicalBluntAttack = increasedPhysicalBluntAttack + collectionMonst.physicalBluntAttack
        finalPhysicalSlashingAttack = increasedPhysicalSlashingAttack + collectionMonst.physicalSlashingAttack
        finalPhysicalPierceAttack = increasedPhysicalPierceAttack + collectionMonst.physicalPierceAttack

        finalSoulMeeleeAttack = increasedSoulMeeleeAttack + collectionMonst.soulMeeleeAttack
        finalSoulRangeAttack = increasedSoulRangeAttack + collectionMonst.soulRangeAttack
        finalSoulSpecialAttack = increasedSoulSpecialAttack + collectionMonst.soulSpecialAttack
        finalSoulBluntAttack = increasedSoulBluntAttack + collectionMonst.soulBluntAttack
        finalSoulSlashingAttack = increasedSoulSlashingAttack + collectionMonst.soulSlashingAttack
        finalSoulPierceAttack = increasedSoulPierceAttack + collectionMonst.soulPierceAttack

        finalPhysicalMeeleeDefense = increasedPhysicalMeeleeDefense + collectionMonst.physicalMeeleeDefense
        finalPhysicalRangeDefense = increasedPhysicalRangeDefense + collectionMonst.physicalRangeDefense
        finalPhysicalSpecialDefense = increasedPhysicalSpecialDefense + collectionMonst.physicalSpecialDefense
        finalPhysicalBluntDefense = increasedPhysicalBluntDefense + collectionMonst.physicalBluntDefense
        finalPhysicalSlashingDefense = increasedPhysicalSlashingDefense + collectionMonst.physicalSlashingDefense
        finalPhysicalPierceDefense = increasedPhysicalPierceDefense + collectionMonst.physicalPierceDefense

        finalSoulMeeleeDefense = increasedSoulMeeleeDefense + collectionMonst.soulMeeleeDefense
        finalSoulRangeDefense = increasedSoulRangeDefense + collectionMonst.soulRangeDefense
        finalSoulSpecialDefense = increasedSoulSpecialDefense + collectionMonst.soulSpecialDefense
        finalSoulBluntDefense = increasedSoulBluntDefense + collectionMonst.soulBluntDefense
        finalSoulSlashingDefense = increasedSoulSlashingDefense + collectionMonst.soulSlashingDefense
        finalSoulPierceDefense = increasedSoulPierceDefense + collectionMonst.soulPierceDefense

        necessaryEp = collectionMonst.necessaryEp * collectionMonst.increaseNecessaryLvlUpEp;
        increaseNecessaryLvlUpEp = collectionMonst.increaseNecessaryLvlUpEp;
        currentEp = 0;
        level = nextLevel;

    }


    const levelUpMonst = {
        ...collectionMonst,
        health: finalHealth,
        maxHealth: finalHealth,
        physicalAttack: finalPhysicalAttack,
        physicalDefense: finalPhysicalDefense,
        soulAttack: finalSoulAttack,
        soulDefense: finalSoulDefense,
        speed: finalSpeed,
        mana: finalMana,
        stamina: finalStamina,

        physicalMeeleeAttack: finalPhysicalMeeleeAttack,
        physicalRangeAttack: finalPhysicalRangeAttack,
        physicalSpecialAttack: finalPhysicalSpecialAttack,
        physicalBluntAttack: finalPhysicalBluntAttack,
        physicalSlashingAttack: finalPhysicalSlashingAttack,
        physicalPierceAttack: finalPhysicalPierceAttack,

        soulMeeleeAttack: finalSoulMeeleeAttack,
        soulRangeAttack: finalSoulRangeAttack,
        soulSpecialAttack: finalSoulSpecialAttack,
        soulBluntAttack: finalSoulBluntAttack,
        soulSlashingAttack: finalSoulSlashingAttack,
        soulPierceAttack: finalSoulPierceAttack,

        physicalMeeleeDefense: finalPhysicalMeeleeDefense,
        physicalRangeDefense: finalPhysicalRangeDefense,
        physicalSpecialDefense: finalPhysicalSpecialDefense,
        physicalBluntDefense: finalPhysicalBluntDefense,
        physicalSlashingDefense: finalPhysicalSlashingDefense,
        physicalPierceDefense: finalPhysicalPierceDefense,

        soulMeeleeDefense: finalSoulMeeleeDefense,
        soulRangeDefense: finalSoulRangeDefense,
        soulSpecialDefense: finalSoulSpecialDefense,
        soulBluntDefense: finalSoulBluntDefense,
        soulSlashingDefense: finalSoulSlashingDefense,
        soulPierceDefense: finalSoulPierceDefense,

        necessaryEp: necessaryEp,
        increaseNecessaryLvlUpEp: increaseNecessaryLvlUpEp,
        currentEp: currentEp,
        attacks: attacks,
        level: level
    }
    console.log("Increased stats for Monster: ", levelUpMonst, " on level ", level);
    return levelUpMonst;
}

export async function evolveCollectionAndTeamMonst(previousSurrogateID) {
    const allMons = await getAllMonsters()
    const collection = getCollection();
    let newSurrogateID
    let level;
    let oldLevel
    let nextLevel
    let necessaryEp
    let increaseNecessaryLvlUpEp;
    let currentEp;

    let staticRandomType;
    let collectionMonst;
    let attacks;

    let increasedHealth
    let increasedPhysicalAttack
    let increasedPhysicalDefense
    let increasedSoulAttack
    let increasedSoulDefense
    let increasedSpeed
    let increasedMana
    let increasedStamina

    let increasedPhysicalMeeleeAttack
    let increasedPhysicalRangeAttack
    let increasedPhysicalSpecialAttack
    let increasedPhysicalBluntAttack
    let increasedPhysicalSlashingAttack
    let increasedPhysicalPierceAttack

    let increasedSoulMeeleeAttack
    let increasedSoulRangeAttack
    let increasedSoulSpecialAttack
    let increasedSoulBluntAttack
    let increasedSoulSlashingAttack
    let increasedSoulPierceAttack

    let increasedPhysicalMeeleeDefense
    let increasedPhysicalRangeDefense
    let increasedPhysicalSpecialDefense
    let increasedPhysicalBluntDefense
    let increasedPhysicalSlashingDefense
    let increasedPhysicalPierceDefense

    let increasedSoulMeeleeDefense
    let increasedSoulRangeDefense
    let increasedSoulSpecialDefense
    let increasedSoulBluntDefense
    let increasedSoulSlashingDefense
    let increasedSoulPierceDefense

    const wildMonstIndex = collection.findIndex(i => i.surrogateID === previousSurrogateID);
    console.log("test evolution function");
    if (wildMonstIndex === -1) {
        console.error("Monster does not exist in wild monsters!", previousSurrogateID);
        return null;
    } else {
        collectionMonst = collection[wildMonstIndex];
        const nextEvolution = collectionMonst.nextEvol;
        if (!nextEvolution) {
            console.error("Monster: ", previousSurrogateID, ", can not evolve because it has no further evolution!")
            return null;
        } else {
            const usedIDs = getUsedIDs();

            // Finde die kleinste Nummer, die es noch nicht gibt
            let num = 1;

            const prefix = `${nextEvolution}#`;

            while (usedIDs.includes(`${prefix}${num}`)) {
                num++;
            }

            newSurrogateID = `${prefix}${num}`;

            usedIDs.push(newSurrogateID);
            saveUsedIDs(usedIDs);
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


        level = collectionMonst.level;
        nextLevel = collectionMonst.level + 1
        oldLevel = collectionMonst.level;
        staticRandomType = collectionMonst.staticType;
        attacks = checkWildIfLvlUpAttack(collectionMonst, nextLevel)
        console.warn("current attacks: ", attacks)

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

                    increasedPhysicalMeeleeAttack = collectionMonst.evolveIncreasePhysicalMeeleeAttackStatic
                    increasedPhysicalRangeAttack = collectionMonst.evolveIncreasePhysicalRangeAttackStatic
                    increasedPhysicalSpecialAttack = collectionMonst.evolveIncreasePhysicalSpecialAttackStatic
                    increasedPhysicalBluntAttack = collectionMonst.evolveIncreasePhysicalBluntAttackStatic
                    increasedPhysicalSlashingAttack = collectionMonst.evolveIncreasePhysicalSlashingAttackStatic
                    increasedPhysicalPierceAttack = collectionMonst.evolveIncreasePhysicalPierceAttackStatic

                    increasedSoulMeeleeAttack = collectionMonst.evolveIncreaseSoulMeeleeAttackStatic
                    increasedSoulRangeAttack = collectionMonst.evolveIncreaseSoulRangeAttackStatic
                    increasedSoulSpecialAttack = collectionMonst.evolveIncreaseSoulSpecialAttackStatic
                    increasedSoulBluntAttack = collectionMonst.evolveIncreaseSoulBluntAttackStatic
                    increasedSoulSlashingAttack = collectionMonst.evolveIncreaseSoulSlashingAttackStatic
                    increasedSoulPierceAttack = collectionMonst.evolveIncreaseSoulPierceAttackStatic

                    increasedPhysicalMeeleeDefense = collectionMonst.evolveIncreasePhysicalMeeleeDefenseStatic
                    increasedPhysicalRangeDefense = collectionMonst.evolveIncreasePhysicalRangeDefenseStatic
                    increasedPhysicalSpecialDefense = collectionMonst.evolveIncreasePhysicalSpecialDefenseStatic
                    increasedPhysicalBluntDefense = collectionMonst.evolveIncreasePhysicalBluntDefenseStatic
                    increasedPhysicalSlashingDefense = collectionMonst.evolveIncreasePhysicalSlashingDefenseStatic
                    increasedPhysicalPierceDefense = collectionMonst.evolveIncreasePhysicalPierceDefenseStatic

                    increasedSoulMeeleeDefense = collectionMonst.evolveIncreaseSoulMeeleeDefenseStatic
                    increasedSoulRangeDefense = collectionMonst.evolveIncreaseSoulRangeDefenseStatic
                    increasedSoulSpecialDefense = collectionMonst.evolveIncreaseSoulSpecialDefenseStatic
                    increasedSoulBluntDefense = collectionMonst.evolveIncreaseSoulBluntDefenseStatic
                    increasedSoulSlashingDefense = collectionMonst.evolveIncreaseSoulSlashingDefenseStatic
                    increasedSoulPierceDefense = collectionMonst.evolveIncreaseSoulPierceDefenseStatic
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

                    increasedPhysicalMeeleeAttack = collectionMonst.evolveIncreasePhysicalMeeleeAttackStatic
                    increasedPhysicalRangeAttack = collectionMonst.evolveIncreasePhysicalRangeAttackStatic
                    increasedPhysicalSpecialAttack = collectionMonst.evolveIncreasePhysicalSpecialAttackStatic
                    increasedPhysicalBluntAttack = collectionMonst.evolveIncreasePhysicalBluntAttackStatic
                    increasedPhysicalSlashingAttack = collectionMonst.evolveIncreasePhysicalSlashingAttackStatic
                    increasedPhysicalPierceAttack = collectionMonst.evolveIncreasePhysicalPierceAttackStatic

                    increasedSoulMeeleeAttack = collectionMonst.evolveIncreaseSoulMeeleeAttackStatic
                    increasedSoulRangeAttack = collectionMonst.evolveIncreaseSoulRangeAttackStatic
                    increasedSoulSpecialAttack = collectionMonst.evolveIncreaseSoulSpecialAttackStatic
                    increasedSoulBluntAttack = collectionMonst.evolveIncreaseSoulBluntAttackStatic
                    increasedSoulSlashingAttack = collectionMonst.evolveIncreaseSoulSlashingAttackStatic
                    increasedSoulPierceAttack = collectionMonst.evolveIncreaseSoulPierceAttackStatic

                    increasedPhysicalMeeleeDefense = collectionMonst.evolveIncreasePhysicalMeeleeDefenseStatic
                    increasedPhysicalRangeDefense = collectionMonst.evolveIncreasePhysicalRangeDefenseStatic
                    increasedPhysicalSpecialDefense = collectionMonst.evolveIncreasePhysicalSpecialDefenseStatic
                    increasedPhysicalBluntDefense = collectionMonst.evolveIncreasePhysicalBluntDefenseStatic
                    increasedPhysicalSlashingDefense = collectionMonst.evolveIncreasePhysicalSlashingDefenseStatic
                    increasedPhysicalPierceDefense = collectionMonst.evolveIncreasePhysicalPierceDefenseStatic

                    increasedSoulMeeleeDefense = collectionMonst.evolveIncreaseSoulMeeleeDefenseStatic
                    increasedSoulRangeDefense = collectionMonst.evolveIncreaseSoulRangeDefenseStatic
                    increasedSoulSpecialDefense = collectionMonst.evolveIncreaseSoulSpecialDefenseStatic
                    increasedSoulBluntDefense = collectionMonst.evolveIncreaseSoulBluntDefenseStatic
                    increasedSoulSlashingDefense = collectionMonst.evolveIncreaseSoulSlashingDefenseStatic
                    increasedSoulPierceDefense = collectionMonst.evolveIncreaseSoulPierceDefenseStatic
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

                    increasedPhysicalMeeleeAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalMeeleeAttack.min, collectionMonst.evolveIncreasePhysicalMeeleeAttack.max);
                    increasedPhysicalRangeAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalRangeAttack.min, collectionMonst.evolveIncreasePhysicalRangeAttack.max);
                    increasedPhysicalSpecialAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalSpecialAttack.min, collectionMonst.evolveIncreasePhysicalSpecialAttack.max);
                    increasedPhysicalBluntAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalBluntAttack.min, collectionMonst.evolveIncreasePhysicalBluntAttack.max);
                    increasedPhysicalSlashingAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalSlashingAttack.min, collectionMonst.evolveIncreasePhysicalSlashingAttack.max);
                    increasedPhysicalPierceAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalPierceAttack.min, collectionMonst.evolveIncreasePhysicalPierceAttack.max);

                    increasedSoulMeeleeAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulMeeleeAttack.min, collectionMonst.evolveIncreaseSoulMeeleeAttack.max);
                    increasedSoulRangeAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulRangeAttack.min, collectionMonst.evolveIncreaseSoulRangeAttack.max);
                    increasedSoulSpecialAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulSpecialAttack.min, collectionMonst.evolveIncreaseSoulSpecialAttack.max);
                    increasedSoulBluntAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulBluntAttack.min, collectionMonst.evolveIncreaseSoulBluntAttack.max);
                    increasedSoulSlashingAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulSlashingAttack.min, collectionMonst.evolveIncreaseSoulSlashingAttack.max);
                    increasedSoulPierceAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulPierceAttack.min, collectionMonst.evolveIncreaseSoulPierceAttack.max);

                    increasedPhysicalMeeleeDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalMeeleeDefense.min, collectionMonst.evolveIncreasePhysicalMeeleeDefense.max);
                    increasedPhysicalRangeDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalRangeDefense.min, collectionMonst.evolveIncreasePhysicalRangeDefense.max);
                    increasedPhysicalSpecialDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalSpecialDefense.min, collectionMonst.evolveIncreasePhysicalSpecialDefense.max);
                    increasedPhysicalBluntDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalBluntDefense.min, collectionMonst.evolveIncreasePhysicalBluntDefense.max);
                    increasedPhysicalSlashingDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalSlashingDefense.min, collectionMonst.evolveIncreasePhysicalSlashingDefense.max);
                    increasedPhysicalPierceDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalPierceDefense.min, collectionMonst.evolveIncreasePhysicalPierceDefense.max);

                    increasedSoulMeeleeDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulMeeleeDefense.min, collectionMonst.evolveIncreaseSoulMeeleeDefense.max);
                    increasedSoulRangeDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulRangeDefense.min, collectionMonst.evolveIncreaseSoulRangeDefense.max);
                    increasedSoulSpecialDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulSpecialDefense.min, collectionMonst.evolveIncreaseSoulSpecialDefense.max);
                    increasedSoulBluntDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulBluntDefense.min, collectionMonst.evolveIncreaseSoulBluntDefense.max);
                    increasedSoulSlashingDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulSlashingDefense.min, collectionMonst.evolveIncreaseSoulSlashingDefense.max);
                    increasedSoulPierceDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulPierceDefense.min, collectionMonst.evolveIncreaseSoulPierceDefense.max);
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

                    increasedPhysicalMeeleeAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalMeeleeAttack.min, collectionMonst.evolveIncreasePhysicalMeeleeAttack.max);
                    increasedPhysicalRangeAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalRangeAttack.min, collectionMonst.evolveIncreasePhysicalRangeAttack.max);
                    increasedPhysicalSpecialAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalSpecialAttack.min, collectionMonst.evolveIncreasePhysicalSpecialAttack.max);
                    increasedPhysicalBluntAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalBluntAttack.min, collectionMonst.evolveIncreasePhysicalBluntAttack.max);
                    increasedPhysicalSlashingAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalSlashingAttack.min, collectionMonst.evolveIncreasePhysicalSlashingAttack.max);
                    increasedPhysicalPierceAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalPierceAttack.min, collectionMonst.evolveIncreasePhysicalPierceAttack.max);

                    increasedSoulMeeleeAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulMeeleeAttack.min, collectionMonst.evolveIncreaseSoulMeeleeAttack.max);
                    increasedSoulRangeAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulRangeAttack.min, collectionMonst.evolveIncreaseSoulRangeAttack.max);
                    increasedSoulSpecialAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulSpecialAttack.min, collectionMonst.evolveIncreaseSoulSpecialAttack.max);
                    increasedSoulBluntAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulBluntAttack.min, collectionMonst.evolveIncreaseSoulBluntAttack.max);
                    increasedSoulSlashingAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulSlashingAttack.min, collectionMonst.evolveIncreaseSoulSlashingAttack.max);
                    increasedSoulPierceAttack = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulPierceAttack.min, collectionMonst.evolveIncreaseSoulPierceAttack.max);

                    increasedPhysicalMeeleeDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalMeeleeDefense.min, collectionMonst.evolveIncreasePhysicalMeeleeDefense.max);
                    increasedPhysicalRangeDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalRangeDefense.min, collectionMonst.evolveIncreasePhysicalRangeDefense.max);
                    increasedPhysicalSpecialDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalSpecialDefense.min, collectionMonst.evolveIncreasePhysicalSpecialDefense.max);
                    increasedPhysicalBluntDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalBluntDefense.min, collectionMonst.evolveIncreasePhysicalBluntDefense.max);
                    increasedPhysicalSlashingDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalSlashingDefense.min, collectionMonst.evolveIncreasePhysicalSlashingDefense.max);
                    increasedPhysicalPierceDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreasePhysicalPierceDefense.min, collectionMonst.evolveIncreasePhysicalPierceDefense.max);

                    increasedSoulMeeleeDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulMeeleeDefense.min, collectionMonst.evolveIncreaseSoulMeeleeDefense.max);
                    increasedSoulRangeDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulRangeDefense.min, collectionMonst.evolveIncreaseSoulRangeDefense.max);
                    increasedSoulSpecialDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulSpecialDefense.min, collectionMonst.evolveIncreaseSoulSpecialDefense.max);
                    increasedSoulBluntDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulBluntDefense.min, collectionMonst.evolveIncreaseSoulBluntDefense.max);
                    increasedSoulSlashingDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulSlashingDefense.min, collectionMonst.evolveIncreaseSoulSlashingDefense.max);
                    increasedSoulPierceDefense = randomizeMonstLevelUpStats(collectionMonst.evolveIncreaseSoulPierceDefense.min, collectionMonst.evolveIncreaseSoulPierceDefense.max);
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

            const finalPhysicalMeeleeAttack = increasedPhysicalMeeleeAttack + collectionMonst.physicalMeeleeAttack
            const finalPhysicalRangeAttack = increasedPhysicalRangeAttack + collectionMonst.physicalRangeAttack
            const finalPhysicalSpecialAttack = increasedPhysicalSpecialAttack + collectionMonst.physicalSpecialAttack
            const finalPhysicalBluntAttack = increasedPhysicalBluntAttack + collectionMonst.physicalBluntAttack
            const finalPhysicalSlashingAttack = increasedPhysicalSlashingAttack + collectionMonst.physicalSlashingAttack
            const finalPhysicalPierceAttack = increasedPhysicalPierceAttack + collectionMonst.physicalPierceAttack

            const finalSoulMeeleeAttack = increasedSoulMeeleeAttack + collectionMonst.soulMeeleeAttack
            const finalSoulRangeAttack = increasedSoulRangeAttack + collectionMonst.soulRangeAttack
            const finalSoulSpecialAttack = increasedSoulSpecialAttack + collectionMonst.soulSpecialAttack
            const finalSoulBluntAttack = increasedSoulBluntAttack + collectionMonst.soulBluntAttack
            const finalSoulSlashingAttack = increasedSoulSlashingAttack + collectionMonst.soulSlashingAttack
            const finalSoulPierceAttack = increasedSoulPierceAttack + collectionMonst.soulPierceAttack

            const finalPhysicalMeeleeDefense = increasedPhysicalMeeleeDefense + collectionMonst.physicalMeeleeDefense
            const finalPhysicalRangeDefense = increasedPhysicalRangeDefense + collectionMonst.physicalRangeDefense
            const finalPhysicalSpecialDefense = increasedPhysicalSpecialDefense + collectionMonst.physicalSpecialDefense
            const finalPhysicalBluntDefense = increasedPhysicalBluntDefense + collectionMonst.physicalBluntDefense
            const finalPhysicalSlashingDefense = increasedPhysicalSlashingDefense + collectionMonst.physicalSlashingDefense
            const finalPhysicalPierceDefense = increasedPhysicalPierceDefense + collectionMonst.physicalPierceDefense

            const finalSoulMeeleeDefense = increasedSoulMeeleeDefense + collectionMonst.soulMeeleeDefense
            const finalSoulRangeDefense = increasedSoulRangeDefense + collectionMonst.soulRangeDefense
            const finalSoulSpecialDefense = increasedSoulSpecialDefense + collectionMonst.soulSpecialDefense
            const finalSoulBluntDefense = increasedSoulBluntDefense + collectionMonst.soulBluntDefense
            const finalSoulSlashingDefense = increasedSoulSlashingDefense + collectionMonst.soulSlashingDefense
            const finalSoulPierceDefense = increasedSoulPierceDefense + collectionMonstEvol.soulPierceDefense

            necessaryEp = collectionMonst.necessaryEp * collectionMonst.increaseNecessaryLvlUpEp;
            increaseNecessaryLvlUpEp = collectionMonst.increaseNecessaryLvlUpEp;
            currentEp = 0;
            level = nextLevel;

            const lvlUpAttacks = collectionMonstEvol.attackLearnSet;
            const staticLvlUpAttacks = collectionMonstEvol.attackStaticSet;
            const evolveAttacks = collectionMonstEvol.attackEvolutionSet;
            attacks = giveWildMonstEvolveAttack(collectionMonst)

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
                attacks: attacks,

                health: finalHealth,
                maxHealth: finalHealth,
                physicalAttack: finalPhysicalAttack,
                physicalDefense: finalPhysicalDefense,
                soulAttack: finalSoulAttack,
                soulDefense: finalSoulDefense,
                speed: finalSpeed,
                mana: finalMana,
                stamina: finalStamina,

                physicalMeeleeAttack: finalPhysicalMeeleeAttack,
                physicalRangeAttack: finalPhysicalRangeAttack,
                physicalSpecialAttack: finalPhysicalSpecialAttack,
                physicalBluntAttack: finalPhysicalBluntAttack,
                physicalSlashingAttack: finalPhysicalSlashingAttack,
                physicalPierceAttack: finalPhysicalPierceAttack,

                soulMeeleeAttack: finalSoulMeeleeAttack,
                soulRangeAttack: finalSoulRangeAttack,
                soulSpecialAttack: finalSoulSpecialAttack,
                soulBluntAttack: finalSoulBluntAttack,
                soulSlashingAttack: finalSoulSlashingAttack,
                soulPierceAttack: finalSoulPierceAttack,

                physicalMeeleeDefense: finalPhysicalMeeleeDefense,
                physicalRangeDefense: finalPhysicalRangeDefense,
                physicalSpecialDefense: finalPhysicalSpecialDefense,
                physicalBluntDefense: finalPhysicalBluntDefense,
                physicalSlashingDefense: finalPhysicalSlashingDefense,
                physicalPierceDefense: finalPhysicalPierceDefense,

                soulMeeleeDefense: finalSoulMeeleeDefense,
                soulRangeDefense: finalSoulRangeDefense,
                soulSpecialDefense: finalSoulSpecialDefense,
                soulBluntDefense: finalSoulBluntDefense,
                soulSlashingDefense: finalSoulSlashingDefense,
                soulPierceDefense: finalSoulPierceDefense,

                level: level,
                necessaryEp: necessaryEp,
                increaseNecessaryLvlUpEp: increaseNecessaryLvlUpEp,
                currentEp: currentEp,
                lvlUpAttacks: lvlUpAttacks,
                staticLvlUpAttacks: staticLvlUpAttacks,
                evolveAttacks: evolveAttacks,
            }
            collection[wildMonstIndex] = evolvedMonst;
            saveWildMonst(collection)
            console.log("Evolved Monster: ", collectionMonst.surrogateID, " with level ", oldLevel, " to Monster: ", evolvedMonst.surrogateID, " with Level: ", level);
            return evolvedMonst;
        } else {
            console.error("Evolution and level up not possible as the Level for evolution is not reached yet.")
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


export async function loadMonstInfo(surrogateID) {
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

//todo: eine methode erstellen, die ein story monster erstellt und nur auf story monsters.json zugreift und dieses genau so erstellt, wie es da statisch aufgebaut ist

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

export function removeMonstFromCollection(surrogateID) {
    console.log("testing function call for removing monster from collection")
    let collection = getCollection()
    let team = getTeam()

    const monstIndex = collection.findIndex(i => i.surrogateID === surrogateID)
    const monst = collection[monstIndex]

    if (!monst) {
        console.log("Monster ", monst, " was not in collection in the first place so it will not be removed.");
        return null;
    } else {
        if (team.some(i => i.surrogateID === surrogateID)) {
            removeMonstFromTeam(surrogateID);
        }

        collection.splice(monstIndex, 1);


        saveCollection(collection);
        console.log("Removed from Collection:", surrogateID);
        console.log("Collection after removing: ", collection);
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
export function addMonstToTeam(surrogateID) {
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
            console.log("about to add monster ", teamMonst, " to team")
            team.push(teamMonst)
            saveTeam(team);
        }
    }
}


export function removeMonstFromTeam(surrogateID) {
    let team = getTeam();
    const monst = team.find(i => i.surrogateID === surrogateID);

    if (!monst) {
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

export function spawnRandomWildMonst() {
    //todo: gleiche logik wie bei map based level anwenden um je nach map random monster erstellen zu lassen
}

export function spawnStoryMonst() {

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