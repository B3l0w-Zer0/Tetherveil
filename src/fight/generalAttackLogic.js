import {getWildMonst, getCollection, getTeam} from '/src/player/monsterlogic.js'


const allAttacks = await getAllAttacks();

const TIER_LEVEL_REQUIREMENTS = {
    1: 0,
    2: 20,
    3: 40,
    4: 60,
    5: 80,
    6: 100
}


export async function getAllAttacks() {
    const attacks = await fetch("./src/data/monsterData/attacks.json")
    return await attacks.json();
}

//This is only to shorten the search for the necessary attack as not all of the attacks need to be loaded in and searched through at all times and also to keep it from becoming all async
export function getAttacks() {
    return JSON.parse(localStorage.getItem("attacks") || "[]")
}

export function saveAttacks(attacks) {
    localStorage.setItem("attacks", JSON.stringify(attacks));
}


export function getAttackInfo(attackID) {
    const attack = allAttacks.find(i => i.attackID === attackID)
    return attack;
}

export function getUsedAttacks(){
    return JSON.parse(localStorage.getItem("usedAttacks") || "[]")
}

export function saveUsedAttacks(usedAttacks){
    localStorage.setItem("usedAttacks", JSON.stringify(usedAttacks));
}

export function giveWildMonsterBaseAttack(surrogateID){
    const wildMons = getWildMonst();
    let monst
    let attacks
    let assignAttacks
    let randomAttackNumber

    const wildMonstIndex = wildMons.findIndex(i => i.surrogateID === surrogateID);
    if(wildMonstIndex === -1){
        console.error("Monster ", surrogateID, " was not found in wild Monsters.");
        return null;
    } else {
        monst = wildMons[wildMonstIndex]
        assignAttacks = monst.baseAttacks;
        attacks = monst.attacks
        randomAttackNumber = Math.floor(Math.random() * 3) + 1; //because max 3 attacks min 1 attack
        for (let i = 0; i < randomAttackNumber; i++){
            if(attacks === null){
                attacks[i] = rollRandomBaseAttack(surrogateID);
            }
        }

    }

    return attacks;
}

function rollRandomBaseAttack(surrogateID){
    const wildMons = getWildMonst();
    let monst
    let assignAttacks
    let randomAttackIndex
    let attackID
    let attackIndex
    let finalAttack
    let usedAttacks

    const wildMonstIndex = wildMons.findIndex(i => i.surrogateID === surrogateID);
    if(wildMonstIndex === -1){
        console.error("Monster ", surrogateID, " was not found in wild Monsters.");
        return null;
    } else {
        monst = wildMons[wildMonstIndex]
        assignAttacks = monst.baseAttacks;

        randomAttackIndex = Math.floor(Math.random() * assignAttacks.length)

        attackID = assignAttacks[randomAttackIndex];
        attackIndex = assignAttacks.findIndex(i => i.attackID = attackID)

        finalAttack = allAttacks.find(i => i.attackID = attackID)
        if(!finalAttack){
        console.error("Attack ", attackID, " can not be assigned to monster ", surrogateID)
            return null;
        }else{
            console.log("about to assign attack ", attackID, " to monster ", surrogateID)
            usedAttacks.push(finalAttack);
            saveUsedAttacks(usedAttacks)
            assignAttacks.splice(attackIndex, 1)
            return finalAttack
        }
    }
}

export function checkWildIfLvlUpAttack(surrogateID, level){
    const wildMons = getWildMonst();
    let monst
    let attacks;
    let attacksLeft
    let nextLvlUpAttack
    let nextLvlUpAttackIndex
    let tier

    monst = wildMons.find(i => i.surrogateID === surrogateID);
    if(!monst){
        console.error("monster could not be found")
        return null;
    } else {
        nextLvlUpAttack = monst.attackStaticSet.find(a =>
            a.level <= level && !monst.attacks.includes(a.attackID)
        );
        if (!nextLvlUpAttack) {
            console.error("attack could not be found in static attack assignment")
            return null;
        } else {

            //5% wahrsch
            const currentMinMaxAttacks = monst.attackLearnSet.filter(a =>
                level >= a.minLevel && level <= a.maxLevel &&
                !monst.attacks.includes(a.attackID)
            );

            const currentTier = Object.keys(TIER_LEVEL_REQUIREMENTS)
                .filter(tier => level >= TIER_LEVEL_REQUIREMENTS[tier])
                .length;

            //1% wahrsch
            const currentTierAttacks = allAttacks.filter(a =>
                a.type === monst.type &&
                a.tier === currentTier &&
                !monst.attacks.includes(a.attackID) &&
                !currentMinMaxAttacks.some(m => m.attackID === a.attackID)
            );
            if (level === nextLvlUpAttack.level) {
                attacks = giveWildMonstAttack(monst, nextLvlUpAttack)
            } else if (Math.random() < 0.05) {

                nextLvlUpAttackIndex = Math.random
            }
        }
    }

    return attacks
}

