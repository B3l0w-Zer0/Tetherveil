//import Phaser from "phaser";
/*import {
  updateHealthBar, updateManaBar
} from '/src/fight/fightLogic.js';

 */

export class Fight extends Phaser.Scene {
  constructor() {
    super("Fight");
  }

  preload() {
    this.load.json("monsters", "./data/monsterData/wildMonsters.json");
  }

  create() {
    const battleWrapper = document.createElement('div');

    //hier liste einfügen, die davor beim start des fights abgefragt wurde und bei der jetzt immer die liste aktualisiert. Es muss ja immer ein neues feld

    let ownPlayerField = createOwnField()

    //let enemyPlayerField = createEnemyField()

    battleWrapper.appendChild(ownPlayerField)
    //battleWrapper.appendChild(enemyPlayerField)
//enemy Monster sprite
    const enemyMonstSprite = document.createElement('div');
      enemyMonstSprite.style.position = "absolute";
      enemyMonstSprite.style.right = "5%";
      enemyMonstSprite.style.top = "22%";
      enemyMonstSprite.style.width = "200px";
      enemyMonstSprite.style.height = "250px";
      enemyMonstSprite.style.backgroundColor = "#8B7A26";
      enemyMonstSprite.innerText = "hier ist der monster sprite von deinem gegner";

  //field for enemy
    const enemyMonstWrapper = document.createElement('div');
     enemyMonstWrapper.style.position = "absolute";
     enemyMonstWrapper.style.right = "3%";
     enemyMonstWrapper.style.top = "6%";
     enemyMonstWrapper.style.height = "10%";
     enemyMonstWrapper.style.width = "25%";
     enemyMonstWrapper.style.backgroundColor = "#5BB95B";
     enemyMonstWrapper.innerText = "Hier ist das Feld deines Gegners";

    battleWrapper.appendChild(enemyMonstSprite);
    battleWrapper.appendChild(enemyMonstWrapper);




//Monster aus dem team nehmen



    document.body.appendChild(battleWrapper);
    

    this.keys = this.input.keyboard.addKeys("ESC");
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      this.scene.start("Start");
    }
/*
    updateHealthBar()
    updateManaBar()

 */

  }
}

function createOwnField(){
  const ownFieldWrapper = document.createElement('div')

  const ownMonstSprite = document.createElement('div');
  ownMonstSprite.style.position = "absolute";
  ownMonstSprite.style.left = "5%";
  ownMonstSprite.style.bottom = "22%";
  ownMonstSprite.style.width = "200px";
  ownMonstSprite.style.height = "250px";
  ownMonstSprite.style.backgroundColor = "#47849E";
  ownMonstSprite.innerText = "hier ist dein monster sprite";

// field with all own monster parts
  const ownMonstWrapper = document.createElement('div');
  ownMonstWrapper.style.position = "absolute";
  ownMonstWrapper.style.left = "3%";
  ownMonstWrapper.style.bottom = "6%";
  ownMonstWrapper.style.height = "15%";
  ownMonstWrapper.style.width = "25%";
  ownMonstWrapper.style.backgroundColor = "#FF6A2A";
  ownMonstWrapper.innerText = "hier ist deine monster card";

  const openActionsFieldBtn = document.createElement('btn')

// wrapper/field for your monsters attacks
  const ownMonstActionsWrapper = document.createElement('div');
  ownMonstActionsWrapper.style.position = "absolute";
  ownMonstActionsWrapper.style.display = "grid";
  ownMonstActionsWrapper.style.gridTemplateColumns = "1fr 1fr";
  ownMonstActionsWrapper.style.gap = "10px";
  ownMonstActionsWrapper.style.left = "1%";
  ownMonstActionsWrapper.style.bottom = "2%";
  ownMonstActionsWrapper.style.height = "70%";
  ownMonstActionsWrapper.style.width = "60%";
  ownMonstActionsWrapper.style.backgroundColor = "#A6FF2A";
  ownMonstActionsWrapper.innerText = "Hier sind deine Attacken";

  ownFieldWrapper.appendChild(ownMonstSprite);
  ownMonstWrapper.appendChild(ownMonstActionsWrapper);
  ownFieldWrapper.appendChild(ownMonstWrapper);

  //field for own player
  const ownPlayerField = document.createElement('div');
  ownPlayerField.style.position = "absolute";
  ownPlayerField.style.right = "35%";
  ownPlayerField.style.bottom = "4%";
  ownPlayerField.style.height = "20%";
  ownPlayerField.style.width = "20%";
  ownPlayerField.style.backgroundColor = "#8D479E"
  ownPlayerField.innerText = "Hier ist dein player Feld";

  ownFieldWrapper.appendChild(ownPlayerField);

  return ownFieldWrapper;
}

function createActionsMenu(){
  const actionsMenu = document.createElement('div')
  actionsMenu.style.b


  return actionsMenu;
}

function closeActionsMenu(){

}

function openActionsField(){

}

function switchAttackField(){

}

//todo: for later when we finally get to the multi fight with several monsters out at the same time, find a solution to do this again but with a multiple option
//like when starting ask for single or multi fight and then just do a switch case or else or shi like that to either call the createPlayerMenu once at that space where it is right now
//or at like the spaces where it is supposed to be in each constellation of 2, 3, 4, 5 monsters out at the same time