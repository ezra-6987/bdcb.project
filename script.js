// =====================================================
// ELEMENTS
// =====================================================

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

const conveyorTrack =
    document.getElementById("movingConveyor");

const correctSound =
    document.getElementById("correctSound");

const wrongSound =
    document.getElementById("wrongSound");

const gameOverSound =
    document.getElementById("gameOverSound");

const clickSound =
    document.getElementById("clickSound");


// =====================================================
// ASSETS
// =====================================================

const assets = [

    {
        id: "property",
        name: "Property",
        image: "images/Property.png",
        category: "Collateralised"
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
        category: "Collateralised"
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
        category: "Collateralised"
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
        category: "Collateralised"
    },

    {
        id: "aircraft",
        name: "Aircraft",
        image: "images/Aircraft.png",
        category: "Collateralised"
    }

];


// =====================================================
// GAME VARIABLES
// =====================================================

let activeAssets = [];

let score = 0;

let lives = 3;

let time = 40;

let timer = null;

let gameRunning = false;


// =====================================================
// CONVEYOR VARIABLES
// =====================================================

let animationFrame = null;

let lastFrameTime = null;

let spawnTimer = null;

let nextAssetIndex = 0;

let processedAssets = 0;


// Cards currently visible on conveyor
//
// Map:
// asset ID -> card information

const activeCards =
    new Map();


// =====================================================
// CONVEYOR SETTINGS
// =====================================================

// Card movement speed

const CARD_SPEED = 55;


// Delay before a replacement card
// appears after player removes a card

const SPAWN_DELAY = 2000;


// Number of cards normally visible

const MAX_VISIBLE_CARDS = 4;


// Starting positions for the
// initial cards

const START_POSITIONS = [
    80,
    300,
    520,
    740
];


// Position where new cards enter

const CONVEYOR_ENTRY = 920;



// =====================================================
// START GAME
// =====================================================

startButton.addEventListener(
    "click",
    startGame
);


function startGame() {

    resetGame();


    startScreen.style.display =
        "none";

    gameOver.style.display =
        "none";

    gameScreen.style.display =
        "block";


    gameRunning = true;


    // Restart conveyor artwork

    conveyorTrack.style.animationPlayState =
        "running";


    // Click sound

    playSound(clickSound);


    // Timer

    startTimer();


    // Start card movement

    startConveyor();


    // Put first cards on conveyor

    startInitialCards();

}



// =====================================================
// RESET GAME
// =====================================================

function resetGame() {

    clearInterval(timer);

    clearTimeout(spawnTimer);

    cancelAnimationFrame(
        animationFrame
    );


    activeAssets =
        shuffleArray(assets);


    score = 0;

    lives = 3;

    time = 40;

    nextAssetIndex = 0;

    processedAssets = 0;

    gameRunning = false;

    lastFrameTime = null;


    activeCards.clear();

    belt.innerHTML = "";


    updateDisplays();


    folders.forEach(
        folder => {

            folder.classList.remove(
                "correctDrop",
                "wrongDrop"
            );

        }
    );

}



// =====================================================
// SHUFFLE ASSETS
// =====================================================

function shuffleArray(array) {

    const shuffled =
        [...array];


    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            shuffled[i],
            shuffled[j]
        ] =
        [
            shuffled[j],
            shuffled[i]
        ];

    }


    return shuffled;

}



// =====================================================
// UPDATE DISPLAY
// =====================================================

function updateDisplays() {

    timerDisplay.innerHTML =
        "⏱ " + time;


    scoreDisplay.innerHTML =
        score +
        " / " +
        assets.length;


    livesDisplay.innerHTML =
        "❤️".repeat(lives);

}



// =====================================================
// TIMER
// =====================================================

function startTimer() {

    clearInterval(timer);


    timer =
        setInterval(
            () => {

                if (!gameRunning) {
                    return;
                }


                time--;


                updateDisplays();


                if (time <= 0) {

                    time = 0;

                    updateDisplays();

                    finishGame();

                }

            },
            1000
        );

}



// =====================================================
// START CONVEYOR
// =====================================================

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



// =====================================================
// MOVE CARDS
// =====================================================

