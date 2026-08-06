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

let currentCard = 0;

let score = 0;

let lives = 3;

let time = 40;

let timer = null;

let isMoving = false;


// =====================================================
// START GAME
// =====================================================

startButton.addEventListener("click", startGame);


function startGame() {

    console.log("Start clicked");

    currentCard = 0;

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

    console.log("Drawing belt");

    belt.innerHTML = "";

    belt.style.transition = "none";

    belt.style.transform = "translateX(0)";


    for (let i = 0; i < 5; i++) {

        const assetIndex = currentCard + i;

        const item = assets[assetIndex];


        // No more cards

        if (!item) {

            break;

        }


        const slot = document.createElement("div");
        slot.className = "slot";
        
        const card = document.createElement("div");
        card.className = "assetCard";

        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cardTitle">${item.name}</div>
        `;

        slot.appendChild(card);
        belt.appendChild(slot);


        // ONLY the first card is draggable

        if (i === 0) {

            card.classList.add("currentAsset");

            card.draggable = true;

            card.dataset.category = item.category;

            card.addEventListener(
                "dragstart",
                dragStart
            );

        }

        else {

            card.draggable = false;

            card.classList.add("previewAsset");

        }

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

    const category =
        event.currentTarget.dataset.category;


    event.dataTransfer.setData(
        "text/plain",
        category
    );


    event.dataTransfer.effectAllowed = "move";

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
        event.dataTransfer.getData("text/plain");


    const chosenCategory =
        this.dataset.category;


    if (answer === chosenCategory) {

        correct(this);

    }

    else {

        wrong();

    }

}

// =====================================================
// CORRECT ANSWER
// =====================================================

function correct(folder) {

    if (isMoving) {

        return;

    }


    isMoving = true;


    // Bounce correct folder

    folder.classList.add("bounce");


    // Message

    showMessage(
        "✔ Correct",
        "#5CFF5C"
    );


    // Confetti

    confetti();


    // Increase score

    score++;


    scoreDisplay.innerHTML =
        score + " / " + assets.length;


    setTimeout(() => {

        folder.classList.remove("bounce");

    }, 400);


    // Move film strip

    moveBelt();

}

// =====================================================
// WRONG ANSWER
// =====================================================

function wrong() {

    if (isMoving) {

        return;

    }


    isMoving = true;


    const card =
        document.querySelector(".currentAsset");


    if (card) {

        card.classList.add("shake");

    }


    showMessage(
        "✖ Wrong",
        "#FF4444"
    );


    lives--;


    livesDisplay.innerHTML =
        "❤️".repeat(lives);


    if (lives <= 0) {

        setTimeout(() => {

            finishGame();

        }, 500);

        return;

    }


    setTimeout(() => {

        moveBelt();

    }, 400);

}

// =====================================================
// MOVE FILM STRIP
// =====================================================

function moveBelt() {

    const firstCard =
        belt.querySelector(".assetCard");


    if (!firstCard) {

        finishGame();

        return;

    }


    const cardWidth =
        firstCard.offsetWidth;


    const beltStyle =
        window.getComputedStyle(belt);


    const gap =
        parseFloat(beltStyle.gap) || 0;


    const moveDistance =
        cardWidth + gap;


    // Turn animation on

    belt.style.transition =
        "transform 0.45s ease";


    // Move entire train left

    const movingConveyor =
    document.getElementById("movingConveyor");

    movingConveyor.style.transform =
    `translateX(-${moveDistance}px)`;


    setTimeout(() => {

        currentCard++;


        // Finished all cards

        if (currentCard >= assets.length) {

            finishGame();

            return;

        }


        // Rebuild belt

        drawBelt();


        isMoving = false;

    }, 450);

}

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


    belt.innerHTML = "";


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