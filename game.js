// ============================================
// 🎮 GAME ENGINE - الإصدار النهائي المثبت
// ============================================

'use strict';

console.log('🎮 بدء تحميل لعبة ماريو...');

class MarioGame {
    constructor() {
        console.log('🔧 إنشاء نسخة جديدة من اللعبة');
        
        try {
            // 🔥 تهيئة الأساسيات
            this.canvas = null;
            this.ctx = null;
            this.gameState = 'loading';
            
            // 🔥 التحكم
            this.keys = {};
            this.touchControls = {
                left: false,
                right: false,
                jump: false
            };
            
            // 🔥 الإحصائيات
            this.score = 0;
            this.highScore = 0;
            this.lives = 3;
            this.timeLeft = 120;
            this.coins = 0;
            this.totalCoins = 30;
            this.kills = 0;
            
            // 🔥 المؤقتات
            this.gameTimer = null;
            this.lastTime = 0;
            this.frameCount = 0;
            this.animationId = null;
            
            // 🔥 عناصر اللعبة
            this.player = null;
            this.platforms = [];
            this.coinItems = [];
            this.enemies = [];
            this.mushrooms = [];
            this.pits = [];
            this.particles = [];
            this.camera = { x: 0, y: 0 };
            this.castle = null;
            
            // 🔥 الأصول
            this.assets = {
                player: null,
                loaded: false
            };
            
            // 🔥 التهيئة
            this.init();
            
        } catch (error) {
            console.error('❌ خطأ في إنشاء اللعبة:', error);
            this.showError('فشل في إنشاء اللعبة');
        }
    }
    
    async init() {
        try {
            // 🔥 انتظار تحميل DOM
            await this.waitForDOM();
            
            // 🔥 الحصول على Canvas
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                throw new Error('Canvas غير موجود');
            }
            
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Canvas غير مدعوم');
            }
            
            console.log('✅ Canvas جاهز');
            
            // 🔥 تهيئة حجم Canvas
            this.setupCanvas();
            
            // 🔥 تحميل صورة اللاعب
            await this.loadPlayerImage();
            
            // 🔥 تهيئة الأحداث
            this.setupEvents();
            
            // 🔥 إنشاء العالم
            this.createGameWorld();
            
            // 🔥 تحميل أفضل نتيجة
            this.loadHighScore();
            
            // 🔥 تحديث الواجهة
            this.updateUI();
            
            // 🔥 تغيير الحالة
            this.gameState = 'start';
            
