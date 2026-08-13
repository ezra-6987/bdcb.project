// =====================================================
// ELEMENTS
// =====================================================

const startButton = document.getElementById("startButton");
const playAgain = document.getElementById("playAgain");

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOver = document.getElementById("gameOver");

const belt = document.getElementById("belt");
const movingConveyor = document.getElementById("movingConveyor");

const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const finalScore = document.getElementById("finalScore");

const folders = document.querySelectorAll(".folder");

// =====================================================
// ASSETS
// =====================================================

const assets = [

    {
        name: "Aircraft",
        image: "images/Aircraft.png",
        category: "Collateralised"
    },

    {
        name: "Art",
        image: "images/Art.png",
        category: "Collateralised"
    },

    {
        name: "Crops",
        image: "images/Crops.png",
        category: "Collateralised"
    },

    {
        name: "Life Insurance",
        image: "images/Insurance.png",
        category: "Non-Collateralised"
    },

    {
        name: "Inventory",
        image: "images/Inventory.png",
        category: "Collateralised"
    },

    {
        name: "Jewelry",
        image: "images/Jewelry.png",
        category: "Collateralised"
    },

    {
        name: "Land",
        image: "images/Land.png",
        category: "Collateralised"
    },

    {
        name: "Livestocks",
        image: "images/Livestocks.png",
        category: "Collateralised"
    },

    {
        name: "Machines",
        image: "images/Machines.png",
        category: "Collateralised"
    },

    {
        name: "Money",
        image: "images/Money.png",
        category: "Collateralised"
    },

    {
        name: "Property",
        image: "images/Property.png",
        category: "Collateralised"
    },

    {
        name: "Rentals",
        image: "images/Rentals.png",
        category: "Collateralised"
    },

    {
        name: "Ships",
        image: "images/Ships.png",
        category: "Collateralised"
    }

];


// =====================================================
// GAME SETTINGS
// =====================================================

const GAME_TIME = 40;

const STARTING_LIVES = 3;

const CARD_WIDTH = 110;

const CARD_GAP = 64;

const CARD_STEP =
    CARD_WIDTH + CARD_GAP;

const CARD_SPEED = 45;

const START_POSITIONS = [
    18,
    192,
    366,
    540,
    714
];


// =====================================================
// GAME VARIABLES
// =====================================================

let remainingAssets = [];

let score = 0;

let lives = 3;

let time = 40;

let timer = null;

let animationFrame = null;

let gameRunning = false;

let conveyorRunning = false;

let lastFrameTime = 0;

let conveyorPosition = 0;

let draggedCard = null;

let draggedAssetName = null;

// =====================================================
// RANDOMIZE ASSETS
// =====================================================

function shuffleAssets(array) {

    const shuffled = [...array];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            shuffled[i],
            shuffled[j]
        ] = [
            shuffled[j],
            shuffled[i]
        ];

    }

    return shuffled;

}


// =====================================================
// START GAME
// =====================================================

startButton.addEventListener(
    "click",
    startGame
);


function startGame() {

    remainingAssets = shuffleAssets(assets);

    score = 0;

    lives = 3;

    time = 40;

    gameRunning = true;

    draggedCard = null;

    draggedAssetName = null;


    clearInterval(timer);

    cancelAnimationFrame(animationFrame);


    belt.innerHTML = "";


    startScreen.style.display = "none";

    gameOver.style.display = "none";

    gameScreen.style.display = "block";


    scoreDisplay.innerHTML =
        `0 / ${assets.length}`;


    document.getElementById("progress").innerHTML =
        `0 of ${assets.length}`;


    livesDisplay.innerHTML =
        "❤️".repeat(lives);


    timerDisplay.innerHTML =
        `⏱ ${time}`;


    createInitialCards();

    startTimer();

    startConveyor();

}


// =====================================================
// CREATE INITIAL CARDS
// =====================================================

function createInitialCards() {

    const initialCount =
        Math.min(
            5,
            remainingAssets.length
        );


    for (
        let i = 0;
        i < initialCount;
        i++
    ) {

        addNextAsset(
            START_POSITIONS[i]
        );

    }

}


// =====================================================
// ADD NEXT ASSET
// =====================================================

