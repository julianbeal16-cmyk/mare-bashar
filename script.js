// ========== تهيئة اللعبة ==========
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// إعداد حجم اللعبة للهاتف الأفقي
function setupCanvas() {
    const isMobile = window.innerWidth <= 768;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.7; // 70% من الشاشة للعبة
}
setupCanvas();
window.addEventListener('resize', setupCanvas);

// ========== تحميل الصور ==========
const images = {
    player: new Image(),
    bg: new Image(),
    ground: new Image(),
    coin: new Image(),
    enemy: new Image()
};

// المسارات النسبية (اضبطها حسب موقع ملفاتك)
images.player.src = 'assets/character.png';  // صورتك هنا
images.bg.src = 'assets/bg.png';
images.ground.src = 'assets/ground.png';

// صور افتراضية إذا لم توجد الصور
images.player.onerror = () => {
    images.player.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA0MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNjAiIGZpbGw9IiNFNzRDM0MiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzJDM0U1MCIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjUiIHI9IjUiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=';
};

images.bg.onerror = () => {
    // خلفية افتراضية
    images.bg.loaded = false;
};

images.ground.onerror = () => {
    images.ground.loaded = false;
};

// ========== العناصر الأساسية ==========
const player = {
    x: 100,
    y: 300,
    width: 40,
    height: 60,
    speed: 8,
    velX: 0,
    velY: 0,
    jumpPower: -20,
    grounded: false,
    facingRight: true,
    isJumping: false
};

// الأرض والمنصات
const ground = {
    y: canvas.height - 50,
    height: 50
};

const platforms = [
    { x: 300, y: 250, width: 150, height: 20 },
    { x: 600, y: 200, width: 150, height: 20 },
    { x: 900, y: 150, width: 150, height: 20 },
    { x: 1200, y: 300, width: 200, height: 20 }
];

// العملات
const coins = [];
for (let i = 0; i < 20; i++) {
    coins.push({
        x: 200 + i * 150,
        y: 100 + Math.random() * 200,
        collected: false,
        radius: 10
    });
}

// متغيرات اللعبة
let gameState = {
    score: 0,
    lives: 3,
    timeLeft: 120,
    gameRunning: true,
    paused: false,
    gameOver: false
};

// الكاميرا
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

// ========== التحكم ==========
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        jump();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// أزرار الشاشة
document.getElementById('leftBtn').addEventListener('touchstart', () => keys['ArrowLeft'] = true);
document.getElementById('leftBtn').addEventListener('touchend', () => keys['ArrowLeft'] = false);
document.getElementById('leftBtn').addEventListener('mousedown', () => keys['ArrowLeft'] = true);
document.getElementById('leftBtn').addEventListener('mouseup', () => keys['ArrowLeft'] = false);

document.getElementById('rightBtn').addEventListener('touchstart', () => keys['ArrowRight'] = true);
document.getElementById('rightBtn').addEventListener('touchend', () => keys['ArrowRight'] = false);
document.getElementById('rightBtn').addEventListener('mousedown', () => keys['ArrowRight'] = true);
document.getElementById('rightBtn').addEventListener('mouseup', () => keys['ArrowRight'] = false);

document.getElementById('jumpBtn').addEventListener('touchstart', jump);
document.getElementById('jumpBtn').addEventListener('mousedown', jump);

// زر القفز
function jump() {
    if (player.grounded && gameState.gameRunning && !gameState.paused) {
        player.velY = player.jumpPower;
        player.grounded = false;
        player.isJumping = true;
    }
}

