// ============================================================
// ASSET QUEST
// Conveyor Sorting Game
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // ELEMENTS
    // ============================================================

    const startButton = document.getElementById("startButton");
    const playAgain = document.getElementById("playAgain");

    const startScreen = document.getElementById("startScreen");
    const gameScreen = document.getElementById("gameScreen");
    const gameOver = document.getElementById("gameOver");

    const belt = document.getElementById("belt");

    const timerDisplay = document.getElementById("timer");
    const scoreDisplay = document.getElementById("score");
    const livesDisplay = document.getElementById("lives");
    const finalScore = document.getElementById("finalScore");

    const message = document.getElementById("message");

    const folders = document.querySelectorAll(".folder");

    const collateralFolder =
        document.getElementById("collateral");

    const nonCollateralFolder =
        document.getElementById("nonCollateral");

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

    const confettiContainer =
        document.getElementById("confetti");


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


    // ============================================================
    // CONVEYOR SETTINGS
    // ============================================================

    // Pixels per second.
    const CARD_SPEED = 50;

    // Number of cards visible when game begins.
    const MAX_VISIBLE_CARDS = 7;

    // Must match CSS.
    const CARD_WIDTH = 110;

    // 110px card + 15px gap.
    const CARD_SPACING = 125;

    // First card position.
    const FIRST_CARD_POSITION = 0;

    // Conveyor width from CSS.
    const CONVEYOR_WIDTH = 900;

    // New cards enter from the right.
    const CONVEYOR_ENTRY =
        CONVEYOR_WIDTH + 1;

    // Card is completely outside on the left.
    const EXIT_POSITION =
        -CARD_WIDTH - 1;

    // Replacement delay after player drops a card.
    const SPAWN_DELAY = 2000;


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

    let assetQueue = [];


    // ============================================================
    // ACTIVE CARDS
    // ============================================================

    const activeCards = new Map();


    // ============================================================
    // SORTED ASSETS
    // ============================================================

    const sortedAssets = new Set();


    // ============================================================
    // SORTING COUNT
    // ============================================================

    let sortedCount = 0;


    // ============================================================
    // CARD COUNTER
    // ============================================================

    let cardCounter = 0;


    // ============================================================
    // REPLACEMENT TIMERS
    // ============================================================

    let replacementTimers = [];


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
        returnToStartScreen
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

        // Stop timer.
        clearInterval(timer);

        timer = null;


        // Stop animation.
        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;


        // Stop all replacement timers.
        replacementTimers.forEach(
            timerId => clearTimeout(timerId)
        );

        replacementTimers = [];


        // Reset game state.
        gameRunning = false;

        score = 0;

        lives = TOTAL_LIVES;

        time = GAME_TIME;

        sortedCount = 0;

        cardCounter = 0;


        // Reset asset queue.
        assetQueue =
            shuffleArray(assets);


        // Reset sorted assets.
        sortedAssets.clear();


        // Remove all active cards.
        activeCards.forEach(
            cardData => {

                if (cardData.element) {
                    cardData.element.remove();
                }

            }
        );

        activeCards.clear();


        // Clear conveyor.
        if (belt) {
            belt.innerHTML = "";
        }


        // Reset folders.
        resetFolders();


        // Reset message.
        if (message) {

            message.textContent = "";

            message.classList.remove(
                "popup"
            );

        }


        // Reset display.
        updateDisplays();

    }


    // ============================================================
    // RESET FOLDERS
    // ============================================================

    function resetFolders() {

        if (collateralImage) {

            collateralImage.src =
                folderImages
                    .collateral
                    .normal;

        }


        if (nonCollateralImage) {

            nonCollateralImage.src =
                folderImages
                    .nonCollateral
                    .normal;

        }


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
    // RETURN TO START SCREEN
    // ============================================================

    function returnToStartScreen() {

        resetGame();

        gameScreen.style.display =
            "none";

        gameOver.style.display =
            "none";

        startScreen.style.display =
            "flex";

        window.scrollTo(
            0,
            0
        );

    }


    // ============================================================
    // SHUFFLE
    // ============================================================

    function shuffleArray(array) {

        const result = [...array];

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
    // UPDATE DISPLAYS
    // ============================================================

    function updateDisplays() {

        if (timerDisplay) {

            timerDisplay.textContent =
                `⏱ ${time}`;

        }


        if (scoreDisplay) {

            scoreDisplay.textContent =
                `${score} / ${assets.length}`;

        }


        if (livesDisplay) {

            livesDisplay.textContent =
                "❤️".repeat(
                    Math.max(
                        0,
                        lives
                    )
                );

        }

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


        // Move every card LEFT.
        activeCards.forEach(
            cardData => {

                cardData.x -=
                    CARD_SPEED *
                    deltaTime;


                cardData.element.style.left =
                    `${cardData.x}px`;


                cardData.element.style.top =
                    "50%";


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


        // Recycle cards that leave
        // without being dragged.
        cardsLeaving.forEach(
            cardId => {

                recycleCard(
                    cardId
                );

            }
        );


        animationFrame =
            requestAnimationFrame(
                moveCards
            );

    }


    // ============================================================
    // CREATE INITIAL CARDS
    // ============================================================

    function createInitialCards() {

        let created = 0;

        while (
            created <
                MAX_VISIBLE_CARDS &&
            assetQueue.length > 0
        ) {

            const item =
                getNextAvailableAsset();

            if (!item) {
                break;
            }


            createCard(
                item,
                FIRST_CARD_POSITION +
                (
                    created *
                    CARD_SPACING
                )
            );


            created++;

        }

    }


    // ============================================================
    // GET NEXT AVAILABLE ASSET
    // ============================================================

    function getNextAvailableAsset() {

        // Search queue.
        for (
            let i = 0;
            i < assetQueue.length;
            i++
        ) {

            const item =
                assetQueue[i];


            // Already sorted?
            if (
                sortedAssets.has(
                    item.id
                )
            ) {
                continue;
            }


            // Already active?
            if (
                isAssetAlreadyActive(
                    item.id
                )
            ) {
                continue;
            }


            // Remove from queue.
            assetQueue.splice(
                i,
                1
            );


            return item;

        }


        // Search full asset list as fallback.
        for (
            const item of assets
        ) {

            if (
                sortedAssets.has(
                    item.id
                )
            ) {
                continue;
            }


            if (
                isAssetAlreadyActive(
                    item.id
                )
            ) {
                continue;
            }


            return item;

        }


        return null;

    }


    // ============================================================
    // CHECK WHETHER ASSET IS ACTIVE
    // ============================================================

    function isAssetAlreadyActive(
        assetId
    ) {

        for (
            const cardData
            of activeCards.values()
        ) {

            if (
                cardData.item.id ===
                assetId
            ) {

                return true;

            }

        }

        return false;

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


        const instanceId =
            `card-${cardCounter++}`;


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "assetCard";


        card.dataset.id =
            instanceId;


        card.dataset.assetId =
            item.id;


        card.dataset.category =
            item.category;


        card.draggable = true;


        // Image only.
        card.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.name}"
                draggable="false"
            >

        `;


        card.style.left =
            `${position}px`;


        card.style.top =
            "50%";


        card.style.transform =
            "translateY(-50%)";


        // Drag events.
        card.addEventListener(
            "dragstart",
            handleDragStart
        );


        card.addEventListener(
            "dragend",
            handleDragEnd
        );


        // Add card to conveyor.
        belt.appendChild(
            card
        );


        // Register active card.
        activeCards.set(
            instanceId,
            {

                id:
                    instanceId,

                item:
                    item,

                element:
                    card,

                x:
                    position

            }
        );


        return instanceId;

    }


    // ============================================================
    // DRAG START
    // ============================================================

    function handleDragStart(
        event
    ) {

        if (!gameRunning) {

            event.preventDefault();

            return;

        }


        const card =
            event.currentTarget;


        const cardId =
            card.dataset.id;


        if (
            !activeCards.has(
                cardId
            )
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

    function handleDragEnd(
        event
    ) {

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


    // ============================================================
    // HANDLE DROP
    // ============================================================

    function handleDrop(
        event
    ) {

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


        const folder =
            event.currentTarget;


        const chosenCategory =
            folder.dataset.category;


        const correct =
            cardData.item.category ===
            chosenCategory;


        // Remove card immediately.
        removeCardFromConveyor(
            cardId
        );


        // Mark asset as processed.
        sortedAssets.add(
            cardData.item.id
        );


        sortedCount++;


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

            createConfetti();

        }


        // ========================================================
        // WRONG
        // ========================================================

        else {

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


        updateDisplays();


        // No lives left.
        if (lives <= 0) {

            finishGame();

            return;

        }


        // All assets processed.
        if (
            sortedCount >=
            assets.length
        ) {

            finishGame();

            return;

        }


        // Wait exactly 2 seconds
        // before replacement.
        scheduleReplacement();

    }


    // ============================================================
    // REMOVE CARD
    // ============================================================

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


        if (cardData.element) {

            cardData.element.remove();

        }

    }


    // ============================================================
    // RECYCLE CARD
    // ============================================================

    function recycleCard(
        cardId
    ) {

        const cardData =
            activeCards.get(
                cardId
            );


        if (!cardData) {
            return;
        }


        // Remove old instance.
        activeCards.delete(
            cardId
        );


        if (cardData.element) {

            cardData.element.remove();

        }


        // Asset was not sorted,
        // so return it to the queue.
        if (
            !sortedAssets.has(
                cardData.item.id
            )
        ) {

            assetQueue.push(
                cardData.item
            );

        }


        // Immediately replace a card
        // that naturally left the screen.
        scheduleReplacement(0);

    }


    // ============================================================
    // SCHEDULE REPLACEMENT
    // ============================================================

    function scheduleReplacement(
        delay = SPAWN_DELAY
    ) {

        if (!gameRunning) {
            return;
        }


        const timerId =
            setTimeout(
                () => {

                    replacementTimers =
                        replacementTimers.filter(
                            id =>
                                id !== timerId
                        );

                    processReplacement();

                },
                delay
            );


        replacementTimers.push(
            timerId
        );

    }


    // ============================================================
    // PROCESS REPLACEMENT
    // ============================================================

    function processReplacement() {

        if (!gameRunning) {
            return;
        }


        if (
            sortedCount >=
            assets.length
        ) {

            return;

        }


        const item =
            getNextAvailableAsset();


        if (!item) {

            return;

        }


        const position =
            getRightmostPosition() +
            CARD_SPACING;


        createCard(
            item,
            Math.max(
                position,
                CONVEYOR_ENTRY
            )
        );

    }


    // ============================================================
    // GET RIGHTMOST CARD
    // ============================================================

    function getRightmostPosition() {

        let rightmost =
            FIRST_CARD_POSITION;


        activeCards.forEach(
            cardData => {

                if (
                    cardData.x >
                    rightmost
                ) {

                    rightmost =
                        cardData.x;

                }

            }
        );


        return rightmost;

    }


    // ============================================================
    // FOLDER RESULT
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


        // Remove previous classes.
        folder.classList.remove(
            "correctDrop",
            "wrongDrop"
        );


        // Restart animation.
        void folder.offsetWidth;


        // ========================================================
        // CORRECT
        // ========================================================

        if (correct) {

            if (
                folder.id ===
                "collateral"
            ) {

                image.src =
                    folderImages
                        .collateral
                        .normal;

            }


            else if (
                folder.id ===
                "nonCollateral"
            ) {

                image.src =
                    folderImages
                        .nonCollateral
                        .normal;

            }


            folder.classList.add(
                "correctDrop"
            );

        }


        // ========================================================
        // WRONG
        // ========================================================

        else {

            if (
                folder.id ===
                "collateral"
            ) {

                image.src =
                    folderImages
                        .collateral
                        .wrong;

            }


            else if (
                folder.id ===
                "nonCollateral"
            ) {

                image.src =
                    folderImages
                        .nonCollateral
                        .wrong;

            }


            folder.classList.add(
                "wrongDrop"
            );

        }


        // Restore normal folder after 900ms.
        setTimeout(
            () => {

                folder.classList.remove(
                    "correctDrop",
                    "wrongDrop"
                );


                if (
                    folder.id ===
                    "collateral"
                ) {

                    image.src =
                        folderImages
                            .collateral
                            .normal;

                }


                else if (
                    folder.id ===
                    "nonCollateral"
                ) {

                    image.src =
                        folderImages
                            .nonCollateral
                            .normal;

                }

            },
            900
        );

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

    function playSound(
        sound
    ) {

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

    function createConfetti() {

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


            if (confettiContainer) {

                confettiContainer.appendChild(
                    piece
                );

            }


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

        if (!gameRunning) {
            return;
        }


        gameRunning = false;


        // Stop timer.
        clearInterval(timer);

        timer = null;


        // Stop conveyor.
        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;


        // Stop pending replacements.
        replacementTimers.forEach(
            timerId => clearTimeout(timerId)
        );

        replacementTimers = [];


        // Update final score.
        if (finalScore) {

            finalScore.textContent =
                `Your Score: ${score} / ${assets.length}`;

        }


        // Hide game.
        gameScreen.style.display =
            "none";


        // Show game over.
        gameOver.style.display =
            "flex";


        playSound(
            gameOverSound
        );

    }


    // ============================================================
    // INITIAL STATE
    // ============================================================

    resetGame();

});