            console.log('✅ اللعبة مهيأة وجاهزة');
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showError('فشل تهيئة اللعبة');
        }
    }
    
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }
    
    async loadPlayerImage() {
        console.log('🖼️ تحميل صورة اللاعب...');
        
        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => {
                console.log('✅ صورة اللاعب محملة بنجاح');
                this.assets.player = img;
                this.assets.loaded = true;
                resolve();
            };
            
            img.onerror = () => {
                console.log('⚠️ فشل تحميل الصورة، استخدام رسم بديل');
                this.assets.player = null;
                this.assets.loaded = true;
                resolve();
            };
            
            // محاولة مسارات مختلفة
            img.src = './assets/player.png';
        });
    }
    
    setupCanvas() {
        console.log('📏 تهيئة حجم Canvas...');
        
        const updateSize = () => {
            const gameArea = document.querySelector('.game-area');
            
            if (gameArea && gameArea.clientWidth > 0 && gameArea.clientHeight > 0) {
                this.canvas.width = gameArea.clientWidth;
                this.canvas.height = gameArea.clientHeight;
                console.log(`📐 حجم Canvas: ${this.canvas.width}x${this.canvas.height}`);
            } else {
                // قيم افتراضية
                this.canvas.width = 800;
                this.canvas.height = 500;
                console.log('📐 استخدام الحجم الافتراضي: 800x500');
            }
            
            // إذا كنا في شاشة البداية، أرسمها
            if (this.gameState === 'start') {
                this.drawStartScreen();
            }
        };
        
        // التهيئة الفورية
        updateSize();
        
        // تحديث عند تغيير الحجم
        window.addEventListener('resize', updateSize);
    }
    
    setupEvents() {
        console.log('🎮 تهيئة أحداث التحكم...');
        
        // 🔥 أحداث أزرار الشاشات
        this.setupScreenButtons();
        
        // 🔥 أحداث التحكم باللمس
        this.setupTouchControls();
        
        // 🔥 أحداث لوحة المفاتيح
        this.setupKeyboardControls();
        
        console.log('✅ أحداث التحكم جاهزة');
    }
    
    setupScreenButtons() {
        // زر البداية
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        // زر الإيقاف
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        // زر إعادة اللعب
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => this.restartGame());
        }
        
        // زر القائمة
        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.showScreen('start'));
        }
        
        // زر ملء الشاشة
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
    }
    
    setupTouchControls() {
        // 🔥 زر اليسار
        const leftBtn = document.getElementById('left-btn');
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touchControls.left = true;
            });
            
            leftBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touchControls.left = false;
            });
            
            leftBtn.addEventListener('mousedown', () => {
                this.touchControls.left = true;
            });
            
            leftBtn.addEventListener('mouseup', () => {
                this.touchControls.left = false;
            });
            
            leftBtn.addEventListener('mouseleave', () => {
                this.touchControls.left = false;
            });
        }
        
        // 🔥 زر اليمين
        const rightBtn = document.getElementById('right-btn');
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touchControls.right = true;
            });
            
            rightBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touchControls.right = false;
            });
            
            rightBtn.addEventListener('mousedown', () => {
                this.touchControls.right = true;
            });
            
            rightBtn.addEventListener('mouseup', () => {
                this.touchControls.right = false;
            });
            
            rightBtn.addEventListener('mouseleave', () => {
                this.touchControls.right = false;
            });
        }
        
        // 🔥 زر القفز (على اليمين)
        const jumpBtn = document.getElementById('jump-btn');
        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touchControls.jump = true;
            });
            
            jumpBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touchControls.jump = false;
            });
            
            jumpBtn.addEventListener('mousedown', () => {
                this.touchControls.jump = true;
            });
            
            jumpBtn.addEventListener('mouseup', () => {
                this.touchControls.jump = false;
            });
            
            jumpBtn.addEventListener('mouseleave', () => {
                this.touchControls.jump = false;
            });
        }
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // التحكم في اللعبة
            if (key === 'p') {
                this.togglePause();
                e.preventDefault();
            }
            
            if (key === 'f') {
                this.toggleFullscreen();
                e.preventDefault();
            }
            
            // منع التمرير
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    loadHighScore() {
        try {
            const saved = localStorage.getItem('mario_high_score');
            this.highScore = saved ? parseInt(saved) : 0;
            
            const highScoreElement = document.getElementById('high-score');
            if (highScoreElement) {
                highScoreElement.textContent = this.highScore;
            }
        } catch (error) {
            console.log('⚠️ فشل تحميل أفضل نتيجة');
            this.highScore = 0;
        }
    }
    
    toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                const btn = document.getElementById('fullscreen-btn');
                if (btn) btn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                document.exitFullscreen();
                const btn = document.getElementById('fullscreen-btn');
                if (btn) btn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        } catch (error) {
            console.log('⚠️ خطأ في ملء الشاشة');
        }
    }
    
    showScreen(screenName) {
        console.log(`🔄 تغيير الشاشة إلى: ${screenName}`);
        
        // إخفاء كل الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // إظهار الشاشة المطلوبة
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.gameState = screenName;
        }
    }
    
    createGameWorld() {
        console.log('🌍 إنشاء عالم اللعبة...');
        
        if (!this.canvas) return;
        
        const canvas = this.canvas;
        const worldWidth = canvas.width * 4;
        const groundY = canvas.height - 60;
        
        // 🔥 اللاعب
        this.player = {
            x: 150,
            y: groundY - 100,
            width: 40,
            height: 60,
            speed: 5,
            velX: 0,
            velY: 0,
            jumpPower: -13,
            grounded: false,
            facingRight: true,
            invincible: false,
            invincibleTime: 0,
            canJump: true
        };
        
        // 🔥 الأرض
        this.platforms = [
            { x: 0, y: groundY, width: worldWidth, height: 60, type: 'ground' }
        ];
        
        // 🔥 منصات إضافية
        for (let i = 0; i < 12; i++) {
            this.platforms.push({
                x: 300 + i * 320,
                y: groundY - 120 - (i % 3) * 40,
                width: 180,
                height: 20,
                type: 'platform'
            });
        }
        
        // 🔥 العملات
        this.coinItems = [];
        for (let i = 0; i < this.totalCoins; i++) {
            this.coinItems.push({
                x: 200 + i * 130,
                y: groundY - 180 + Math.sin(i) * 60,
                collected: false,
                anim: Math.random() * Math.PI * 2,
                size: 12
            });
        }
        
        // 🔥 الأعداء
        this.enemies = [];
        for (let i = 0; i < 8; i++) {
            this.enemies.push({
                x: 400 + i * 350,
                y: groundY - 45,
                width: 40,
                height: 40,
                dir: i % 2 === 0 ? 1 : -1,
                speed: 2,
                active: true
            });
        }
        
        // 🔥 الفطر
        this.mushrooms = [];
        for (let i = 0; i < 6; i++) {
            this.mushrooms.push({
                x: 500 + i * 450,
                y: groundY - 120,
                collected: false
            });
        }
        
        // 🔥 الحفر
        this.pits = [
            { x: 1500, y: groundY, width: 100, height: 100 },
            { x: 2200, y: groundY, width: 100, height: 100 },
            { x: 2900, y: groundY, width: 120, height: 100 },
            { x: 3600, y: groundY, width: 150, height: 100 }
        ];
        
        // 🔥 القصر
        this.castle = {
            x: worldWidth - 350,
            y: groundY - 220,
            width: 220,
            height: 220,
            reached: false
        };
        
        // 🔥 جسيمات
        this.particles = [];
        
        console.log(`✅ العالم مخلوق - العرض: ${worldWidth}px`);
    }
    
    startGame() {
        console.log('🚀 بدء لعبة جديدة');
        
        // 🔥 إعادة تعيين
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coins = 0;
        this.kills = 0;
        
        // 🔥 إنشاء العالم
        this.createGameWorld();
        
        // 🔥 إظهار شاشة اللعب
        this.showScreen('game');
        
        // 🔥 بدء المؤقت
        this.startTimer();
        
        // 🔥 تحديث الواجهة
        this.updateUI();
        
        // 🔥 بدء الحلقة
        this.startGameLoop();
    }
    
    startTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            if (this.gameState === 'playing') {
                this.timeLeft--;
                this.updateUI();
                
                if (this.timeLeft <= 0) {
                    this.endGame(false);
                }
            }
        }, 1000);
    }
    
    updateUI() {
        // الوقت
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // النتيجة
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        // الأرواح
        const livesElement = document.getElementById('lives');
        if (livesElement) {
            livesElement.textContent = this.lives;
        }
        
        // العملات
        const coinsElement = document.getElementById('coins');
        if (coinsElement) {
            coinsElement.textContent = `${this.coins}/${this.totalCoins}`;
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    pauseGame() {
        this.gameState = 'paused';
        clearInterval(this.gameTimer);
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.startTimer();
        
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        this.startGameLoop();
    }
    
    startGameLoop() {
        if (this.gameState !== 'playing') return;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.frameCount++;
        
        // 🔥 التحديث
        this.update(deltaTime);
        
        // 🔥 الرسم
        this.draw();
        
        // 🔥 الاستمرار
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (!this.player) return;
        
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateCoins(deltaTime);
        this.updateCamera();
        this.checkCollisions();
        this.checkEndConditions();
    }
    
    updatePlayer(deltaTime) {
        const player = this.player;
        
        // 🔥 حركة أفقية
        player.velX = 0;
        
        if (this.keys['arrowleft'] || this.keys['a'] || this.touchControls.left) {
            player.velX = -player.speed;
            player.facingRight = false;
        }
        
        if (this.keys['arrowright'] || this.keys['d'] || this.touchControls.right) {
            player.velX = player.speed;
            player.facingRight = true;
        }
        
        // 🔥 قفز
        const jumpPressed = this.keys[' '] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump;
        
        if (jumpPressed && player.grounded && player.canJump) {
            player.velY = player.jumpPower;
            player.grounded = false;
            player.canJump = false;
            
            // جسيمات القفز
            this.createParticles(
                player.x + player.width / 2,
                player.y + player.height,
                5,
                '#FFD700'
            );
        }
        
        if (!jumpPressed) {
            player.canJump = true;
        }
        
        // 🔥 جاذبية
        player.velY += 0.7;
        player.velY = Math.min(player.velY, 15);
        
        // 🔥 تحديث الموقع
        player.x += player.velX;
        player.y += player.velY;
        
        // 🔥 حدود العالم
        const worldWidth = this.canvas.width * 4;
        player.x = Math.max(0, Math.min(worldWidth - player.width, player.x));
        
        // 🔥 اكتشاف الاصطدام مع المنصات
        player.grounded = false;
        
        for (const platform of this.platforms) {
            if (player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y + player.height > platform.y &&
                player.y + player.height < platform.y + platform.height + player.velY &&
                player.velY > 0) {
                
                player.y = platform.y - player.height;
                player.velY = 0;
                player.grounded = true;
                break;
            }
        }
        
        // 🔥 سقوط في حفرة
        for (const pit of this.pits) {
            if (player.x + player.width > pit.x &&
                player.x < pit.x + pit.width &&
                player.y + player.height > pit.y) {
                
                this.playerDamaged();
                player.x = 150;
                player.y = this.canvas.height - 160;
                player.velX = 0;
                player.velY = 0;
                break;
            }
        }
        
        // 🔥 سقوط عام
        if (player.y > this.canvas.height + 100) {
            this.playerDamaged();
            player.x = 150;
            player.y = this.canvas.height - 160;
            player.velX = 0;
            player.velY = 0;
        }
        
        // 🔥 مناعة
        if (player.invincible) {
            player.invincibleTime -= deltaTime;
            if (player.invincibleTime <= 0) {
                player.invincible = false;
            }
        }
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            enemy.x += enemy.speed * enemy.dir;
            
            // تغيير الاتجاه عند الحدود
            if (enemy.x < 0 || enemy.x + enemy.width > this.canvas.width * 4) {
                enemy.dir *= -1;
                enemy.x = Math.max(0, Math.min(this.canvas.width * 4 - enemy.width, enemy.x));
            }
        });
    }
    
    updateCoins(deltaTime) {
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                coin.anim += deltaTime * 4;
            }
        });
    }
    
    updateCamera() {
        if (!this.player) return;
        
        const player = this.player;
        const canvas = this.canvas;
        
        const targetX = player.x - canvas.width / 2 + player.width / 2;
        
        // تتبع سلس
        this.camera.x += (targetX - this.camera.x) * 0.1;
        
        // حدود الكاميرا
        this.camera.x = Math.max(0, Math.min(canvas.width * 4 - canvas.width, this.camera.x));
    }
    
    checkCollisions() {
        const player = this.player;
        
        // 🔥 جمع العملات
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const dx = player.x + player.width / 2 - coin.x;
                const dy = player.y + player.height / 2 - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 25) {
                    coin.collected = true;
                    this.coins++;
                    this.score += 100;
                    this.updateUI();
                    
                    this.createParticles(coin.x, coin.y, 8, '#FFD700');
                }
            }
        });
        
        // 🔥 جمع الفطر
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.collected) {
                const dx = player.x + player.width / 2 - mushroom.x;
                const dy = player.y + player.height / 2 - mushroom.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 35) {
                    mushroom.collected = true;
                    this.score += 500;
                    player.invincible = true;
                    player.invincibleTime = 8;
                    this.updateUI();
                    
                    this.createParticles(mushroom.x, mushroom.y, 12, '#E74C3C');
                }
            }
        });
        
        // 🔥 الاصطدام بالأعداء
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {
                
                // إذا قفز على العدو
                if (player.velY > 0 && player.y + player.height < enemy.y + enemy.height / 2) {
                    enemy.active = false;
                    this.score += 200;
                    this.kills++;
                    player.velY = -10;
                    this.updateUI();
                    
                    this.createParticles(
                        enemy.x + enemy.width / 2,
                        enemy.y + enemy.height / 2,
                        10,
                        '#EF476F'
                    );
                } 
                // إذا اصطدم بالعدو
                else if (!player.invincible) {
                    this.playerDamaged();
                }
            }
        });
    }
    
    playerDamaged() {
        if (this.player.invincible) return;
        
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.endGame(false);
        } else {
            this.player.invincible = true;
            this.player.invincibleTime = 2;
            this.player.velY = -8;
            this.player.velX = this.player.facingRight ? -8 : 8;
            
            this.createParticles(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                6,
                '#EF476F'
            );
        }
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                velX: (Math.random() - 0.5) * 6,
                velY: (Math.random() - 0.5) * 6 - 3,
                size: Math.random() * 3 + 2,
                color,
                life: 1
            });
        }
    }
    
    checkEndConditions() {
        // 🔥 الفوز بجمع كل العملات
        if (this.coins >= this.totalCoins) {
            this.endGame(true);
            return;
        }
        
        // 🔥 الفوز بالوصول للقصر
        if (this.castle && !this.castle.reached) {
            const player = this.player;
            const castle = this.castle;
            
            const dx = player.x + player.width / 2 - (castle.x + castle.width / 2);
            const dy = player.y + player.height / 2 - (castle.y + castle.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                castle.reached = true;
                this.score += 2000;
                this.endGame(true);
                return;
            }
        }
        
        // 🔥 الفوز بالوصول لنهاية العالم
        if (this.player.x >= this.canvas.width * 4 - 200) {
            this.endGame(true);
            return;
        }
    }
    
    endGame(isWin) {
        this.gameState = 'ended';
        
        // إيقاف المؤقتات
        clearInterval(this.gameTimer);
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // حفظ أفضل نتيجة
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('mario_high_score', this.highScore.toString());
            
            const highScoreElement = document.getElementById('high-score');
            if (highScoreElement) {
                highScoreElement.textContent = this.highScore;
            }
        }
        
        // تحديث شاشة النهاية
        try {
            const endIcon = document.getElementById('end-icon');
            const endTitle = document.getElementById('end-title');
            const endMessage = document.getElementById('end-message');
            
            if (endIcon) {
                endIcon.className = isWin ? 'fas fa-trophy' : 'fas fa-skull-crossbones';
            }
            
            if (endTitle) {
                endTitle.textContent = isWin ? 'تهانينا! 🏆' : 'انتهت اللعبة';
            }
            
            if (endMessage) {
                endMessage.textContent = isWin 
                    ? `لقد فزت! جمعت ${this.coins} عملة من ${this.totalCoins}`
                    : 'حاول مرة أخرى في المرة القادمة!';
            }
            
            // تحديث الإحصائيات النهائية
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('final-coins').textContent = `${this.coins}/${this.totalCoins}`;
            document.getElementById('final-time').textContent = this.formatTime(120 - this.timeLeft);
            document.getElementById('final-kills').textContent = this.kills;
            
        } catch (error) {
            console.error('❌ خطأ في تحديث شاشة النهاية:', error);
        }
        
        // إظهار شاشة النهاية
        this.showScreen('end');
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    restartGame() {
        this.startGame();
    }
    
    drawStartScreen() {
        if (!this.canvas || !this.ctx) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // خلفية
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // عنوان
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 40px Cairo';
        ctx.textAlign = 'center';
        ctx.fillText('🎮 لعبة ماريو', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.fillStyle = '#4ECDC4';
        ctx.font = '20px Cairo';
        ctx.fillText('مغامرة حقيقية مع شخصيتك', canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#E74C3C';
        ctx.font = '16px Cairo';
        ctx.fillText('اضغط على "ابدأ اللعب" للبدء', canvas.width / 2, canvas.height / 2 + 50);
    }
    
    draw() {
        if (!this.canvas || !this.ctx || !this.player) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // مسح الشاشة
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // حفظ حالة Canvas
        ctx.save();
        
        // تطبيق حركة الكاميرا
        ctx.translate(-this.camera.x, 0);
        
        // 🔥 رسم الخلفية
        this.drawBackground();
        
        // 🔥 رسم المنصات
        this.drawPlatforms();
        
        // 🔥 رسم الحفر
        this.drawPits();
        
        // 🔥 رسم العملات
        this.drawCoins();
        
        // 🔥 رسم الفطر
        this.drawMushrooms();
        
        // 🔥 رسم الأعداء
        this.drawEnemies();
        
        // 🔥 رسم القصر
        this.drawCastle();
        
        // 🔥 رسم الجسيمات
        this.drawParticles();
        
        // 🔥 رسم اللاعب
        this.drawPlayer();
        
        // استعادة حالة Canvas
        ctx.restore();
    }
    
    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const worldWidth = canvas.width * 4;
        
        // السماء
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, worldWidth, canvas.height);
        
        // سحب
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 10; i++) {
            const x = (i * 400) % worldWidth;
            const y = 50 + Math.sin(this.frameCount * 0.01 + i) * 20;
            this.drawCloud(x, y, 60);
        }
        
        // جبال
        ctx.fillStyle = '#2C3E50';
        for (let i = 0; i < 8; i++) {
            const x = i * 600;
            const height = 80 + Math.sin(i) * 40;
            this.drawMountain(x, canvas.height - height, 300, height);
        }
    }
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            // جسم المنصة
            ctx.fillStyle = platform.type === 'ground' ? '#8B4513' : '#A0522D';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل
            ctx.fillStyle = platform.type === 'ground' ? '#A0522D' : '#8B4513';
            for (let i = 0; i < platform.width; i += 20) {
                ctx.fillRect(platform.x + i, platform.y, 10, 5);
            }
        });
    }
    
    drawPits() {
        const ctx = this.ctx;
        
        this.pits.forEach(pit => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(pit.x, pit.y, pit.width, pit.height);
        });
    }
    
    drawCoins() {
        const ctx = this.ctx;
        
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.anim) * 10;
                const y = coin.y + bounce;
                
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(coin.x, y, coin.size, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#FFA500';
                ctx.beginPath();
                ctx.arc(coin.x, y, coin.size * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    drawMushrooms() {
        const ctx = this.ctx;
        
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.collected) {
                ctx.fillStyle = '#E74C3C';
                ctx.beginPath();
                ctx.arc(mushroom.x, mushroom.y, 15, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(mushroom.x - 4, mushroom.y - 4, 4, 0, Math.PI * 2);
                ctx.arc(mushroom.x + 4, mushroom.y - 4, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    drawEnemies() {
        const ctx = this.ctx;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            ctx.fillStyle = '#EF476F';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(enemy.x + 8, enemy.y + 8, 8, 8);
            ctx.fillRect(enemy.x + 24, enemy.y + 8, 8, 8);
        });
    }
    
    drawCastle() {
        if (!this.castle) return;
        
        const ctx = this.ctx;
        const castle = this.castle;
        
        // قاعدة القصر
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        // أبراج
        const towerWidth = castle.width * 0.25;
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(castle.x - 10, castle.y - 100, towerWidth, 100);
        ctx.fillRect(castle.x + castle.width - towerWidth + 10, castle.y - 100, towerWidth, 100);
        
        // علم
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.moveTo(castle.x + castle.width / 2, castle.y - 150);
        ctx.lineTo(castle.x + castle.width / 2, castle.y - 180);
        ctx.lineTo(castle.x + castle.width / 2 + 20, castle.y - 165);
        ctx.closePath();
        ctx.fill();
    }
    
    drawParticles() {
        const ctx = this.ctx;
        
        this.particles.forEach((particle, i) => {
            particle.x += particle.velX;
            particle.y += particle.velY;
            particle.velY += 0.2;
            particle.life -= 0.02;
            
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        });
        
        ctx.globalAlpha = 1;
    }
    
    drawPlayer() {
        if (!this.player) return;
        
        const ctx = this.ctx;
        const player = this.player;
        
        if (this.assets.player && this.assets.loaded) {
            // رسم صورة اللاعب
            ctx.save();
            
            if (!player.facingRight) {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    this.assets.player,
                    -player.x - player.width,
                    player.y,
                    player.width,
                    player.height
                );
            } else {
                ctx.drawImage(
                    this.assets.player,
                    player.x,
                    player.y,
                    player.width,
                    player.height
                );
            }
            
            ctx.restore();
        } else {
            // رسم بديل
            ctx.fillStyle = player.invincible ? '#9B59B6' : '#E74C3C';
            ctx.fillRect(player.x, player.y, player.width, player.height);
            
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(player.x + 10, player.y + 10, 20, 20);
            
            ctx.fillStyle = '#FFF';
            ctx.fillRect(player.x + 15, player.y + 15, 5, 5);
            ctx.fillRect(player.x + 25, player.y + 15, 5, 5);
        }
    }
    
    drawCloud(x, y, size) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.25, 0, Math.PI * 2);
        ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawMountain(x, y, width, height) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        ctx.lineTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
        ctx.fill();
    }
    
    showError(message) {
        console.error('❌ خطأ:', message);
    }
}

// ============================================
// تهيئة اللعبة عند تحميل الصفحة
// ============================================

let game = null;

window.addEventListener('load', function() {
    console.log('📄 الصفحة محملة - بدء اللعبة...');
    
    try {
        // تأخير لضمان تحميل الصفحة بالكامل
        setTimeout(function() {
            game = new MarioGame();
            console.log('✅ اللعبة جاهزة!');
        }, 100);
    } catch (error) {
        console.error('❌ فشل تحميل اللعبة:', error);
        alert('حدث خطأ في تحميل اللعبة. حاول تحديث الصفحة.');
    }
});