// ========== إدارة واجهة اللعبة ==========
const elements = {
    score: document.getElementById('score'),
    lives: document.getElementById('lives'),
    timer: document.getElementById('timer'),
    pauseBtn: document.getElementById('pauseBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    pauseMenu: document.getElementById('pauseMenu'),
    gameOverMenu: document.getElementById('gameOverMenu'),
    finalScore: document.getElementById('finalScore'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    soundBtn: document.getElementById('soundBtn')
};

// أحداث الأزرار
elements.pauseBtn.addEventListener('click', togglePause);
elements.resumeBtn.addEventListener('click', togglePause);
elements.restartBtn.addEventListener('click', resetGame);
elements.playAgainBtn.addEventListener('click', resetGame);
elements.soundBtn.addEventListener('click', toggleSound);

function togglePause() {
    gameState.paused = !gameState.paused;
    elements.pauseMenu.classList.toggle('hidden', !gameState.paused);
}

function resetGame() {
    gameState = {
        score: 0,
        lives: 3,
        timeLeft: 120,
        gameRunning: true,
        paused: false,
        gameOver: false
    };
    
    player.x = 100;
    player.y = 300;
    player.velX = 0;
    player.velY = 0;
    player.grounded = true;
    
    coins.forEach(coin => coin.collected = false);
    
    updateUI();
    elements.pauseMenu.classList.add('hidden');
    elements.gameOverMenu.classList.add('hidden');
}

function toggleSound() {
    // إدارة الصوت (يمكن إضافة صوت لاحقاً)
    const isOn = elements.soundBtn.textContent.includes('تشغيل');
    elements.soundBtn.textContent = isOn ? '🔇 صوت: إيقاف' : '🔊 صوت: تشغيل';
}

function updateUI() {
    elements.score.textContent = gameState.score;
    elements.lives.textContent = gameState.lives;
    elements.timer.textContent = Math.floor(gameState.timeLeft);
}

// ========== فيزياء اللعبة ==========
function updatePlayer() {
    if (!gameState.gameRunning || gameState.paused) return;
    
    // الحركة الأفقية
    player.velX = 0;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.velX = -player.speed;
        player.facingRight = false;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.velX = player.speed;
        player.facingRight = true;
    }
    
    // الجاذبية
    player.velY += 1.5;
    if (player.velY > 15) player.velY = 15;
    
    // الحركة
    player.x += player.velX;
    player.y += player.velY;
    
    // منع الخروج عن الحافة اليسرى
    if (player.x < 0) player.x = 0;
    
    // تصادم مع الأرض
    if (player.y + player.height > ground.y) {
        player.y = ground.y - player.height;
        player.velY = 0;
        player.grounded = true;
        player.isJumping = false;
    }
    
    // تصادم مع المنصات
    player.grounded = false;
    for (const platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + player.velY &&
            player.velY > 0) {
            
            player.y = platform.y - player.height;
            player.velY = 0;
            player.grounded = true;
            player.isJumping = false;
        }
    }
    
    // جمع العملات
    coins.forEach(coin => {
        if (!coin.collected) {
            const dx = player.x + player.width/2 - (coin.x - camera.x);
            const dy = player.y + player.height/2 - (coin.y - camera.y);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < player.width/2 + coin.radius) {
                coin.collected = true;
                gameState.score += 100;
                updateUI();
            }
        }
    });
    
    // تحديث الكاميرا
    camera.x = player.x - canvas.width/2 + player.width/2;
    if (camera.x < 0) camera.x = 0;
}

