// تهيئة العناصر
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const endScreen = document.getElementById('endScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const pauseButton = document.getElementById('pauseBtn');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// أزرار التحكم للهاتف
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');

// عناصر العرض
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const livesElement = document.getElementById('lives');
const finalScoreElement = document.getElementById('finalScore');
const endMessageElement = document.getElementById('endMessage');

// إعداد اللعبة
canvas.width = 800;
canvas.height = 450;

let gameRunning = false;
let gamePaused = false;
let score = 0;
let timeLeft = 100;
let lives = 3;
let keys = {};

// الشخصية (سيتم تحميل صورتها لاحقاً)
const player = {
    x: 100,
    y: 300,
    width: 40,
    height: 60,
    speed: 5,
    velY: 0,
    jumping: false,
    grounded: false,
    image: new Image()
};

// 1. استبدل هذا المسار بمسار صورتك الشخصية على GitHub
player.image.src = 'assets/mario.png';

// المنصات (الأرض والعوائق)
const platforms = [
    { x: 0, y: 400, width: 800, height: 50 },
    { x: 200, y: 300, width: 150, height: 20 },
    { x: 500, y: 250, width: 150, height: 20 },
    { x: 300, y: 150, width: 150, height: 20 }
];

// العملات
const coins = [
    { x: 250, y: 270, collected: false },
    { x: 550, y: 220, collected: false },
    { x: 350, y: 120, collected: false },
    { x: 450, y: 120, collected: false }
];

// تحميل الصور
const images = {
    background: new Image(),
    block: new Image()
};

// 2. استبدل هذه المسارات بصورك على GitHub
images.background.src = 'assets/background.png';
images.block.src = 'assets/block.png';

// إدارة لوحة المفاتيح
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// أزرار التحكم للهاتف
leftBtn.addEventListener('touchstart', () => keys['ArrowLeft'] = true);
leftBtn.addEventListener('touchend', () => keys['ArrowLeft'] = false);

rightBtn.addEventListener('touchstart', () => keys['ArrowRight'] = true);
rightBtn.addEventListener('touchend', () => keys['ArrowRight'] = false);

jumpBtn.addEventListener('touchstart', () => {
    if (!player.jumping && player.grounded) {
        player.velY = -15;
        player.jumping = true;
        player.grounded = false;
    }
});

// بدء اللعبة
startButton.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    startGame();
});

restartButton.addEventListener('click', () => {
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    resetGame();
    startGame();
});

pauseButton.addEventListener('click', () => {
    gamePaused = !gamePaused;
    pauseButton.textContent = gamePaused ? 'متابعة' : 'إيقاف مؤقت';
});

function startGame() {
    gameRunning = true;
    gameLoop();
    
    // عداد الوقت
    const timer = setInterval(() => {
        if (!gamePaused && gameRunning) {
            timeLeft--;
            timeElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                endGame(false);
                clearInterval(timer);
            }
        }
    }, 1000);
}

function resetGame() {
    score = 0;
    timeLeft = 100;
    lives = 3;
    
    player.x = 100;
    player.y = 300;
    player.velY = 0;
    player.jumping = false;
    
    coins.forEach(coin => coin.collected = false);
    
    scoreElement.textContent = score;
    timeElement.textContent = timeLeft;
    livesElement.textContent = lives;
}

function gameLoop() {
    if (!gameRunning) return;
    
    if (gamePaused) {
        // رسم شاشة الإيقاف المؤقت
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.fillText('الإيقاف مؤقت', canvas.width/2 - 100, canvas.height/2);
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // تحديث
    updatePlayer();
    updateCoins();
    
    // رسم
    draw();
    
    requestAnimationFrame(gameLoop);
}

function updatePlayer() {
    // الحركة اليمين/يسار
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;
    
    // الجاذبية
    player.velY += 1; // جاذبية
    player.y += player.velY;
    
    // منع الخروج عن الشاشة
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // الاصطدام مع المنصات
    player.grounded = false;
    for (const platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + player.velY) {
            
            player.jumping = false;
            player.grounded = true;
            player.velY = 0;
            player.y = platform.y - player.height;
        }
    }
    
    // السقوط
    if (player.y > canvas.height) {
        lives--;
        livesElement.textContent = lives;
        
        if (lives <= 0) {
            endGame(false);
        } else {
            player.x = 100;
            player.y = 300;
            player.velY = 0;
        }
    }
}

function updateCoins() {
    for (const coin of coins) {
        if (!coin.collected &&
            player.x < coin.x + 20 &&
            player.x + player.width > coin.x &&
            player.y < coin.y + 20 &&
            player.y + player.height > coin.y) {
            
            coin.collected = true;
            score += 100;
            scoreElement.textContent = score;
            
            // فحص الفوز
            if (coins.every(c => c.collected)) {
                endGame(true);
            }
        }
    }
}

function draw() {
    // الخلفية
    if (images.background.complete) {
        ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // المنصات
    for (const platform of platforms) {
        if (images.block.complete) {
            ctx.drawImage(images.block, platform.x, platform.y, platform.width, platform.height);
        } else {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
    }
    
    // العملات
    for (const coin of coins) {
        if (!coin.collected) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x + 10, coin.y + 10, 10, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(coin.x + 10, coin.y + 10, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // الشخصية
    if (player.image.complete) {
        ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
    } else {
        // رسم بديل إذا لم تحمل الصورة
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(player.x + 10, player.y + 10, 20, 20);
    }
    
    // معلومات التصحيح
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 200, 60);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`الموقع: (${Math.round(player.x)}, ${Math.round(player.y)})`, 20, 30);
    ctx.fillText(`السرعة: ${Math.round(player.velY)}`, 20, 50);
    ctx.fillText(`على الأرض: ${player.grounded}`, 20, 70);
}

function endGame(isWin) {
    gameRunning = false;
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    
    if (isWin) {
        endMessageElement.textContent = '!🎉 فزت 🎉';
        endMessageElement.style.color = '#2ecc71';
    } else {
        endMessageElement.textContent = '!💀 انتهت اللعبة 💀';
        endMessageElement.style.color = '#e74c3c';
    }
    
    finalScoreElement.textContent = score;
}

// تأكد من تحميل الصور قبل البدء
window.onload = function() {
    console.log('!اللعبة جاهزة للتحميل');
    
    // إذا فشل تحميل صورة الشخصية، عرض رسالة
    player.image.onerror = function() {
        console.error('تعذر تحميل صورة الشخصية. تأكد من المسار: ' + player.image.src);
        alert('⚠️ لم يتم العثور على صورة الشخصية في assets/mario.png. استبدل الملف أو عدل المسار في script.js');
    };
    
    images.background.onerror = function() {
        console.log('سيتم استخدام لون بديل للخلفية');
    };
};
