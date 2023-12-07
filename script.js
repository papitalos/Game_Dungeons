//ITENS DA DOM
const $mainBoard = document.querySelector(".world-table");
const $allCell = document.querySelectorAll(".world-cell");
const $mainCharacter = document.querySelector(".soul-reaper");
const $enemy = document.querySelector(".enemy");
const $soulBar = document.querySelector(".soul-bar");
const $money = document.querySelector(".money");
const $soulorb = document.querySelector(".soulorb");
const $shield = document.querySelector(".shield");

//CONSTANTES DO CODIGO
const tempoParaRefresh = 2000;
const playerSpeed = '0.7s';
const ROWS = 3;
const COLS = 3;

//ARRAY IMPORTANTE
let centers = []

//INFORMAÇÕES NUMERICAS
let soulCoinQtd = 0;
let soulsQtd = 100;
let slotNumber;
let controler = 0;

//BOOLEANAS
let invFull = false;
let smooth = true;
let isMoving = false;
let isUsingItem = false;
let canMove = true;
let hasShield = false;

//INFORMAÇÃO DE LOCALIZAÇÕES EM CELULAS
let currentRow = 1;
let currentCol = 1;

let currentEnemyCell;
let currentPlayerCell;
let currentMoneyCell;
let currentShieldCell;
let currentSoulorbCell;


//PROBABILIDADES
let enemySpawnProbability = 0.6;
let shieldSpawnProbability = 0.2;
let moneySpawnProbability = 1;
let soulorbSpawnProbability = 0.6;


//CALCULOS
function onStart() {
    if (controler == 0) {
        centers = calcCenterCell();
        canMove = true
        changeTileOnTeleport();
        moveToCell(4); //move o player para a célula do meio
        updatePlayerCell();
        animationActive('idle')
        spawnEnemyRandomly()
        spawnMoneyRandomly()
        spawnSoulorbRandomly()
        spawnShieldRandomly()
        controler = 1;
    }
}
function calcCenterCell() {
    const centros = [];

    const boardRect = $mainBoard.getBoundingClientRect();
    $allCell.forEach(cell => {
        const cellRect = cell.getBoundingClientRect();

        //calcular a posição do centro em porcentagem em relação ao tabuleiro
        const centerX = ((cellRect.left - boardRect.left) + (cell.offsetWidth / 2)) / boardRect.width * 100;
        const centerY = ((cellRect.top - boardRect.top) + (cell.offsetHeight / 2)) / boardRect.height * 100;

        centros.push({ x: centerX, y: centerY });
    });

    return centros;
}


//PLAYER
function decreaseSoulsOverTime() {
    setInterval(() => {
        if (soulsQtd > 0) {
            soulsQtd -= 4;
            $soulBar.style.width = `${soulsQtd}%`;
            showHitInformation(4)
            playerDeath()
        } else {
            playerDeath()
        }
    }, 1000);
}
function removeSoul(state) {
    switch (state) {
        case "walking":
            soulsQtd -= 5;
            $soulBar.style.width = `${soulsQtd}%`
            showHitInformation(5)
            break;
        case "killing-shield":
            soulsQtd -= 10;
            $soulBar.style.width = `${soulsQtd}%`
            showHitInformation(10)
            break;
        case "killing-non-shield":
            soulsQtd -= 70;
            $soulBar.style.width = `${soulsQtd}%`
            showHitInformation(70)
            break;
    }


}
function playerDeath() {
    console.log(soulsQtd)
    if (soulsQtd <= 0) {
        animationDeactive("walking")
        animationDeactive("atacking")


        setTimeout(function () {
            canMove = false
            animationDeactive("idle")
            animationActive("dying")
        }, 600)


        setTimeout(function () {
            // Recarrega a página
            window.location.reload();
        }, tempoParaRefresh);
    }
}
function updatePlayerCell() {

    currentPlayerCell = currentRow * COLS + currentCol;
    //Fazer movimento
    const cellIndex = currentRow * COLS + currentCol;

    removeSoul("walking")
    playerDeath()

    if (smooth) {
        animationActive('walking')
        animationDeactive('idle')
        setTimeout(() => {
            animationActive('idle')
            animationDeactive('walking')
        }, 500);
        moveToCell(cellIndex, smooth);
    }
    else {
        moveToCell(cellIndex, smooth);
    }

}
$mainCharacter.addEventListener('transitionend', () => {
    isMoving = false;
});
document.documentElement.style.setProperty('--playerSpeed', playerSpeed);


