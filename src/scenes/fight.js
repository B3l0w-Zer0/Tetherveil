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
  ownFieldWrapper.style.position = "absolute";
  ownFieldWrapper.style.left = "2%";
  ownFieldWrapper.style.bottom = "5%";
  ownFieldWrapper.style.height = "25%";
  ownFieldWrapper.style.width = "40%";
  ownFieldWrapper.style.backgroundColor = "#FF6A2A";
  ownFieldWrapper.innerText = "hier ist deine monster card";

  const ownMonstSprite = document.createElement('div');
  ownMonstSprite.style.position = "absolute";
  ownMonstSprite.style.left = "5%";
  ownMonstSprite.style.bottom = "22%";
  ownMonstSprite.style.width = "200px";
  ownMonstSprite.style.height = "250px";
  ownMonstSprite.style.backgroundColor = "#47849E";
  ownMonstSprite.innerText = "hier ist dein monster sprite";

// field with all own monster parts
  /*const ownMonstWrapper = document.createElement('div');
  ownMonstWrapper.style.position = "absolute";
  ownMonstWrapper.style.left = "2%";
  ownMonstWrapper.style.bottom = "5%";
  ownMonstWrapper.style.height = "25%";
  ownMonstWrapper.style.width = "40%";
  ownMonstWrapper.style.backgroundColor = "#FF6A2A";
  ownMonstWrapper.innerText = "hier ist deine monster card";

   */

  const basicInfoField = document.createElement('div')
  basicInfoField.classList.add('basic-info-field')

  const nameInfoField = document.createElement('div')
  nameInfoField.classList.add('single-info-field-name')

  const levelInfoField = document.createElement('div')
  levelInfoField.classList.add('single-info-field-level')

  const typeInfoField = document.createElement('div')
  typeInfoField.classList.add('single-info-field-type')

  basicInfoField.appendChild(nameInfoField)
  basicInfoField.appendChild(levelInfoField)//hier noch eine leiste einfügen wo die EP auch grafisch dargestellt werden
  basicInfoField.appendChild(typeInfoField)

  const extendedInfoBtn = document.createElement('btn')
  extendedInfoBtn.classList.add('extended-info-button')

  const healthBar = document.createElement('div');
  healthBar.classList.add('health-bar-fight')

  const manaBar = document.createElement('div');
  manaBar.classList.add('mana-bar-fight')

  const staminaBar = document.createElement('div');
  staminaBar.classList.add('stamina-bar-fight')

  const openActionsFieldBtn = document.createElement('btn')
  openActionsFieldBtn.classList.add("action-button")

  const openAttackFieldBtn = document.createElement('btn')
  openAttackFieldBtn.classList.add("attack-button")

  const openRunAwayFieldBtn = document.createElement('btn')
  openRunAwayFieldBtn.classList.add("run-away-button")

  ownFieldWrapper.appendChild(basicInfoField)
  ownFieldWrapper.appendChild(extendedInfoBtn)
  ownFieldWrapper.appendChild(healthBar)
  ownFieldWrapper.appendChild(manaBar)
  ownFieldWrapper.appendChild(staminaBar)
  ownFieldWrapper.appendChild(openAttackFieldBtn)
  ownFieldWrapper.appendChild(openRunAwayFieldBtn)
  ownFieldWrapper.appendChild(openActionsFieldBtn)

