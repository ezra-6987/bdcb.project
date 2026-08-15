// ============================================================
// ASSET QUEST
// Conveyor Sorting Game
// ============================================================


// ============================================================
// ELEMENTS
// ============================================================

const startButton =
    document.getElementById("startButton");

const playAgain =
    document.getElementById("playAgain");

const startScreen =
    document.getElementById("startScreen");

const gameScreen =
    document.getElementById("gameScreen");

const gameOver =
    document.getElementById("gameOver");

const belt =
    document.getElementById("belt");

const timerDisplay =
    document.getElementById("timer");

const scoreDisplay =
    document.getElementById("score");

const livesDisplay =
    document.getElementById("lives");

const finalScore =
    document.getElementById("finalScore");

const message =
    document.getElementById("message");

const folders =
    document.querySelectorAll(".folder");

const collateralImage =
    document.getElementById("collateralImage");

const nonCollateralImage =
    document.getElementById("nonCollateralImage");

const correctSound =
    document.getElementById("correctSound");

const wrongSound =
    document.getElementById("wrongSound");

const gameOverSound =
    document.getElementById("gameOverSound");

const clickSound =
    document.getElementById("clickSound");


// ============================================================
// FOLDER IMAGES
// ============================================================

const folderImages = {

    collateral: {

        normal:
            "images/Collateral.png",

        wrong:
            "images/Wrong_Collateral.png"

    },


    nonCollateral: {

        normal:
            "images/Non-Collateral.png",

        wrong:
            "images/Wrong_Non-Collateral.png"

    }

};


// ============================================================
// ASSETS
// ============================================================

const assets = [

    {
        id: "property",
        name: "Property",
        image: "images/Property.png",
        category: "Non-Collateralised"
    },

    {
        id: "art",
        name: "Art",
        image: "images/Art.png",
        category: "Collateralised"
    },

    {
        id: "rentals",
        name: "Rentals",
        image: "images/Rentals.png",
        category: "Non-Collateralised"
    },

    {
        id: "jewelry",
        name: "Jewelry",
        image: "images/Jewelry.png",
        category: "Collateralised"
    },

    {
        id: "crops",
        name: "Crops",
        image: "images/Crops.png",
        category: "Collateralised"
    },

    {
        id: "ships",
        name: "Ships",
        image: "images/Ships.png",
        category: "Collateralised"
    },

    {
        id: "machines",
        name: "Machines",
        image: "images/Machines.png",
        category: "Collateralised"
    },

    {
        id: "livestocks",
        name: "Livestocks",
        image: "images/Livestocks.png",
        category: "Collateralised"
    },

    {
        id: "money",
        name: "Money",
        image: "images/Money.png",
        category: "Non-Collateralised"
    },

    {
        id: "lifeInsurance",
        name: "Life Insurance",
        image: "images/Insurance.png",
        category: "Non-Collateralised"
    },

    {
        id: "inventory",
        name: "Inventory",
        image: "images/Inventory.png",
        category: "Collateralised"
    },

    {
        id: "land",
        name: "Land",
        image: "images/Land.png",
        category: "Non-Collateralised"
    },

    {
        id: "aircraft",
        name: "Aircraft",
        image: "images/Aircraft.png",
        category: "Collateralised"
    }

];


// ============================================================
// GAME SETTINGS
// ============================================================

const GAME_TIME = 30;

const TOTAL_LIVES = 3;


// Number of cards visible initially

const INITIAL_CARD_COUNT = 4;


// Distance a card moves every second

const CARD_SPEED = 80;


// Time before a replacement card enters

const SPAWN_DELAY = 2000;


// Conveyor dimensions

const CONVEYOR_WIDTH = 900;

const CARD_WIDTH = 110;

const CARD_HEIGHT = 130;


// Card starting position

const ENTRY_POSITION =
    CONVEYOR_WIDTH + 20;


// Position where card has completely left

const EXIT_POSITION =
    -CARD_WIDTH - 20;


// Minimum horizontal distance between cards

const MIN_CARD_SPACING = 190;


// ============================================================
// GAME VARIABLES
// ============================================================