function addNextAsset(position) {

    if (
        remainingAssets.length === 0
    ) {

        return;

    }


    // Take one asset from the queue

    const item =
        remainingAssets.shift();


    createCard(
        item,
        position
    );

}


function createCard(item, position) {

    const card =
        document.createElement("div");

    card.className =
        "assetCard";

    card.draggable = true;

    card.dataset.assetName =
        item.name;

    card.dataset.category =
        item.category;


    card.innerHTML = `
        <img
            src="${item.image}"
            alt="${item.name}"
        >
    `;


    /*
     * Position the card directly
     * on the conveyor.
     */

    card.style.left =
        position + "px";

    card.style.top =
        "25px";


    card.addEventListener(
        "dragstart",
        dragStart
    );

    card.addEventListener(
        "dragend",
        dragEnd
    );


    belt.appendChild(card);
}


// =====================================================
// DRAG START
// =====================================================

function dragStart(event) {

    if (!gameRunning) {

        event.preventDefault();

        return;

    }


    const card =
        event.currentTarget;


    draggedCard = card;

    draggedAssetName =
        card.dataset.assetName;


    event.dataTransfer.setData(
        "assetName",
        draggedAssetName
    );


    event.dataTransfer.setData(
        "category",
        card.dataset.category
    );


    event.dataTransfer.effectAllowed =
        "move";


    card.classList.add(
        "dragging"
    );


    // Clear previous indicators

    clearFolderIndicators();

}


// =====================================================
// DRAG END
// =====================================================

function dragEnd() {

    if (draggedCard) {

        draggedCard.classList.remove(
            "dragging"
        );

    }


    draggedCard = null;

    draggedAssetName = null;

    clearFolderIndicators();

}


// =====================================================
// CLEAR FOLDER INDICATORS
// =====================================================

function clearFolderIndicators() {

    folders.forEach(folder => {

        folder.classList.remove(
            "correctDrop",
            "wrongDrop",
            "active"
        );

    });

}


// =====================================================
// FOLDER EVENTS
// =====================================================

folders.forEach(folder => {


    // ---------------------------------------------
    // DRAG OVER
    // ---------------------------------------------

    folder.addEventListener(
        "dragover",
        function(event) {

            event.preventDefault();


            if (
                !gameRunning ||
                !draggedCard
            ) {

                return;

            }


            const isCorrect =
                draggedCard.dataset.category ===
                this.dataset.category;


            clearFolderIndicators();


            if (isCorrect) {

                this.classList.add(
                    "correctDrop"
                );

                event.dataTransfer.dropEffect =
                    "move";

            }

            else {

                this.classList.add(
                    "wrongDrop"
                );

                event.dataTransfer.dropEffect =
                    "none";

            }

        }
    );


    // ---------------------------------------------
    // DRAG ENTER
    // ---------------------------------------------

    folder.addEventListener(
        "dragenter",
        function(event) {

            event.preventDefault();

        }
    );


    // ---------------------------------------------
    // DRAG LEAVE
    // ---------------------------------------------

    folder.addEventListener(
        "dragleave",
        function(event) {

            if (
                event.relatedTarget &&
                this.contains(
                    event.relatedTarget
                )
            ) {

                return;

            }


            this.classList.remove(
                "correctDrop",
                "wrongDrop"
            );

        }
    );


    // ---------------------------------------------
    // DROP
    // ---------------------------------------------

    folder.addEventListener(
        "drop",
        checkAnswer
    );

});


// =====================================================
// CHECK ANSWER
// =====================================================

function checkAnswer(event) {

    event.preventDefault();


    if (
        !gameRunning ||
        !draggedCard
    ) {

        return;

    }


    const card =
        draggedCard;


    const assetName =
        card.dataset.assetName;


    const answer =
        card.dataset.category;


    const chosenCategory =
        this.dataset.category;


    clearFolderIndicators();


    // ---------------------------------------------
    // CORRECT
    // ---------------------------------------------

    if (
        answer ===
        chosenCategory
    ) {

        correct(
            assetName,
            card,
            this
        );

    }


    // ---------------------------------------------
    // WRONG
    // ---------------------------------------------

    else {

        wrong(
            card,
            this
        );

    }


    draggedCard = null;

    draggedAssetName = null;

}


// =====================================================
// CORRECT ANSWER
// =====================================================

