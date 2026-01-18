// ============================================
// 🎮 لعبة ماريو الخارقة - النسخة النهائية البسيطة
// ============================================

'use strict';

// نظام اللعبة الرئيسي
const MarioGame = {
    // ======================
    // الإعدادات الأساسية
    // ======================
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
    
    // عناصر اللعبة
    player: null,
    platforms: [],
    coins: [],
    enemies: [],
    castle: null,
    camera: { x: 0, y: 0 },
    
    // التحكم
    keys: {},
    touchControls: {
        left: false,
        right: false,
        jump: false
    },
    
    // الصوت
    soundEnabled: true,
    
    // ======================
    // التهيئة الأساسية
    // ======================
    init() {
        console.log('🎮 تهيئة اللعبة...');
        
        try {
            // الحصول على العناصر
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');
            
            if (!this.canvas || !this.ctx) {
                throw new Error('فشل تحميل Canvas');
            }
            
            // ضبط حجم Canvas
            this.setupCanvas();
            
            // تحميل أفضل نتيجة
            this.loadBestScore();
            
            // إعداد التحكم
            this.setupControls();
            
            // اللعبة جاهزة
            this.state = 'ready';
            console.log('✅ اللعبة مهيأة بنجاح!');
            
            // إظهار إشعار
            this.showNotification('🎮 اللعبة جاهزة!');
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showError(error.message);
        }
    },
    
    setupCanvas() {
        const resize = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea && this.canvas) {
                const width = gameArea.clientWidth;
                const height = gameArea.clientHeight;
                
                // ضبط حجم Canvas
                this.canvas.width = width;
                this.canvas.height = height;
                
                console.log(`📐 Canvas: ${width}x${height}`);
            }
        };
        
        // الضبط الأولي
        resize();
        
        // إعادة الضبط عند تغيير الحجم
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => {
            setTimeout(resize, 300);
        });
    },
    
    loadBestScore() {
        try {
            const saved = localStorage.getItem('mario_best_score');
            this.bestScore = saved ? parseInt(saved) : 0;
            if (document.getElementById('best-score')) {
                document.getElementById('best-score').textContent = this.bestScore;
            }
        } catch (e) {
            console.warn('⚠️ لا يمكن تحميل أفضل نتيجة');
        }
    },
    
    setupControls() {
        // لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // منع السلوك الافتراضي
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // التحكم باللمس
        this.setupTouchControls();
    },
    
    setupTouchControls() {
        const leftBtn = document.getElementById('btn-left');
        const rightBtn = document.getElementById('btn-right');
        const jumpBtn = document.getElementById('btn-jump');
        
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => {
                this.touchControls.left = true;
                e.preventDefault();
            });
            leftBtn.addEventListener('touchend', (e) => {
                this.touchControls.left = false;
                e.preventDefault();
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => {
                this.touchControls.right = true;
                e.preventDefault();
            });
            rightBtn.addEventListener('touchend', (e) => {
                this.touchControls.right = false;
                e.preventDefault();
            });
        }
        
        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', (e) => {
                this.touchControls.jump = true;
                e.preventDefault();
            });
            jumpBtn.addEventListener('touchend', (e) => {
                this.touchControls.jump = false;
                e.preventDefault();
            });
        }
    },
    
    // ======================
    // بدء اللعبة
    // ======================
    startGame() {
        console.log('🚀 بدء لعبة جديدة...');
        
        // إعادة تعيين الإحصائيات
        this.resetGame();
        
        // إنشاء العالم
        this.createWorld();
        
        // تحديث الواجهة
        this.updateUI();
        
        // بدء المؤقتات
        this.startTimer();
        this.startGameLoop();
        
        // إشعار البدء
        this.showNotification('🚀 ابدأ مغامرتك!');
        
        console.log('🎮 اللعبة بدأت!');
    },
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coinsCollected = 0;
        this.enemiesKilled = 0;
        this.camera = { x: 0, y: 0 };
    },
    
    createWorld() {
        const canvas = this.canvas;
        const groundY = canvas.height - 80;
        
        // اللاعب
        this.player = {
            x: 100,
            y: groundY - 100,
            width: 35,
            height: 50,
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
                width: 2000,
                height: 80,
                type: 'ground',
                color: '#8B4513'
            }
        ];
        
        // منصات إضافية
        const platformData = [
            { x: 300, y: groundY - 100, width: 150 },
            { x: 600, y: groundY - 120, width: 140 },
            { x: 900, y: groundY - 90, width: 160 },
            { x: 1200, y: groundY - 110, width: 150 },
            { x: 1500, y: groundY - 130, width: 170 }
        ];
        
        platformData.forEach(p => {
            this.platforms.push({
                x: p.x,
                y: p.y,
                width: p.width,
                height: 20,
                type: 'platform',
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
                x: 400 + i * 250,
                y: groundY - 40,
                width: 35,
                height: 35,
                speed: 1 + Math.random(),
                direction: i % 2 === 0 ? 1 : -1,
                color: ['#EF476F', '#FF6B6B', '#E74C3C'][i % 3],
                active: true
            });
        }
        
        // القصر
        this.castle = {
            x: 1800,
            y: groundY - 150,
            width: 180,
            height: 150,
            color: '#8B4513',
            reached: false
        };
    },
    
    // ======================
    // حلقة اللعبة
    // ======================
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
        
        // تحديث
        this.update(deltaTime);
        
        // رسم
        this.draw();
        
        // الاستمرار
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    },
    
    update(deltaTime) {
        if (!this.player) return;
        
        // تحديث اللاعب
        this.updatePlayer(deltaTime);
        
        // تحديث الأعداء
        this.updateEnemies(deltaTime);
        
        // تحديث الكاميرا
        this.updateCamera();
        
        // التحقق من التصادمات
        this.checkCollisions();
        
        // التحقق من شروط النهاية
        this.checkGameEnd();
    },
    
    updatePlayer(deltaTime) {
        const player = this.player;
        
        // الحركة الأفقية
        player.velX = 0;
        
        if (this.keys['arrowleft'] || this.keys['a'] || this.touchControls.left) {
            player.velX = -player.speed;
            player.facingRight = false;
        }
        
        if (this.keys['arrowright'] || this.keys['d'] || this.touchControls.right) {
            player.velX = player.speed;
            player.facingRight = true;
        }
        
        // القفز
        const jumpPressed = this.keys[' '] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump;
        
        if (jumpPressed && player.grounded) {
            player.velY = player.jumpPower;
            player.grounded = false;
            this.playSound('jump');
        }
        
        // الجاذبية
        player.velY += player.gravity;
        player.velY = Math.min(player.velY, 15);
        
        // التحرك
        player.x += player.velX * 60 * deltaTime;
        player.y += player.velY * 60 * deltaTime;
        
        // حدود العالم
        player.x = Math.max(0, Math.min(2000 - player.width, player.x));
        
        // تصادم مع المنصات
        player.grounded = false;
        
        for (const platform of this.platforms) {
            if (player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y + player.height > platform.y &&
                player.y + player.height < platform.y + platform.height + 10 &&
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
            
            // تغيير الاتجاه
            if (enemy.x < 50 || enemy.x > 1950) {
                enemy.direction *= -1;
            }
        });
    },
    
    updateCamera() {
        if (!this.player) return;
        
        const targetX = this.player.x - this.canvas.width / 2;
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.x = Math.max(0, Math.min(2000 - this.canvas.width, this.camera.x));
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
                    this.playSound('coin');
                    this.showNotification('💰 +100 نقطة!');
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
                    this.playSound('hit');
                    this.showNotification('👊 +200 نقطة!');
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
        this.playSound('hit');
        this.showNotification(`${message} ❤️ ${this.lives}`);
        
        if (this.lives <= 0) {
            this.endGame(false, '💔 خسارة!');
        } else {
            // ارتداد
            this.player.velY = -8;
            this.player.x -= 50 * (this.player.facingRight ? 1 : -1);
        }
    },
    
    checkGameEnd() {
        // الوقت
        if (this.timeLeft <= 0) {
            this.endGame(false, '⏰ انتهى الوقت!');
            return;
        }
        
        // كل العملات
        if (this.coinsCollected >= this.totalCoins && !this.castle.reached) {
            this.showNotification('🎯 تقدم نحو القصر!');
        }
    },
    
    // ======================
    // الرسم
    // ======================
    draw() {
        if (!this.canvas || !this.ctx || !this.player) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // مسح
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // حفظ الحالة
        ctx.save();
        ctx.translate(-this.camera.x, 0);
        
        // الخلفية
        this.drawBackground();
        
        // المنصات
        this.drawPlatforms();
        
        // العملات
        this.drawCoins();
        
        // الأعداء
        this.drawEnemies();
        
        // القصر
        this.drawCastle();
        
        // اللاعب
        this.drawPlayer();
        
        // استعادة الحالة
        ctx.restore();
        
        // الواجهة
        this.drawHUD();
    },
    
    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // السماء
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2000, canvas.height);
        
        // سحب
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 4; i++) {
            const x = (this.camera.x * 0.1 + i * 300) % 2300;
            const y = 40 + Math.sin(i) * 20;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.arc(x + 20, y - 5, 12, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let i = 0; i < platform.width; i += 30) {
                ctx.fillRect(platform.x + i, platform.y, 25, 4);
            }
        });
    },
    
    drawCoins() {
        const ctx = this.ctx;
        
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.animation += 0.1;
                const y = coin.y + Math.sin(coin.animation) * 5;
                
                // عملة
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(coin.x, y, coin.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // بريق
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(coin.x - 2, y - 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    },
    
    drawEnemies() {
        const ctx = this.ctx;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // الجسم
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // عيون
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 8, enemy.y + 8, 6, 6);
            ctx.fillRect(enemy.x + enemy.width - 14, enemy.y + 8, 6, 6);
            
            // فم
            ctx.fillRect(enemy.x + 10, enemy.y + 22, enemy.width - 20, 4);
        });
    },
    
    drawCastle() {
        if (!this.castle) return;
        
        const ctx = this.ctx;
        const castle = this.castle;
        
        // القاعدة
        ctx.fillStyle = castle.color;
        ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        // النوافذ
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(castle.x + 30, castle.y + 30, 25, 25);
        ctx.fillRect(castle.x + castle.width - 55, castle.y + 30, 25, 25);
        ctx.fillRect(castle.x + castle.width/2 - 12, castle.y + 70, 25, 25);
        
        // البوابة
        ctx.fillStyle = '#654321';
        ctx.fillRect(castle.x + castle.width/2 - 25, castle.y + castle.height - 40, 50, 40);
        
        // العلم
        if (!castle.reached) {
            ctx.fillStyle = '#654321';
            ctx.fillRect(castle.x + castle.width/2 - 2, castle.y - 40, 4, 40);
            
            ctx.fillStyle = '#E74C3C';
            ctx.beginPath();
            ctx.moveTo(castle.x + castle.width/2, castle.y - 40);
            ctx.lineTo(castle.x + castle.width/2 + 30, castle.y - 25);
            ctx.lineTo(castle.x + castle.width/2, castle.y - 10);
            ctx.closePath();
            ctx.fill();
        }
    },
    
    drawPlayer() {
        const ctx = this.ctx;
        const player = this.player;
        
        // الجسم
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // الرأس
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(player.x + 8, player.y + 8, 20, 20);
        
        // عيون
        const eyeOffset = player.facingRight ? 0 : 3;
        ctx.fillStyle = '#FFF';
        ctx.fillRect(player.x + 11 + eyeOffset, player.y + 12, 6, 6);
        ctx.fillRect(player.x + 21 + eyeOffset, player.y + 12, 6, 6);
        
        // بؤبؤ
        ctx.fillStyle = '#000';
        ctx.fillRect(player.x + 13 + eyeOffset, player.y + 14, 2, 2);
        ctx.fillRect(player.x + 23 + eyeOffset, player.y + 14, 2, 2);
        
        // فم
        ctx.fillStyle = '#FFF';
        ctx.fillRect(player.x + 13, player.y + 25, 10, 4);
    },
    
    drawHUD() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // خلفية
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 150, 35);
        ctx.fillRect(canvas.width - 160, 10, 150, 35);
        
        // معلومات
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Cairo';
        ctx.fillText(`🏆 ${this.score}`, 20, 30);
        
        ctx.fillStyle = '#E74C3C';
        ctx.font = '14px Cairo';
        ctx.fillText(`❤️ ${this.lives}`, 90, 30);
        
        ctx.fillStyle = '#4ECDC4';
        ctx.fillText(`💰 ${this.coinsCollected}/${this.totalCoins}`, canvas.width - 150, 30);
    },
    
    // ======================
    // إدارة المؤقتات
    // ======================
    startTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
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
    
    updateUI() {
        // الوقت
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timer = document.getElementById('timer-display');
        if (timer) timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // النقاط
        const score = document.getElementById('score-display');
        if (score) score.textContent = this.score;
        
        // الأرواح
        const lives = document.getElementById('lives-display');
        if (lives) lives.textContent = this.lives;
        
        // العملات
        const coins = document.getElementById('coins-display');
        if (coins) coins.textContent = `${this.coinsCollected}/${this.totalCoins}`;
        
        // رسالة المهمة
        const mission = document.getElementById('mission-text');
        if (mission) {
            if (this.coinsCollected < this.totalCoins) {
                mission.textContent = `🎯 اجمع ${this.totalCoins - this.coinsCollected} عملة أخرى!`;
            } else {
                mission.textContent = '🏃‍♂️ تقدم نحو القصر!';
            }
        }
    },
    
    // ======================
    // نهاية اللعبة
    // ======================
    endGame(isWin, message) {
        console.log(isWin ? '🏆 فوز!' : '💔 خسارة!');
        
        this.state = 'gameOver';
        
        // إيقاف المؤقتات
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
            try {
                localStorage.setItem('mario_best_score', this.bestScore.toString());
                document.getElementById('best-score').textContent = this.bestScore;
            } catch (e) {
                console.warn('⚠️ لا يمكن حفظ أفضل نتيجة');
            }
        }
        
        // تحديث شاشة النهاية
        this.updateEndScreen(isWin, message);
        
        // الانتقال لشاشة النهاية
        this.showScreen('end');
    },
    
    updateEndScreen(isWin, message) {
        // الأيقونة
        const icon = document.getElementById('result-icon');
        if (icon) {
            icon.innerHTML = isWin ? '<i class="fas fa-trophy"></i>' : '<i class="fas fa-skull-crossbones"></i>';
        }
        
        // النصوص
        const title = document.getElementById('end-title');
        const msg = document.getElementById('end-message');
        
        if (title) title.textContent = isWin ? '🎉 انتصار!' : '💔 انتهت اللعبة';
        if (msg) msg.textContent = message;
        
        // الإحصائيات
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-coins').textContent = `${this.coinsCollected}/${this.totalCoins}`;
        document.getElementById('final-enemies').textContent = this.enemiesKilled;
        
        // الكفاءة
        const efficiency = Math.min(Math.round((this.score / 3000) * 100), 100);
        document.getElementById('final-efficiency').textContent = `${efficiency}%`;
    },
    
    // ======================
    // وظائف مساعدة
    // ======================
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
            screen.style.display = 'flex';
            this.state = screenId === 'game' ? 'playing' : screenId;
        }
    },
    
    playSound(soundName) {
        if (!this.soundEnabled) return;
        
        const sound = document.getElementById(soundName + '-sound');
        if (sound) {
            try {
                sound.currentTime = 0;
                sound.play().catch(e => {
                    console.log('🔇 فشل تشغيل الصوت');
                });
            } catch (e) {
                console.log('🔇 خطأ في الصوت');
            }
        }
    },
    
    showNotification(message) {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notification-text');
        
        if (notification && text) {
            text.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        }
    },
    
    showError(message) {
        alert('🚨 خطأ: ' + message + '\n\nجاري إعادة تحميل الصفحة...');
        setTimeout(() => location.reload(), 2000);
    }
};

// ============================================
// تهيئة عند تحميل الصفحة
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 الصفحة محملة');
    
    setTimeout(() => {
        try {
            // تهيئة اللعبة
            MarioGame.init();
            
            // جعل الدوال متاحة
            window.MarioGame = MarioGame;
            window.startGame = () => MarioGame.startGame();
            window.restartGame = () => {
                MarioGame.showScreen('start');
                setTimeout(() => MarioGame.startGame(), 500);
            };
            window.showScreen = (screen) => MarioGame.showScreen(screen);
            window.showNotification = (msg) => MarioGame.showNotification(msg);
            
            console.log('✅ جميع الأنظمة جاهزة!');
            
        } catch (error) {
            console.error('❌ فشل التهيئة:', error);
            alert('خطأ في تحميل اللعبة: ' + error.message);
        }
    }, 500);
});

// ============================================
// منع السلوك الافتراضي
// ============================================

document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});
