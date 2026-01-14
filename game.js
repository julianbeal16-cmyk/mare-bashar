// ============================================
// 🎮 GAME ENGINE - النسخة الخارقة المثبتة
// ============================================

'use strict';

console.log('🎮 بدء تحميل لعبة ماريو...');

class MarioGame {
    constructor() {
        console.log('🔧 إنشاء نسخة جديدة من اللعبة');
        
        // 🔥 متغيرات اللعبة
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
        
        // 🔥 التهيئة الفورية
        this.initializeGame();
    }
    
    initializeGame() {
        try {
            console.log('🚀 التهيئة الفورية للعبة...');
            
            // 🔥 الحصول على Canvas مباشرة
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                console.error('❌ Canvas غير موجود!');
                this.createEmergencyCanvas();
                return;
            }
            
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                console.error('❌ سياق Canvas غير مدعوم!');
                return;
            }
            
            console.log('✅ Canvas جاهز');
            
            // 🔥 تهيئة حجم Canvas
            this.initializeCanvas();
            
            // 🔥 تحميل الصورة
            this.loadPlayerImage();
            
            // 🔥 تهيئة الأحداث
            this.initializeEvents();
            
            // 🔥 إنشاء العالم
            this.createGameWorld();
            
            // 🔥 تحميل أفضل نتيجة
            this.loadHighScore();
            
            // 🔥 تحديث الواجهة
            this.updateUI();
            
            // 🔥 تغيير الحالة
            this.gameState = 'ready';
            
            console.log('✅ اللعبة مهيأة وجاهزة');
            