function correct(
    assetName,
    card,
    folder
) {

    if (!gameRunning) {

        return;

    }


    // Visual feedback

    folder.classList.add(
        "correctDrop",
        "bounce"
    );


    showMessage(
        "✔ Correct",
        "#5CFF5C"
    );


    confetti();


    // Score

    score++;


    scoreDisplay.innerHTML =
        `${score} / ${assets.length}`;

    
    document.getElementById(
    "progress"
    ).innerHTML =
    `${score} of ${assets.length}`;

    // Disable this card

    card.draggable = false;

    card.classList.add(
        "correctCard"
    );


    // ---------------------------------------------
    // REMOVE AFTER 2 SECONDS
    // ---------------------------------------------

    setTimeout(() => {

        if (!gameRunning) {

            return;

        }


        removeAsset(
            assetName,
            card
        );


        folder.classList.remove(
            "correctDrop",
            "bounce"
        );


    }, 2000);

}


// =====================================================
// WRONG ANSWER
// =====================================================

function wrong(
    card,
    folder
) {

    if (!gameRunning) {

        return;

    }


    folder.classList.add(
        "wrongDrop"
    );


    card.classList.add(
        "shake"
    );


    showMessage(
        "✖ Wrong",
        "#FF4444"
    );


    lives--;


    livesDisplay.innerHTML =
        "❤️".repeat(lives);


    setTimeout(() => {

        card.classList.remove(
            "shake"
        );

        folder.classList.remove(
            "wrongDrop"
        );

    }, 500);


    // Game Over

    if (lives <= 0) {

        setTimeout(() => {

            finishGame();

        }, 500);

    }

}


// =====================================================
// REMOVE ASSET
// =====================================================

function removeAsset(
    assetName,
    card
) {

    if (!gameRunning) {
        return;
    }


    // Remove visual card

    if (card) {

        card.remove();

    }


    // Increase progress

    document.getElementById(
        "progress"
    ).innerHTML =
        `${score} of ${assets.length}`;


    // -----------------------------------------
    // ALL SORTED
    // -----------------------------------------

    if (
        score >= assets.length
    ) {

        finishGame();

        return;

    }


    // -----------------------------------------
    // Bring another asset after 2 seconds
    // -----------------------------------------

    setTimeout(() => {

        if (!gameRunning) {
            return;
        }


        addNextAssetFromRight();

    }, 2000);

}


// =====================================================
// ADD NEW ASSET FROM RIGHT
// =====================================================

function addNextAssetFromRight() {

    if (
        remainingAssets.length === 0
    ) {

        return;

    }


    const cards =
        document.querySelectorAll(
            ".assetCard"
        );


    let rightMost = -Infinity;


    cards.forEach(card => {

        const x =
            parseFloat(
                card.style.left
            ) || 0;


        if (
            x > rightMost
        ) {

            rightMost = x;

        }

    });

    if (rightMost === -Infinity) {
        rightMost = START_POSITIONS[START_POSITIONS.length - 1];
    }

    const newPosition =
        rightMost + CARD_STEP;


    addNextAsset(
        newPosition
    );

}


// =====================================================
// CONTINUOUS CONVEYOR
// =====================================================

function startConveyor() {

    conveyorRunning = true;

    lastFrameTime =
        performance.now();


    function animate(
        currentTime
    ) {

        if (
            !gameRunning ||
            !conveyorRunning
        ) {

            return;

        }


        const delta =
            (currentTime -
                lastFrameTime) /
            1000;


        lastFrameTime =
            currentTime;


        conveyorPosition +=
            CARD_SPEED *
            delta;


        const cards =
            document.querySelectorAll(
                ".assetCard"
            );


        cards.forEach(card => {

            const currentLeft =
                parseFloat(
                    card.style.left
                ) || 0;


            card.style.left =
                (
                    currentLeft -
                    CARD_SPEED *
                    delta
                ) + "px";


            // ----------------------------------
            // Remove card that has gone offscreen
            // ----------------------------------

            if (
                currentLeft <
                -CARD_WIDTH
            ) {

                // Only remove if it hasn't
                // already been sorted

                if (
                    !card.classList.contains(
                        "correctCard"
                    )
                ) {

                    const assetName =
                        card.dataset.assetName;


                    removeUnsortedCard(
                        assetName,
                        card
                    );

                }

            }

        });


        animationFrame =
            requestAnimationFrame(
                animate
            );

    }


    animationFrame =
        requestAnimationFrame(
            animate
        );

}


