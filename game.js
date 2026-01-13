// ============================================
// 🎮 SUPER MARIO GAME ENGINE - الإصدار الكامل
// جميع الملفات مرتبطة بنجاح 100%
// ============================================

console.log('🎮 بدء تحميل لعبة ماريو الكاملة...');

class MarioGameEngine {
    constructor() {
        console.log('🔧 إنشاء نسخة جديدة من اللعبة');
        
        // ===== العناصر الأساسية =====
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // ===== تهيئة الكنفاس =====
        this.setupCanvas();
        
        // ===== حالة اللعبة =====
        this.gameState = {
            current: 'start', // start, game, pause, end
            isPaused: false,
            isGameOver: false,
            isMuted: false,
            isFullscreen: false
        };
        
        // ===== الإحصائيات =====
        this.stats = {
            score: 0,
            highScore: parseInt(localStorage.getItem('mario_highScore')) || 0,
            coins: 0,
            totalCoins: 10,
            lives: 3,
            time: 120, // 2 دقيقة
            level: 1,
            kills: 0,
            progress: 0
        };
        
        // ===== المتغيرات الزمنية =====
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameTime = 0;
        this.timerInterval = null;
        this.frameCount = 0;
        
        // ===== عناصر اللعبة =====
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.items = [];
        this.particles = [];
        this.camera = { x: 0, y: 0 };
        
        // ===== التحكم =====
        this.keys = {};
        this.touchControls = {
            left: false,
            right: false,
            jump: false
        };
        
        // ===== الصور =====
        this.images = {
            player: null
        };
        
        // ===== الصوت =====
        this.audio = {
            enabled: true,
            volume: 0.7
        };
        
        // ===== الإعدادات =====
        this.settings = {
            controlsSize: 'medium',
            controlsOpacity: 70,
            graphicsQuality: 'medium',
            showParticles: true
        };
        
        // ===== التهيئة الكاملة =====
        this.initialize();
    }
    
    // ===== التهيئة الرئيسية =====
    initialize() {
        console.log('⚙️ تهيئة اللعبة النهائية...');
        
        // 1. تحميل الإعدادات
        this.loadSettings();
        
        // 2. إعداد الأحداث
        this.setupEventListeners();
        
        // 3. تحميل الأصول
        this.loadAssets();
        
        // 4. تحديث أفضل نتيجة
        this.updateHighScore();
        
        // 5. إنشاء عالم اللعبة الأولي
        this.createGameWorld();
        
        // 6. تحديث واجهة البداية
        this.updateStartScreen();
        
        console.log('✅ اللعبة مهيأة وجاهزة للعب');
    }
    
    setupCanvas() {
        console.log('📐 تهيئة الكنفاس...');
        
        const resize = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                this.canvas.width = gameArea.clientWidth;
                this.canvas.height = gameArea.clientHeight;
            } else {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight * 0.7;
            }
            