let gameRunning = false;

let score = 0;

let lives = TOTAL_LIVES;

let time = GAME_TIME;

let timer = null;

let animationFrame = null;

let lastFrameTime = null;


// ============================================================
// ASSET QUEUE
// ============================================================

// Assets waiting to appear

let assetQueue = [];


// ============================================================
// ACTIVE CARDS
// ============================================================

// Cards currently on conveyor

const activeCards = new Map();


// ============================================================
// PENDING SPAWNS
// ============================================================

// Each value is the time when another card may enter

let pendingSpawns = [];

let spawnCheckTimer = null;


// ============================================================
// SORTING COUNT
// ============================================================

let sortedCount = 0;


// ============================================================
// START BUTTON
// ============================================================

startButton.addEventListener(
    "click",
    startGame
);


// ============================================================
// PLAY AGAIN
// ============================================================

playAgain.addEventListener(
    "click",
    startGame
);


// ============================================================
// START GAME
// ============================================================

function startGame() {

    resetGame();


    startScreen.style.display =
        "none";


    gameOver.style.display =
        "none";


    gameScreen.style.display =
        "block";


    gameRunning = true;


    playSound(clickSound);


    updateDisplays();


    startTimer();


    createInitialCards();


    startConveyor();

}


// ============================================================
// RESET GAME
// ============================================================

function resetGame() {

    // Stop everything

    clearInterval(timer);

    clearTimeout(spawnCheckTimer);

    cancelAnimationFrame(animationFrame);


    timer = null;

    spawnCheckTimer = null;

    animationFrame = null;

    lastFrameTime = null;


    // Reset values

    score = 0;

    lives = TOTAL_LIVES;

    time = GAME_TIME;

    sortedCount = 0;


    gameRunning = false;


    // Clear cards

    activeCards.forEach(
        cardData => {

            cardData.element.remove();

        }
    );


    activeCards.clear();


    // Clear pending spawns

    pendingSpawns = [];


    // Create fresh shuffled queue

    assetQueue =
        shuffleArray(assets);


    // Clear belt

    belt.innerHTML = "";


    // Reset folders

    resetFolders();


    // Clear message

    if (message) {

        message.textContent = "";

        message.classList.remove(
            "popup"
        );

    }


    updateDisplays();

}


// ============================================================
// RESET FOLDERS
// ============================================================

function resetFolders() {

    collateralImage.src =
        folderImages.collateral.normal;


    nonCollateralImage.src =
        folderImages.nonCollateral.normal;


    folders.forEach(
        folder => {

            folder.classList.remove(
                "correctDrop",
                "wrongDrop"
            );

        }
    );

}


// ============================================================
// SHUFFLE
// ============================================================

function shuffleArray(array) {

    const result =
        [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]

        ] = [

            result[j],
            result[i]

        ];

    }


    return result;

}


// ============================================================
// UPDATE DISPLAY
// ============================================================

function updateDisplays() {

    timerDisplay.textContent =
        `⏱ ${time}`;


    scoreDisplay.textContent =
        `${score} / ${assets.length}`;


    livesDisplay.textContent =
        "❤️".repeat(lives);

}


// ============================================================
// TIMER
// ============================================================

function startTimer() {

    clearInterval(timer);


    timer =
        setInterval(
            () => {

                if (!gameRunning) {
                    return;
                }


                time--;


                if (time < 0) {
                    time = 0;
                }


                updateDisplays();


                if (time <= 0) {

                    finishGame();

                }

            },
            1000
        );

}


// ============================================================
// START CONVEYOR
// ============================================================

function startConveyor() {

    cancelAnimationFrame(
        animationFrame
    );


    lastFrameTime = null;


    animationFrame =
        requestAnimationFrame(
            moveCards
        );

}


// ============================================================
// MOVE CARDS
// ============================================================