// =====================================================
// REMOVE UNSORTED CARD THAT LEFT SCREEN
// =====================================================

function removeUnsortedCard(
    assetName,
    card
) {

    if (!gameRunning) {
        return;
    }


    const item =
        assets.find(
            asset =>
                asset.name ===
                assetName
        );


    if (!item) {
        return;
    }


    card.remove();


    // Put the unsorted asset
    // back at the end of the queue

    remainingAssets.push(item);


    // Bring another item in
    // after a short delay

    setTimeout(() => {

        if (!gameRunning) {
            return;
        }


        addNextAssetFromRight();

    }, 500);

}

// =====================================================
// ADD EXISTING ASSET
// =====================================================

function addCardForExistingAsset(
    item
) {

    const cards =
        document.querySelectorAll(
            ".assetCard"
        );


    let rightMost = 0;


    cards.forEach(card => {

        const x =
            parseFloat(
                card.style.left
            ) || 0;


        if (
            x >
            rightMost
        ) {

            rightMost = x;

        }

    });


    const card =
        document.createElement("div");


    card.className =
        "assetCard";


    card.draggable = true;


    card.dataset.assetName =
        item.name;


    card.dataset.category =
        item.category;


    card.style.left =
        (
            rightMost +
            CARD_STEP
        ) + "px";


    card.innerHTML = `

        <img
            src="${item.image}"
            alt="${item.name}"
        >

    `;


    card.addEventListener(
        "dragstart",
        dragStart
    );


    card.addEventListener(
        "dragend",
        dragEnd
    );


    belt.appendChild(card);

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    text,
    color
) {

    const message =
        document.getElementById(
            "message"
        );


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


    setTimeout(() => {

        message.classList.remove(
            "popup"
        );

    }, 800);

}


// =====================================================
// CONFETTI
// =====================================================

function confetti() {

    for (
        let i = 0;
        i < 25;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );


        piece.classList.add(
            "piece"
        );


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


        setTimeout(() => {

            piece.remove();

        }, 3000);

    }

}


// =====================================================
// TIMER
// =====================================================

function startTimer() {

    clearInterval(timer);


    timer =
        setInterval(() => {

            if (!gameRunning) {

                return;

            }


            time--;


            timerDisplay.innerHTML =
                `⏱ ${time}`;


            if (time <= 0) {

                time = 0;


                timerDisplay.innerHTML =
                    "⏱ 0";


                finishGame();

            }

        }, 1000);

}


// =====================================================
// FINISH GAME
// =====================================================

function finishGame() {

    if (!gameRunning) {

        return;

    }


    gameRunning = false;

    conveyorRunning = false;


    clearInterval(timer);


    cancelAnimationFrame(
        animationFrame
    );


    let bestScore =
        Number(
            localStorage.getItem(
                "bestScore"
            )
        ) || 0;


    if (
        score >
        bestScore
    ) {

        bestScore =
            score;


        localStorage.setItem(
            "bestScore",
            bestScore
        );

    }


    gameScreen.style.display =
        "none";


    gameOver.style.display =
        "block";


    finalScore.innerHTML = `

        Your Score : ${score}
        <br><br>
        Best Score : ${bestScore}

    `;

}


// =====================================================
// PLAY AGAIN
// =====================================================

playAgain.addEventListener(
    "click",
    restartGame
);


function restartGame() {

    clearInterval(timer);

    cancelAnimationFrame(
        animationFrame
    );


    gameRunning = false;

    conveyorRunning = false;

    score = 0;

    lives = STARTING_LIVES;

    time = GAME_TIME;

    conveyorPosition = 0;

    draggedCard = null;

    draggedAssetName = null;


    belt.innerHTML = "";


    movingConveyor.style.transform =
        "translateX(0px)";


    scoreDisplay.innerHTML =
        `0 / ${assets.length}`;


    livesDisplay.innerHTML =
        "❤️".repeat(
            STARTING_LIVES
        );


    timerDisplay.innerHTML =
        `⏱ ${GAME_TIME}`;


    clearFolderIndicators();


    gameOver.style.display =
        "none";


    gameScreen.style.display =
        "none";


    startScreen.style.display =
        "block";

}