// wrapper/field for your monsters attacks
 /* const ownMonstActionsWrapper = document.createElement('div');
  ownMonstActionsWrapper.style.position = "absolute";
  ownMonstActionsWrapper.style.display = "grid";
  ownMonstActionsWrapper.style.gridTemplateColumns = 'repeat(3, 1fr)';
  ownMonstActionsWrapper.style.gap = "2%x";
  ownMonstActionsWrapper.style.left = "1%";
  ownMonstActionsWrapper.style.bottom = "2%";
  ownMonstActionsWrapper.style.height = "70%";
  ownMonstActionsWrapper.style.width = "60%";
  ownMonstActionsWrapper.style.backgroundColor = "purple";
  //ownMonstActionsWrapper.innerText = "Hier sind deine aktuellen Möglichkeiten. Catch, run away, switch, actions";


  */
  /*
  const buttonGroup = document.createElement('div');
  buttonGroup.style.position = "absolute";
  buttonGroup.style.display = "grid";
  buttonGroup.style.gridTemplateColumns = 'repeat(3, 1fr)';
  buttonGroup.style.gap = "2%x";
  buttonGroup.style.left = "1%";
  buttonGroup.style.bottom = "2%";
  buttonGroup.style.height = "70%";
  buttonGroup.style.width = "60%";
  buttonGroup.style.backgroundColor = "purple";
  //buttonGroup.innerText = "Hier sind deine aktuellen Möglichkeiten. Catch, run away, switch, actions";




  /*const button1 = document.createElement('div')
  button1.style.position = "relative"
  button1.style.height = "80%";
  button1.style.width = "70%";
  button1.style.backgroundColor = "blue";
  button1.innerText = "Hier is möglichkeit 1";

  const button2 = document.createElement('div')
  button2.style.position = "relative"
  button2.style.height = "80%";
  button2.style.width = "70";
  button2.style.backgroundColor = "red";
  button2.innerText = "Hier is möglichkeit 2";

  const button3 = document.createElement('div')
  button3.style.position = "relative"
  button3.style.height = "80%";
  button3.style.width = "70%";
  button3.style.backgroundColor = "yellow";
  button3.innerText = "Hier is möglichkeit 3";

  ownMonstActionsWrapper.appendChild(button1)
  ownMonstActionsWrapper.appendChild(button2)
  ownMonstActionsWrapper.appendChild(button3)*/

  //ownMonstActionsWrapper.appendChild(ownMonstActionsWrapper)
  //ownFieldWrapper.appendChild(ownMonstSprite);
  //ownMonstWrapper.appendChild(ownMonstActionsWrapper);
  //ownFieldWrapper.appendChild(ownMonstWrapper);

  //field for own player
  /*const ownPlayerField = document.createElement('div');
  ownPlayerField.style.position = "absolute";
  ownPlayerField.style.right = "35%";
  ownPlayerField.style.bottom = "4%";
  ownPlayerField.style.height = "20%";
  ownPlayerField.style.width = "20%";
  ownPlayerField.style.backgroundColor = "#8D479E"
  ownPlayerField.innerText = "Hier ist dein player Feld";

   */

  //ownFieldWrapper.appendChild(ownPlayerField);



  return ownFieldWrapper;
}

function createActionsMenu(){
  const actionsMenu = document.createElement('div')
  actionsMenu.style.bottom = "10%";



  return actionsMenu;
}

function closeActionsMenu(){

}

function openActionsField(){

}

function switchAttackField(){

}

function createEnemyField(){
  const enemyFieldWrapper = document.createElement('div');
  enemyFieldWrapper.classList.add("enemy-field-wrapper")

  const enemyInfoField = document.createElement('div');
  enemyInfoField.classList.add("")

  const enemyName = document.createElement('div')
  enemyName.classList.add("")

  const enemyLevel = document.createElement('div')
  enemyLevel.classList.add("")

  const enemyHealthBar = document.createElement('div');
  enemyHealthBar.classList.add("")


  return enemyFieldWrapper
}

//todo: for later when we finally get to the multi fight with several monsters out at the same time, find a solution to do this again but with a multiple option
// like when starting ask for single or multi fight and then just do a switch case or else or shi like that to either call the createPlayerMenu once at that space where it is right now
// or at like the spaces where it is supposed to be in each constellation of 2, 3, 4, 5 monsters out at the same time

//todo: spätere funktion für Kampf: scan: Analyse des Gegners durch Fähigkeit mit Typ, Attacken, stats. je nach upgrade grad (gibt 4 level dazu)
//      - 1. stufe: typ (und second type im hintergrund), strengthlevel durch base stats durchschnitt (das gibts als basic erste funktion im skill tree
//      um zu erzwingen, dass der player das hat. ohne kann er nicht spielen und ohne das scannen wird das monster auch nicht in das grimoire vollständig aufgenommen.
//      zwang, um jedes mal scan einzusetzen. (wenn allerdings monster gefangen, wird der vollständige eintrag automatisch gemacht oder man muss was anderes machen um eben zu analysieren/ zu erforschen
//      - 2. stufe: genaue base stats
//      - 3. stufe: Fähigkei
//      - 4. stufe: attacken und