// =====================================================
// ELEMENTS
// =====================================================

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

const folders = document.querySelectorAll(".folder");


// =====================================================
// ASSETS
// =====================================================

const assets = [

    {
        name: "Crops",
        image: "images/crops.jpg",
        category: "Collateralised"
    },

    {
        name: "Jewellery",
        image: "images/jewellery.jpg",
        category: "Collateralised"
    },

    {
        name: "Motor Vehicle",
        image: "images/vehicle.jpg",
        category: "Collateralised"
    },

    {
        name: "Life Insurance",
        image: "images/insurance.jpg",
        category: "Non-Collateralised"
    },

    {
        name: "Fixed Deposit",
        image: "images/deposit.jpg",
        category: "Non-Collateralised"
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

let isMoving = false;


// =====================================================
// START GAME
// =====================================================

startButton.addEventListener("click", startGame);

function shuffleAssets(array) {

    return [...array].sort(
        () => Math.random() - 0.5
    );

}


function startGame() {

    console.log("Start clicked");

    activeAssets = shuffleAssets(assets);

    score = 0;

    lives = 3;

    time = 40;

    isMoving = false;


    // Hide screens

    startScreen.style.display = "none";

    gameOver.style.display = "none";


    // Show game

    gameScreen.style.display = "block";


    // Reset displays

    scoreDisplay.innerHTML =
        score + " / " + assets.length;

    livesDisplay.innerHTML =
        "❤️".repeat(lives);

    timerDisplay.innerHTML =
        "⏱ " + time;


    // Draw cards

    drawBelt();

    belt.style.transition = "none";
    
    belt.style.transform = "translateX(0)";

    // Start countdown

    startTimer();

}


// =====================================================
// DRAW FILM STRIP
// =====================================================

function drawBelt() {

    const slots =
        document.querySelectorAll(".slot");

    // Clear the five slots
    slots.forEach(slot => {
        slot.innerHTML = "";
    });

    // Put active assets into the slots
    for (let i = 0; i < slots.length; i++) {

        const item = activeAssets[i];

        if (!item) {
            continue;
        }

        const card =
            document.createElement("div");

        card.className = "assetCard";

        card.draggable = true;

        card.dataset.index = i;

        card.dataset.category =
            item.category;

        card.innerHTML = `
            <img
                src="${item.image}"
                alt="${item.name}"
            >

            <div class="cardTitle">
                ${item.name}
            </div>
        `;

        card.addEventListener(
            "dragstart",
            dragStart
        );

        slots[i].appendChild(card);
    }

}



// =====================================================
// DRAG START
// =====================================================

function dragStart(event) {

    if (isMoving) {

        event.preventDefault();

        return;
    }

    const card =
        event.currentTarget;

    const category =
        card.dataset.category;

    const index =
        card.dataset.index;

    event.dataTransfer.setData(
        "category",
        category
    );

    event.dataTransfer.setData(
        "index",
        index
    );

    event.dataTransfer.effectAllowed =
        "move";

}

// =====================================================
// FOLDER EVENTS
// =====================================================

folders.forEach(folder => {

    folder.addEventListener(
        "dragover",
        function(event) {

            event.preventDefault();

            event.dataTransfer.dropEffect = "move";

        }
    );


    folder.addEventListener(
        "dragenter",
        function(event) {

            event.preventDefault();

            this.classList.add("active");

        }
    );


    folder.addEventListener(
        "dragleave",
        function() {

            this.classList.remove("active");

        }
    );


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

    if (isMoving) {
        return;
    }

    this.classList.remove("active");

    const answer =
        event.dataTransfer.getData(
            "category"
        );

    const assetIndex =
        Number(
            event.dataTransfer.getData(
                "index"
            )
        );

    const chosenCategory =
        this.dataset.category;

    if (answer === chosenCategory) {

        correct(
            assetIndex,
            this
        );


    }
    else {

        wrong();

    }

}

function removeAsset(index) {

    activeAssets.splice(index, 1);

    // All assets have been sorted
    if (activeAssets.length === 0) {

        clearInterval(timer);

        isMoving = true;

        finishGame();

        return;

    }

    // There are still assets remaining
    drawBelt();

    isMoving = false;

}

// =====================================================
// CORRECT ANSWER
// =====================================================

function correct(assetIndex, folder) {

    if (isMoving) {
        return;
    }

    isMoving = true;

    folder.classList.add("bounce");

    showMessage(
        "✔ Correct",
        "#5CFF5C"
    );

    confetti();

    score++;

    scoreDisplay.innerHTML =
        score + " / " + assets.length;

    setTimeout(() => {

        folder.classList.remove(
            "bounce"
        );

    }, 400);

    setTimeout(() => {

        removeAsset(assetIndex);

    }, 450);

}

// =====================================================
// WRONG ANSWER
// =====================================================

function wrong() {

    if (isMoving) {
        return;
    }

    const card =
        document.querySelector(
            ".assetCard.shake"
        );

    showMessage(
        "✖ Wrong",
        "#FF4444"
    );

    lives--;

    livesDisplay.innerHTML =
        "❤️".repeat(lives);

    if (lives <= 0) {

        finishGame();

        return;
    }

}

// =====================================================
// MOVE FILM STRIP
// =====================================================

// =====================================================
// MESSAGE
// =====================================================

function showMessage(text, color) {

    const message =
        document.getElementById("message");


    message.innerHTML = text;

    message.style.color = color;


    // Restart animation

    message.classList.remove("popup");

    void message.offsetWidth;

    message.classList.add("popup");


    setTimeout(() => {

        message.classList.remove("popup");

    }, 800);

}

// =====================================================
// CONFETTI
// =====================================================

function confetti() {

    for (let i = 0; i < 25; i++) {

        const piece =
            document.createElement("div");


        piece.classList.add("piece");


        piece.style.left =
            Math.random() * 100 + "vw";


        piece.style.background =
            `hsl(${Math.random() * 360}, 100%, 60%)`;


        piece.style.animationDelay =
            Math.random() * 0.3 + "s";


        document.body.appendChild(piece);


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


    timer = setInterval(() => {

        time--;


        timerDisplay.innerHTML =
            "⏱ " + time;


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

    clearInterval(timer);

    isMoving = true;


    let bestScore =
        Number(
            localStorage.getItem("bestScore")
        ) || 0;


    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "bestScore",
            bestScore
        );

    }


    gameScreen.style.display = "none";

    gameOver.style.display = "block";


    finalScore.innerHTML = `

        Your Score : ${score}
        <br>

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


    currentCard = 0;

    score = 0;

    lives = 3;

    time = 40;

    isMoving = false;


    document.querySelectorAll(".slot").forEach(slot=>{
    slot.innerHTML="";
    });


    scoreDisplay.innerHTML =
        "0 / " + assets.length;


    livesDisplay.innerHTML =
        "❤️❤️❤️";


    timerDisplay.innerHTML =
        "⏱ 40";


    gameOver.style.display = "none";

    gameScreen.style.display = "none";

    startScreen.style.display = "block";

}