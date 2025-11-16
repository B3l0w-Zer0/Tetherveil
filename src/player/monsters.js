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

export function catchMonster() {

}

export function addMonToInventory() {

}

export function addMonToTeam() {

}