function moveCards(timestamp) {

    if (!gameRunning) {
        return;
    }


    if (lastFrameTime === null) {

        lastFrameTime =
            timestamp;

    }


    const deltaTime =
        (
            timestamp -
            lastFrameTime
        ) / 1000;


    lastFrameTime =
        timestamp;


    const cardsToRemove = [];


    activeCards.forEach(
        cardData => {

            cardData.x -=
                CARD_SPEED *
                deltaTime;


            cardData.element.style.left =
                cardData.x + "px";


            /*
                Card has travelled completely
                off the left side.
            */

            if (
                cardData.x <
                -cardData.element.offsetWidth
            ) {

                cardsToRemove.push(
                    cardData.id
                );

            }

        }
    );


    /*
        Remove cards that have
        reached the end.
    */

    cardsToRemove.forEach(
        cardId => {

            removeCardFromConveyor(
                cardId
            );

            /*
                This card was NOT dragged.
                It simply reached the end.
                We still count it as processed
                so that the game doesn't
                continue forever.
            */

            processedAssets++;

            keepConveyorMoving();

        }
    );


    /*
        Continue animation.
    */

    animationFrame =
        requestAnimationFrame(
            moveCards
        );

}



// =====================================================
// INITIAL CARDS
// =====================================================

function startInitialCards() {

    for (
        let i = 0;
        i < START_POSITIONS.length;
        i++
    ) {

        spawnNextCard(
            START_POSITIONS[i]
        );

    }

}



// =====================================================
// SPAWN NEXT CARD
// =====================================================

function spawnNextCard(
    position = CONVEYOR_ENTRY
) {

    if (!gameRunning) {
        return;
    }


    /*
        All assets have already
        entered the conveyor.
    */

    if (
        nextAssetIndex >=
        activeAssets.length
    ) {

        return;

    }


    const item =
        activeAssets[
            nextAssetIndex
        ];


    nextAssetIndex++;


    createCard(
        item,
        position
    );

}



// =====================================================
// CREATE CARD
// =====================================================

function createCard(
    item,
    position
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "assetCard";


    card.dataset.id =
        item.id;


    card.dataset.category =
        item.category;


    card.innerHTML = `
        <img
            src="${item.image}"
            alt="${item.name}"
        >
    `;


    card.style.left =
        position + "px";


    /*
        Center the card vertically
        on the conveyor.
    */

    card.style.top =
        "50%";


    card.style.transform =
        "translateY(-50%)";


    card.draggable =
        true;


    card.addEventListener(
        "dragstart",
        handleDragStart
    );


    card.addEventListener(
        "dragend",
        handleDragEnd
    );


    belt.appendChild(
        card
    );


    activeCards.set(
        item.id,
        {
            id: item.id,
            item: item,
            element: card,
            x: position
        }
    );

}



// =====================================================
// DRAG START
// =====================================================

function handleDragStart(event) {

    if (!gameRunning) {

        event.preventDefault();

        return;

    }


    const card =
        event.currentTarget;


    const cardId =
        card.dataset.id;


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



// =====================================================
// DRAG END
// =====================================================

function handleDragEnd(event) {

    event.currentTarget.classList.remove(
        "dragging"
    );

}



// =====================================================
// FOLDER EVENTS
// =====================================================

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
            "dragenter",
            event => {

                if (!gameRunning) {
                    return;
                }


                event.preventDefault();

            }
        );


        folder.addEventListener(
            "drop",
            handleDrop
        );

    }
);