function moveCards(timestamp) {

    if (!gameRunning) {
        return;
    }


    if (lastFrameTime === null) {

        lastFrameTime =
            timestamp;

    }


    const deltaTime =
        Math.min(
            (
                timestamp -
                lastFrameTime
            ) / 1000,
            0.05
        );


    lastFrameTime =
        timestamp;


    const cardsLeaving = [];


    // --------------------------------------------------------
    // MOVE ALL CARDS LEFT
    // --------------------------------------------------------

    activeCards.forEach(
        cardData => {

            cardData.x -=
                CARD_SPEED *
                deltaTime;


            cardData.element.style.left =
                `${cardData.x}px`;


            // Card completely leaves conveyor

            if (
                cardData.x <=
                EXIT_POSITION
            ) {

                cardsLeaving.push(
                    cardData.id
                );

            }

        }
    );


    // --------------------------------------------------------
    // HANDLE CARDS THAT LEFT
    // --------------------------------------------------------

    cardsLeaving.forEach(
        cardId => {

            const cardData =
                activeCards.get(cardId);


            if (!cardData) {
                return;
            }


            // The player did not sort it.
            // Put it back at the end of queue.

            assetQueue.push(
                cardData.item
            );


            removeCardFromConveyor(
                cardId
            );


            // Schedule replacement

            scheduleReplacement();

        }
    );


    // Process cards waiting to enter

    processPendingSpawns();


    // Continue animation

    animationFrame =
        requestAnimationFrame(
            moveCards
        );

}


// ============================================================
// CREATE INITIAL CARDS
// ============================================================

function createInitialCards() {

    const startingPositions = [

        80,
        300,
        520,
        740

    ];


    for (
        let i = 0;
        i < INITIAL_CARD_COUNT;
        i++
    ) {

        const item =
            getNextAsset();


        if (!item) {
            break;
        }


        createCard(
            item,
            startingPositions[i]
        );

    }

}


// ============================================================
// GET NEXT ASSET
// ============================================================

function getNextAsset() {

    if (
        assetQueue.length === 0
    ) {

        return null;

    }


    return assetQueue.shift();

}


// ============================================================
// CREATE CARD
// ============================================================

function createCard(
    item,
    position
) {

    if (!gameRunning) {
        return null;
    }


    // Unique ID for this card

    const instanceId =
        `${item.id}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}`;


    // Create card

    const card =
        document.createElement("div");


    card.className =
        "assetCard";


    card.dataset.id =
        instanceId;


    card.dataset.assetId =
        item.id;


    card.dataset.category =
        item.category;


    card.draggable = true;


    // ONLY IMAGE
    // No duplicate title

    card.innerHTML = `

        <img
            src="${item.image}"
            alt="${item.name}"
            draggable="false"
        >

    `;


    // Position

    card.style.left =
        `${position}px`;


    // Vertically centred

    card.style.top =
        "50%";


    card.style.transform =
        "translateY(-50%)";


    // Drag events

    card.addEventListener(
        "dragstart",
        handleDragStart
    );


    card.addEventListener(
        "dragend",
        handleDragEnd
    );


    // Add to conveyor

    belt.appendChild(card);


    // Register card

    activeCards.set(
        instanceId,
        {

            id: instanceId,

            item: item,

            element: card,

            x: position

        }
    );


    return instanceId;

}


// ============================================================
// DRAG START
// ============================================================

function handleDragStart(event) {

    if (!gameRunning) {

        event.preventDefault();

        return;

    }


    const card =
        event.currentTarget;


    const cardId =
        card.dataset.id;


    if (
        !activeCards.has(cardId)
    ) {

        event.preventDefault();

        return;

    }


    event.dataTransfer.setData(
        "cardId",
        cardId
    );


    event.dataTransfer.effectAllowed =
        "move";


    card.classList.add(
        "dragging"
    );

}


// ============================================================
// DRAG END
// ============================================================

function handleDragEnd(event) {

    event.currentTarget.classList.remove(
        "dragging"
    );

}


// ============================================================
// FOLDER EVENTS
// ============================================================

folders.forEach(
    folder => {


        folder.addEventListener(
            "dragover",
            event => {

                if (!gameRunning) {
                    return;
                }


                event.preventDefault();


                event.dataTransfer.dropEffect =
                    "move";

            }
        );


        folder.addEventListener(
            "drop",
            handleDrop
        );

    }
);


