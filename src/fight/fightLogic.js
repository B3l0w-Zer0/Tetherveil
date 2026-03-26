
//here are all functions for creating and updating healthbar, mana and generally all the functions that belong to the fight and its buttons


function fillFightList(){

}


export function switchTurns(){

}

export function nextRound(){

}

export function doDamage(surrogateID, damage){

}

export function createHealthBar(monster, currentHP, maxHP){
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

export function createManaBar(currentHP, maxHP){
    const manaWrapper = document.createElement("div");
    manaWrapper.classList.add("health-wrapper");

    const manaFill = document.createElement("div");
    manaFill.classList.add("health-fill");

    const healthPercentage = (currentHP / maxHP) * 100;
    if (healthPercentage > 60) {
        manaFill.style.backgroundColor = "violet";
    } else if (healthPercentage > 30) {
        manaFill.style.backgroundColor = "purple";
    } else {
        manaFill.style.backgroundColor = "blue";
    }

    manaFill.style.width = healthPercentage + "%";

    manaWrapper.appendChild(manaFill);

    return manaWrapper;
}

export function updateHealthBar(){

}

export function updateManaBar(){

}

export function updateManaColor(fill, current, max) {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    // 270 = violett, 200 = blau — je mehr Mana desto blauer
    const hue = 270 - (pct * 0.7);
    fill.style.backgroundColor = `hsl(${hue}, 80%, 50%)`;
}

export function updateHealthColor(fill, current, max) {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    // 120 = grün, 0 = rot — je weniger HP desto röter
    const hue = (pct * 1.2);
    fill.style.backgroundColor = `hsl(${hue}, 80%, 40%)`;
}
