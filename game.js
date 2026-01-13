// ============================================
// 🎮 GAME ENGINE - النسخة النهائية المثبتة
// ============================================

'use strict';

console.log('🎮 بدء تحميل لعبة ماريو...');

class MarioGame {
    constructor() {
        console.log('🔧 إنشاء نسخة جديدة من اللعبة');
        
        try {
            // 🔥 تهيئة العناصر الأساسية
            this.canvas = null;
            this.ctx = null;
            this.gameState = 'loading'; // loading, start, playing, paused, ended
            
            // 🔥 تهيئة المتغيرات
            this.keys = {};
            this.touchControls = {
                left: false,
                right: false,
                jump: false
            };
            
            // 🔥 إحصائيات اللعبة
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
            this.showError('فشل في إنشاء اللعبة: ' + error.message);
        }
    }
    
    async init() {
        try {
            // انتظار تحميل DOM
            await this.waitForDOM();
            
            // الحصول على عناصر DOM
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                throw new Error('عنصر Canvas غير موجود');
            }
            
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('سياق الرسم Canvas غير مدعوم');
            }
            
            // تحميل الأصول
            await this.loadAssets();
            
            // تهيئة Canvas
            this.setupCanvas();
            
            // تهيئة الأحداث
            this.setupEvents();
            
            // إنشاء العالم
            this.createGameWorld();
            
            // تحميل أفضل نتيجة
            this.loadHighScore();
            
            // تحديث الواجهة
            this.updateUI();
            
            // تغيير الحالة إلى البداية
            this.gameState = 'start';
            
            // رسم شاشة البداية
            this.drawStartScreen();
            