// ============================================================
// HANDLE DROP
// ============================================================

function handleDrop(event) {

    event.preventDefault();


    if (!gameRunning) {
        return;
    }


    const cardId =
        event.dataTransfer.getData(
            "cardId"
        );


    if (!cardId) {
        return;
    }


    const cardData =
        activeCards.get(cardId);


    if (!cardData) {
        return;
    }


    const folder =
        event.currentTarget;


    const chosenCategory =
        folder.dataset.category;


    const correct =
        cardData.item.category ===
        chosenCategory;


    // ========================================================
    // IMPORTANT
    // ========================================================
    //
    // REMOVE THE CARD IMMEDIATELY.
    //
    // THIS HAPPENS FOR BOTH CORRECT AND WRONG.
    //
    // The card NEVER stays on the conveyor.
    // The card NEVER gets placed inside the folder.
    //
    // ========================================================

    removeCardFromConveyor(
        cardId
    );


    // Schedule next card

    scheduleReplacement();


    // ========================================================
    // CORRECT
    // ========================================================

    if (correct) {

        score++;


        showFolderResult(
            folder,
            true
        );


        showMessage(
            "✔ CORRECT",
            "#16a34a"
        );


        playSound(
            correctSound
        );


        confetti();

    }


    // ========================================================
    // WRONG
    // ========================================================

    else {

        // IMPORTANT:
        // DO NOT increase score.

        lives--;


        showFolderResult(
            folder,
            false
        );


        showMessage(
            "✖ WRONG",
            "#dc2626"
        );


        playSound(
            wrongSound
        );

    }


    // This counts as sorted regardless
    // of whether the answer was right or wrong.

    sortedCount++;


    updateDisplays();


    // ========================================================
    // NO LIVES
    // ========================================================

    if (lives <= 0) {

        finishGame();

        return;

    }


    // ========================================================
    // ALL ASSETS SORTED
    // ========================================================

    if (
        sortedCount >=
        assets.length
    ) {

        finishGame();

    }

}


// ============================================================
// REMOVE CARD FROM CONVEYOR
// ============================================================

function removeCardFromConveyor(
    cardId
) {

    const cardData =
        activeCards.get(cardId);


    if (!cardData) {
        return false;
    }


    // Remove from active map

    activeCards.delete(
        cardId
    );


    // Remove actual DOM element

    if (
        cardData.element &&
        cardData.element.parentNode
    ) {

        cardData.element.remove();

    }


    return true;

}


// ============================================================
// SCHEDULE REPLACEMENT
// ============================================================

function scheduleReplacement() {

    if (!gameRunning) {
        return;
    }


    pendingSpawns.push(
        Date.now() +
        SPAWN_DELAY
    );


    processPendingSpawns();

}


// ============================================================
// PROCESS PENDING SPAWNS
// ============================================================

function processPendingSpawns() {

    if (!gameRunning) {
        return;
    }


    if (
        pendingSpawns.length === 0
    ) {

        return;

    }


    const now =
        Date.now();


    const nextSpawn =
        pendingSpawns[0];


    // Not ready yet

    if (
        nextSpawn > now
    ) {

        scheduleSpawnCheck(
            nextSpawn - now
        );


        return;

    }


    // --------------------------------------------------------
    // WAIT UNTIL THERE IS SPACE
    // --------------------------------------------------------

    if (
        !hasEnoughSpaceForNewCard()
    ) {

        scheduleSpawnCheck(100);

        return;

    }


    // Get next asset

    const item =
        getNextAsset();


    // No asset available

    if (!item) {

        pendingSpawns.shift();

        return;

    }


    // Remove pending spawn

    pendingSpawns.shift();


    // Create new card at right side

    createCard(
        item,
        ENTRY_POSITION
    );


    // Process another waiting spawn if possible

    processPendingSpawns();

}


// ============================================================
// SPAWN CHECK TIMER
// ============================================================

