import {addMonstToCollection, addMonstToTeam, getTeam, loadMonstInfo, getCollection} from '/src/player/monsters.js'
export async function createGenMonstMenu() {
    const genMonstWrapper = document.createElement('div');
    genMonstWrapper.classList.add('gen-menu-monsters-wrapper');

    await initMonInv();
    const team = getTeam();
    console.log("your current team: ", team)

    const monstGrid = createMonstGrid();

    genMonstWrapper.style.display = 'flex';
    //genMonstWrapper.style.display = genMonstWrapper.style.display === 'none' ? 'flex' : 'none';
    const monstContainer = document.getElementById("game-container");
    genMonstWrapper.appendChild(monstGrid);
    monstContainer.appendChild(genMonstWrapper);

//todo: entferne noch die ganzen async functions. Die brauchtest du nur zum testen weil händisch alles eingefügt

    console.log("Monster Menu created");
    return genMonstWrapper;
}

function createMonstGrid(){
    const monstGrid = document.createElement('div');
    monstGrid.classList.add("gen-menu-monsters-grid")

    let team = getTeam();
    let currentMonstCard;
    for (let i = 0; i < 5; i++){
        let currentMonst = team[i];
        if(currentMonst === undefined){
            currentMonstCard = createMonstCard(null)
        } else{
            currentMonstCard = createMonstCard(currentMonst.surrogateID)
        }
        console.log("loop läuft", i)
    monstGrid.appendChild(currentMonstCard)
    }
    return monstGrid;
}


function createMonstCard(surrogateID){
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
        let currentMonst = loadMonstInfo(surrogateID);
        let currentMonstSurrogateID = currentMonst.surrogateID;
        let currentMonstName = currentMonst.monsterName;
        let currentMonstHealth = currentMonst.health;
        let currentMonstLevel = currentMonst.level;

        monstNameField = document.createElement('div');
        monstNameField.classList.add('monster-name-field');
        monstNameField.textContent = "Monster Name: " + currentMonstName;

        monstCard.appendChild(monstNameField);

        monstBasicInfo = document.createElement('div');
        monstBasicInfo.classList.add('monster-basic-info-field');
        monstBasicInfo.textContent = "Level: " + currentMonstLevel;
        const monstHealthBar = createHealthBar(currentMonstHealth, currentMonst);
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

function createHealthBar(currentHP, maxHP){
    const healthWrapper = document.createElement("div");
    healthWrapper.classList.add("health-wrapper");

    const healthFill = document.createElement("div");
    healthFill.classList.add("health-fill");

    const healthPercentage = (currentHP / maxHP) * 100;
    if (healthPercentage > 60) {
        healthFill.style.backgroundColor = "limegreen";
    } else if (healthPercentage > 30) {
        healthFill.style.backgroundColor = "orange";
    } else {
        healthFill.style.backgroundColor = "red";
    }

    healthFill.style.width = healthPercentage + "%";

    healthWrapper.appendChild(healthFill);

    return healthWrapper;
}

function createDetailedMonstCard(monsterID){
    const detailedMonstCard = document.createElement('div');
    detailedMonstCard.classList.add('detailed-monst-card')


    return detailedMonstCard;
}

async function initMonInv() {
    await addMonstToCollection("burntWitch");
    await addMonstToTeam("burntWitch#1");
    await addMonstToCollection("burntWitch");
    await addMonstToCollection("burntWitch");
    await addMonstToTeam("burntWitch#3");
    await addMonstToCollection("burntWitchEvolution");
    await addMonstToTeam("burntWitchEvolution#1")
    console.log("collection: ", getCollection());
}