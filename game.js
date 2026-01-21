// 🎮 اللعبة الكاملة - تعمل 100%

'use strict';

const Game = {
    // العناصر
    canvas: null,
    ctx: null,
    state: 'menu',
    
    // الإحصائيات
    score: 0,
    bestScore: 0,
    lives: 3,
    timeLeft: 120,
    coinsCollected: 0,
    totalCoins: 15,
    enemiesKilled: 0,
    
    // المؤقتات
    gameTimer: null,
    animationId: null,
    lastTime: 0,
    
    // العناصر
    player: null,
    platforms: [],
    coins: [],
    enemies: [],
    castle: null,
    camera: { x: 0, y: 0 },
    worldWidth: 2000,
    
    // التحكم
    keys: {},
    touchControls: {
        left: false,
        right: false,
        jump: false
    },
    
    // الصوت
    soundEnabled: true,
    
    // التهيئة
    init() {
        console.log('🎮 بدء اللعبة...');
        
        // الحصول على العناصر
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.canvas) {
            console.error('❌ لم يتم العثور على Canvas');
            return;
        }
        
        // ضبط الحجم
        this.resizeCanvas();
        
        // تحميل أفضل نتيجة
        this.loadBestScore();
        
        // إعداد الأحداث
        this.setupEvents();
        
        // تهيئة اللعبة
        this.state = 'menu';
        
        console.log('✅ اللعبة جاهزة!');
    },
    
    resizeCanvas() {
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen && this.canvas) {
            const width = gameScreen.clientWidth;
            const height = gameScreen.clientHeight - 70; // ناقص الهيدر
            
            this.canvas.width = width;
            this.canvas.height = height;
            
            console.log('📏 حجم Canvas:', width, 'x', height);
        }
    },
    
    loadBestScore() {
        try {
            const saved = localStorage.getItem('mario_best_score');
            this.bestScore = saved ? parseInt(saved) : 0;
            document.getElementById('best-score').textContent = this.bestScore;
        } catch (e) {
            console.log('⚠️ لا يمكن تحميل أفضل نتيجة');
        }
    },
    
    setupEvents() {
        // أزرار البدء
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.showScreen('start');
        });
        
        document.getElementById('help-btn').addEventListener('click', () => {
            document.getElementById('instructions').style.display = 'flex';
        });
        
        document.getElementById('close-help').addEventListener('click', () => {
            document.getElementById('instructions').style.display = 'none';
        });
        
        // أزرار اللعبة
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('sound-btn').addEventListener('click', () => {
            this.toggleSound();
        });
        
        // التحكم باللمس
        document.getElementById('left-btn').addEventListener('touchstart', (e) => {
            this.touchControls.left = true;
            e.preventDefault();
        });
        
        document.getElementById('left-btn').addEventListener('touchend', (e) => {
            this.touchControls.left = false;
            e.preventDefault();
        });
        
        document.getElementById('right-btn').addEventListener('touchstart', (e) => {
            this.touchControls.right = true;
            e.preventDefault();
        });
        
        document.getElementById('right-btn').addEventListener('touchend', (e) => {
            this.touchControls.right = false;
            e.preventDefault();
        });
        
        document.getElementById('jump-btn').addEventListener('touchstart', (e) => {
            this.touchControls.jump = true;
            e.preventDefault();
        });
        
        document.getElementById('jump-btn').addEventListener('touchend', (e) => {
            this.touchControls.jump = false;
            e.preventDefault();
        });
        
        // لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            if (['arrowleft', 'arrowright', ' '].includes(key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // تغيير الحجم
        window.addEventListener('resize', () => this.resizeCanvas());
    },
    
    // بدء اللعبة
    startGame() {
        console.log('🚀 بدء اللعبة...');
        
        // إعادة تعيين
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coinsCollected = 0;
        this.enemiesKilled = 0;
        this.camera = { x: 0, y: 0 };
        
        // إنشاء العالم
        this.createWorld();
        
        // تحديث الواجهة
        this.updateUI();
        
        // الانتقال للعبة
        this.showScreen('game');
        
        // بدء المؤقت
        this.startTimer();
        
        // بدء الحلقة
        this.startGameLoop();
    },
    
    createWorld() {
        const canvas = this.canvas;
        const groundY = canvas.height - 80;
        
        // اللاعب
        this.player = {
            x: 100,
            y: groundY - 150,
            width: 40,
            height: 60,
            speed: 5,
            velX: 0,
            velY: 0,
            jumpPower: -12,
            gravity: 0.6,
            grounded: false,
            facingRight: true,
            color: '#E74C3C'
        };
        
        // الأرض
        this.platforms = [
            {
                x: 0,
                y: groundY,
                width: this.worldWidth,
                height: 80,
                color: '#8B4513'
            }
        ];
        
        // منصات إضافية
        const platforms = [
            { x: 300, y: groundY - 100, width: 150 },
            { x: 600, y: groundY - 120, width: 140 },
            { x: 900, y: groundY - 90, width: 160 },
            { x: 1200, y: groundY - 110, width: 150 },
            { x: 1500, y: groundY - 130, width: 170 }
        ];
        
        platforms.forEach(p => {
            this.platforms.push({
                x: p.x,
                y: p.y,
                width: p.width,
                height: 20,
                color: '#A0522D'
            });
        });
        
        // العملات
        this.coins = [];
        for (let i = 0; i < this.totalCoins; i++) {
            const platform = this.platforms[Math.floor(Math.random() * (this.platforms.length - 1)) + 1];
            this.coins.push({
                x: platform.x + Math.random() * (platform.width - 30) + 15,
                y: platform.y - 30,
                collected: false,
                radius: 8,
                animation: Math.random() * Math.PI * 2
            });
        }
        
        // الأعداء
        this.enemies = [];
        for (let i = 0; i < 5; i++) {
            this.enemies.push({
                x: 400 + i * 300,
                y: groundY - 40,
                width: 35,
                height: 35,
                speed: 1 + Math.random(),
                direction: Math.random() > 0.5 ? 1 : -1,
                color: '#FF6B6B',
                active: true
            });
        }
        
        // القصر
        this.castle = {
            x: this.worldWidth - 300,
            y: groundY - 180,
            width: 200,
            height: 160,
            color: '#8B4513',
            reached: false
        };
    },
    
    // حلقة اللعبة
    startGameLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.lastTime = performance.now();
        this.gameLoop();
    },
    
    gameLoop(currentTime = 0) {
        if (this.state !== 'playing') return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // التحديث
        this.update(deltaTime);
        
        // الرسم
        this.draw();
        
        // الاستمرار
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    },
    
    update(deltaTime) {
        if (!this.player) return;
        
        // تحديث اللاعب
        this.updatePlayer(deltaTime);
        
        // تحديث الأعداء
        this.updateEnemies(deltaTime);
        
        // تحديث الكاميرا
        this.updateCamera();
        
        // التصادمات
        this.checkCollisions();
        
        // نهاية اللعبة
        this.checkGameEnd();
    },
    
    updatePlayer(deltaTime) {
        const player = this.player;
        
        // الحركة
        player.velX = 0;
        
        if (this.keys['arrowleft'] || this.touchControls.left) {
            player.velX = -player.speed;
            player.facingRight = false;
        }
        
        if (this.keys['arrowright'] || this.touchControls.right) {
            player.velX = player.speed;
            player.facingRight = true;
        }
        
        // القفز
        if ((this.keys[' '] || this.touchControls.jump) && player.grounded) {
            player.velY = player.jumpPower;
            player.grounded = false;
        }
        
        // الجاذبية
        player.velY += player.gravity;
        player.velY = Math.min(player.velY, 15);
        
        // الحركة
        player.x += player.velX * 60 * deltaTime;
        player.y += player.velY * 60 * deltaTime;
        
        // حدود العالم
        player.x = Math.max(0, Math.min(this.worldWidth - player.width, player.x));
        
        // تصادم مع المنصات
        player.grounded = false;
        
        for (const platform of this.platforms) {
            if (player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y + player.height > platform.y &&
                player.y + player.height < platform.y + platform.height + 5 &&
                player.velY > 0) {
                
                player.y = platform.y - player.height;
                player.velY = 0;
                player.grounded = true;
                break;
            }
        }
        
        // السقوط
        if (player.y > this.canvas.height + 100) {
            this.playerHit('💀 سقوط!');
            player.x = 100;
            player.y = 100;
            player.velY = 0;
        }
    },
    
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            enemy.x += enemy.speed * enemy.direction * 60 * deltaTime;
            
            if (enemy.x < 50 || enemy.x > this.worldWidth - enemy.width - 50) {
                enemy.direction *= -1;
            }
        });
    },
    
    updateCamera() {
        if (!this.player) return;
        
        const targetX = this.player.x - this.canvas.width / 3;
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.x = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.camera.x));
    },
    
    checkCollisions() {
        const player = this.player;
        
        // العملات
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const dx = player.x + player.width/2 - coin.x;
                const dy = player.y + player.height/2 - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 20) {
                    coin.collected = true;
                    this.coinsCollected++;
                    this.score += 100;
                    this.updateUI();
                }
            }
        });
        
        // الأعداء
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {
                
                if (player.velY > 0 && player.y + player.height < enemy.y + enemy.height/2) {
                    // قفز على العدو
                    enemy.active = false;
                    this.score += 200;
                    this.enemiesKilled++;
                    player.velY = -8;
                    this.updateUI();
                } else {
                    // اصطدام
                    this.playerHit('👾 اصطدام!');
                }
            }
        });
        
        // القصر
        if (this.castle && !this.castle.reached && this.coinsCollected >= this.totalCoins) {
            const dx = player.x - (this.castle.x + this.castle.width/2);
            const dy = player.y - (this.castle.y + this.castle.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                this.castle.reached = true;
                this.endGame(true, '🏰 فوز!');
            }
        }
    },
    
    playerHit(message) {
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.endGame(false, '💔 خسارة!');
        } else {
            this.player.velY = -8;
            this.player.x -= 30 * (this.player.facingRight ? 1 : -1);
        }
    },
    
    checkGameEnd() {
        if (this.timeLeft <= 0) {
            this.endGame(false, '⏰ انتهى الوقت!');
        }
    },
    
    // الرسم
    draw() {
        if (!this.canvas || !this.ctx || !this.player) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // مسح الشاشة
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // تطبيق الكاميرا
        ctx.save();
        ctx.translate(-this.camera.x, 0);
        
        // الخلفية
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, this.worldWidth, canvas.height);
        
        // سحب
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 4; i++) {
            const x = (this.camera.x * 0.1 + i * 300) % 2300;
            ctx.beginPath();
            ctx.arc(x, 40, 15, 0, Math.PI * 2);
            ctx.arc(x + 20, 35, 12, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // المنصات
        this.platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let i = 0; i < platform.width; i += 30) {
                ctx.fillRect(platform.x + i, platform.y, 25, 4);
            }
        });
        
        // العملات
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.animation += 0.1;
                const y = coin.y + Math.sin(coin.animation) * 5;
                
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(coin.x, y, coin.radius, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(coin.x - 2, y - 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // الأعداء
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 8, enemy.y + 8, 6, 6);
            ctx.fillRect(enemy.x + enemy.width - 14, enemy.y + 8, 6, 6);
            
            ctx.fillRect(enemy.x + 10, enemy.y + 22, enemy.width - 20, 4);
        });
        
        // القصر
        if (this.castle) {
            ctx.fillStyle = this.castle.color;
            ctx.fillRect(this.castle.x, this.castle.y, this.castle.width, this.castle.height);
            
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.castle.x + 30, this.castle.y + 30, 25, 25);
            ctx.fillRect(this.castle.x + this.castle.width - 55, this.castle.y + 30, 25, 25);
            
            ctx.fillStyle = '#654321';
            ctx.fillRect(this.castle.x + this.castle.width/2 - 25, this.castle.y + this.castle.height - 40, 50, 40);
        }
        
        // اللاعب
        this.drawPlayer();
        
        // استعادة الحالة
        ctx.restore();
    },
    
    drawPlayer() {
        const ctx = this.ctx;
        const player = this.player;
        
        // الجسم
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // الرأس
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(player.x + 8, player.y + 8, 25, 25);
        
        // العيون
        const eyeOffset = player.facingRight ? 0 : 3;
        ctx.fillStyle = '#FFF';
        ctx.fillRect(player.x + 12 + eyeOffset, player.y + 12, 6, 6);
        ctx.fillRect(player.x + 22 + eyeOffset, player.y + 12, 6, 6);
        
        // الفم
        ctx.fillStyle = '#FFF';
        ctx.fillRect(player.x + 14, player.y + 26, 10, 4);
    },
    
    // المؤقت
    startTimer() {
        if (this.gameTimer) clearInterval(this.gameTimer);
        
        this.gameTimer = setInterval(() => {
            if (this.state === 'playing') {
                this.timeLeft--;
                this.updateUI();
                
                if (this.timeLeft <= 0) {
                    this.endGame(false, '⏰ انتهى الوقت!');
                }
            }
        }, 1000);
    },
    
    // تحديث الواجهة
    updateUI() {
        // الوقت
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // النقاط
        document.getElementById('score').textContent = this.score;
        
        // الأرواح
        document.getElementById('lives').textContent = this.lives;
        
        // العملات
        document.getElementById('coins').textContent = `${this.coinsCollected}/${this.totalCoins}`;
        
        // رسالة المهمة
        const mission = document.getElementById('mission-text');
        if (mission) {
            if (this.coinsCollected < this.totalCoins) {
                mission.textContent = `اجمع ${this.totalCoins - this.coinsCollected} عملة أخرى!`;
            } else {
                mission.textContent = '🏃‍♂️ تقدم نحو القصر!';
            }
        }
    },
    
    // نهاية اللعبة
    endGame(isWin, message) {
        this.state = 'gameOver';
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // حفظ أفضل نتيجة
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('mario_best_score', this.bestScore.toString());
        }
        
        // تحديث شاشة النهاية
        const icon = document.getElementById('result-icon');
        const title = document.getElementById('end-title');
        const msg = document.getElementById('end-message');
        
        if (icon) icon.textContent = isWin ? '🏆' : '💔';
        if (title) title.textContent = isWin ? '🎉 انتصار!' : '💔 انتهت اللعبة';
        if (msg) msg.textContent = message;
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-coins').textContent = `${this.coinsCollected}/${this.totalCoins}`;
        document.getElementById('final-enemies').textContent = this.enemiesKilled;
        
        // الانتقال لشاشة النهاية
        this.showScreen('end');
    },
    
    // وظائف مساعدة
    showScreen(screenId) {
        // إخفاء كل الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });
        
        // إظهار الشاشة المطلوبة
        const screen = document.getElementById(screenId + '-screen');
        if (screen) {
            screen.classList.add('active');
            screen.style.display = 'block';
            this.state = screenId === 'game' ? 'playing' : screenId;
        }
    },
    
    togglePause() {
        const btn = document.getElementById('pause-btn');
        
        if (this.state === 'playing') {
            this.state = 'paused';
            if (this.gameTimer) clearInterval(this.gameTimer);
            if (this.animationId) cancelAnimationFrame(this.animationId);
            btn.textContent = '▶️';
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.startTimer();
            this.startGameLoop();
            btn.textContent = '⏸️';
        }
    },
    
    toggleSound() {
        const btn = document.getElementById('sound-btn');
        this.soundEnabled = !this.soundEnabled;
        btn.textContent = this.soundEnabled ? '🔊' : '🔇';
    },
    
    restartGame() {
        this.showScreen('start');
        setTimeout(() => this.startGame(), 500);
    }
};

// بدء اللعبة عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 تحميل اللعبة...');
    
    // بدء اللعبة بعد ثانية
    setTimeout(() => {
        Game.init();
        console.log('✅ اللعبة محملة وجاهزة!');
    }, 1000);
});