//MOVIMENTO
function playerChangeRoom() {
    changeTileOnTeleport()
    spawnEnemyRandomly()
    spawnMoneyRandomly()
    spawnSoulorbRandomly()
    spawnShieldRandomly()
}
function changeTileOnTeleport() {
    let tileNumber = Math.floor(Math.random() * 3) + 1;
    $allCell.forEach(function (cell) {

        cell.classList.remove('tile1', 'tile2', 'tile3');

        cell.classList.add('tile' + tileNumber);
    });
}
function moveToCell(index, smoothTransition) {
    if (isMoving) return;

    if (!smoothTransition) {
        $mainCharacter.style.transition = 'none';  //desativa a transição para teleportes
    } else {
        //reativa as transições para movimentos normais
        $mainCharacter.style.transition = `left ${playerSpeed}, top ${playerSpeed}`;
    }

    const position = centers[index];

    //aplicar a posição em porcentagem
    $mainCharacter.style.left = `${position.x}%`;
    $mainCharacter.style.top = `${position.y}%`;




    if (!smoothTransition) {
        setTimeout(() => {
            isMoving = false;
        }, 0);
    } else {
        isMoving = true;
    }

}


//ANIMAÇÕES
function animationActive(elementClassName) {
    const animation = document.querySelector(`.${elementClassName}`);
    animation.querySelector('img').style.display = 'block';
}
function animationDeactive(elementClassName) {
    const animation = document.querySelector(`.${elementClassName}`);
    animation.querySelector('img').style.display = 'none';

}


//INIMIGO
function spawnEnemyRandomly() {

    if (Math.random() < enemySpawnProbability) {
        //scolhe uma célula aleatória para spawnar o inimigo, evitando a célula do jogador
        let randomRow, randomCol;
        do {
            randomRow = Math.floor(Math.random() * ROWS);
            randomCol = Math.floor(Math.random() * COLS);
        } while (randomRow === currentRow && randomCol === currentCol);

        // Calcula a posição da célula aleatória em pixels
        const cellRect = $allCell[randomRow * COLS + randomCol].getBoundingClientRect();

        // Define a posição do inimigo com base na célula aleatória
        const centerX = ((cellRect.left - $mainBoard.getBoundingClientRect().left) + (cellRect.width / 2));
        const centerY = ((cellRect.top - $mainBoard.getBoundingClientRect().top) + (cellRect.height / 2));

        $enemy.style.left = `${centerX}px`;
        $enemy.style.top = `${centerY}px`;

        updateEnemyCell(randomRow, randomCol)
        $enemy.style.display = "block";
        animationDeactive("enemy_atacking")
        animationActive('enemy_idle')


    } else {
        // Caso contrário, não spawn um inimigo
        $enemy.style.left = '-9999px'; // Movendo o inimigo para fora da tela para escondê-lo
        currentEnemyCell = -1;
    }
}
function updateEnemyCell(row, col) {
    currentEnemyCell = row * COLS + col;
}