            // 🔥 تأكيد للكونسول
            this.debugInfo();
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showEmergencyMessage('خطأ: ' + error.message);
        }
    }
    
    createEmergencyCanvas() {
        console.log('🆘 إنشاء Canvas طارئ...');
        
        // إنشاء Canvas طارئ
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            const emergencyCanvas = document.createElement('canvas');
            emergencyCanvas.id = 'emergency-canvas';
            emergencyCanvas.width = 800;
            emergencyCanvas.height = 500;
            emergencyCanvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #87CEEB;
                display: block;
                z-index: 10;
            `;
            gameArea.appendChild(emergencyCanvas);
            
            this.canvas = emergencyCanvas;
            this.ctx = emergencyCanvas.getContext('2d');
            
            // رسم رسالة
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 30px Cairo';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🎮 اللعبة تعمل في وضع الطوارئ', 400, 200);
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '20px Cairo';
            this.ctx.fillText('استخدم مفاتيح الأسهم للتحرك', 400, 250);
        }
    }
    
    initializeCanvas() {
        console.log('📏 تهيئة حجم Canvas...');
        
        const updateCanvasSize = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                const width = gameArea.clientWidth || 800;
                const height = gameArea.clientHeight || 500;
                
                this.canvas.width = width;
                this.canvas.height = height;
                
                // إظهار Canvas
                this.canvas.style.display = 'block';
                this.canvas.classList.add('visible');
                
                console.log(`📐 حجم Canvas: ${width}x${height}`);
            }
        };
        
        // التهيئة الفورية
        updateCanvasSize();
        
        // تحديث عند تغيير الحجم
        window.addEventListener('resize', updateCanvasSize);
        
        // إعادة التحجيم بعد تأخير بسيط
        setTimeout(updateCanvasSize, 100);
        setTimeout(updateCanvasSize, 500);
        setTimeout(updateCanvasSize, 1000);
    }
    
    loadPlayerImage() {
        console.log('🖼️ تحميل صورة اللاعب...');
        
        const img = new Image();
        
        img.onload = () => {
            console.log('✅ صورة اللاعب محملة بنجاح');
            this.assets.player = img;
            this.assets.loaded = true;
            
            // إذا كنا في شاشة البداية، ارسمها
            if (this.gameState === 'ready') {
                this.drawStartScreen();
            }
        };
        
        img.onerror = () => {
            console.log('⚠️ فشل تحميل الصورة، استخدام رسم بديل');
            this.assets.player = null;
            this.assets.loaded = true;
        };
        
        // محاولة مسارات مختلفة
        img.src = './assets/player.png';
        
        // Timeout احتياطي
        setTimeout(() => {
            if (!this.assets.loaded) {
                console.log('⏰ انتهى وقت تحميل الصورة');
                this.assets.loaded = true;
            }
        }, 3000);
    }
    
    initializeEvents() {
        console.log('🎮 تهيئة أحداث التحكم...');
        
        // 🔥 أحداث أزرار الشاشات
        this.initializeScreenButtons();
        
        // 🔥 أحداث التحكم باللمس
        this.initializeTouchControls();
        
        // 🔥 أحداث لوحة المفاتيح
        this.initializeKeyboardControls();
        
        console.log('✅ أحداث التحكم جاهزة');
    }
    
    initializeScreenButtons() {
        // زر البداية
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                console.log('🎮 زر البداية مضغوط');
                e.preventDefault();
                e.stopPropagation();
                this.startGame();
            });
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
    
    initializeTouchControls() {
        // 🔥 زر اليسار
        const leftBtn = document.getElementById('left-btn');
        if (leftBtn) {
            const leftEvents = {
                start: (e) => {
                    e.preventDefault();
                    this.touchControls.left = true;
                },
                end: (e) => {
                    e.preventDefault();
                    this.touchControls.left = false;
                }
            };
            
            leftBtn.addEventListener('touchstart', leftEvents.start);
            leftBtn.addEventListener('mousedown', leftEvents.start);
            leftBtn.addEventListener('touchend', leftEvents.end);
            leftBtn.addEventListener('mouseup', leftEvents.end);
            leftBtn.addEventListener('mouseleave', leftEvents.end);
        }
        
        // 🔥 زر اليمين
        const rightBtn = document.getElementById('right-btn');
        if (rightBtn) {
            const rightEvents = {
                start: (e) => {
                    e.preventDefault();
                    this.touchControls.right = true;
                },
                end: (e) => {
                    e.preventDefault();
                    this.touchControls.right = false;
                }
            };
            
            rightBtn.addEventListener('touchstart', rightEvents.start);
            rightBtn.addEventListener('mousedown', rightEvents.start);
            rightBtn.addEventListener('touchend', rightEvents.end);
            rightBtn.addEventListener('mouseup', rightEvents.end);
            rightBtn.addEventListener('mouseleave', rightEvents.end);
        }
        
        // 🔥 زر القفز
        const jumpBtn = document.getElementById('jump-btn');
        if (jumpBtn) {
            const jumpEvents = {
                start: (e) => {
                    e.preventDefault();
                    this.touchControls.jump = true;
                },
                end: (e) => {
                    e.preventDefault();
                    this.touchControls.jump = false;
                }
            };
            
            jumpBtn.addEventListener('touchstart', jumpEvents.start);
            jumpBtn.addEventListener('mousedown', jumpEvents.start);
            jumpBtn.addEventListener('touchend', jumpEvents.end);
            jumpBtn.addEventListener('mouseup', jumpEvents.end);
            jumpBtn.addEventListener('mouseleave', jumpEvents.end);
        }
    }
    
    initializeKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
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
    
    showScreen(screenName) {
        console.log(`🔄 تغيير الشاشة إلى: ${screenName}`);
        
        // إخفاء كل الشاشات
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.style.display = 'none';
        });
        
        // إظهار الشاشة المطلوبة
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.style.display = 'flex';
            this.gameState = screenName;
            
            // إذا كانت شاشة البداية، ارسمها
            if (screenName === 'start') {
                this.drawStartScreen();
            }
            
            // إذا كانت شاشة اللعب، ابدأ اللعبة
            if (screenName === 'game') {
                setTimeout(() => {
                    this.startGame();
                }, 100);
            }
        }
    }
    
    createGameWorld() {
        console.log('🌍 إنشاء عالم اللعبة...');
        
        if (!this.canvas) return;
        
        const canvas = this.canvas;
        const worldWidth = canvas.width * 4;
        const groundY = canvas.height - 80;
        
        // 🔥 اللاعب
        this.player = {
            x: 200,
            y: groundY - 120,
            width: 40,
            height: 60,
            speed: 6,
            velX: 0,
            velY: 0,
            jumpPower: -14,
            grounded: false,
            facingRight: true,
            invincible: false,
            invincibleTime: 0,
            canJump: true
        };
        
        // 🔥 الأرض
        this.platforms = [
            { x: 0, y: groundY, width: worldWidth, height: 80, type: 'ground' }
        ];
        
        // 🔥 منصات إضافية
        const platformPositions = [
            { x: 350, y: groundY - 120 },
            { x: 650, y: groundY - 160 },
            { x: 950, y: groundY - 140 },
            { x: 1250, y: groundY - 180 },
            { x: 1550, y: groundY - 130 },
            { x: 1850, y: groundY - 150 },
            { x: 2150, y: groundY - 170 },
            { x: 2450, y: groundY - 140 },
            { x: 2750, y: groundY - 160 },
            { x: 3050, y: groundY - 150 }
        ];
        
        platformPositions.forEach(pos => {
            this.platforms.push({
                x: pos.x,
                y: pos.y,
                width: 200,
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
                x: platform.x + 40 + (i % 5) * 32,
                y: platform.y - 70,
                collected: false,
                anim: Math.random() * Math.PI * 2,
                size: 14
            });
        }
        
        // 🔥 الأعداء (8 أعداء)
        this.enemies = [];
        for (let i = 0; i < 8; i++) {
            this.enemies.push({
                x: 450 + i * 380,
                y: groundY - 50,
                width: 45,
                height: 45,
                dir: i % 2 === 0 ? 1 : -1,
                speed: 2.5,
                active: true
            });
        }
        
        // 🔥 الفطر (6 فطر)
        this.mushrooms = [];
        for (let i = 0; i < 6; i++) {
            this.mushrooms.push({
                x: 600 + i * 480,
                y: groundY - 130,
                collected: false
            });
        }
        
        // 🔥 الحفر
        this.pits = [
            { x: 1600, y: groundY, width: 110, height: 100 },
            { x: 2300, y: groundY, width: 110, height: 100 },
            { x: 3000, y: groundY, width: 130, height: 100 },
            { x: 3700, y: groundY, width: 150, height: 100 }
        ];
        
        // 🔥 القصر
        this.castle = {
            x: worldWidth - 400,
            y: groundY - 240,
            width: 240,
            height: 240,
            reached: false
        };
        
        // 🔥 جسيمات
        this.particles = [];
        
        console.log(`✅ العالم مخلوق - العرض: ${worldWidth}px`);
    }
    
    startGame() {
        console.log('🚀 بدء لعبة جديدة');
        
        // 🔥 إعادة تعيين الإحصائيات
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coins = 0;
        this.kills = 0;
        
        // 🔥 إعادة إنشاء العالم
        this.createGameWorld();
        
        // 🔥 إظهار شاشة اللعب
        this.showScreen('game');
        
        // 🔥 بدء المؤقت
        this.startTimer();
        
        // 🔥 تحديث الواجهة
        this.updateUI();
        
        // 🔥 بدء حلقة اللعبة
        this.startGameLoop();
        
        console.log('🎮 اللعبة بدأت!');
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
        
        try {
            // 🔥 التحديث
            this.update(deltaTime);
            
            // 🔥 الرسم
            this.draw();
            
        } catch (error) {
            console.error('❌ خطأ في حلقة اللعبة:', error);
            return;
        }
        
        // 🔥 الاستمرار
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (!this.player) return;
        
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
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
                6,
                '#FFD700'
            );
        }
        
        if (!jumpPressed) {
            player.canJump = true;
        }
        
        // 🔥 جاذبية
        player.velY += 0.8;
        player.velY = Math.min(player.velY, 16);
        
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
                player.x = 200;
                player.y = this.canvas.height - 200;
                player.velX = 0;
                player.velY = 0;
                break;
            }
        }
        
        // 🔥 سقوط عام
        if (player.y > this.canvas.height + 150) {
            this.playerDamaged();
            player.x = 200;
            player.y = this.canvas.height - 200;
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
            if (enemy.x < 50 || enemy.x + enemy.width > this.canvas.width * 4 - 50) {
                enemy.dir *= -1;
            }
        });
    }
    
    updateCamera() {
        if (!this.player) return;
        
        const player = this.player;
        const canvas = this.canvas;
        
        const targetX = player.x - canvas.width / 2 + player.width / 2;
        
        // تتبع سلس
        this.camera.x += (targetX - this.camera.x) * 0.15;
        
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
                
                if (distance < 30) {
                    coin.collected = true;
                    this.coins++;
                    this.score += 100;
                    this.updateUI();
                    
                    this.createParticles(coin.x, coin.y, 10, '#FFD700');
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
                    
                    this.createParticles(mushroom.x, mushroom.y, 15, '#E74C3C');
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
                    
                    this.createParticles(
                        enemy.x + enemy.width / 2,
                        enemy.y + enemy.height / 2,
                        12,
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
            this.player.invincibleTime = 3;
            this.player.velY = -10;
            this.player.velX = this.player.facingRight ? -10 : 10;
            
            this.createParticles(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                8,
                '#EF476F'
            );
        }
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                velX: (Math.random() - 0.5) * 8,
                velY: (Math.random() - 0.5) * 8 - 4,
                size: Math.random() * 4 + 2,
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
            
            if (distance < 180) {
                castle.reached = true;
                this.score += 2000;
                this.endGame(true);
                return;
            }
        }
        
        // 🔥 الفوز بالوصول لنهاية العالم
        if (this.player.x >= this.canvas.width * 4 - 250) {
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
                if (isWin) {
                    if (this.castle && this.castle.reached) {
                        endMessage.textContent = `🎉 وصلت للقصر النهائي! جمعت ${this.coins} عملة`;
                    } else if (this.coins >= this.totalCoins) {
                        endMessage.textContent = `🎊 جمعت كل العملات! ${this.coins}/${this.totalCoins}`;
                    } else {
                        endMessage.textContent = `🚀 وصلت لنهاية العالم! النتيجة: ${this.score}`;
                    }
                } else {
                    endMessage.textContent = 'حاول مرة أخرى في المرة القادمة!';
                }
            }
            
            // تحديث الإحصائيات النهائية
            const finalScore = document.getElementById('final-score');
            const finalCoins = document.getElementById('final-coins');
            const finalTime = document.getElementById('final-time');
            const finalKills = document.getElementById('final-kills');
            
            if (finalScore) finalScore.textContent = this.score;
            if (finalCoins) finalCoins.textContent = `${this.coins}/${this.totalCoins}`;
            if (finalTime) finalTime.textContent = this.formatTime(120 - this.timeLeft);
            if (finalKills) finalKills.textContent = this.kills;
            
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
        
        // خلفية
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // عنوان
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 45px Cairo';
        ctx.textAlign = 'center';
        ctx.fillText('🎮 لعبة ماريو', canvas.width / 2, canvas.height / 2 - 60);
        
        ctx.fillStyle = '#4ECDC4';
        ctx.font = '24px Cairo';
        ctx.fillText('مغامرة حقيقية مع شخصيتك', canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#E74C3C';
        ctx.font = '18px Cairo';
        ctx.fillText('اضغط على "ابدأ اللعب" للبدء', canvas.width / 2, canvas.height / 2 + 60);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '16px Cairo';
        ctx.fillText('مشروع مبرمج بلغة JavaScript', canvas.width / 2, canvas.height - 50);
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
        
        // 🔥 رسم الأرض والمنصات
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
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, worldWidth, canvas.height);
        
        // سحب
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 12; i++) {
            const x = (this.camera.x * 0.05 + i * 350) % (worldWidth + 500);
            const y = 40 + Math.sin(this.frameCount * 0.005 + i) * 25;
            this.drawCloud(x, y, 70);
        }
        
        // جبال بعيدة
        ctx.fillStyle = 'rgba(44, 62, 80, 0.5)';
        for (let i = 0; i < 10; i++) {
            const x = i * 650;
            const height = 90 + Math.sin(i * 0.8) * 40;
            this.drawMountain(x, canvas.height - height, 350, height);
        }
        
        // جبال قريبة
        ctx.fillStyle = '#2C3E50';
        for (let i = 0; i < 8; i++) {
            const x = i * 550 + 100;
            const height = 130 + Math.cos(i * 0.7) * 50;
            this.drawMountain(x, canvas.height - height, 280, height);
        }
    }
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            // جسم المنصة
            if (platform.type === 'ground') {
                // الأرض
                const gradient = ctx.createLinearGradient(
                    platform.x, platform.y,
                    platform.x, platform.y + platform.height
                );
                gradient.addColorStop(0, '#8B4513');
                gradient.addColorStop(1, '#654321');
                ctx.fillStyle = gradient;
            } else {
                // المنصات العائمة
                const gradient = ctx.createLinearGradient(
                    platform.x, platform.y,
                    platform.x, platform.y + platform.height
                );
                gradient.addColorStop(0, '#A0522D');
                gradient.addColorStop(1, '#8B4513');
                ctx.fillStyle = gradient;
            }
            
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل المنصة
            ctx.fillStyle = platform.type === 'ground' ? '#A0522D' : '#8B4513';
            const patternSize = 25;
            for (let i = 0; i < platform.width; i += patternSize) {
                for (let j = 0; j < platform.height; j += 8) {
                    if ((i / patternSize + j / 8) % 2 === 0) {
                        ctx.fillRect(
                            platform.x + i,
                            platform.y + j,
                            patternSize / 2,
                            4
                        );
                    }
                }
            }
            
            // ظل المنصة
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(
                platform.x,
                platform.y + platform.height,
                platform.width,
                10
            );
        });
    }
    
    drawPits() {
        const ctx = this.ctx;
        
        this.pits.forEach(pit => {
            // الحفرة
            const gradient = ctx.createLinearGradient(
                pit.x, pit.y,
                pit.x, pit.y + pit.height
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
            gradient.addColorStop(1, 'rgba(50, 50, 50, 1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(pit.x, pit.y, pit.width, pit.height);
            
            // حواف الحفرة
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(pit.x - 10, pit.y, 10, 30);
            ctx.fillRect(pit.x + pit.width, pit.y, 10, 30);
            
            // تحذير
            ctx.fillStyle = '#E74C3C';
            ctx.font = 'bold 20px Cairo';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️', pit.x + pit.width / 2, pit.y - 25);
        });
    }
    
    drawCoins() {
        const ctx = this.ctx;
        
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.anim) * 12;
                const y = coin.y + bounce;
                
                // هالة العملة
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(coin.x, y, coin.size + 6, 0, Math.PI * 2);
                ctx.fill();
                
                // العملة الذهبية
                const gradient = ctx.createRadialGradient(
                    coin.x, y, 0,
                    coin.x, y, coin.size
                );
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(1, '#FFA500');
                ctx.fillStyle = gradient;
                
                ctx.beginPath();
                ctx.arc(coin.x, y, coin.size, 0, Math.PI * 2);
                ctx.fill();
                
                // بريق العملة
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(coin.x - 4, y - 4, coin.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
                
                // تأثير اللمعان
                if (Math.floor(this.frameCount / 5) % 2 === 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.beginPath();
                    ctx.arc(coin.x, y, coin.size * 1.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }
    
    drawMushrooms() {
        const ctx = this.ctx;
        
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.collected) {
                // ساق الفطر
                ctx.fillStyle = '#FFF';
                ctx.fillRect(mushroom.x - 8, mushroom.y + 12, 16, 18);
                
                // جسم الفطر
                const gradient = ctx.createRadialGradient(
                    mushroom.x, mushroom.y, 0,
                    mushroom.x, mushroom.y, 20
                );
                gradient.addColorStop(0, '#E74C3C');
                gradient.addColorStop(1, '#C0392B');
                ctx.fillStyle = gradient;
                
                ctx.beginPath();
                ctx.arc(mushroom.x, mushroom.y, 20, 0, Math.PI * 2);
                ctx.fill();
                
                // نقاط بيضاء
                ctx.fillStyle = '#FFF';
                const dots = [
                    { x: -7, y: -7 },
                    { x: 7, y: -7 },
                    { x: 0, y: 0 },
                    { x: -5, y: 5 },
                    { x: 5, y: 5 }
                ];
                
                dots.forEach(dot => {
                    ctx.beginPath();
                    ctx.arc(mushroom.x + dot.x, mushroom.y + dot.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                });
                
                // تأثير اللمعان
                if (Math.floor(this.frameCount / 7) % 2 === 0) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(mushroom.x, mushroom.y, 24, 0, Math.PI * 2);
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
            const gradient = ctx.createLinearGradient(
                enemy.x, enemy.y,
                enemy.x, enemy.y + enemy.height
            );
            gradient.addColorStop(0, '#EF476F');
            gradient.addColorStop(1, '#C0392B');
            ctx.fillStyle = gradient;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // عيون العدو
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(enemy.x + 12, enemy.y + 12, 12, 12);
            ctx.fillRect(enemy.x + enemy.width - 24, enemy.y + 12, 12, 12);
            
            // تفاصيل العيون
            ctx.fillStyle = '#FFF';
            ctx.fillRect(enemy.x + 16, enemy.y + 16, 4, 4);
            ctx.fillRect(enemy.x + enemy.width - 20, enemy.y + 16, 4, 4);
            
            // فم العدو
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 18, enemy.y + 32, enemy.width - 36, 6);
            
            // أرجل العدو
            ctx.fillStyle = '#C0392B';
            ctx.fillRect(enemy.x + 10, enemy.y + enemy.height, 10, 8);
            ctx.fillRect(enemy.x + enemy.width - 20, enemy.y + enemy.height, 10, 8);
        });
    }
    
    drawCastle() {
        if (!this.castle) return;
        
        const ctx = this.ctx;
        const castle = this.castle;
        
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
        const towerWidth = castle.width * 0.22;
        const towerGradient = ctx.createLinearGradient(
            castle.x, castle.y - 140,
            castle.x, castle.y
        );
        towerGradient.addColorStop(0, '#A0522D');
        towerGradient.addColorStop(1, '#8B4513');
        ctx.fillStyle = towerGradient;
        
        // البرج الأيسر
        ctx.fillRect(castle.x - 12, castle.y - 140, towerWidth + 8, 140);
        // البرج الأيمن
        ctx.fillRect(castle.x + castle.width - towerWidth + 4, castle.y - 140, towerWidth + 8, 140);
        
        // أسطح الأبراج
        ctx.fillStyle = '#654321';
        ctx.fillRect(castle.x - 16, castle.y - 150, towerWidth + 16, 10);
        ctx.fillRect(castle.x + castle.width - towerWidth, castle.y - 150, towerWidth + 16, 10);
        
        // نوافذ القصر
        ctx.fillStyle = '#FFD700';
        for (let floor = 0; floor < 3; floor++) {
            for (let pos = 0; pos < 4; pos++) {
                const windowX = castle.x + 35 + pos * 50;
                const windowY = castle.y + 35 + floor * 60;
                
                // إطار النافذة
                ctx.fillStyle = '#654321';
                ctx.fillRect(windowX - 4, windowY - 4, 34, 28);
                
                // النافذة
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(windowX, windowY, 26, 20);
                
                // تفاصيل النافذة
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(windowX, windowY, 26, 3); // أعلى
                ctx.fillRect(windowX + 12, windowY, 2, 20); // عمودي
            }
        }
        
        // العلم
        ctx.save();
        ctx.translate(castle.x + castle.width / 2, castle.y - 160);
        
        // سارية العلم
        ctx.fillStyle = '#654321';
        ctx.fillRect(-4, 0, 8, 60);
        
        // العلم
        const flagGradient = ctx.createLinearGradient(0, 0, 30, 0);
        flagGradient.addColorStop(0, '#E74C3C');
        flagGradient.addColorStop(1, '#C0392B');
        ctx.fillStyle = flagGradient;
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(30, 18);
        ctx.lineTo(0, 28);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // الباب
        const doorGradient = ctx.createLinearGradient(
            castle.x + castle.width / 2 - 40,
            castle.y + castle.height - 100,
            castle.x + castle.width / 2 - 40,
            castle.y + castle.height
        );
        doorGradient.addColorStop(0, '#654321');
        doorGradient.addColorStop(1, '#3D2506');
        ctx.fillStyle = doorGradient;
        ctx.fillRect(castle.x + castle.width / 2 - 40, castle.y + castle.height - 100, 80, 100);
        
        // مقبض الباب
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(castle.x + castle.width / 2 + 25, castle.y + castle.height - 50, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // كتابة فوق القصر
        if (!castle.reached) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 26px Cairo';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 15;
            ctx.fillText('🏆 القصر النهائي', castle.x + castle.width / 2, castle.y - 200);
            ctx.shadowBlur = 0;
        }
    }
    
    drawParticles() {
        const ctx = this.ctx;
        
        this.particles.forEach((particle, i) => {
            particle.x += particle.velX;
            particle.y += particle.velY;
            particle.velY += 0.25;
            particle.life -= 0.03;
            
            ctx.globalAlpha = particle.life;
            
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalAlpha = 1;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        });
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
            
            // تأثير المناعة
            if (player.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.globalAlpha = 0.6;
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 5;
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
            const mouthWidth = 14;
            const mouthX = player.x + 18;
            const mouthY = player.y + 28;
            ctx.fillRect(mouthX, mouthY, mouthWidth, 5);
            
            // تأثير المناعة
            if (player.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 5;
                ctx.strokeRect(player.x - 3, player.y - 3, player.width + 6, player.height + 6);
            }
        }
        
        // ظل اللاعب
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        const shadowWidth = player.width * 0.8;
        const shadowHeight = 10;
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
        if (height > 100) {
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
    
    showEmergencyMessage(message) {
        console.error('🚨 خطأ طارئ:', message);
    }
    
    debugInfo() {
        console.log('🔍 معلومات التصحيح:');
        console.log('- Canvas:', this.canvas ? `موجود (${this.canvas.width}x${this.canvas.height})` : 'مفقود');
        console.log('- Game State:', this.gameState);
        console.log('- Player:', this.player ? 'موجود' : 'مفقود');
        console.log('- Assets Loaded:', this.assets.loaded);
        console.log('- Platform Count:', this.platforms.length);
        console.log('- Coin Count:', this.coinItems.length);
    }
}

// ============================================
// تهيئة اللعبة
// ============================================

let gameInstance = null;

// بدء اللعبة عند تحميل الصفحة
window.addEventListener('load', function() {
    console.log('📄 الصفحة محملة - تهيئة اللعبة...');
    
    // تأخير لضمان تحميل كل شيء
    setTimeout(function() {
        try {
            gameInstance = new MarioGame();
            console.log('✅ اللعبة جاهزة للعب!');
            
            // جعل اللعبة متاحة عالمياً
            window.marioGame = gameInstance;
            
        } catch (error) {
            console.error('❌ فشل إنشاء اللعبة:', error);
            alert('🚨 فشل تحميل اللعبة!\n\n' + error.message + '\n\nاستخدم أزرار الطوارئ في أسفل الشاشة.');
        }
    }, 500);
});

// تسهيل الوصول للعبة
window.startMarioGame = function() {
    if (gameInstance && gameInstance.startGame) {
        gameInstance.startGame();
    } else {
        alert('اللعبة ليست جاهزة بعد. حاول استخدام أزرار الطوارئ.');
    }
};

window.showMarioGame = function() {
    if (gameInstance && gameInstance.showScreen) {
        gameInstance.showScreen('game');
    }
};
