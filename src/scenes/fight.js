//import Phaser from "phaser";

export class Fight extends Phaser.Scene {
  constructor() {
    super("Fight");
  }

  preload() {
    this.load.json("monsters", "./data/monsters/monsters.json");
  }

  create() {
    const battleWrapper = document.createElement('div');

//your Monster sprite
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

// wrapper/field for your monsters attacks
  	const ownMonstAttackWrapper = document.createElement('div');
      ownMonstAttackWrapper.style.position = "absolute";
      ownMonstAttackWrapper.style.display = "grid";
      ownMonstAttackWrapper.style.gridTemplateColumns = "1fr 1fr";
      ownMonstAttackWrapper.style.gap = "10px";
      ownMonstAttackWrapper.style.left = "1%";
      ownMonstAttackWrapper.style.bottom = "2%";
      ownMonstAttackWrapper.style.height = "70%";
      ownMonstAttackWrapper.style.width = "60%";
      ownMonstAttackWrapper.style.backgroundColor = "#A6FF2A";
      ownMonstAttackWrapper.innerText = "Hier sind deine Attacken";
    
    battleWrapper.appendChild(ownMonstSprite);
    ownMonstWrapper.appendChild(ownMonstAttackWrapper);
    battleWrapper.appendChild(ownMonstWrapper);

    //field for own player
    const ownPlayerField = document.createElement('div');
      ownPlayerField.style.position = "absolute";
      ownPlayerField.style.right = "35%";
      ownPlayerField.style.bottom = "4%";
      ownPlayerField.style.height = "20%";
      ownPlayerField.style.width = "20%";
      ownPlayerField.style.backgroundColor = "#8D479E"
      ownPlayerField.innerText = "Hier ist dein player Feld";

    battleWrapper.appendChild(ownPlayerField);

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
  }
}
