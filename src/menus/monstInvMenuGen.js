import {
    addMonstToCollection,
    addMonstToTeam,
    removeMonstFromTeam,
    removeMonstFromCollection,
    getTeam,
    loadMonstInfo,
    getCollection,
    createCompleteRandomMonster,
    createCompleteStaticMonster, createOnlyLevelRandomMonster, createOnlyStatsRandomMonster
}
    from '/src/player/monsterlogic.js';

import {
    createHealthBar,

}
from '/src/fight/fightLogic.js'

export async function createGenMonstMenu() {
    const genMonstWrapper = document.createElement('div');
    genMonstWrapper.classList.add('gen-menu-monsters-wrapper');

    await initMonInv();
    const team = getTeam();
    console.log("your current team: ", team)

    const monstGrid = await createMonstGrid();

    genMonstWrapper.style.display = 'flex';
    //genMonstWrapper.style.display = genMonstWrapper.style.display === 'none' ? 'flex' : 'none';
    const monstContainer = document.getElementById("game-container");
    genMonstWrapper.appendChild(monstGrid);
    monstContainer.appendChild(genMonstWrapper);

//todo: entferne noch die ganzen async functions. Die brauchtest du nur zum testen weil händisch alles eingefügt

    console.log("Monster Menu created");
    return genMonstWrapper;
}

async function createMonstGrid(){
    const monstGrid = document.createElement('div');
    monstGrid.classList.add("gen-menu-monsters-grid")

    let team = getTeam();
    let currentMonstCard;
    for (let i = 0; i < 5; i++){
        let currentMonst = team[i];
        if(currentMonst === undefined){
            currentMonstCard = await createMonstCard(null)
        } else{
            currentMonstCard = await createMonstCard(currentMonst.surrogateID)
        }
        console.log("loop läuft", i)
    monstGrid.appendChild(currentMonstCard)
    }
    return monstGrid;
}


async function createMonstCard(surrogateID){
    const monstCard = document.createElement('div');
    monstCard.classList.add('gen-menu-monsters-card')

    let monstNameField;
    let monstBasicInfo;
    let monstShowInfoBtn;
    let monstMakeMainBtn;

    if(surrogateID === null){
        monstCard.textContent = "empty slot";
        monstCard.classList.add("empty-slot")
        console.log("monster card for empty slot created");
        return monstCard;
    } else {
        let currentMonst = await loadMonstInfo(surrogateID);
        let currentMonstSurrogateID = currentMonst.surrogateID;
        let currentMonstName = currentMonst.name;
        let currentMonstHealth = currentMonst.health;
        let currentMonstLevel = currentMonst.level;
        let currentMonstMaxHealth = currentMonst.maxHealth

        monstNameField = document.createElement('div');
        monstNameField.classList.add('monster-name-field');
        monstNameField.textContent = "Monster Name: " + currentMonstName;

        monstCard.appendChild(monstNameField);

        monstBasicInfo = document.createElement('div');
        monstBasicInfo.classList.add('monster-basic-info-field');
        monstBasicInfo.textContent = "Level: " + currentMonstLevel;
        const monstHealthBar = createHealthBar(currentMonstHealth, currentMonstMaxHealth);
        monstCard.appendChild(monstHealthBar);

        monstShowInfoBtn = document.createElement('button');
        monstShowInfoBtn.classList.add('monster-show-info-btn');

        //const monstAdvancedInfo = createDetailedMonstCard(monsterID);

        monstMakeMainBtn = document.createElement('button');
        monstMakeMainBtn.classList.add('monster-make-main-btn');
        console.log("Monster card für: ", currentMonstSurrogateID, " erstellt")
    }

    return monstCard;
}


function createDetailedMonstCard(monsterID){
    const detailedMonstCard = document.createElement('div');
    detailedMonstCard.classList.add('detailed-monst-card')


    return detailedMonstCard;
}

async function initMonInv() {
    await createCompleteRandomMonster("burntWitch")
    await createCompleteStaticMonster("burntWitch", 16)
    await createOnlyLevelRandomMonster("burntWitch")
    await createOnlyStatsRandomMonster("burntWitch", 15)
    addMonstToCollection("burntWitch#1")
    addMonstToCollection("burntWitchEvolution#1")
    addMonstToCollection("hello")
    addMonstToTeam("burntWitch#1")
    addMonstToTeam("hello")
    addMonstToTeam("burntWitchEvolution#1")
    removeMonstFromTeam("burntWitch#1")
    removeMonstFromTeam("burntWitch")
    removeMonstFromTeam("burntWitch#3")
    removeMonstFromCollection("burntWitchEvolution#1")
    addMonstToCollection("burntWitchEvolution#2")
    addMonstToTeam("burntWitchEvolution#2")

    /*
    await createOnlyStatsRandomMonster("burntWitch", 17)
*/
    console.log("collection: ", getCollection());
}