// =====================================================
// HANDLE DROP
// =====================================================

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
        activeCards.get(
            cardId
        );


    if (!cardData) {
        return;
    }


    const chosenCategory =
        this.dataset.category;


    const correct =
        cardData.item.category ===
        chosenCategory;



    // =================================================
    // REMOVE CARD IMMEDIATELY
    // =================================================

    removeCardFromConveyor(
        cardId
    );


    /*
        IMPORTANT:

        Whether the answer is correct
        OR wrong, the card is gone.

        It is NOT inserted into the folder.
    */

    processedAssets++;



    // =================================================
    // CORRECT
    // =================================================

    if (correct) {

        score++;

        updateDisplays();

        showFolderResult(
            this,
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


    // =================================================
    // WRONG
    // =================================================

    else {

        /*
            DO NOT increase score.
        */

        lives--;

        updateDisplays();

        showFolderResult(
            this,
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


    // =================================================
    // NO LIVES
    // =================================================

    if (lives <= 0) {

        finishGame();

        return;

    }


    // =================================================
    // ALL ASSETS PROCESSED
    // =================================================

    if (
        processedAssets >=
        assets.length
    ) {

        finishGame();

        return;

    }


    // =================================================
    // BRING NEXT CARD AFTER 2 SECONDS
    // =================================================

    scheduleNextCard();

}



// =====================================================
// REMOVE CARD
// =====================================================

function removeCardFromConveyor(
    cardId
) {

    const cardData =
        activeCards.get(
            cardId
        );


    if (!cardData) {
        return;
    }


    activeCards.delete(
        cardId
    );


    cardData.element.remove();

}



// =====================================================
// SCHEDULE NEXT CARD
// =====================================================

function scheduleNextCard() {

    clearTimeout(
        spawnTimer
    );


    if (!gameRunning) {
        return;
    }


    if (
        nextAssetIndex >=
        activeAssets.length
    ) {

        return;

    }


    spawnTimer =
        setTimeout(
            () => {

                if (!gameRunning) {
                    return;
                }


                spawnNextCard(
                    CONVEYOR_ENTRY
                );


            },
            SPAWN_DELAY
        );

}



// =====================================================
// KEEP CONVEYOR POPULATED
// =====================================================

function keepConveyorMoving() {

    if (!gameRunning) {
        return;
    }


    /*
        Don't add anything if all
        assets have already entered.
    */

    if (
        nextAssetIndex >=
        activeAssets.length
    ) {

        return;

    }


    /*
        Keep at least 4 cards visible.

        A slight delay prevents cards
        from appearing immediately
        on top of each other.
    */

    if (
        activeCards.size <
        MAX_VISIBLE_CARDS
    ) {

        clearTimeout(
            spawnTimer
        );


        spawnTimer =
            setTimeout(
                () => {

                    if (!gameRunning) {
                        return;
                    }


                    if (
                        activeCards.size <
                        MAX_VISIBLE_CARDS
                    ) {

                        spawnNextCard(
                            CONVEYOR_ENTRY
                        );

                    }

                },
                1000
            );

    }

}



// =====================================================
// FOLDER RESULT
// =====================================================

function showFolderResult(
    folder,
    correct
) {

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


    setTimeout(
        () => {

            folder.classList.remove(
                "correctDrop",
                "wrongDrop"
            );

        },
        900
    );

}



// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    text,
    color
) {

    message.innerHTML =
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



// =====================================================
// SOUND
// =====================================================

function playSound(
    sound
) {

    if (!sound) {
        return;
    }


    sound.currentTime =
        0;


    sound.play().catch(
        () => {}
    );

}



// =====================================================
// CONFETTI
// =====================================================

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
            Math.random() *
            100 +
            "vw";


        piece.style.background =
            `hsl(
                ${Math.random() * 360},
                100%,
                60%
            )`;


        piece.style.animationDelay =
            Math.random() *
            0.3 +
            "s";


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



// =====================================================
// FINISH GAME
// =====================================================

function finishGame() {

    if (!gameRunning) {
        return;
    }


    gameRunning = false;


    // Stop timer

    clearInterval(
        timer
    );


    // Stop pending spawn

    clearTimeout(
        spawnTimer
    );


    // Stop card animation

    cancelAnimationFrame(
        animationFrame
    );


    animationFrame =
        null;


    // Stop conveyor artwork

    conveyorTrack.style.animationPlayState =
        "paused";


    // Final score

    finalScore.innerHTML = `
        Your Score:
        ${score} / ${assets.length}
    `;


    gameScreen.style.display =
        "none";


    gameOver.style.display =
        "block";


    playSound(
        gameOverSound
    );

}



// =====================================================
// PLAY AGAIN
// =====================================================

playAgain.addEventListener(
    "click",
    () => {

        gameOver.style.display =
            "none";


        startScreen.style.display =
            "block";


        conveyorTrack.style.animationPlayState =
            "running";

    }
);