//import { createGenItemsMenu } from "src/menus/itemsInvMenuGen.js";
import { createGenMonstMenu } from "/src/menus/monstInvMenuGen.js";
//import { addMonstToTeam, addMonstToCollection } from "../player/monsters.js";
import { createGenQuestMenu } from './questMenuGen.js';

let genMenuStatus = false;


export function createGenMenu(questManager) {
    const genMenuWrapper = document.createElement('div');
    genMenuWrapper.classList.add('gen-menu-wrapper');

    const genMenuGrid = createGrid(questManager);

    const container = document.getElementById("game-container");
    genMenuWrapper.appendChild(genMenuGrid)
    container.appendChild(genMenuWrapper);

    console.log('General Menu wurde erstellt');
    return genMenuWrapper;
}

//turns general menu off and on
let focusedBtnIndex = 0;

export function toggleGenMenu(genMenu) {
    if (genMenuStatus) {
        const questOverlay = document.getElementById('quest-menu-overlay');
        if (questOverlay) questOverlay.remove();

        genMenu.style.display = 'none';
        genMenuStatus = false;

        // Keyboard-Listener entfernen
        document.removeEventListener('keydown', handleMenuKeydown);
    } else {
        genMenu.style.display = 'flex';
        genMenuStatus = true;
        focusedBtnIndex = 0;

        // Ersten Button fokussieren
        updateButtonFocus(genMenu);

        // Keyboard-Listener hinzufügen
        document.addEventListener('keydown', handleMenuKeydown);
    }
}

function handleMenuKeydown(e) {
    const genMenu = document.querySelector('.gen-menu-wrapper');
    if (!genMenu || genMenu.style.display === 'none') return;

    const buttons = genMenu.querySelectorAll('.gen-menu-categ-btn');
    if (!buttons.length) return;

    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        e.preventDefault();
        focusedBtnIndex = (focusedBtnIndex - 1 + buttons.length) % buttons.length;
        updateButtonFocus(genMenu);
    }

    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        e.preventDefault();
        focusedBtnIndex = (focusedBtnIndex + 1) % buttons.length;
        updateButtonFocus(genMenu);
    }

    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        buttons[focusedBtnIndex]?.click();
    }
}

function updateButtonFocus(genMenu) {
    const buttons = genMenu.querySelectorAll('.gen-menu-categ-btn');
    buttons.forEach((btn, i) => {
        if (i === focusedBtnIndex) {
            btn.style.outline = '2px solid #ffffff';
            btn.style.backgroundColor = '#555555';
        } else {
            btn.style.outline = 'none';
            btn.style.backgroundColor = '';
        }
    });
}

//creates the grid with buttons for the general menu
    function createGrid(questManager){
        const genMenuGrid = document.createElement('div');
        genMenuGrid.classList.add('gen-menu-grid');



    function createGenItemsMenu(){
        console.log("Items Menu created");
        return 2;
    }


    function createMenuMap(){
        console.log("Map created");
        return 4;
    }

    function createGrimoire(){
        console.log("Grimoire created");
        return 5;
    }

    const genMenuBtns = [
        { text: 'Monsters', function: createGenMonstMenu},
        { text: "Items", function: createGenItemsMenu},
        { text: "Quests", function: () => createGenQuestMenu(questManager)},
        { text: "Map", function: createMenuMap},
        { text: "Grimoire", function: createGrimoire},
    ]

    genMenuBtns.forEach((btn) => {
        const button = document.createElement('Button')
        button.innerText = btn.text;
        button.classList.add('gen-menu-categ-btn')


        button.addEventListener('click', () => {
            btn.function();

        });
        genMenuGrid.appendChild(button);
    });
    return genMenuGrid;
}