            console.log('✅ اللعبة مهيأة وجاهزة');
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showError('فشل تهيئة اللعبة: ' + error.message);
        }
    }
    
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                resolve();
            } else {
                document.addEventListener('DOMContentLoaded', resolve);
            }
        });
    }
    
    async loadAssets() {
        console.log('🖼️ تحميل الأصول...');
        
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.assets.player = img;
                this.assets.loaded = true;
                console.log('✅ صورة اللاعب محملة بنجاح');
                resolve();
            };
            
            img.onerror = () => {
                console.log('⚠️ استخدام رسم بديل للاعب');
                this.assets.player = null;
                this.assets.loaded = true;
                resolve();
            };
            
            // محاولة تحميل الصورة
            img.src = 'assets/player.png';
            
            // Timeout احتياطي
            setTimeout(() => {
                if (!this.assets.loaded) {
                    console.log('⏰ انتهى وقت تحميل الصورة، استخدام البديل');
                    this.assets.player = null;
                    this.assets.loaded = true;
                    resolve();
                }
            }, 3000);
        });
    }
    
    setupCanvas() {
        console.log('📏 تهيئة Canvas...');
        
        const updateCanvasSize = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea && gameArea.clientWidth > 0 && gameArea.clientHeight > 0) {
                this.canvas.width = gameArea.clientWidth;
                this.canvas.height = gameArea.clientHeight;
            } else {
                // قيم افتراضية
                this.canvas.width = Math.min(window.innerWidth, 1200);
                this.canvas.height = Math.min(window.innerHeight - 100, 700);
            }
            
            console.log(`📐 حجم Canvas: ${this.canvas.width}×${this.canvas.height}`);
            
            // إعادة الرسم إذا لزم
            if (this.gameState === 'start') {
                this.drawStartScreen();
            } else if (this.gameState === 'playing') {
                this.draw();
            }
        };
        
        // التهيئة الأولية
        updateCanvasSize();
        
        // أحداث إعادة الحجم
        window.addEventListener('resize', updateCanvasSize);
        window.addEventListener('orientationchange', () => {
            setTimeout(updateCanvasSize, 150);
        });
        
        // تحديث دوري للحجم (للتصحيح)
        this.canvasSizeCheckInterval = setInterval(updateCanvasSize, 1000);
    }
    
    setupEvents() {
        console.log('🎮 تهيئة أحداث التحكم...');
        
        // 🔥 أحداث أزرار الشاشات
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const playAgainBtn = document.getElementById('play-again-btn');
        const menuBtn = document.getElementById('menu-btn');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
        if (playAgainBtn) playAgainBtn.addEventListener('click', () => this.restartGame());
        if (menuBtn) menuBtn.addEventListener('click', () => this.showScreen('start'));
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // 🔥 أحداث التحكم باللمس
        const touchButtons = ['left-btn', 'right-btn', 'jump-btn'];
        touchButtons.forEach((id, index) => {
            const btn = document.getElementById(id);
            if (!btn) {
                console.warn(`⚠️ زر ${id} غير موجود`);
                return;
            }
            
            const controlName = ['left', 'right', 'jump'][index];
            const eventHandlers = {
                start: (e) => {
                    e.preventDefault();
                    this.touchControls[controlName] = true;
                    btn.classList.add('active');
                },
                end: (e) => {
                    e.preventDefault();
                    this.touchControls[controlName] = false;
                    btn.classList.remove('active');
                }
            };
            
            btn.addEventListener('touchstart', eventHandlers.start);
            btn.addEventListener('mousedown', eventHandlers.start);
            btn.addEventListener('touchend', eventHandlers.end);
            btn.addEventListener('mouseup', eventHandlers.end);
            btn.addEventListener('mouseleave', eventHandlers.end);
        });
        
        // 🔥 أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // إيقاف/متابعة
            if (key === 'p') {
                this.togglePause();
                e.preventDefault();
            }
            
            // ملء الشاشة
            if (key === 'f') {
                this.toggleFullscreen();
                e.preventDefault();
            }
            
            // الخروج من الإيقاف المؤقت
            if (key === 'escape' && this.gameState === 'paused') {
                this.resumeGame();
                e.preventDefault();
            }
            
            // منع التمرير عند استخدام مفاتيح التحكم
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // 🔥 منع القائمة السياقية على Canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        console.log('✅ أحداث التحكم جاهزة');
    }
    
    loadHighScore() {
        try {
            const savedScore = localStorage.getItem('mario_high_score');
            this.highScore = savedScore ? parseInt(savedScore, 10) : 0;
            
            const highScoreElement = document.getElementById('high-score');
            if (highScoreElement) {
                highScoreElement.textContent = this.highScore;
            }
        } catch (error) {
            console.log('⚠️ فشل تحميل أفضل نتيجة:', error);
            this.highScore = 0;
        }
    }
    
    saveHighScore() {
        try {
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('mario_high_score', this.highScore.toString());
                
                const highScoreElement = document.getElementById('high-score');
                if (highScoreElement) {
                    highScoreElement.textContent = this.highScore;
                }
                
                console.log('🏆 تم حفظ أفضل نتيجة جديدة:', this.highScore);
            }
        } catch (error) {
            console.log('⚠️ فشل حفظ أفضل نتيجة:', error);
        }
    }
    
    toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {
                    console.log('⚠️ المتصفح لا يدعم ملء الشاشة');
                });
                const btn = document.getElementById('fullscreen-btn');
                if (btn) btn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                document.exitFullscreen();
                const btn = document.getElementById('fullscreen-btn');
                if (btn) btn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        } catch (error) {
            console.log('⚠️ خطأ في ملء الشاشة:', error);
        }
    }
    
    showScreen(screenName) {
        console.log(`🔄 تغيير الشاشة إلى: ${screenName}`);
        
        try {
            // إخفاء كل الشاشات
            const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => {
                screen.classList.remove('active');
            });
            
            // إظهار الشاشة المطلوبة
            const targetScreen = document.getElementById(`${screenName}-screen`);
            if (targetScreen) {
                targetScreen.classList.add('active');
                this.gameState = screenName;
                
                // إذا كانت شاشة اللعب، ابدأ اللعبة
                if (screenName === 'game') {
                    setTimeout(() => {
                        this.startGameLoop();
                    }, 100);
                }
                
                // إذا كانت شاشة البداية، ارسمها
                if (screenName === 'start') {
                    this.drawStartScreen();
                }
            }
        } catch (error) {
            console.error('❌ خطأ في تغيير الشاشة:', error);
        }
    }
    
    createGameWorld() {
        console.log('🌍 إنشاء عالم اللعبة...');
        
        if (!this.canvas) return;
        
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // 🔥 اللاعب
        this.player = {
            x: 150,
            y: canvasHeight - 200,
            width: 40,
            height: 60,
            speed: 5,
            velX: 0,
            velY: 0,
            jumpPower: -14,
            grounded: false,
            facingRight: true,
            invincible: false,
            invincibleTime: 0,
            canJump: true
        };
        
        // 🔥 حجم العالم (4 أضعاف العرض)
        const worldWidth = canvasWidth * 4;
        const groundHeight = 60;
        const groundY = canvasHeight - groundHeight;
        
        // 🔥 الأرض الأساسية
        this.platforms = [
            { x: 0, y: groundY, width: worldWidth, height: groundHeight, type: 'ground' }
        ];
        
        // 🔥 المنصات الإضافية
        const platformPositions = [
            { x: 350, y: groundY - 120 },
            { x: 650, y: groundY - 180 },
            { x: 950, y: groundY - 150 },
            { x: 1250, y: groundY - 200 },
            { x: 1550, y: groundY - 140 },
            { x: 1850, y: groundY - 160 },
            { x: 2150, y: groundY - 190 },
            { x: 2450, y: groundY - 130 },
            { x: 2750, y: groundY - 170 },
            { x: 3050, y: groundY - 150 }
        ];
        
        platformPositions.forEach(pos => {
            this.platforms.push({
                x: pos.x,
                y: pos.y,
                width: 180,
                height: 25,
                type: 'platform'
            });
        });
        
        // 🔥 العملات (30 عملة)
        this.coinItems = [];
        for (let i = 0; i < this.totalCoins; i++) {
            const platformIndex = i % platformPositions.length;
            const platform = platformPositions[platformIndex];
            
            this.coinItems.push({
                x: platform.x + 40 + (i % 4) * 35,
                y: platform.y - 60,
                collected: false,
                anim: Math.random() * Math.PI * 2,
                size: 14,
                rotation: 0
            });
        }
        
        // 🔥 الأعداء (8 أعداء)
        this.enemies = [];
        for (let i = 0; i < 8; i++) {
            this.enemies.push({
                x: 450 + i * 400,
                y: groundY - 45,
                width: 45,
                height: 45,
                dir: i % 2 === 0 ? 1 : -1,
                speed: 1.8 + Math.random() * 1.2,
                active: true,
                anim: Math.random() * Math.PI * 2
            });
        }
        
        // 🔥 الفطر (6 فطر)
        this.mushrooms = [];
        for (let i = 0; i < 6; i++) {
            this.mushrooms.push({
                x: 600 + i * 500,
                y: groundY - 130,
                collected: false,
                bounce: 0
            });
        }
        
        // 🔥 الحفر
        this.pits = [
            { x: 1500, y: groundY, width: 90, height: 110 },
            { x: 2200, y: groundY, width: 110, height: 110 },
            { x: 2900, y: groundY, width: 130, height: 110 },
            { x: 3600, y: groundY, width: 150, height: 110 }
        ];
        
        // 🔥 القصر النهائي
        this.castle = {
            x: worldWidth - 350,
            y: groundY - 220,
            width: 220,
            height: 220,
            reached: false,
            flagWave: 0
        };
        
        // 🔥 الجسيمات
        this.particles = [];
        
        // 🔥 الكاميرا
        this.camera.x = 0;
        this.camera.y = 0;
        
        console.log(`✅ العالم مخلوق - العرض: ${worldWidth}px`);
    }
    
    startGame() {
        console.log('🚀 بدء لعبة جديدة');
        
        try {
            // إعادة تعيين الإحصائيات
            this.score = 0;
            this.lives = 3;
            this.timeLeft = 120;
            this.coins = 0;
            this.kills = 0;
            
            // إعادة إنشاء العالم
            this.createGameWorld();
            
            // إظهار شاشة اللعب
            this.showScreen('game');
            
            // بدء المؤقت
            this.startTimer();
            
            // تحديث الواجهة
            this.updateUI();
            
            console.log('🎮 اللعبة بدأت');
            
        } catch (error) {
            console.error('❌ خطأ في بدء اللعبة:', error);
            this.showError('فشل بدء اللعبة: ' + error.message);
        }
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
        try {
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
            
        } catch (error) {
            console.log('⚠️ خطأ في تحديث الواجهة:', error);
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
        
        console.log('⏸️ اللعبة متوقفة');
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.startTimer();
        
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        this.startGameLoop();
        console.log('▶️ اللعبة مستمرة');
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
        
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        this.frameCount++;
        
        try {
            // التحديث
            this.update(deltaTime);
            
            // الرسم
            this.draw();
            
        } catch (error) {
            console.error('❌ خطأ في حلقة اللعبة:', error);
            this.showError('خطأ في اللعبة: ' + error.message);
            return;
        }
        
        // الاستمرار
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (!this.player) return;
        
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateCoins(deltaTime);
        this.updateMushrooms(deltaTime);
        this.updateParticles(deltaTime);
        this.updateCamera();
        this.checkCollisions();
        this.checkEndConditions();
    }
    
    updatePlayer(deltaTime) {
        const player = this.player;
        const dt = deltaTime * 60; // تحويل إلى إطارات
        
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
                8,
                '#FFD700'
            );
        }
        
        if (!jumpPressed) {
            player.canJump = true;
        }
        
        // 🔥 جاذبية
        player.velY += 0.8 * dt / 60;
        player.velY = Math.min(player.velY, 20);
        
        // 🔥 تحديث الموقع
        player.x += player.velX * dt / 60;
        player.y += player.velY * dt / 60;
        
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
                player.x = Math.max(150, this.camera.x + 150);
                player.y = this.canvas.height - 200;
                player.velX = 0;
                player.velY = 0;
                break;
            }
        }
        
        // 🔥 سقوط عام
        if (player.y > this.canvas.height + 200) {
            this.playerDamaged();
            player.x = Math.max(150, this.camera.x + 150);
            player.y = this.canvas.height - 200;
            player.velX = 0;
            player.velY = 0;
        }
        
        // 🔥 مناعة
        if (player.invincible) {
            player.invincibleTime -= deltaTime;
            if (player.invincibleTime <= 0) {
                player.invincible = false;
                player.invincibleTime = 0;
            }
        }
    }
    
    updateEnemies(deltaTime) {
        const dt = deltaTime * 60;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // الحركة
            enemy.x += enemy.speed * enemy.dir * dt / 60;
            enemy.anim += deltaTime * 3;
            
            // تغيير الاتجاه عند الحدود
            const worldWidth = this.canvas.width * 4;
            if (enemy.x < 0 || enemy.x + enemy.width > worldWidth) {
                enemy.dir *= -1;
                enemy.x = Math.max(0, Math.min(worldWidth - enemy.width, enemy.x));
            }
            
            // تأرجح بسيط
            enemy.y = (this.canvas.height - 105) + Math.sin(enemy.anim) * 5;
        });
    }
    
    updateCoins(deltaTime) {
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                coin.anim += deltaTime * 4;
                coin.rotation += deltaTime * 3;
            }
        });
    }
    
    updateMushrooms(deltaTime) {
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.collected) {
                mushroom.bounce += deltaTime * 5;
            }
        });
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.velX;
            particle.y += particle.velY;
            particle.velY += 0.3;
            particle.life -= 0.03;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateCamera() {
        if (!this.player) return;
        
        const player = this.player;
        const canvas = this.canvas;
        
        const targetX = player.x - canvas.width / 2 + player.width / 2;
        const targetY = player.y - canvas.height / 2 + player.height / 2;
        
        // تتبع سلس
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.08;
        
        // حدود الكاميرا
        const worldWidth = canvas.width * 4;
        this.camera.x = Math.max(0, Math.min(worldWidth - canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(canvas.height - canvas.height, this.camera.y));
    }
    
    checkCollisions() {
        const player = this.player;
        
        // 🔥 جمع العملات
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const dx = player.x + player.width / 2 - coin.x;
                const dy = player.y + player.height / 2 - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30) {
                    coin.collected = true;
                    this.coins++;
                    this.score += 100;
                    this.updateUI();
                    
                    // جسيمات العملة
                    this.createParticles(coin.x, coin.y, 12, '#FFD700');
                    
                    // صوت العملة (محاكاة)
                    console.log('💰 +100 نقطة');
                }
            }
        });
        
        // 🔥 جمع الفطر
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.collected) {
                const dx = player.x + player.width / 2 - mushroom.x;
                const dy = player.y + player.height / 2 - mushroom.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 40) {
                    mushroom.collected = true;
                    this.score += 500;
                    player.invincible = true;
                    player.invincibleTime = 10;
                    this.updateUI();
                    
                    // جسيمات الفطر
                    this.createParticles(mushroom.x, mushroom.y, 15, '#E74C3C');
                    
                    console.log('🍄 +500 نقطة + مناعة');
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
                    player.velY = -12;
                    this.updateUI();
                    
                    // جسيمات هزيمة العدو
                    this.createParticles(
                        enemy.x + enemy.width / 2,
                        enemy.y + enemy.height / 2,
                        15,
                        '#EF476F'
                    );
                    
                    console.log('👹 +200 نقطة');
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
            this.player.invincibleTime = 3;
            this.player.velY = -10;
            this.player.velX = this.player.facingRight ? -10 : 10;
            
            // جسيمات الضرر
            this.createParticles(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                10,
                '#EF476F'
            );
            
            console.log('💔 حياة واحدة أقل');
        }
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 4;
            
            this.particles.push({
                x, y,
                velX: Math.cos(angle) * speed,
                velY: Math.sin(angle) * speed - 2,
                size: 2 + Math.random() * 4,
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
            
            const playerCenterX = player.x + player.width / 2;
            const playerCenterY = player.y + player.height / 2;
            const castleCenterX = castle.x + castle.width / 2;
            const castleCenterY = castle.y + castle.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(playerCenterX - castleCenterX, 2) + 
                Math.pow(playerCenterY - castleCenterY, 2)
            );
            
            if (distance < 180) {
                castle.reached = true;
                this.score += 2000;
                this.endGame(true);
                return;
            }
        }
        
        // 🔥 الفوز بالوصول لنهاية العالم
        const worldWidth = this.canvas.width * 4;
        if (this.player.x >= worldWidth - 250) {
            this.endGame(true);
            return;
        }
    }
    
    endGame(isWin) {
        console.log(isWin ? '🏆 فوز!' : '💀 خسارة!');
        
        this.gameState = 'ended';
        
        // إيقاف المؤقتات
        clearInterval(this.gameTimer);
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // حفظ أفضل نتيجة
        this.saveHighScore();
        
        // تحديث عناصر شاشة النهاية
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
            
            let message = '';
            if (isWin) {
                if (this.castle && this.castle.reached) {
                    message = `🎉 وصلت للقصر النهائي! جمعت ${this.coins} عملة من ${this.totalCoins}`;
                } else if (this.coins >= this.totalCoins) {
                    message = `🎊 جمعت كل العملات! ${this.coins}/${this.totalCoins}`;
                } else {
                    message = `🚀 وصلت لنهاية العالم! النتيجة: ${this.score}`;
                }
            } else {
                message = 'حاول مرة أخرى في المرة القادمة!';
            }
            
            if (endMessage) {
                endMessage.textContent = message;
            }
            
            // تحديث الإحصائيات النهائية
            const elements = {
                'final-score': this.score,
                'final-coins': `${this.coins}/${this.totalCoins}`,
                'final-time': this.formatTime(120 - this.timeLeft),
                'final-kills': this.kills
            };
            
            for (const [id, value] of Object.entries(elements)) {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            }
            
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
        console.log('🔄 إعادة تشغيل اللعبة');
        this.startGame();
    }
    
    drawStartScreen() {
        if (!this.canvas || !this.ctx) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // خلفية متدرجة
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // النجوم
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 2 + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // عنوان
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Cairo';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 20;
        ctx.fillText('🎮 لعبة ماريو', canvas.width / 2, canvas.height / 2 - 100);
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#4ECDC4';
        ctx.font = '28px Cairo';
        ctx.fillText('مغامرة حقيقية مع شخصيتك', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.fillStyle = '#E74C3C';
        ctx.font = '22px Cairo';
        ctx.fillText('اضغط على "ابدأ اللعب" للبدء', canvas.width / 2, canvas.height / 2 + 40);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '18px Cairo';
        ctx.fillText('مشروع مبرمج بلغة JavaScript', canvas.width / 2, canvas.height / 2 + 100);
        
        // مؤشر ترحيبي
        ctx.fillStyle = '#FFD700';
        ctx.font = '16px Cairo';
        ctx.fillText('← استخدم مفاتيح الأسهم للتحرك ↑ للقفز', canvas.width / 2, canvas.height - 50);
    }
    
    draw() {
        if (!this.canvas || !this.ctx || !this.player) {
            console.log('⚠️ لا يمكن الرسم - عناصر مفقودة');
            return;
        }
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // مسح الشاشة
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // حفظ حالة Canvas
        ctx.save();
        
        // تطبيق حركة الكاميرا
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // 🔥 1. رسم الخلفية
        this.drawBackground();
        
        // 🔥 2. رسم الأرض والمنصات
        this.drawPlatforms();
        
        // 🔥 3. رسم الحفر
        this.drawPits();
        
        // 🔥 4. رسم العملات
        this.drawCoins();
        
        // 🔥 5. رسم الفطر
        this.drawMushrooms();
        
        // 🔥 6. رسم الأعداء
        this.drawEnemies();
        
        // 🔥 7. رسم القصر
        this.drawCastle();
        
        // 🔥 8. رسم الجسيمات
        this.drawParticles();
        
        // 🔥 9. رسم اللاعب
        this.drawPlayer();
        
        // استعادة حالة Canvas
        ctx.restore();
        
        // 🔥 10. رسم معلومات التصحيح (إذا تم تفعيل وضع التصحيح)
        if (window.location.hash === '#debug') {
            this.drawDebugInfo();
        }
    }
    
    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const worldWidth = canvas.width * 4;
        
        // السماء
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.7, '#5DADE2');
        skyGradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, worldWidth, canvas.height);
        
        // سحب
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 15; i++) {
            const x = (this.camera.x * 0.05 + i * 350) % (worldWidth + 500);
            const y = 40 + Math.sin(this.frameCount * 0.003 + i) * 25;
            this.drawCloud(x, y, 70 + Math.sin(i) * 20);
        }
        
        // جبال بعيدة
        ctx.fillStyle = 'rgba(44, 62, 80, 0.6)';
        for (let i = 0; i < 12; i++) {
            const x = i * 600;
            const height = 80 + Math.sin(i * 0.8) * 40;
            this.drawMountain(x, canvas.height - height - 60, 300, height);
        }
        
        // جبال قريبة
        ctx.fillStyle = '#2C3E50';
        for (let i = 0; i < 10; i++) {
            const x = i * 500 + 100;
            const height = 120 + Math.cos(i * 0.7) * 50;
            this.drawMountain(x, canvas.height - height - 50, 250, height);
        }
    }
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            // جسم المنصة
            if (platform.type === 'ground') {
                // الأرض
                const groundGradient = ctx.createLinearGradient(
                    platform.x, platform.y,
                    platform.x, platform.y + platform.height
                );
                groundGradient.addColorStop(0, '#8B4513');
                groundGradient.addColorStop(1, '#654321');
                ctx.fillStyle = groundGradient;
            } else {
                // المنصات العائمة
                const platformGradient = ctx.createLinearGradient(
                    platform.x, platform.y,
                    platform.x, platform.y + platform.height
                );
                platformGradient.addColorStop(0, '#A0522D');
                platformGradient.addColorStop(1, '#8B4513');
                ctx.fillStyle = platformGradient;
            }
            
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل المنصة
            ctx.fillStyle = platform.type === 'ground' ? '#A0522D' : '#8B4513';
            const patternSize = 20;
            for (let i = 0; i < platform.width; i += patternSize) {
                for (let j = 0; j < platform.height; j += 10) {
                    if ((i / patternSize + j / 10) % 2 === 0) {
                        ctx.fillRect(
                            platform.x + i,
                            platform.y + j,
                            patternSize / 2,
                            5
                        );
                    }
                }
            }
            
            // ظل المنصة
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(
                platform.x,
                platform.y + platform.height,
                platform.width,
                8
            );
        });
    }
    
    drawPits() {
        const ctx = this.ctx;
        
        this.pits.forEach(pit => {
            // الحفرة
            const pitGradient = ctx.createLinearGradient(
                pit.x, pit.y,
                pit.x, pit.y + pit.height
            );
            pitGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
            pitGradient.addColorStop(1, 'rgba(50, 50, 50, 0.9)');
            ctx.fillStyle = pitGradient;
            ctx.fillRect(pit.x, pit.y, pit.width, pit.height);
            
            // حواف الحفرة
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(pit.x - 8, pit.y, 8, 25);
            ctx.fillRect(pit.x + pit.width, pit.y, 8, 25);
            
            // تحذير
            ctx.fillStyle = '#E74C3C';
            ctx.font = 'bold 16px Cairo';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️', pit.x + pit.width / 2, pit.y - 20);
        });
    }
    
    drawCoins() {
        const ctx = this.ctx;
        
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.anim) * 15;
                const y = coin.y + bounce;
                
                // هالة العملة
                ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
                ctx.beginPath();
                ctx.arc(coin.x, y, coin.size + 5, 0, Math.PI * 2);
                ctx.fill();
                
                // العملة الذهبية
                ctx.save();
                ctx.translate(coin.x, y);
                ctx.rotate(coin.rotation);
                
                const coinGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coin.size);
                coinGradient.addColorStop(0, '#FFD700');
                coinGradient.addColorStop(1, '#FFA500');
                ctx.fillStyle = coinGradient;
                
                ctx.beginPath();
                ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
                ctx.fill();
                
                // بريق العملة
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(-coin.size * 0.3, -coin.size * 0.3, coin.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
                
                // تأثير اللمعان
                if (Math.floor(this.frameCount / 5) % 2 === 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.beginPath();
                    ctx.arc(coin.x, y, coin.size * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }
    
    drawMushrooms() {
        const ctx = this.ctx;
        
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.collected) {
                const bounce = Math.sin(mushroom.bounce) * 5;
                const y = mushroom.y + bounce;
                
                // ساق الفطر
                ctx.fillStyle = '#FFF';
                ctx.fillRect(mushroom.x - 6, y + 10, 12, 15);
                
                // جسم الفطر
                const mushroomGradient = ctx.createRadialGradient(
                    mushroom.x, y, 0,
                    mushroom.x, y, 18
                );
                mushroomGradient.addColorStop(0, '#E74C3C');
                mushroomGradient.addColorStop(1, '#C0392B');
                ctx.fillStyle = mushroomGradient;
                
                ctx.beginPath();
                ctx.arc(mushroom.x, y, 18, 0, Math.PI * 2);
                ctx.fill();
                
                // نقاط بيضاء
                ctx.fillStyle = '#FFF';
                const dots = [
                    { x: -8, y: -6 },
                    { x: 8, y: -6 },
                    { x: 0, y: 0 },
                    { x: -5, y: 5 },
                    { x: 5, y: 5 }
                ];
                
                dots.forEach(dot => {
                    ctx.beginPath();
                    ctx.arc(mushroom.x + dot.x, y + dot.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                });
                
                // تأثير اللمعان
                if (Math.floor(this.frameCount / 8) % 2 === 0) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(mushroom.x, y, 22, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        });
    }
    
    drawEnemies() {
        const ctx = this.ctx;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // جسم العدو
            const enemyGradient = ctx.createLinearGradient(
                enemy.x, enemy.y,
                enemy.x, enemy.y + enemy.height
            );
            enemyGradient.addColorStop(0, '#EF476F');
            enemyGradient.addColorStop(1, '#C0392B');
            ctx.fillStyle = enemyGradient;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // عيون العدو
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(enemy.x + 10, enemy.y + 10, 10, 10);
            ctx.fillRect(enemy.x + enemy.width - 20, enemy.y + 10, 10, 10);
            
            // تفاصيل العيون
            ctx.fillStyle = '#FFF';
            ctx.fillRect(enemy.x + 13, enemy.y + 13, 4, 4);
            ctx.fillRect(enemy.x + enemy.width - 17, enemy.y + 13, 4, 4);
            
            // فم العدو
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 15, enemy.y + 30, enemy.width - 30, 5);
            
            // أرجل العدو
            ctx.fillStyle = '#C0392B';
            ctx.fillRect(enemy.x + 8, enemy.y + enemy.height, 8, 6);
            ctx.fillRect(enemy.x + enemy.width - 16, enemy.y + enemy.height, 8, 6);
            
            // حركة المشي
            const walkOffset = Math.sin(enemy.anim * 2) * 3;
            ctx.fillRect(enemy.x + 5, enemy.y + enemy.height + walkOffset, 6, 4);
            ctx.fillRect(enemy.x + enemy.width - 11, enemy.y + enemy.height - walkOffset, 6, 4);
        });
    }
    
    drawCastle() {
        if (!this.castle) return;
        
        const ctx = this.ctx;
        const castle = this.castle;
        castle.flagWave += 0.1;
        
        // قاعدة القصر
        const baseGradient = ctx.createLinearGradient(
            castle.x, castle.y,
            castle.x, castle.y + castle.height
        );
        baseGradient.addColorStop(0, '#8B4513');
        baseGradient.addColorStop(1, '#654321');
        ctx.fillStyle = baseGradient;
        ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        // أبراج القصر
        const towerWidth = castle.width * 0.2;
        const towerGradient = ctx.createLinearGradient(
            castle.x, castle.y - 100,
            castle.x, castle.y
        );
        towerGradient.addColorStop(0, '#A0522D');
        towerGradient.addColorStop(1, '#8B4513');
        ctx.fillStyle = towerGradient;
        
        // البرج الأيسر
        ctx.fillRect(castle.x - 15, castle.y - 120, towerWidth + 10, 120);
        // البرج الأيمن
        ctx.fillRect(castle.x + castle.width - towerWidth + 5, castle.y - 120, towerWidth + 10, 120);
        
        // أسطح الأبراج
        ctx.fillStyle = '#654321';
        ctx.fillRect(castle.x - 20, castle.y - 130, towerWidth + 20, 10);
        ctx.fillRect(castle.x + castle.width - towerWidth, castle.y - 130, towerWidth + 20, 10);
        
        // نوافذ القصر
        ctx.fillStyle = '#FFD700';
        for (let floor = 0; floor < 3; floor++) {
            for (let pos = 0; pos < 4; pos++) {
                const windowX = castle.x + 30 + pos * 45;
                const windowY = castle.y + 30 + floor * 55;
                
                // إطار النافذة
                ctx.fillStyle = '#654321';
                ctx.fillRect(windowX - 3, windowY - 3, 31, 26);
                
                // النافذة
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(windowX, windowY, 25, 20);
                
                // تفاصيل النافذة
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(windowX, windowY, 25, 2); // أعلى
                ctx.fillRect(windowX + 11, windowY, 2, 20); // عمودي
            }
        }
        
        // العلم
        ctx.save();
        ctx.translate(castle.x + castle.width / 2, castle.y - 150);
        ctx.rotate(Math.sin(castle.flagWave) * 0.1);
        
        // سارية العلم
        ctx.fillStyle = '#654321';
        ctx.fillRect(-3, 0, 6, 50);
        
        // العلم
        const flagGradient = ctx.createLinearGradient(0, 0, 25, 0);
        flagGradient.addColorStop(0, '#E74C3C');
        flagGradient.addColorStop(1, '#C0392B');
        ctx.fillStyle = flagGradient;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(25, 15);
        ctx.lineTo(0, 25);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // الباب
        const doorGradient = ctx.createLinearGradient(
            castle.x + castle.width / 2 - 35,
            castle.y + castle.height - 90,
            castle.x + castle.width / 2 - 35,
            castle.y + castle.height
        );
        doorGradient.addColorStop(0, '#654321');
        doorGradient.addColorStop(1, '#3D2506');
        ctx.fillStyle = doorGradient;
        ctx.fillRect(castle.x + castle.width / 2 - 35, castle.y + castle.height - 90, 70, 90);
        
        // مقبض الباب
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(castle.x + castle.width / 2 + 20, castle.y + castle.height - 45, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // كتابة فوق القصر
        if (!castle.reached) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 24px Cairo';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.fillText('🏆 القصر النهائي', castle.x + castle.width / 2, castle.y - 180);
            ctx.shadowBlur = 0;
        }
    }
    
    drawParticles() {
        const ctx = this.ctx;
        
        this.particles.forEach(particle => {
            ctx.globalAlpha = particle.life;
            
            const particleGradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );
            particleGradient.addColorStop(0, particle.color);
            particleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = particleGradient;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalAlpha = 1;
        });
    }
    
    drawPlayer() {
        if (!this.player) return;
        
        const ctx = this.ctx;
        const player = this.player;
        
        if (this.assets.player && this.assets.loaded && this.assets.player.complete) {
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
            
            // تأثير المناعة
            if (player.invincible && Math.floor(Date.now() / 150) % 2 === 0) {
                ctx.globalAlpha = 0.5;
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 4;
                ctx.strokeRect(
                    player.facingRight ? player.x : -player.x - player.width,
                    player.y,
                    player.width,
                    player.height
                );
                ctx.globalAlpha = 1;
            }
            
            ctx.restore();
        } else {
            // رسم بديل للاعب
            const playerColor = player.invincible ? '#9B59B6' : '#E74C3C';
            
            // جسم اللاعب
            const bodyGradient = ctx.createLinearGradient(
                player.x, player.y,
                player.x, player.y + player.height
            );
            bodyGradient.addColorStop(0, playerColor);
            bodyGradient.addColorStop(1, playerColor === '#9B59B6' ? '#8E44AD' : '#C0392B');
            ctx.fillStyle = bodyGradient;
            ctx.fillRect(player.x, player.y, player.width, player.height);
            
            // رأس اللاعب
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(player.x + 10, player.y + 10, 20, 20);
            
            // عيون اللاعب
            ctx.fillStyle = '#FFF';
            ctx.fillRect(player.x + 15, player.y + 15, 5, 5);
            ctx.fillRect(player.x + 25, player.y + 15, 5, 5);
            
            // فم اللاعب
            ctx.fillStyle = '#FFF';
            const mouthWidth = 12;
            const mouthX = player.x + 19;
            const mouthY = player.y + 27;
            ctx.fillRect(mouthX, mouthY, mouthWidth, 4);
            
            // تأثير المناعة
            if (player.invincible && Math.floor(Date.now() / 150) % 2 === 0) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 4;
                ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
            }
        }
        
        // ظل اللاعب
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        const shadowWidth = player.width * 0.7;
        const shadowHeight = 8;
        ctx.fillRect(
            player.x + (player.width - shadowWidth) / 2,
            player.y + player.height,
            shadowWidth,
            shadowHeight
        );
    }
    
    drawCloud(x, y, size) {
        const ctx = this.ctx;
        ctx.beginPath();
        
        // رسم سحابة دائرية
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.25, 0, Math.PI * 2);
        ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
        ctx.arc(x + size * 0.4, y + size * 0.15, size * 0.2, 0, Math.PI * 2);
        ctx.arc(x + size * 0.2, y + size * 0.1, size * 0.22, 0, Math.PI * 2);
        
        ctx.fill();
    }
    
    drawMountain(x, y, width, height) {
        const ctx = this.ctx;
        ctx.beginPath();
        
        ctx.moveTo(x, y + height);
        ctx.lineTo(x + width * 0.3, y + height * 0.3);
        ctx.lineTo(x + width * 0.5, y);
        ctx.lineTo(x + width * 0.7, y + height * 0.3);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
        
        ctx.fill();
        
        // ثلج على القمة
        if (height > 80) {
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.moveTo(x + width * 0.4, y + height * 0.25);
            ctx.lineTo(x + width * 0.6, y + height * 0.25);
            ctx.lineTo(x + width * 0.5, y + height * 0.1);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.fillStyle = '#2C3E50';
    }
    
    drawDebugInfo() {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#FFF';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const debugInfo = [
            `الحالة: ${this.gameState}`,
            `اللاعب: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
            `الكاميرا: (${Math.round(this.camera.x)}, ${Math.round(this.camera.y)})`,
            `النتيجة: ${this.score}`,
            `العملات: ${this.coins}/${this.totalCoins}`,
            `الأرواح: ${this.lives}`,
            `الوقت: ${this.timeLeft}s`,
            `الأعداء: ${this.enemies.filter(e => e.active).length}/${this.enemies.length}`,
            `الجسيمات: ${this.particles.length}`
        ];
        
        debugInfo.forEach((text, i) => {
            ctx.fillText(text, 10, 10 + i * 20);
        });
    }
    
    showError(message) {
        console.error('❌ خطأ:', message);
        
        try {
            const errorContainer = document.getElementById('error-container');
            const errorDetails = document.getElementById('error-details');
            
            if (errorContainer && errorDetails) {
                errorDetails.textContent = message;
                errorContainer.style.display = 'flex';
            }
            
            // إخفاء شاشة التحميل إذا كانت ظاهرة
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'none';
            }
            
        } catch (error) {
            console.error('❌ فشل عرض رسالة الخطأ:', error);
        }
    }
}

// ============================================
// تهيئة اللعبة عند تحميل الصفحة
// ============================================

// متغير اللعبة العام
let game = null;

// تهيئة اللعبة عند تحميل الصفحة
window.addEventListener('load', function() {
    console.log('📄 الصفحة محملة - تهيئة اللعبة...');
    
    try {
        // تأخير بسيط لضمان تحميل جميع الموارد
        setTimeout(function() {
            game = new MarioGame();
            console.log('✅ اللعبة جاهزة للعب!');
            
            // جعل اللعبة متاحة عالمياً للتصحيح
            window.marioGame = game;
            
        }, 500);
        
    } catch (error) {
        console.error('❌ فشل إنشاء اللعبة:', error);
        
        const errorContainer = document.getElementById('error-container');
        const errorDetails = document.getElementById('error-details');
        
        if (errorContainer && errorDetails) {
            errorDetails.textContent = 'فشل تحميل اللعبة: ' + error.message;
            errorContainer.style.display = 'flex';
        }
    }
});

// تنظيف عند إغلاق الصفحة
window.addEventListener('beforeunload', function() {
    if (game) {
        game.pauseGame();
    }
});

// إعادة الحجم
window.addEventListener('resize', function() {
    if (game && game.setupCanvas) {
        game.setupCanvas();
    }
});

// وضع التصحيح - إضافة #debug إلى الرابط لعرض معلومات التصحيح
if (window.location.hash === '#debug') {
    console.log('🔧 وضع التصحيح مفعّل');
    console.log('🎮 استخدم window.marioGame للوصول إلى كائن اللعبة');
}