function scheduleSpawnCheck(
    delay
) {

    clearTimeout(
        spawnCheckTimer
    );


    spawnCheckTimer =
        setTimeout(
            () => {

                spawnCheckTimer =
                    null;


                processPendingSpawns();

            },
            Math.max(
                50,
                delay
            )
        );

}


// ============================================================
// PREVENT CARD STACKING
// ============================================================

function hasEnoughSpaceForNewCard() {

    if (
        activeCards.size === 0
    ) {

        return true;

    }


    let rightmostX =
        -Infinity;


    activeCards.forEach(
        cardData => {

            if (
                cardData.x >
                rightmostX
            ) {

                rightmostX =
                    cardData.x;

            }

        }
    );


    return (
        rightmostX <=
        ENTRY_POSITION -
        MIN_CARD_SPACING
    );

}


// ============================================================
// FOLDER RESULT
// ============================================================
//
// CORRECT:
// Folder remains its normal green design.
//
// WRONG:
// Folder changes permanently to the red version.
//
// The card itself is NOT placed inside the folder.
//
// ============================================================

function showFolderResult(
    folder,
    correct
) {

    const image =
        folder.querySelector(
            ".folderImage"
        );


    if (!image) {
        return;
    }


    // ========================================================
    // COLLATERALISED
    // ========================================================

    if (
        folder.id ===
        "collateral"
    ) {

        image.src =
            correct
                ? folderImages.collateral.normal
                : folderImages.collateral.wrong;

    }


    // ========================================================
    // NON-COLLATERALISED
    // ========================================================

    else if (
        folder.id ===
        "nonCollateral"
    ) {

        image.src =
            correct
                ? folderImages.nonCollateral.normal
                : folderImages.nonCollateral.wrong;

    }


    // Small visual feedback

    folder.classList.remove(
        "correctDrop",
        "wrongDrop"
    );


    void folder.offsetWidth;


    if (correct) {

        folder.classList.add(
            "correctDrop"
        );

    }

    else {

        folder.classList.add(
            "wrongDrop"
        );

    }

}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    text,
    color
) {

    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.style.color =
        color;


    message.classList.remove(
        "popup"
    );


    void message.offsetWidth;


    message.classList.add(
        "popup"
    );


    setTimeout(
        () => {

            message.classList.remove(
                "popup"
            );

        },
        800
    );

}


// ============================================================
// SOUND
// ============================================================

function playSound(sound) {

    if (!sound) {
        return;
    }


    sound.currentTime = 0;


    sound.play().catch(
        () => {}
    );

}


// ============================================================
// CONFETTI
// ============================================================

function confetti() {

    for (
        let i = 0;
        i < 20;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );


        piece.className =
            "piece";


        piece.style.left =
            `${Math.random() * 100}vw`;


        piece.style.background =
            `hsl(
                ${Math.random() * 360},
                100%,
                60%
            )`;


        piece.style.animationDelay =
            `${Math.random() * 0.3}s`;


        document.body.appendChild(
            piece
        );


        setTimeout(
            () => {

                piece.remove();

            },
            3000
        );

    }

}


// ============================================================
// FINISH GAME
// ============================================================

function finishGame() {

    // Prevent duplicate calls

    if (!gameRunning) {
        return;
    }


    // ========================================================
    // STOP GAME
    // ========================================================

    gameRunning = false;


    // ========================================================
    // STOP TIMER
    // ========================================================

    clearInterval(timer);

    timer = null;


    // ========================================================
    // STOP CONVEYOR ANIMATION
    // ========================================================

    cancelAnimationFrame(
        animationFrame
    );

    animationFrame = null;


    // ========================================================
    // STOP SPAWN SYSTEM
    // ========================================================

    clearTimeout(
        spawnCheckTimer
    );

    spawnCheckTimer = null;


    pendingSpawns = [];


    // ========================================================
    // UPDATE FINAL DISPLAY
    // ========================================================

    updateDisplays();


    // ========================================================
    // SHOW GAME OVER
    // ========================================================

    finalScore.textContent =
        `Score: ${score} / ${assets.length}`;


    gameScreen.style.display =
        "none";


    gameOver.style.display =
        "block";


    playSound(
        gameOverSound
    );

}