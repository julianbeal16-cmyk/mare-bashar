// ============================================
// SUPER MARIO 2D - GAME ENGINE
// إصدار مبسط ومصحح يعمل فوراً
// ============================================

class SimpleMarioGame {
    constructor() {
        console.log('🎮 بدء تحميل لعبة ماريو...');
        
        // تهيئة العناصر الأساسية
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // إعدادات اللعبة
        this.gameState = {
            current: 'start',
            isPaused: false,
            isGameOver: false,
            isMuted: false
        };
        
        // إحصائيات اللعبة
        this.stats = {
            score: 0,
            highScore: parseInt(localStorage.getItem('mario_highScore')) || 0,
            coins: 0,
            totalCoins: 10,
            lives: 3,
            time: 120,
            level: 1,
            kills: 0
        };
        
        // متغيرات اللعبة
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameTime = 0;
        this.timerInterval = null;
        
        // العناصر المرئية
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.items = [];
        this.particles = [];
        this.camera = { x: 0, y: 0 };
        
        // التحكم
        this.keys = {};
        this.touchControls = {
            left: false,
            right: false,
            jump: false
        };
        
        // الصور
        this.images = {
            player: new Image(),
            ground: null,
            brick: null,
            coin: null,
            enemy: null
        };
        
        // واجهة المستخدم
        this.UI = {
            screens: {},
            buttons: {},
            elements: {}
        };
        
        // بدء التهيئة
        this.init();
    }
    
    // ===== INITIALIZATION =====
    init() {
        this.setupCanvas();
        this.loadUI();
        this.setupEventListeners();
        this.loadAssets();
        
        // تحديث أفضل نتيجة
        this.updateHighScore();
    }
    