//ITENS
function spawnMoneyRandomly() {

    // Seleção das células disponíveis (exceto onde o jogador e o inimigo estão)
    const availableCells = [...$allCell].filter((_, index) => {
        return index !== currentPlayerCell && index !== currentEnemyCell && index !== currentShieldCell && index !== currentSoulorbCell;
    });

    // Verifica a probabilidade de spawnar o dinheiro
    if (Math.random() < moneySpawnProbability && availableCells.length > 0) {
        // Seleção aleatória de uma célula disponível
        const randomCellIndex = Math.floor(Math.random() * availableCells.length);
        const chosenCell = availableCells[randomCellIndex];

        // Posicionando o dinheiro na célula escolhida
        const chosenCellRect = chosenCell.getBoundingClientRect();
        const centerX = ((chosenCellRect.left - $mainBoard.getBoundingClientRect().left) + (chosenCellRect.width / 2));
        const centerY = ((chosenCellRect.top - $mainBoard.getBoundingClientRect().top) + (chosenCellRect.height / 2));

        $money.style.left = `${centerX}px`;
        $money.style.top = `${centerY}px`;
        $money.style.display = "block";

        // Atualizando a posição atual do dinheiro
        currentMoneyCell = [...$allCell].indexOf(chosenCell);

    } else {
        // Esconder o dinheiro se não spawnar
        $money.style.left = '-99999px';
        currentMoneyCell = -1;
    }
}
function spawnSoulorbRandomly() {

    // Seleção das células disponíveis
    const availableCells = [...$allCell].filter((_, index) => {
        return index !== currentPlayerCell && index !== currentEnemyCell && index !== currentShieldCell && index !== currentMoneyCell;
    });

    // Verifica a probabilidade de spawnar o soulorb
    if (Math.random() < soulorbSpawnProbability && availableCells.length > 0) {
        // Seleção aleatória de uma célula disponível
        const randomCellIndex = Math.floor(Math.random() * availableCells.length);
        const chosenCell = availableCells[randomCellIndex];

        // Posicionando o soulorb na célula escolhida
        const chosenCellRect = chosenCell.getBoundingClientRect();
        const centerX = ((chosenCellRect.left - $mainBoard.getBoundingClientRect().left) + (chosenCellRect.width / 2));
        const centerY = ((chosenCellRect.top - $mainBoard.getBoundingClientRect().top) + (chosenCellRect.height / 2));

        $soulorb.style.left = `${centerX}px`;
        $soulorb.style.top = `${centerY}px`;
        $soulorb.style.display = "block";

        // Atualizando a posição atual do soulorb
        currentSoulorbCell = [...$allCell].indexOf(chosenCell);

    } else {
        // Esconder o soulorb se não spawnar
        $soulorb.style.left = '-99999px';
        currentSoulorbCell = -1;
    }
}
function spawnShieldRandomly() {

    // Não spawnar o escudo se o jogador já tiver um
    if (hasShield) {
        $shield.style.left = '-99999px';
        currentShieldCell = -1;
        return;
    }

    // Seleção das células disponíveis
    const availableCells = [...$allCell].filter((_, index) => {
        return index !== currentPlayerCell && index !== currentEnemyCell && index !== currentMoneyCell && index !== currentSoulorbCell;
    });

    // Verifica a probabilidade de spawnar o escudo
    if (Math.random() < shieldSpawnProbability && availableCells.length > 0) {
        // Seleção aleatória de uma célula disponível
        const randomCellIndex = Math.floor(Math.random() * availableCells.length);
        const chosenCell = availableCells[randomCellIndex];

        // Posicionando o escudo na célula escolhida
        const chosenCellRect = chosenCell.getBoundingClientRect();
        const centerX = ((chosenCellRect.left - $mainBoard.getBoundingClientRect().left) + (chosenCellRect.width / 2));
        const centerY = ((chosenCellRect.top - $mainBoard.getBoundingClientRect().top) + (chosenCellRect.height / 2));

        $shield.style.left = `${centerX}px`;
        $shield.style.top = `${centerY}px`;
        $shield.style.display = "block";
        // Atualizando a posição atual do escudo
        currentShieldCell = [...$allCell].indexOf(chosenCell);

    } else {
        // Esconder o escudo se não spawnar
        $shield.style.left = '-99999px';
        currentShieldCell = -1;
    }
}

