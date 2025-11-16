//import { createGenItemsMenu } from "src/menus/itemsInvMenuGen.js";

let genMenuStatus = false;


export function createGenMenu() {
    const genMenuWrapper = document.createElement('div');
    genMenuWrapper.classList.add('gen-menu-wrapper');

    const genMenuGrid = createGrid();

    const container = document.getElementById("game-container");
    genMenuWrapper.appendChild(genMenuGrid)
    container.appendChild(genMenuWrapper);
    console.log('General Menu wurde erstellt');
    return genMenuWrapper;
}

//turns general menu off and on
export function toggleGenMenu(genMenu) {
    if (genMenuStatus) {
        genMenu.style.display = 'none';
        genMenuStatus = false;
    } else {
        genMenu.style.display = 'flex';
        genMenuStatus = true;
    }
}

//creates the grid with buttons for the general menu
    function createGrid(){
        const genMenuGrid = document.createElement('div');
        genMenuGrid.classList.add('gen-menu-grid');

        function  createGenMonstMenu(){
            console.log("Monster Menu created");
            return 1;
        }

    function createGenItemsMenu(){
        console.log("Items Menu created");
        return 2;
    }

    function createGenQuestMenu(){
        console.log("Quest Menu created");
        return 3;
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
        { text: 'Monsters', function: createGenMonstMenu, },
        { text: "Items", function: createGenItemsMenu},
        { text: "Quests", function: createGenQuestMenu},
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
        genMenuGrid.appendChild(button)
    });
    return genMenuGrid;
}