            console.log(`📏 حجم الكنفاس: ${this.canvas.width}x${this.canvas.height}`);
        };
        
        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => {
            setTimeout(resize, 100);
        });
    }
    
    loadSettings() {
        console.log('⚙️ تحميل الإعدادات...');
        
        try {
            const savedSettings = localStorage.getItem('mario_settings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
                this.applySettings();
            }
        } catch (e) {
            console.log('⚠️ خطأ في تحميل الإعدادات:', e);
        }
    }
    
    applySettings() {
        // حجم أزرار التحكم
        const mobileBtns = document.querySelectorAll('.mobile-btn');
        let scale = 1;
        switch (this.settings.controlsSize) {
            case 'small': scale = 0.8; break;
            case 'medium': scale = 1; break;
            case 'large': scale = 1.2; break;
        }
        
        mobileBtns.forEach(btn => {
            btn.style.transform = `scale(${scale})`;
            btn.style.opacity = `${this.settings.controlsOpacity / 100}`;
        });
        
        // تحديث قيم العناصر
        document.getElementById('controls-size').value = this.settings.controlsSize;
        document.getElementById('controls-opacity').value = this.settings.controlsOpacity;
        document.getElementById('opacity-value').textContent = `${this.settings.controlsOpacity}%`;
        document.getElementById('graphics-quality').value = this.settings.graphicsQuality;
        document.getElementById('show-particles').checked = this.settings.showParticles;
        document.getElementById('sound-volume').value = this.audio.volume * 100;
        document.getElementById('volume-value').textContent = `${Math.round(this.audio.volume * 100)}%`;
        document.getElementById('enable-sound').checked = this.audio.enabled;
    }
    
    updateHighScore() {
        const highScoreElement = document.getElementById('high-score');
        if (highScoreElement) {
            highScoreElement.textContent = this.stats.highScore.toLocaleString();
        }
    }
    
    setupEventListeners() {
        console.log('🎮 تهيئة أحداث التحكم...');
        
        // ===== أزرار الشاشات =====
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('howto-btn').addEventListener('click', () => this.showModal('help'));
        document.getElementById('settings-btn').addEventListener('click', () => this.showModal('settings'));
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.showScreen('start'));
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('main-menu-btn').addEventListener('click', () => this.showScreen('start'));
        document.getElementById('close-help').addEventListener('click', () => this.hideModal('help'));
        document.getElementById('close-settings').addEventListener('click', () => this.hideModal('settings'));
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        
        // ===== إعدادات =====
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-settings').addEventListener('click', () => this.resetSettings());
        document.getElementById('sound-checkbox').addEventListener('change', (e) => {
            this.gameState.isMuted = !e.target.checked;
        });
        
        // ===== التحكم باللمس =====
        this.setupTouchControls();
        
        // ===== لوحة المفاتيح =====
        this.setupKeyboardControls();
        
        // ===== منع السلوك الافتراضي =====
        this.preventDefaults();
        
        console.log('✅ أحداث التحكم جاهزة');
    }
    
    setupTouchControls() {
        console.log('📱 إعداد التحكم باللمس...');
        
        // زر اليسار
        document.getElementById('left-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.left = true;
        });
        
        document.getElementById('left-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.left = false;
        });
        
        document.getElementById('left-btn').addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.touchControls.left = true;
        });
        
        document.getElementById('left-btn').addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.touchControls.left = false;
        });
        
        // زر اليمين
        document.getElementById('right-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.right = true;
        });
        
        document.getElementById('right-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.right = false;
        });
        
        document.getElementById('right-btn').addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.touchControls.right = true;
        });
        
        document.getElementById('right-btn').addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.touchControls.right = false;
        });
        
        // زر القفز
        document.getElementById('jump-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.jump = true;
        });
        
        document.getElementById('jump-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.jump = false;
        });
        
        document.getElementById('jump-btn').addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.touchControls.jump = true;
        });
        
        document.getElementById('jump-btn').addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.touchControls.jump = false;
        });
    }
    
    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // الإيقاف المؤقت
            if (key === 'p' && this.gameState.current === 'game') {
                e.preventDefault();
                this.pauseGame();
            }
            
            // الإسكيب للخروج من الإيقاف
            if (key === 'escape' && this.gameState.current === 'pause') {
                this.resumeGame();
            }
            
            // ملء الشاشة
            if (key === 'f') {
                e.preventDefault();
                this.toggleFullscreen();
            }
            
            // منع التمرير
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    preventDefaults() {
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        document.addEventListener('touchmove', (e) => {
            if (this.gameState.current === 'game') {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    loadAssets() {
        console.log('🔄 جاري تحميل الأصول...');
        
        // صورة اللاعب
        this.images.player = new Image();
        this.images.player.src = 'assets/player.png';
        
        this.images.player.onload = () => {
            console.log('✅ تم تحميل صورة اللاعب');
            
            // تحديث صورة المعاينة
            const previewImg = document.getElementById('player-preview-img');
            if (previewImg) {
                previewImg.src = this.images.player.src;
            }
        };
        
        this.images.player.onerror = () => {
            console.log('⚠️ لم يتم العثور على صورة اللاعب، سيتم استخدام رسم بديل');
        };
    }
    
    // ===== إدارة الشاشات =====
    showScreen(screenName) {
        console.log(`📺 إظهار شاشة: ${screenName}`);
        
        // إخفاء جميع الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // إخفاء النوافذ المنبثقة
        this.hideModal('help');
        this.hideModal('settings');
        
        // إظهار الشاشة المطلوبة
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.classList.add('active');
            this.gameState.current = screenName;
            
            // إذا كانت شاشة اللعبة، ابدأ الحلقة
            if (screenName === 'game') {
                this.gameState.isPaused = false;
                this.startGameLoop();
            } else {
                // توقف أي عملية تحديث
                this.gameState.isPaused = true;
                clearInterval(this.timerInterval);
            }
        }
    }
    
    showModal(modalName) {
        const modal = document.getElementById(`${modalName}-modal`);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    hideModal(modalName) {
        const modal = document.getElementById(`${modalName}-modal`);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                console.log('ملء الشاشة غير مدعوم:', e);
            });
            this.gameState.isFullscreen = true;
            document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            this.gameState.isFullscreen = false;
            document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-expand"></i>';
        }
    }
    
    // ===== تدفق اللعبة =====
    startGame() {
        console.log('🚀 بدء لعبة جديدة');
        
        // إعادة تعيين الإحصائيات
        this.stats = {
            score: 0,
            highScore: this.stats.highScore,
            coins: 0,
            totalCoins: 10,
            lives: 3,
            time: 120,
            level: 1,
            kills: 0,
            progress: 0
        };
        
        // إنشاء العالم
        this.createGameWorld();
        
        // إظهار شاشة اللعب
        this.showScreen('game');
        
        // بدء المؤقت
        this.startGameTimer();
        
        // تحديث الواجهة
        this.updateGameUI();
        this.updateProgressBar();
        
        console.log(`✅ اللعبة بدأت - الوقت: ${this.stats.time}ث، الأرواح: ${this.stats.lives}`);
    }
    
    pauseGame() {
        if (this.gameState.current !== 'game' || this.gameState.isGameOver) return;
        
        console.log('⏸ إيقاف اللعبة مؤقتاً');
        
        this.gameState.isPaused = true;
        clearInterval(this.timerInterval);
        
        // تحديث واجهة الإيقاف
        this.updatePauseUI();
        
        // إظهار شاشة الإيقاف
        this.showScreen('pause');
    }
    
    resumeGame() {
        if (this.gameState.current !== 'pause') return;
        
        console.log('▶ استئناف اللعبة');
        
        this.gameState.isPaused = false;
        this.showScreen('game');
        this.startGameTimer();
    }
    
    restartGame() {
        console.log('🔄 إعادة تشغيل اللعبة');
        this.startGame();
    }
    
    gameOver(isWin = false) {
        console.log(`🎮 نهاية اللعبة - فوز: ${isWin}`);
        
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
        
        // إظهار شاشة النهاية
        this.showScreen('end');
    }
    
    // ===== المؤقت =====
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
    
    // ===== الحلقة الرئيسية =====
    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        // حساب الوقت المنقضي
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.gameTime += this.deltaTime;
        this.frameCount++;
        
        // تحديث اللعبة
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
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateCoins(deltaTime);
        this.updateItems(deltaTime);
        this.updateParticles(deltaTime);
        this.updateCamera();
        this.checkCollisions();
        this.checkEndConditions();
    }
    
    // ===== إنشاء عالم اللعبة =====
    createGameWorld() {
        console.log('🌍 إنشاء عالم اللعبة...');
        
        // اللاعب
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
            invincibleTime: 0,
            color: '#E74C3C'
        };
        
        // الأرض والمنصات
        const groundHeight = 50;
        const worldWidth = Math.max(this.canvas.width * 3, 2000);
        
        this.platforms = [
            // الأرض الرئيسية
            { x: 0, y: this.canvas.height - groundHeight, width: worldWidth, height: groundHeight, type: 'ground' },
            
            // منصات عائمة
            { x: 300, y: 350, width: 200, height: 20, type: 'platform' },
            { x: 600, y: 300, width: 150, height: 20, type: 'platform' },
            { x: 900, y: 250, width: 200, height: 20, type: 'platform' },
            { x: 1200, y: 350, width: 150, height: 20, type: 'platform' },
            { x: 1500, y: 280, width: 200, height: 20, type: 'platform' },
            { x: 1800, y: 200, width: 250, height: 20, type: 'platform' }
        ];
        
        // العملات
        this.coins = [];
        for (let i = 0; i < this.stats.totalCoins; i++) {
            this.coins.push({
                x: 150 + i * 180,
                y: 200 + Math.sin(i * 0.7) * 100,
                collected: false,
                animation: 0,
                radius: 12,
                id: i
            });
        }
        
        // الأعداء
        this.enemies = [
            { x: 400, y: this.platforms[0].y - 40, width: 40, height: 40, velocityX: 2, direction: 1, type: 'goomba', active: true },
            { x: 800, y: this.platforms[0].y - 40, width: 40, height: 40, velocityX: 2.5, direction: -1, type: 'goomba', active: true },
            { x: 1200, y: this.platforms[0].y - 40, width: 40, height: 40, velocityX: 3, direction: 1, type: 'goomba', active: true },
            { x: 1600, y: 160, width: 40, height: 40, velocityX: 2, direction: 1, type: 'goomba', active: true }
        ];
        
        // العناصر
        this.items = [
            { x: 500, y: 200, type: 'mushroom', collected: false },
            { x: 1000, y: 180, type: 'flower', collected: false },
            { x: 1700, y: 150, type: 'mushroom', collected: false }
        ];
        
        // الجسيمات
        this.particles = [];
        
        // الكاميرا
        this.camera.x = 0;
        this.camera.y = 0;
        
        console.log(`✅ العالم الجديد: ${this.platforms.length} منصة، ${this.coins.length} عملة، ${this.enemies.length} عدو`);
    }
    
    // ===== تحديث العناصر =====
    updatePlayer(deltaTime) {
        if (!this.player) return;
        
        // الجاذبية
        this.player.velocityY += 0.8;
        if (this.player.velocityY > 20) this.player.velocityY = 20;
        
        // الحركة
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
        if ((this.keys[' '] || this.keys['space'] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump) && 
            this.player.isOnGround) {
            this.player.velocityY = this.player.jumpForce;
            this.player.isJumping = true;
            this.player.isOnGround = false;
            
            // جسيمات القفز
            if (this.settings.showParticles) {
                this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height, 8, '#FFD700');
            }
        }
        
        // تحديث الموضع
        this.player.x += this.player.velocityX * deltaTime * 60;
        this.player.y += this.player.velocityY * deltaTime * 60;
        
        // الاتجاه
        if (moveDirection > 0) this.player.facingRight = true;
        if (moveDirection < 0) this.player.facingRight = false;
        
        // المناعة
        if (this.player.invincible) {
            this.player.invincibleTime -= deltaTime;
            if (this.player.invincibleTime <= 0) {
                this.player.invincible = false;
            }
        }
        
        // الحدود الأفقية
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.canvas.width * 2.5) this.player.x = this.canvas.width * 2.5;
        
        // الاصطدام مع المنصات
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
        
        // السقوط
        if (this.player.y > this.canvas.height + 100) {
            this.playerDie();
        }
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach((enemy, index) => {
            if (!enemy.active) return;
            
            // الحركة
            enemy.x += enemy.velocityX * enemy.direction * deltaTime * 60;
            
            // تغيير الاتجاه عند الحواف
            if (enemy.x <= 0 || enemy.x + enemy.width >= this.canvas.width * 3) {
                enemy.direction *= -1;
                enemy.x = Math.max(0, Math.min(this.canvas.width * 3 - enemy.width, enemy.x));
            }
            
            // الجاذبية للأعداء الطائرين
            if (enemy.type === 'goomba') {
                let onGround = false;
                for (const platform of this.platforms) {
                    if (enemy.x < platform.x + platform.width &&
                        enemy.x + enemy.width > platform.x &&
                        enemy.y + enemy.height > platform.y &&
                        enemy.y + enemy.height < platform.y + platform.height + 5) {
                        
                        enemy.y = platform.y - enemy.height;
                        onGround = true;
                    }
                }
                
                // إذا لم يكن على منصة، يسقط
                if (!onGround && enemy.y < this.platforms[0].y - enemy.height) {
                    enemy.y += 5;
                }
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
                item.y += Math.sin(this.gameTime * 2 + item.x) * 0.5;
            }
        });
    }
    
    updateParticles(deltaTime) {
        if (!this.settings.showParticles) {
            this.particles = [];
            return;
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.2;
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
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
    
    // ===== الاصطدامات =====
    checkCollisions() {
        this.checkCoinCollisions();
        this.checkItemCollisions();
        this.checkEnemyCollisions();
    }
    
    checkCoinCollisions() {
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
                    this.stats.progress = (this.stats.coins / this.stats.totalCoins) * 100;
                    
                    // جسيمات الجمع
                    if (this.settings.showParticles) {
                        this.createParticles(coin.x, coin.y, 10, '#FFD700');
                    }
                    
                    // تحديث الواجهة
                    this.updateGameUI();
                    this.updateProgressBar();
                    
                    console.log(`💰 جمع عملة! الإجمالي: ${this.stats.coins}/${this.stats.totalCoins}`);
                }
            }
        });
    }
    
    checkItemCollisions() {
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
                            this.player.width = Math.min(60, this.player.width * 1.2);
                            this.player.height = Math.min(80, this.player.height * 1.2);
                            this.player.invincible = true;
                            this.player.invincibleTime = 10;
                            this.stats.score += 500;
                            break;
                        case 'flower':
                            this.player.speed = Math.min(12, this.player.speed * 1.5);
                            this.player.invincible = true;
                            this.player.invincibleTime = 15;
                            this.stats.score += 1000;
                            break;
                    }
                    
                    // جسيمات العنصر
                    if (this.settings.showParticles) {
                        this.createParticles(item.x, item.y, 15, this.getItemColor(item.type));
                    }
                    
                    // تحديث الواجهة
                    this.updateGameUI();
                    
                    console.log(`🎁 جمع عنصر: ${item.type}`);
                }
            }
        });
    }
    
    checkEnemyCollisions() {
        this.enemies.forEach((enemy, index) => {
            if (!enemy.active) return;
            
            const distance = Math.sqrt(
                Math.pow(this.player.x + this.player.width/2 - (enemy.x + enemy.width/2), 2) +
                Math.pow(this.player.y + this.player.height/2 - (enemy.y + enemy.height/2), 2)
            );
            
            if (distance < 50) {
                if (this.player.velocityY > 0 && this.player.y + this.player.height < enemy.y + enemy.height/2) {
                    // القفز على العدو
                    enemy.active = false;
                    this.stats.kills++;
                    this.stats.score += 200;
                    
                    // جسيمات التدمير
                    if (this.settings.showParticles) {
                        this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 12, '#EF476F');
                    }
                    
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
    
    // ===== شروط النهاية =====
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
        if (this.player.x >= this.canvas.width * 2.5 - 100) {
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
            // مناعة مؤقتة
            this.player.invincible = true;
            this.player.invincibleTime = 2;
            
            // ارتداد
            this.player.velocityY = -10;
            this.player.velocityX = this.player.facingRight ? -10 : 10;
            
            // جسيمات الضرر
            if (this.settings.showParticles) {
                this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 8, '#EF476F');
            }
            
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
    
    // ===== الرسم =====
    draw() {
        if (!this.ctx) return;
        
        // مسح الشاشة
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // تطبيق تحويلات الكاميرا
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // رسم المكونات
        this.drawBackground();
        this.drawPlatforms();
        this.drawCoins();
        this.drawItems();
        this.drawEnemies();
        this.drawParticles();
        this.drawPlayer();
        
        // استعادة التحويلات
        this.ctx.restore();
    }
    
    drawBackground() {
        // السماء
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width * 3, this.canvas.height);
        
        // السحب (إذا الجودة ليست منخفضة)
        if (this.settings.graphicsQuality !== 'low') {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 8; i++) {
                const x = (this.camera.x * 0.3 + i * 250) % (this.canvas.width * 3 + 300);
                const y = 50 + Math.sin(this.gameTime + i) * 15;
                this.drawCloud(x, y, 70);
            }
        }
        
        // الجبال (إذا الجودة ليست منخفضة)
        if (this.settings.graphicsQuality !== 'low') {
            this.ctx.fillStyle = '#2C3E50';
            this.drawMountain(300, 200, 200, 150);
            this.drawMountain(600, 180, 180, 130);
            this.drawMountain(900, 220, 220, 170);
            this.drawMountain(1400, 200, 180, 140);
        }
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
            this.ctx.fillStyle = platform.type === 'ground' ? '#8B4513' : '#A0522D';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل الأرض
            if (this.settings.graphicsQuality !== 'low') {
                this.ctx.fillStyle = platform.type === 'ground' ? '#A0522D' : '#8B4513';
                for (let i = 0; i < platform.width; i += 20) {
                    this.ctx.fillRect(platform.x + i, platform.y, 10, platform.height * 0.1);
                }
            }
            
            // ظل
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
                
                this.ctx.fillStyle = color;
                
                switch (item.type) {
                    case 'mushroom':
                        // فطر
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
            if (!enemy.active) return;
            
            // الجسم
            this.ctx.fillStyle = '#EF476F';
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // العيون
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(enemy.x + 10, enemy.y + 10, 8, 8);
            this.ctx.fillRect(enemy.x + enemy.width - 18, enemy.y + 10, 8, 8);
            
            // القدم المتحركة
            const footOffset = Math.sin(this.gameTime * 5 + enemy.x) * 3;
            this.ctx.fillRect(enemy.x + 5, enemy.y + enemy.height - 5, 10, 5 + footOffset);
            this.ctx.fillRect(enemy.x + enemy.width - 15, enemy.y + enemy.height - 5, 10, 5 - footOffset);
        });
    }
    
    drawParticles() {
        if (!this.settings.showParticles) return;
        
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
            // رسم بديل للاعب (مربع أحمر)
            this.ctx.fillStyle = this.player.invincible ? '#9B59B6' : this.player.color;
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            
            // الوجه
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(this.player.x + 10, this.player.y + 10, 20, 20);
            
            // العيون
            this.ctx.fillStyle = '#FFF';
            const eyeOffset = this.player.isJumping ? 2 : 0;
            this.ctx.fillRect(this.player.x + 15, this.player.y + 15 + eyeOffset, 5, 5);
            this.ctx.fillRect(this.player.x + 25, this.player.y + 15 + eyeOffset, 5, 5);
        }
        
        this.ctx.globalAlpha = 1;
        
        // تأثير القفز
        if (this.player.isJumping && this.settings.graphicsQuality !== 'low') {
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
    
    // ===== أدوات مساعدة =====
    createParticles(x, y, count, color) {
        if (!this.settings.showParticles) return;
        
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
            default: return '#FFF';
        }
    }
    
    // ===== تحديث الواجهة =====
    updateStartScreen() {
        // تحديث أفضل نتيجة
        this.updateHighScore();
    }
    
    updateGameUI() {
        // الوقت
        document.getElementById('timer').textContent = this.formatTime(this.stats.time);
        
        // النقاط
        document.getElementById('score').textContent = this.stats.score.toLocaleString();
        
        // الأرواح
        document.getElementById('lives').textContent = this.stats.lives;
        
        // المستوى
        document.getElementById('level').textContent = this.stats.level;
        
        // العملات
        document.getElementById('coins').textContent = `${this.stats.coins}/${this.stats.totalCoins}`;
    }
    
    updatePauseUI() {
        document.getElementById('pause-time').textContent = this.formatTime(this.stats.time);
        document.getElementById('pause-score').textContent = this.stats.score.toLocaleString();
        document.getElementById('pause-coins').textContent = `${this.stats.coins}/${this.stats.totalCoins}`;
        document.getElementById('pause-lives').textContent = this.stats.lives;
    }
    
    updateEndUI(isWin) {
        // الأيقونة والعنوان
        const endIcon = document.getElementById('end-icon');
        endIcon.className = isWin ? 'fas fa-trophy' : 'fas fa-skull-crossbones';
        
        document.getElementById('end-title').textContent = isWin ? 'تهانينا!' : 'انتهت اللعبة';
        
        document.getElementById('end-message').textContent = isWin 
            ? `لقد أكملت المستوى بنجاح! جمعت ${this.stats.coins} عملة في ${this.formatTime(120 - this.stats.time)}` 
            : 'حاول مرة أخرى في المرة القادمة!';
        
        // الإحصائيات
        document.getElementById('end-score').textContent = this.stats.score.toLocaleString();
        document.getElementById('end-coins').textContent = `${this.stats.coins}/${this.stats.totalCoins}`;
        document.getElementById('end-time').textContent = this.formatTime(120 - this.stats.time);
        document.getElementById('end-kills').textContent = this.stats.kills;
    }
    
    updateProgressBar() {
        const progress = (this.stats.coins / this.stats.totalCoins) * 100;
        document.getElementById('level-progress').style.width = `${progress}%`;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // ===== الإعدادات =====
    saveSettings() {
        try {
            this.settings.controlsSize = document.getElementById('controls-size').value;
            this.settings.controlsOpacity = parseInt(document.getElementById('controls-opacity').value);
            this.settings.graphicsQuality = document.getElementById('graphics-quality').value;
            this.settings.showParticles = document.getElementById('show-particles').checked;
            
            this.audio.volume = parseInt(document.getElementById('sound-volume').value) / 100;
            this.audio.enabled = document.getElementById('enable-sound').checked;
            
            localStorage.setItem('mario_settings', JSON.stringify(this.settings));
            localStorage.setItem('mario_audio', JSON.stringify(this.audio));
            
            this.applySettings();
            
            // إخفاء نافذة الإعدادات
            this.hideModal('settings');
            
            console.log('✅ تم حفظ الإعدادات');
        } catch (e) {
            console.log('❌ خطأ في حفظ الإعدادات:', e);
        }
    }
    
    resetSettings() {
        this.settings = {
            controlsSize: 'medium',
            controlsOpacity: 70,
            graphicsQuality: 'medium',
            showParticles: true
        };
        
        this.audio = {
            enabled: true,
            volume: 0.7
        };
        
        localStorage.removeItem('mario_settings');
        localStorage.removeItem('mario_audio');
        
        this.applySettings();
        
        console.log('🔄 تم إعادة تعيين الإعدادات');
    }
    
    // ===== التنظيف =====
    cleanup() {
        clearInterval(this.timerInterval);
        console.log('🧹 تنظيف موارد اللعبة');
    }
}

// ============================================
// تهيئة اللعبة عند تحميل الصفحة
// ============================================

let game;

window.addEventListener('load', () => {
    console.log('📄 الصفحة محملة - إنشاء اللعبة...');
    
    // إدارة إشعار الدوران
    const updateRotationWarning = () => {
        const warning = document.getElementById('rotate-warning');
        const startScreen = document.getElementById('start-screen');
        
        if (window.innerHeight > window.innerWidth) {
            // وضع عمودي
            warning.style.display = 'flex';
            if (startScreen) startScreen.classList.remove('active');
        } else {
            // وضع أفقي
            warning.style.display = 'none';
            if (startScreen) startScreen.classList.add('active');
        }
    };
    
    updateRotationWarning();
    window.addEventListener('resize', updateRotationWarning);
    window.addEventListener('orientationchange', updateRotationWarning);
    
    // إنشاء اللعبة
    game = new MarioGameEngine();
    console.log('✅ اللعبة جاهزة! اضغط زر "بدء اللعبة"');
});

// ============================================
// جعل الكائن متاحاً عالمياً للتصحيح
// ============================================
window.MarioGameEngine = MarioGameEngine;
console.log('🎮 جميع الملفات مرتبطة وجاهزة للعمل!');