    setupCanvas() {
        const resize = () => {
            const container = document.querySelector('.game-area');
            if (!container) {
                console.log('⚠️ لم يتم العثور على .game-area، استخدام حجم النافذة');
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight * 0.7;
                return;
            }
            
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            
            console.log(`📐 حجم الكنفاس: ${this.canvas.width}x${this.canvas.height}`);
        };
        
        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => {
            setTimeout(resize, 100);
        });
    }
    
    loadUI() {
        // شاشات
        this.UI.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            pause: document.getElementById('pause-screen'),
            end: document.getElementById('end-screen'),
            help: document.getElementById('help-modal')
        };
        
        // أزرار
        const buttonIds = [
            'start-btn', 'howto-btn', 'pause-btn', 'resume-btn',
            'restart-btn', 'quit-btn', 'play-again-btn', 'main-menu-btn',
            'close-help', 'left-btn', 'right-btn', 'jump-btn'
        ];
        
        buttonIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) this.UI.buttons[id] = btn;
        });
        
        // عناصر
        this.UI.elements = {
            timer: document.getElementById('timer'),
            score: document.getElementById('score'),
            lives: document.getElementById('lives'),
            level: document.getElementById('level'),
            progress: document.getElementById('level-progress'),
            loadingProgress: document.getElementById('loading-progress'),
            playerPreview: document.getElementById('player-preview-img'),
            highScore: document.getElementById('high-score'),
            endScore: document.getElementById('end-score'),
            endCoins: document.getElementById('end-coins'),
            endTime: document.getElementById('end-time'),
            endTitle: document.getElementById('end-title'),
            endMessage: document.getElementById('end-message'),
            endIcon: document.getElementById('end-icon')
        };
    }
    
    updateHighScore() {
        if (this.UI.elements.highScore) {
            this.UI.elements.highScore.textContent = this.stats.highScore.toLocaleString();
        }
    }
    
    setupEventListeners() {
        // لوحة المفاتيح
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // أزرار واجهة المستخدم
        this.setupButtonEvents();
        
        // أزرار التحكم باللمس
        this.setupTouchControls();
        
        // منع التمرير على الهاتف
        document.addEventListener('touchmove', (e) => {
            if (this.gameState.current === 'game') {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    setupButtonEvents() {
        // زر البدء
        this.UI.buttons['start-btn']?.addEventListener('click', () => {
            this.startGame();
        });
        
        // زر المساعدة
        this.UI.buttons['howto-btn']?.addEventListener('click', () => {
            this.showScreen('help');
        });
        
        // زر الإيقاف المؤقت
        this.UI.buttons['pause-btn']?.addEventListener('click', () => {
            this.pauseGame();
        });
        
        // زر الاستئناف
        this.UI.buttons['resume-btn']?.addEventListener('click', () => {
            this.resumeGame();
        });
        
        // زر إعادة التشغيل
        this.UI.buttons['restart-btn']?.addEventListener('click', () => {
            this.restartGame();
        });
        
        // زر الخروج
        this.UI.buttons['quit-btn']?.addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // زر اللعب مجدداً
        this.UI.buttons['play-again-btn']?.addEventListener('click', () => {
            this.restartGame();
        });
        
        // زر القائمة الرئيسية
        this.UI.buttons['main-menu-btn']?.addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // زر إغلاق المساعدة
        this.UI.buttons['close-help']?.addEventListener('click', () => {
            this.hideModal('help');
        });
        
        // تبديل الصوت
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                this.gameState.isMuted = !e.target.checked;
                console.log(this.gameState.isMuted ? '🔇 صوت معطل' : '🔊 صوت مفعل');
            });
        }
    }
    
    setupTouchControls() {
        // زر اليسار
        this.UI.buttons['left-btn']?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.left = true;
        });
        
        this.UI.buttons['left-btn']?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.left = false;
        });
        
        this.UI.buttons['left-btn']?.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.touchControls.left = true;
        });
        
        this.UI.buttons['left-btn']?.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.touchControls.left = false;
        });
        
        // زر اليمين
        this.UI.buttons['right-btn']?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.right = true;
        });
        
        this.UI.buttons['right-btn']?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.right = false;
        });
        
        this.UI.buttons['right-btn']?.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.touchControls.right = true;
        });
        
        this.UI.buttons['right-btn']?.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.touchControls.right = false;
        });
        
        // زر القفز
        this.UI.buttons['jump-btn']?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.jump = true;
        });
        
        this.UI.buttons['jump-btn']?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.jump = false;
        });
        
        this.UI.buttons['jump-btn']?.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.touchControls.jump = true;
        });
        
        this.UI.buttons['jump-btn']?.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.touchControls.jump = false;
        });
    }
    
    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        
        // الإيقاف المؤقت بمفتاح P أو مفتاح المسافة
        if ((e.key === 'p' || e.key === 'P') && this.gameState.current === 'game') {
            e.preventDefault();
            this.pauseGame();
        }
        
        // الهروب للخروج من الإيقاف المؤقت
        if (e.key === 'Escape') {
            if (this.gameState.current === 'pause') {
                this.resumeGame();
            } else if (this.gameState.current === 'game') {
                this.pauseGame();
            }
        }
    }
    
    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }
    
    // ===== ASSET LOADING =====
    loadAssets() {
        console.log('🔄 جاري تحميل الأصول...');
        
        // تحميل صورة اللاعب - المسار النسبي
        this.images.player.src = 'assets/player.png';
        
        this.images.player.onload = () => {
            console.log('✅ تم تحميل صورة اللاعب');
            
            // عرض المعاينة
            if (this.UI.elements.playerPreview) {
                this.UI.elements.playerPreview.src = this.images.player.src;
            }
            
            this.onAssetsLoaded();
        };
        
        this.images.player.onerror = () => {
            console.log('⚠️ لم يتم العثور على صورة اللاعب، استخدام رسم بديل');
            this.onAssetsLoaded();
        };
    }
    
    onAssetsLoaded() {
        console.log('✅ جميع الأصول جاهزة');
        
        // إخفاء شاشة التحميل
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.style.display = 'none';
                    document.getElementById('game-container').style.display = 'block';
                    this.showScreen('start');
                }, 500);
            }
        }, 500);
    }
    
    // ===== GAME WORLD =====
    createGameWorld() {
        console.log('🌍 إنشاء عالم اللعبة...');
        
        // إنشاء اللاعب
        this.player = {
            x: 100,
            y: 300,
            width: 40,
            height: 60,
            velocityX: 0,
            velocityY: 0,
            speed: 8,
            jumpForce: -18,
            isJumping: false,
            isOnGround: false,
            facingRight: true,
            invincible: false,
            invincibleTime: 0
        };
        
        // إنشاء الأرض والمنصات
        const groundHeight = 50;
        const worldWidth = this.canvas.width * 3;
        
        this.platforms = [
            // الأرض الرئيسية
            { x: 0, y: this.canvas.height - groundHeight, width: worldWidth, height: groundHeight },
            
            // منصات عائمة
            { x: 300, y: 350, width: 200, height: 20 },
            { x: 600, y: 300, width: 150, height: 20 },
            { x: 900, y: 250, width: 200, height: 20 },
            { x: 1200, y: 350, width: 150, height: 20 },
            { x: 1500, y: 280, width: 200, height: 20 }
        ];
        
        // إنشاء العملات
        this.coins = [];
        for (let i = 0; i < this.stats.totalCoins; i++) {
            this.coins.push({
                x: 200 + i * 150,
                y: 150 + Math.sin(i * 0.5) * 100,
                collected: false,
                animation: 0,
                radius: 12
            });
        }
        
        // إنشاء الأعداء
        this.enemies = [
            { x: 400, y: this.platforms[0].y - 40, width: 40, height: 40, velocityX: 2, direction: 1, type: 'goomba', health: 1 },
            { x: 800, y: this.platforms[0].y - 40, width: 40, height: 40, velocityX: 2.5, direction: -1, type: 'goomba', health: 1 },
            { x: 1200, y: this.platforms[0].y - 40, width: 40, height: 40, velocityX: 3, direction: 1, type: 'goomba', health: 1 }
        ];
        
        // إنشاء العناصر
        this.items = [
            { x: 500, y: 200, type: 'mushroom', collected: false },
            { x: 1000, y: 180, type: 'flower', collected: false }
        ];
        
        // إعادة تعيين الجسيمات
        this.particles = [];
        
        // إعادة تعيين الكاميرا
        this.camera.x = 0;
        this.camera.y = 0;
    }
    
    // ===== GAME FLOW =====
    showScreen(screenName) {
        // إخفاء جميع الشاشات
        Object.values(this.UI.screens).forEach(screen => {
            if (screen && screen.classList) {
                screen.classList.remove('active');
            }
        });
        
        // إخفاء النوافذ المنبثقة
        this.hideModal('help');
        
        // إظهار الشاشة المطلوبة
        if (this.UI.screens[screenName]) {
            this.UI.screens[screenName].classList.add('active');
            this.gameState.current = screenName;
            
            if (screenName === 'game') {
                this.gameState.isPaused = false;
                this.startGameLoop();
            }
        }
    }
    
    showModal(modalName) {
        const modal = this.UI.screens[modalName];
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    hideModal(modalName) {
        const modal = this.UI.screens[modalName];
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    startGame() {
        console.log('🚀 بدء اللعبة');
        
        // إعادة تعيين الإحصائيات
        this.stats.score = 0;
        this.stats.coins = 0;
        this.stats.lives = 3;
        this.stats.time = 120;
        this.stats.level = 1;
        this.stats.kills = 0;
        
        // إنشاء العالم
        this.createGameWorld();
        
        // إظهار شاشة اللعب
        this.showScreen('game');
        
        // بدء المؤقت
        this.startGameTimer();
        
        // تحديث الواجهة
        this.updateGameUI();
    }
    
    pauseGame() {
        if (this.gameState.current !== 'game' || this.gameState.isGameOver) return;
        
        this.gameState.isPaused = true;
        clearInterval(this.timerInterval);
        this.showScreen('pause');
        
        // تحديث إحصائيات الإيقاف المؤقت
        this.updatePauseUI();
        
        console.log('⏸ اللعبة متوقفة');
    }
    
    resumeGame() {
        if (this.gameState.current !== 'pause') return;
        
        this.gameState.isPaused = false;
        this.showScreen('game');
        this.startGameTimer();
        
        console.log('▶ استئناف اللعبة');
    }
    
    restartGame() {
        console.log('🔄 إعادة تشغيل اللعبة');
        this.startGame();
    }
    
    gameOver(isWin = false) {
        this.gameState.isGameOver = true;
        clearInterval(this.timerInterval);
        
        // تحديث أفضل نتيجة
        if (this.stats.score > this.stats.highScore) {
            this.stats.highScore = this.stats.score;
            localStorage.setItem('mario_highScore', this.stats.highScore.toString());
            this.updateHighScore();
        }
        
        // تحديث شاشة النهاية
        this.updateEndUI(isWin);
        this.showScreen('end');
        
        console.log(isWin ? '🏆 فوز!' : '💀 هزيمة!');
    }
    
    // ===== GAME TIMER =====
    startGameTimer() {
        clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            if (!this.gameState.isPaused && this.gameState.current === 'game') {
                this.stats.time--;
                this.updateGameUI();
                
                if (this.stats.time <= 0) {
                    this.gameOver(false);
                }
            }
        }, 1000);
    }
    
    // ===== GAME LOOP =====
    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        // حساب الوقت المنقضي
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.gameTime += this.deltaTime;
        
        // تحديث اللعبة إذا لم تكن متوقفة
        if (!this.gameState.isPaused && this.gameState.current === 'game') {
            this.update(this.deltaTime);
        }
        
        // الرسم
        this.draw();
        
        // الاستمرار في الحلقة
        if (this.gameState.current === 'game' && !this.gameState.isGameOver) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    update(deltaTime) {
        // تحديث اللاعب
        this.updatePlayer(deltaTime);
        
        // تحديث الأعداء
        this.updateEnemies(deltaTime);
        
        // تحديث العملات
        this.updateCoins(deltaTime);
        
        // تحديث العناصر
        this.updateItems(deltaTime);
        
        // تحديث الجسيمات
        this.updateParticles(deltaTime);
        
        // تحديث الكاميرا
        this.updateCamera();
        
        // فحص الاصطدامات
        this.checkCollisions();
        
        // فحص شروط النهاية
        this.checkEndConditions();
    }
    
    updatePlayer(deltaTime) {
        if (!this.player) return;
        
        // تطبيق الجاذبية
        this.player.velocityY += 0.8;
        if (this.player.velocityY > 20) this.player.velocityY = 20;
        
        // التحكم بالحركة
        let moveDirection = 0;
        
        // لوحة المفاتيح
        if (this.keys['arrowleft'] || this.keys['a']) moveDirection -= 1;
        if (this.keys['arrowright'] || this.keys['d']) moveDirection += 1;
        
        // التحكم باللمس
        if (this.touchControls.left) moveDirection -= 1;
        if (this.touchControls.right) moveDirection += 1;
        
        // تطبيق الحركة
        this.player.velocityX = moveDirection * this.player.speed;
        
        // القفز
        if ((this.keys[' '] || this.keys['space'] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump) && this.player.isOnGround) {
            this.player.velocityY = this.player.jumpForce;
            this.player.isJumping = true;
            this.player.isOnGround = false;
            
            // جسيمات القفز
            this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height, 8, '#FFD700');
        }
        
        // تحديث الموضع
        this.player.x += this.player.velocityX * deltaTime * 60;
        this.player.y += this.player.velocityY * deltaTime * 60;
        
        // تحديث الاتجاه
        if (moveDirection > 0) this.player.facingRight = true;
        if (moveDirection < 0) this.player.facingRight = false;
        
        // تحديث المناعة
        if (this.player.invincible) {
            this.player.invincibleTime -= deltaTime;
            if (this.player.invincibleTime <= 0) {
                this.player.invincible = false;
            }
        }
        
        // منع الخروج عن حدود العالم
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.canvas.width * 2.5) this.player.x = this.canvas.width * 2.5;
        
        // فحص الاصطدام مع المنصات
        this.player.isOnGround = false;
        
        for (const platform of this.platforms) {
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > platform.y &&
                this.player.y + this.player.height < platform.y + platform.height + this.player.velocityY &&
                this.player.velocityY > 0) {
                
                this.player.y = platform.y - this.player.height;
                this.player.velocityY = 0;
                this.player.isOnGround = true;
                this.player.isJumping = false;
            }
        }
        
        // السقوط من العالم
        if (this.player.y > this.canvas.height + 100) {
            this.playerDie();
        }
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach((enemy, index) => {
            // الحركة
            enemy.x += enemy.velocityX * enemy.direction * deltaTime * 60;
            
            // تغيير الاتجاه عند الاصطدام بالحواف
            if (enemy.x <= 0 || enemy.x + enemy.width >= this.canvas.width * 3) {
                enemy.direction *= -1;
                enemy.x = Math.max(0, Math.min(this.canvas.width * 3 - enemy.width, enemy.x));
            }
            
            // تطبيق الجاذبية
            enemy.velocityY += 0.5;
            enemy.y += enemy.velocityY * deltaTime * 60;
            
            // الاصطدام مع المنصات
            let onGround = false;
            for (const platform of this.platforms) {
                if (enemy.x < platform.x + platform.width &&
                    enemy.x + enemy.width > platform.x &&
                    enemy.y + enemy.height > platform.y &&
                    enemy.y + enemy.height < platform.y + platform.height + enemy.velocityY &&
                    enemy.velocityY > 0) {
                    
                    enemy.y = platform.y - enemy.height;
                    enemy.velocityY = 0;
                    onGround = true;
                }
            }
            
            // إزالة الأعداء الساقطين
            if (enemy.y > this.canvas.height + 200) {
                this.enemies.splice(index, 1);
            }
        });
    }
    
    updateCoins(deltaTime) {
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.animation += deltaTime * 5;
            }
        });
    }
    
    updateItems(deltaTime) {
        this.items.forEach(item => {
            if (!item.collected) {
                // حركة طفيفة للعناصر
                item.y += Math.sin(this.gameTime * 2) * 0.5;
            }
        });
    }
    
    updateParticles(deltaTime) {
        this.particles.forEach((particle, index) => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.2;
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    updateCamera() {
        if (!this.player) return;
        
        // متابعة اللاعب
        const targetX = this.player.x - this.canvas.width / 2 + this.player.width / 2;
        const targetY = this.player.y - this.canvas.height / 2 + this.player.height / 2;
        
        // تطبيق بسلاسة
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
        
        // الحدود
        this.camera.x = Math.max(0, Math.min(this.canvas.width * 2.5 - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(600 - this.canvas.height, this.camera.y));
    }
    
    checkCollisions() {
        // جمع العملات
        this.coins.forEach((coin, index) => {
            if (!coin.collected) {
                const distance = Math.sqrt(
                    Math.pow(this.player.x + this.player.width/2 - coin.x, 2) +
                    Math.pow(this.player.y + this.player.height/2 - coin.y, 2)
                );
                
                if (distance < 30) {
                    coin.collected = true;
                    this.stats.coins++;
                    this.stats.score += 100;
                    
                    // جسيمات الجمع
                    this.createParticles(coin.x, coin.y, 10, '#FFD700');
                    
                    // تحديث الواجهة
                    this.updateGameUI();
                    this.updateProgressBar();
                    
                    console.log(`💰 جمع عملة! الإجمالي: ${this.stats.coins}/${this.stats.totalCoins}`);
                }
            }
        });
        
        // جمع العناصر
        this.items.forEach((item, index) => {
            if (!item.collected) {
                const distance = Math.sqrt(
                    Math.pow(this.player.x + this.player.width/2 - item.x, 2) +
                    Math.pow(this.player.y + this.player.height/2 - item.y, 2)
                );
                
                if (distance < 40) {
                    item.collected = true;
                    
                    // تأثير العنصر
                    switch (item.type) {
                        case 'mushroom':
                            this.player.width *= 1.2;
                            this.player.height *= 1.2;
                            this.player.invincible = true;
                            this.player.invincibleTime = 10;
                            this.stats.score += 500;
                            break;
                        case 'flower':
                            this.player.speed *= 1.5;
                            this.player.invincible = true;
                            this.player.invincibleTime = 15;
                            this.stats.score += 1000;
                            break;
                    }
                    
                    // جسيمات العنصر
                    this.createParticles(item.x, item.y, 15, this.getItemColor(item.type));
                    
                    // تحديث الواجهة
                    this.updateGameUI();
                    
                    console.log(`🎁 جمع عنصر: ${item.type}`);
                }
            }
        });
        
        // الاصطدام بالأعداء
        this.enemies.forEach((enemy, index) => {
            const distance = Math.sqrt(
                Math.pow(this.player.x + this.player.width/2 - (enemy.x + enemy.width/2), 2) +
                Math.pow(this.player.y + this.player.height/2 - (enemy.y + enemy.height/2), 2)
            );
            
            if (distance < 50) {
                if (this.player.velocityY > 0 && this.player.y + this.player.height < enemy.y + enemy.height/2) {
                    // القفز على العدو
                    this.enemies.splice(index, 1);
                    this.stats.kills++;
                    this.stats.score += 200;
                    
                    // جسيمات التدمير
                    this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 12, '#EF476F');
                    
                    // قوة القفز
                    this.player.velocityY = -12;
                    
                    // تحديث الواجهة
                    this.updateGameUI();
                    
                    console.log(`👾 هزمت عدواً! الإجمالي: ${this.stats.kills}`);
                } else if (!this.player.invincible) {
                    // تضرر اللاعب
                    this.playerDamaged();
                }
            }
        });
    }
    
    checkEndConditions() {
        // الوقت انتهى
        if (this.stats.time <= 0) {
            this.gameOver(false);
            return;
        }
        
        // جمع كل العملات
        if (this.stats.coins >= this.stats.totalCoins) {
            this.gameOver(true);
            return;
        }
        
        // وصل لنهاية العالم
        if (this.player.x >= this.canvas.width * 2.5) {
            this.gameOver(true);
            return;
        }
    }
    
    playerDamaged() {
        if (this.player.invincible) return;
        
        this.stats.lives--;
        this.updateGameUI();
        
        if (this.stats.lives <= 0) {
            this.gameOver(false);
        } else {
            // مناعة مؤقتة بعد الضرر
            this.player.invincible = true;
            this.player.invincibleTime = 2;
            
            // تأثير ارتداد
            this.player.velocityY = -10;
            this.player.velocityX = this.player.facingRight ? -10 : 10;
            
            // جسيمات الضرر
            this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 8, '#EF476F');
            
            console.log(`💔 تضررت! الأرواح المتبقية: ${this.stats.lives}`);
        }
    }
    
    playerDie() {
        this.stats.lives--;
        this.updateGameUI();
        
        if (this.stats.lives <= 0) {
            this.gameOver(false);
        } else {
            // إعادة تعيين اللاعب
            this.player.x = Math.max(0, this.camera.x + 50);
            this.player.y = 300;
            this.player.velocityX = 0;
            this.player.velocityY = 0;
            this.player.invincible = true;
            this.player.invincibleTime = 3;
            
            console.log(`💀 سقوط! الأرواح المتبقية: ${this.stats.lives}`);
        }
    }
    
    // ===== DRAWING =====
    draw() {
        if (!this.ctx) return;
        
        // مسح الشاشة
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // تطبيق تحويلات الكاميرا
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // رسم الخلفية
        this.drawBackground();
        
        // رسم الأرض والمنصات
        this.drawPlatforms();
        
        // رسم العملات
        this.drawCoins();
        
        // رسم العناصر
        this.drawItems();
        
        // رسم الأعداء
        this.drawEnemies();
        
        // رسم الجسيمات
        this.drawParticles();
        
        // رسم اللاعب
        this.drawPlayer();
        
        // استعادة تحويلات الكاميرا
        this.ctx.restore();
    }
    
    drawBackground() {
        // السماء المتدرجة
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width * 3, this.canvas.height);
        
        // السحب
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 8; i++) {
            const x = (this.camera.x * 0.3 + i * 250) % (this.canvas.width * 3 + 300);
            const y = 50 + Math.sin(this.gameTime + i) * 15;
            this.drawCloud(x, y, 70);
        }
        
        // الجبال البعيدة
        this.ctx.fillStyle = '#2C3E50';
        this.drawMountain(300, 200, 200, 150);
        this.drawMountain(600, 180, 180, 130);
        this.drawMountain(900, 220, 220, 170);
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.25, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.4, y + size * 0.1, size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawMountain(x, y, width, height) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height);
        this.ctx.lineTo(x + width / 2, y);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // الثلج
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.beginPath();
        this.ctx.moveTo(x + width * 0.4, y + height * 0.3);
        this.ctx.lineTo(x + width * 0.6, y + height * 0.3);
        this.ctx.lineTo(x + width * 0.5, y + height * 0.1);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawPlatforms() {
        this.platforms.forEach(platform => {
            // الأرض
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل الأرض
            this.ctx.fillStyle = '#A0522D';
            for (let i = 0; i < platform.width; i += 20) {
                this.ctx.fillRect(platform.x + i, platform.y, 10, 5);
            }
            
            // ظل المنصة
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 5);
        });
    }
    
    drawCoins() {
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.animation) * 10;
                
                // العملة الذهبية
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(coin.x, coin.y + bounce, coin.radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#FFA500';
                this.ctx.beginPath();
                this.ctx.arc(coin.x, coin.y + bounce, coin.radius * 0.6, 0, Math.PI * 2);
                this.ctx.fill();
                
                // بريق
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.beginPath();
                this.ctx.arc(coin.x - 3, coin.y - 3 + bounce, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    drawItems() {
        this.items.forEach(item => {
            if (!item.collected) {
                const color = this.getItemColor(item.type);
                const size = 20;
                
                // رسم العنصر
                this.ctx.fillStyle = color;
                
                switch (item.type) {
                    case 'mushroom':
                        // عيش الغراب
                        this.ctx.beginPath();
                        this.ctx.arc(item.x, item.y, size, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        this.ctx.fillStyle = '#FFF';
                        this.ctx.beginPath();
                        this.ctx.arc(item.x - 5, item.y - 5, size * 0.3, 0, Math.PI * 2);
                        this.ctx.arc(item.x + 5, item.y - 5, size * 0.3, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                        
                    case 'flower':
                        // زهرة
                        this.ctx.save();
                        this.ctx.translate(item.x, item.y);
                        for (let i = 0; i < 8; i++) {
                            this.ctx.rotate(Math.PI / 4);
                            this.ctx.fillRect(0, -size/2, size, size/2);
                        }
                        this.ctx.restore();
                        break;
                }
            }
        });
    }
    
    drawEnemies() {
        this.enemies.forEach(enemy => {
            // العدو الأحمر
            this.ctx.fillStyle = '#EF476F';
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // العيون
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(enemy.x + 10, enemy.y + 10, 8, 8);
            this.ctx.fillRect(enemy.x + enemy.width - 18, enemy.y + 10, 8, 8);
            
            // القدم المتحركة
            const footOffset = Math.sin(this.gameTime * 5) * 3;
            this.ctx.fillRect(enemy.x + 5, enemy.y + enemy.height - 5, 10, 5 + footOffset);
            this.ctx.fillRect(enemy.x + enemy.width - 15, enemy.y + enemy.height - 5, 10, 5 - footOffset);
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawPlayer() {
        if (!this.player) return;
        
        // تأثير المناعة (وميض)
        if (this.player.invincible && Math.floor(this.player.invincibleTime * 10) % 2 === 0) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // استخدام صورة اللاعب إذا كانت متوفرة
        if (this.images.player && this.images.player.complete && !this.images.player.error) {
            this.ctx.save();
            if (!this.player.facingRight) {
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(this.images.player, -this.player.x - this.player.width, this.player.y, this.player.width, this.player.height);
            } else {
                this.ctx.drawImage(this.images.player, this.player.x, this.player.y, this.player.width, this.player.height);
            }
            this.ctx.restore();
        } else {
            // رسم بديل للاعب
            this.ctx.fillStyle = this.player.invincible ? '#9B59B6' : '#E74C3C';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            
            // الوجه
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(this.player.x + 10, this.player.y + 10, 20, 20);
            
            // العيون
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(this.player.x + 15, this.player.y + 15, 5, 5);
            this.ctx.fillRect(this.player.x + 25, this.player.y + 15, 5, 5);
        }
        
        this.ctx.globalAlpha = 1;
        
        // تأثير القفز
        if (this.player.isJumping) {
            this.ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width/2,
                this.player.y + this.player.height,
                15 + Math.sin(this.gameTime * 10) * 3,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
    }
    
    // ===== UTILITY FUNCTIONS =====
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 8,
                velocityY: (Math.random() - 0.5) * 8 - 4,
                size: Math.random() * 4 + 2,
                color: color,
                life: 1
            });
        }
    }
    
    getItemColor(type) {
        switch (type) {
            case 'mushroom': return '#E74C3C';
            case 'flower': return '#9B59B6';
            case 'star': return '#F1C40F';
            default: return '#FFF';
        }
    }
    
    // ===== UI UPDATES =====
    updateGameUI() {
        // الوقت
        if (this.UI.elements.timer) {
            this.UI.elements.timer.textContent = this.formatTime(this.stats.time);
        }
        
        // النقاط
        if (this.UI.elements.score) {
            this.UI.elements.score.textContent = this.stats.score.toLocaleString();
        }
        
        // الأرواح
        if (this.UI.elements.lives) {
            this.UI.elements.lives.textContent = this.stats.lives;
        }
        
        // المستوى
        if (this.UI.elements.level) {
            this.UI.elements.level.textContent = this.stats.level;
        }
    }
    
    updatePauseUI() {
        const pauseTime = document.getElementById('pause-time');
        const pauseScore = document.getElementById('pause-score');
        
        if (pauseTime) pauseTime.textContent = this.formatTime(this.stats.time);
        if (pauseScore) pauseScore.textContent = this.stats.score.toLocaleString();
    }
    
    updateEndUI(isWin) {
        if (this.UI.elements.endIcon) {
            this.UI.elements.endIcon.textContent = isWin ? '🏆' : '💀';
        }
        
        if (this.UI.elements.endTitle) {
            this.UI.elements.endTitle.textContent = isWin ? 'تهانينا!' : 'انتهت اللعبة';
        }
        
        if (this.UI.elements.endMessage) {
            this.UI.elements.endMessage.textContent = isWin 
                ? `لقد أكملت المستوى ${this.stats.level}!` 
                : 'حاول مرة أخرى!';
        }
        
        if (this.UI.elements.endScore) {
            this.UI.elements.endScore.textContent = this.stats.score.toLocaleString();
        }
        
        if (this.UI.elements.endCoins) {
            this.UI.elements.endCoins.textContent = `${this.stats.coins}/${this.stats.totalCoins}`;
        }
        
        if (this.UI.elements.endTime) {
            this.UI.elements.endTime.textContent = this.formatTime(120 - this.stats.time);
        }
    }
    
    updateProgressBar() {
        const progress = (this.stats.coins / this.stats.totalCoins) * 100;
        if (this.UI.elements.progress) {
            this.UI.elements.progress.style.width = `${progress}%`;
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // ===== CLEANUP =====
    cleanup() {
        clearInterval(this.timerInterval);
    }
}

// ============================================
// بدء اللعبة عند تحميل الصفحة
// ============================================

let game;

window.addEventListener('load', () => {
    console.log('📄 الصفحة محملة، بدء اللعبة...');
    
    // إنشاء اللعبة
    game = new SimpleMarioGame();
    
    // تحديث شريط التحميل
    const loadingProgress = document.getElementById('loading-progress');
    if (loadingProgress) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            loadingProgress.textContent = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 300);
    }
});

// منع قائمة السياق
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// ============================================
// FORCE LANDSCAPE ON MOBILE
// ============================================

if (window.innerHeight > window.innerWidth) {
    alert('يرجى تدوير هاتفك إلى الوضع الأفقي للحصول على أفضل تجربة');
}