//also responsible for calculating the worst attack to be switched for the new one
function giveWildMonstAttack(monst, attack){
    let monstAttacks = monst.attacks
    const currentAttack = allAttacks.find(i => i.attackID === attack.attackID )
    if(monstAttacks.length < 4){
        monstAttacks.push(currentAttack)
    } else {
        let worstAttack = monstAttacks[0];

        for (const attack of monstAttacks) {
            if (attack.tier < worstAttack.tier) {
                worstAttack = attack;
            } else if (attack.tier === worstAttack.tier) {
                const attackDmg = (attack.physicalDamage ?? 0) + (attack.soulDamage ?? 0);
                const worstDmg = (worstAttack.physicalDamage ?? 0) + (worstAttack.soulDamage ?? 0);
                if (attackDmg < worstDmg) {
                    worstAttack = attack;
                }
            }
        }

// worstAttack ersetzen
        const worstIndex = monstAttacks.indexOf(worstAttack);
        monstAttacks[worstIndex] = currentAttack;
    }
    return monstAttacks
}



function rollRandomLvlUpAttack(){

}

function rollStaticLvlUpAttack(){

}

function giveWildMonstLvlUpAttack(surrogateID){

}


function giveCollectionMonsterAttack(surrogateID, attackID, attackMonstIndex) {
    const collection = getCollection()
    let attacks
    let monst
    let currentAttack

    const collMonstIndex = collection.findIndex(i => i.surrogateID === surrogateID)
    if (collMonstIndex === -1) {
        console.error("Can not assign Attack ", attackID, " to Monster ", surrogateID, " as monster does not exist in your collection!");
        return null;
    } else {
        const genAttackIndex = allAttacks.findIndex(i => i.attackID = attackID)
        if (genAttackIndex === -1) {
            console.error("Can not assign attack ", attackID, " as it can not be found or does not exist in attacks list.")
        } else {
            monst = collection[collMonstIndex];
            currentAttack = allAttacks[genAttackIndex];
            attacks = monst.attacks
            if (attacks < 4) {
                if (checkAttackAlreadyCollectionAssigned) {
                    console.log("Attack ", attackID, " already assigned to that monster.")
                    return null;
                } else {
                    attacks.push(currentAttack)
                    console.log("Successfully added attack ", attackID, " to monster ", surrogateID,)
                    console.log(attacks)
                    return null;
                }
            }
            else {
            console.log("Current Attacks are already full. Do you want to delete an attack for the new one to be assigned?")
                //code hier:
            }
        }
    }
}

function checkAttackAlreadyCollectionAssigned(surrogateID, attackID) {
    const collection = getCollection()
    let attacks
    let monst
    let currentAttack
    let alreadyAssigned

    const collMonstIndex = collection.findIndex(i => i.surrogateID === surrogateID)
    if (collMonstIndex === -1) {
        console.error("Can not assign Attack ", attackID, " to Monster ", surrogateID, " as monster does not exist in your collection!");
        return null;
    } else {
        const genAttackIndex = allAttacks.findIndex(i => i.attackID = attackID)
        if (genAttackIndex === -1) {
            console.error("Can not assign attack ", attackID, " as it can not be found or does not exist in attacks list.")
        } else {
            monst = collection[collMonstIndex];
            currentAttack = allAttacks[genAttackIndex];
            attacks = monst.attacks

            for (const attack of attacks) {
                if (attack === currentAttack) {
                    alreadyAssigned = true;
                } else {
                    alreadyAssigned = false;
                }
            }
        }

    }
    return alreadyAssigned
}

function swapMonsterAttack(surrogateID, attackID, swappedAttackIndex) {
    //when assigning and creating the buttons in the field of the monster which you use to swap 2 attacks, already assign each button/field a number which directly correlates and is used in the function call
    //that number can even be to just put in the number of iteration when using a for loop and use i as your swappedAttackIndex
}

function switchMonsterAttack(surrogateID, attackID, oldAttackIndex) {

}

function removeAttack(surrogateID, attackID) {

}


/*
todo: monster AI types: defensive, aggressive, balanced, smart, dumb
todo: attack types: protection, damage, heal, buff, debuff, aoe (flächenangriff, schaden an allen) aoe friendly (nur schaden an allen gegnern)

 */