function moneyAction() {
    const coinCountElement = document.querySelector('.coin-count');
    let currentCoins = parseInt(coinCountElement.textContent);
    currentCoins += 5; //adiciona 5 moedas
    coinCountElement.textContent = currentCoins; //atualiza o texto
}
function soulOrbAction() {
    if (soulsQtd > 0) {
        soulsQtd += 50;
        if (soulsQtd > 100) {
            soulsQtd = 100;
        }
        if (soulsQtd <= 100) {
            $soulBar.style.width = `${soulsQtd}%`
        }
    }
}

//COLISÃO
function checkCollisions() {
    //verifica se o jogador colidiu com o inimigo
    if (currentPlayerCell === currentEnemyCell) {
        handleEnemyCollision();
    }

    if (!invFull) {
        //verifica se o jogador colidiu com o escudo
        if (currentPlayerCell === currentShieldCell) {
            handleShieldCollision();
            currentShieldCell = -1; //remove a "position" tabuleiro
        }

        //verifica se o jogador colidiu com o dinheiro
        if (currentPlayerCell === currentMoneyCell) {
            handleMoneyCollision();
            currentMoneyCell = -1;
        }

        //verifica se o jogador colidiu com o soulorb
        if (currentPlayerCell === currentSoulorbCell) {
            handleSoulorbCollision();
            currentSoulorbCell = -1;

        }
    }
}
function handleEnemyCollision() {
    console.log("Colidiu com o inimigo!");

    animationDeactive("enemy_idle")
    animationActive("enemy_atacking")
    setTimeout(() => {
        $enemy.style.display = "none";
    }, 500);
    if (hasShield) {
        removeSoul("killing-shield");
        hasShield = false;
        for (let i = 0; i < 3; i++) {
            const slot = document.querySelector(`.inventory-cell[number="${i}"] img`);
            if (slot) {
                const item = slot.getAttribute('src').split('/').pop().split('.')[0];
                switch (item) {
                    case "shield":
                        console.log("Usou um escudo!");
                        slot.parentElement.removeChild(slot);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    else {
        removeSoul("killing-non-shield")
    }
}
function handleShieldCollision() {
    console.log("Pegou um escudo!");
    hasShield = true; //atualiza a variável global indicando que o jogador pegou o escudo
    fillInventory("shield")
    if (!invFull) { $shield.style.display = "none"; }
}
function handleMoneyCollision() {
    console.log("Pegou dinheiro!");
    fillInventory("money")
    if (!invFull) { $money.style.display = "none"; }
}
function handleSoulorbCollision() {
    console.log("Pegou um soulorb!");
    fillInventory("soulorb")
    if (!invFull) { $soulorb.style.display = "none"; }
}


//INVENTARIO
function invSlots() {
    let invSlots = [];
    const inventoryCells = document.querySelectorAll('.inventory-cell');

    inventoryCells.forEach((cell, index) => {
        if (cell.children.length === 0) {
            invSlots.push(index);
        }
    });

    return invSlots;
}
function fillInventory(item) {
    let slots = invSlots();
    if (slots.length === 0) {
        invFull = true;
        console.log("Inventário cheio");
        return;
    }

    const firstAvailableSlot = document.querySelector(`.inventory-cell[number="${slots[0]}"]`);

    //criando um elemento de imagem
    const itemImage = document.createElement('img');
    itemImage.src = `./images/itens/${item}.png`;
    firstAvailableSlot.appendChild(itemImage);
    fixProportions(item)
}
function fixProportions(item) {
    const itemImages = document.querySelectorAll(`.inventory-cell img[src$='${item}.png']`);

    itemImages.forEach(img => {
        //configurar largura e altura
        img.style.width = '5vw';
        img.style.height = '5vw';

        //configurar posição e centralização
        img.style.position = 'absolute';
        img.style.left = '50%';
        img.style.top = '50%';
        img.style.transform = 'translate(-50%, -50%)';
    });
}
function removeItemFromInventory(item) {
    const itemToRemove = document.querySelector(`.inventory-cell img[src$='${item}.png']`);

    //se o item existe, removê-lo
    if (itemToRemove) {
        itemToRemove.parentElement.removeChild(itemToRemove);
    } else {
        console.log("Item não encontrado no inventário.");
    }
}
function useItem(slotNum) {
    isUsingItem = true;
    const slot = document.querySelector(`.inventory-cell[number="${slotNum}"] img`);

    if (slot) {
        const item = slot.getAttribute('src').split('/').pop().split('.')[0]; //obtém o nome do item a partir do array

        //actions
        switch (item) {
            case 'money':
                //action para o dinheiro
                console.log("Usou dinheiro!");
                moneyAction()
                slot.parentElement.removeChild(slot);
                break;
            case 'soulorb':
                //action para o soulorb
                console.log("Usou um soulorb!");
                soulOrbAction()
                slot.parentElement.removeChild(slot);
                break;
            default:
                console.log("Ação não definida para este item.");
                break;
        }

    } else {
        console.log("Não há item neste slot.");
    }

}

//UI
function showHitInformation(amount) {
    const hitInfo = document.querySelector('.hit-information');
    hitInfo.textContent = `-${amount}`; // Atualiza o texto

    // Forçar a animação a reiniciar
    hitInfo.classList.add('fade');
    setTimeout(() => {
        hitInfo.classList.remove('fade');
    }, 250); // Remover a classe imediatamente
}

//LOOP PRINCIPAL
function gameLoop() {
    document.addEventListener('keydown', function (event) {
        if (isMoving) return;

        if (canMove) {
            //Verificar movimento
            switch (event.key) {
                case 'w':
                case "ArrowUp": // para cima
                    if (currentRow > 0) {
                        currentRow--
                        smooth = true
                        updatePlayerCell();
                        $mainCharacter.style.transform = "translate(-50%, -50%)";
                    }
                    else {
                        currentRow = ROWS - 1
                        smooth = false
                        updatePlayerCell();
                        playerChangeRoom()
                    }
                    break;
                case 's':
                case 'ArrowDown': // para baixo
                    if (currentRow < ROWS - 1) {
                        currentRow++
                        smooth = true
                        updatePlayerCell();
                        $mainCharacter.style.transform = "translate(-50%, -50%) scaleX(-1)";
                    }
                    else {
                        currentRow = 0
                        smooth = false
                        updatePlayerCell();
                        playerChangeRoom()
                    }
                    break;
                case 'a':
                case 'ArrowLeft': // esquerda
                    if (currentCol > 0) {
                        currentCol--
                        smooth = true
                        updatePlayerCell();
                        $mainCharacter.style.transform = "translate(-50%, -50%) scaleX(-1)";
                    }
                    else {
                        currentCol = COLS - 1
                        smooth = false
                        updatePlayerCell();
                        playerChangeRoom()
                    }
                    break;
                case 'd':
                case 'ArrowRight': // direita
                    if (currentCol < COLS - 1) {
                        currentCol++
                        smooth = true
                        updatePlayerCell();
                        $mainCharacter.style.transform = "translate(-50%, -50%)";
                    }
                    else {
                        currentCol = 0
                        smooth = false
                        updatePlayerCell();
                        playerChangeRoom()
                    }
                    break;
                case '1':
                    slotNumber = 0;
                    useItem(slotNumber)
                    break;
                case '2':
                    slotNumber = 1;
                    useItem(slotNumber)
                    break;
                case '3':
                    slotNumber = 2;
                    useItem(slotNumber)
                    break;
                default:
                    return;
            }


            //Faz verificações
            checkCollisions()


        }
    });
}


//INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', onStart());

gameLoop()
decreaseSoulsOverTime()