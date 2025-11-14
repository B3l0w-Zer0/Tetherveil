import Phaser from 'phaser';

export class ownMonstAttack {
    constructor(currentMon, enemy, logCallback){
        this.currentMon = currentMon;
        this.enemy = enemy;
        this.maxHealth = currentMon.health;
        this.logCallback = logCallback;
    }

    

}