// ========== الرسم ==========
function draw() {
    // مسح الشاشة
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // الخلفية
    if (images.bg.loaded !== false) {
        ctx.drawImage(images.bg, -camera.x * 0.5, 0, canvas.width, canvas.height);
    } else {
        // خلفية افتراضية
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // سحب بسيطة
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 5; i++) {
            const x = (i * 200 - camera.x * 0.3) % (canvas.width + 200);
            ctx.beginPath();
            ctx.arc(x, 50, 30, 0, Math.PI * 2);
            ctx.arc(x + 40, 50, 40, 0, Math.PI * 2);
            ctx.arc(x + 90, 50, 30, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // الأرض
    if (images.ground.loaded !== false) {
        const groundTiles = Math.ceil(canvas.width / 100) + 1;
        for (let i = 0; i < groundTiles; i++) {
            ctx.drawImage(
                images.ground,
                i * 100 - camera.x % 100,
                ground.y,
                100,
                ground.height
            );
        }
    } else {
        // أرض افتراضية
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, ground.y, canvas.width, ground.height);
        
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.fillRect(i - camera.x % 40, ground.y, 20, 10);
        }
    }
    
    // المنصات
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
        if (platform.x - camera.x > -100 && platform.x - camera.x < canvas.width + 100) {
            ctx.fillRect(
                platform.x - camera.x,
                platform.y,
                platform.width,
                platform.height
            );
            
            // تفاصيل المنصة
            ctx.fillStyle = '#A0522D';
            for (let i = 0; i < platform.width; i += 20) {
                ctx.fillRect(
                    platform.x - camera.x + i,
                    platform.y,
                    10,
                    5
                );
            }
            ctx.fillStyle = '#8B4513';
        }
    });
    
    // العملات
    coins.forEach(coin => {
        if (!coin.collected && coin.x - camera.x > -50 && coin.x - camera.x < canvas.width + 50) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x - camera.x, coin.y, coin.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(coin.x - camera.x, coin.y, coin.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            // تأثير بريق
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(coin.x - camera.x - 3, coin.y - 3, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // الشخصية
    if (images.player.complete) {
        // قلب الصورة إذا تحرك لليسار
        if (!player.facingRight) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(
                images.player,
                -(player.x - camera.x + player.width),
                player.y,
                player.width,
                player.height
            );
            ctx.restore();
        } else {
            ctx.drawImage(
                images.player,
                player.x - camera.x,
                player.y,
                player.width,
                player.height
            );
        }
    } else {
        // رسم افتراضي
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(player.x - camera.x, player.y, player.width, player.height);
        
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(player.x - camera.x + 10, player.y + 10, 20, 20);
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(player.x - camera.x + 20, player.y + 25, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // تأثير القفز
    if (player.isJumping) {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.beginPath();
        ctx.arc(
            player.x - camera.x + player.width/2,
            player.y + player.height,
            15,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

// ========== دورة اللعبة ==========
let lastTime = 0;
let coinSpawnTime = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime || 0;
    lastTime = timestamp;
    
    if (!gameState.paused && gameState.gameRunning) {
        updatePlayer();
        
        // تحديث المؤقت
        if (timestamp - coinSpawnTime > 1000) {
            gameState.timeLeft--;
            coinSpawnTime = timestamp;
            updateUI();
            
            if (gameState.timeLeft <= 0) {
                endGame(false);
            }
        }
    }
    
    draw();
    
    // الفحص المستمر للنهاية
    if (player.y > canvas.height + 100) {
        gameState.lives--;
        updateUI();
        
        if (gameState.lives <= 0) {
            endGame(false);
        } else {
            player.x = camera.x + 100;
            player.y = 300;
            player.velY = 0;
        }
    }
    
    if (gameState.gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function endGame(isWin) {
    gameState.gameRunning = false;
    gameState.gameOver = true;
    
    elements.finalScore.textContent = gameState.score;
    elements.gameOverTitle.textContent = isWin ? '🎉 فزت! 🎉' : '💀 انتهت اللعبة';
    elements.gameOverTitle.style.color = isWin ? '#2ECC71' : '#E74C3C';
    elements.gameOverMenu.classList.remove('hidden');
}

// ========== بدء اللعبة ==========
// تهيئة الصور قبل البدء
let imagesLoaded = 0;
const totalImages = Object.keys(images).length;

function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded >= totalImages) {
        startGame();
    }
}

Object.values(images).forEach(img => {
    img.onload = checkImagesLoaded;
    img.onerror = checkImagesLoaded;
});

function startGame() {
    updateUI();
    gameLoop();
    console.log('🚀 اللعبة بدأت!');
    
    // بدء المؤقت
    setInterval(() => {
        if (gameState.gameRunning && !gameState.paused) {
            gameState.timeLeft--;
            updateUI();
            
            if (gameState.timeLeft <= 0) {
                endGame(false);
            }
        }
    }, 1000);
}

// بدء اللعبة فور تحميل الصفحة
window.addEventListener('load', () => {
    setTimeout(startGame, 500);
});

// إعادة الحجم عند تدوير الهاتف
window.addEventListener('orientationchange', () => {
    setTimeout(setupCanvas, 100);
});
