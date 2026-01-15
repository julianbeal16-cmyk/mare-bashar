// ============================================
// 🎮 لعبة ماريو الخارقة - المحرك النهائي
// ============================================

'use strict';

// الكائن الرئيسي للعبة
const MarioGame = {
    // ======================
    // إعدادات النظام
    // ======================
    
    // عناصر DOM
    canvas: null,
    ctx: null,
    
    // حالة اللعبة
    state: 'start', // start, playing, paused, ended
    
    // الإحصائيات
    score: 0,
    highScore: 0,
    lives: 3,
    timeLeft: 120,
    coins: 0,
    totalCoins: 30,
    kills: 0,
    level: 1,
    
    // المؤقتات
    gameTimer: null,
    animationId: null,
    frameCount: 0,
    lastTime: 0,
    
    // عناصر اللعبة
    player: null,
    platforms: [],
    coinsArr: [],
    enemies: [],
    powerUps: [],
    particles: [],
    camera: { x: 0, y: 0 },
    castle: null,
    worldWidth: 0,
    
    // التحكم
    keys: {},
    touchControls: {
        left: false,
        right: false,
        jump: false,
        action: false
    },
    
    // إعدادات الصوت
    soundEnabled: true,
    musicEnabled: true,
    
    // ======================
    // التهيئة الأساسية
    // ======================
    
    init() {
        console.log('🚀 تهيئة لعبة ماريو الخارقة...');
        
        try {
            // 1. إعداد Canvas
            this.setupCanvas();
            
            // 2. تحميل أفضل نتيجة
            this.loadHighScore();
            
            // 3. إعداد التحكم
            this.setupControls();
            
            // 4. إعداد الأزرار
            this.setupButtons();
            
            // 5. إعداد الأصوات
            this.setupAudio();
            
            // 6. التأكد من عمل النظام
            this.systemCheck();
            
            console.log('✅ اللعبة مهيأة وجاهزة للعب!');
            this.showNotification('مرحباً بك في لعبة ماريو الخارقة! 🎮');
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showEmergencyScreen(error);
        }
    },
    
    setupCanvas() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            throw new Error('Canvas غير موجود!');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('سياق Canvas غير مدعوم!');
        }
        
        // ضبط حجم Canvas
        const resizeCanvas = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                this.canvas.width = gameArea.clientWidth;
                this.canvas.height = gameArea.clientHeight;
                console.log(`📐 حجم Canvas: ${this.canvas.width}x${this.canvas.height}`);
            }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // تأكيد إضافي
        setTimeout(resizeCanvas, 100);
        setTimeout(resizeCanvas, 500);
    },
    
    loadHighScore() {
        try {
            const saved = localStorage.getItem('mario_high_score');
            this.highScore = saved ? parseInt(saved) : 0;
            document.getElementById('high-score').textContent = this.highScore;
        } catch (e) {
            console.warn('⚠️ فشل تحميل أفضل نتيجة:', e);
            this.highScore = 0;
        }
    },
    
    setupControls() {
        // لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // منع السلوك الافتراضي
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }
            
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
            
            // إعادة التشغيل
            if (key === 'r' && this.state === 'ended') {
                this.restartGame();
                e.preventDefault();
            }
            
            // العودة للقائمة
            if (key === 'escape') {
                this.backToMenu();
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // تحكم الجوال
        this.setupMobileControls();
    },
    
    setupMobileControls() {
        const setupButton = (id, control) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            const events = ['touchstart', 'mousedown'];
            const endEvents = ['touchend', 'touchcancel', 'mouseup', 'mouseleave'];
            
            events.forEach(event => {
                btn.addEventListener(event, (e) => {
                    this.touchControls[control] = true;
                    if (event === 'touchstart') e.preventDefault();
                });
            });
            
            endEvents.forEach(event => {
                btn.addEventListener(event, (e) => {
                    this.touchControls[control] = false;
                    if (event.startsWith('touch')) e.preventDefault();
                });
            });
        };
        
        setupButton('btn-left', 'left');
        setupButton('btn-right', 'right');
        setupButton('btn-jump', 'jump');
        setupButton('btn-action', 'action');
        
        // زر خاص
        const specialBtn = document.getElementById('btn-special');
        if (specialBtn) {
            specialBtn.addEventListener('click', () => {
                this.showNotification('🌟 مهارة خاصة مفعلة!');
            });
        }
    },
    
    setupButtons() {
        // زر البدء الرئيسي
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        
        // زر الإيقاف/المتابعة
        document.getElementById('pause-button').addEventListener('click', () => this.togglePause());
        
        // زر القائمة
        document.getElementById('menu-button').addEventListener('click', () => this.backToMenu());
        
        // زر الصوت
        document.getElementById('sound-button').addEventListener('click', () => this.toggleSound());
        
        // زر إعادة اللعب
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        
        // زر العودة للقائمة من النهاية
        document.getElementById('return-menu-btn').addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // زر المشاركة
        document.getElementById('share-btn').addEventListener('click', () => this.shareScore());
        
        // زر ملء الشاشة
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
    },
    
    setupAudio() {
        // إنشاء عناصر صوتية
        this.sounds = {
            jump: document.getElementById('jump-sound'),
            coin: document.getElementById('coin-sound'),
            hit: document.getElementById('hit-sound')
        };
        
        // التحقق من توفر الصوت
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = 0.5;
                sound.preload = 'auto';
            }
        });
    },
    
    systemCheck() {
        const checks = {
            canvas: !!this.canvas,
            context: !!this.ctx,
            gameArea: !!document.querySelector('.game-area'),
            buttons: {
                start: !!document.getElementById('start-game'),
                pause: !!document.getElementById('pause-button'),
                menu: !!document.getElementById('menu-button')
            }
        };
        
        console.log('🔍 فحص النظام:', checks);
        
        if (!checks.canvas || !checks.context) {
            throw new Error('Canvas غير مدعوم!');
        }
    },
    
    // ======================
    // إدارة الشاشات
    // ======================
    
    showScreen(screenId) {
        // إخفاء كل الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
        
        // إظهار الشاشة المطلوبة
        const screen = document.getElementById(screenId + '-screen');
        if (screen) {
            screen.style.display = 'flex';
            this.state = screenId === 'game' ? 'playing' : screenId;
            
            // إذا كانت شاشة اللعب، نبدأ بعد تأخير بسيط
            if (screenId === 'game') {
                setTimeout(() => {
                    if (this.state === 'playing') {
                        this.startGameLoop();
                    }
                }, 100);
            }
        }
    },
    
    backToMenu() {
        this.state = 'start';
        
        // إيقاف المؤقتات
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // إظهار شاشة البداية
        this.showScreen('start');
    },
    
    // ======================
    // بدء اللعبة
    // ======================
    
    startGame() {
        console.log('🚀 بدء لعبة جديدة...');
        
        // إعادة تعيين الإحصائيات
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coins = 0;
        this.kills = 0;
        this.camera = { x: 0, y: 0 };
        this.frameCount = 0;
        
        // إنشاء عالم اللعبة
        this.createGameWorld();
        
        // تحديث الواجهة
        this.updateUI();
        
        // إظهار شاشة اللعب
        this.showScreen('game');
        
        // بدء المؤقت
        this.startTimer();
        
        // إظهار إشعار
        this.showNotification('🚀 ابدأ مغامرتك! اجمع العملات وتجنب الأعداء!');
        
        console.log('🎮 اللعبة بدأت!');
    },
    
    createGameWorld() {
        if (!this.canvas) return;
        
        this.worldWidth = this.canvas.width * 3;
        const groundY = this.canvas.height - 80;
        
        // 🔥 اللاعب
        this.player = {
            x: 200,
            y: groundY - 100,
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
            color: '#E74C3C'
        };
        
        // 🔥 الأرض الأساسية
        this.platforms = [
            { 
                x: 0, 
                y: groundY, 
                width: this.worldWidth, 
                height: 80, 
                type: 'ground',
                color: '#8B4513'
            }
        ];
        
        // 🔥 منصات عائمة
        const platformPositions = [
            { x: 350, y: groundY - 120 },
            { x: 650, y: groundY - 160 },
            { x: 950, y: groundY - 140 },
            { x: 1250, y: groundY - 180 },
            { x: 1550, y: groundY - 130 },
            { x: 1850, y: groundY - 150 },
            { x: 2150, y: groundY - 170 }
        ];
        
        platformPositions.forEach((pos, i) => {
            this.platforms.push({
                x: pos.x,
                y: pos.y,
                width: 200,
                height: 25,
                type: 'platform',
                color: i % 2 === 0 ? '#A0522D' : '#8B4513'
            });
        });
        
        // 🔥 العملات الذهبية
        this.coinsArr = [];
        for (let i = 0; i < this.totalCoins; i++) {
            this.coinsArr.push({
                x: 400 + i * 85,
                y: groundY - 150 + (i % 4) * 35,
                collected: false,
                radius: 12,
                anim: Math.random() * Math.PI * 2,
                value: 100
            });
        }
        
        // 🔥 الأعداء
        this.enemies = [];
        const enemyTypes = [
            { color: '#EF476F', speed: 2.5, size: 45 },
            { color: '#FF6B6B', speed: 3, size: 40 },
            { color: '#E74C3C', speed: 2, size: 50 }
        ];
        
        for (let i = 0; i < 6; i++) {
            const type = enemyTypes[i % enemyTypes.length];
            this.enemies.push({
                x: 500 + i * 320,
                y: groundY - type.size,
                width: type.size,
                height: type.size,
                dir: i % 2 === 0 ? 1 : -1,
                speed: type.speed,
                color: type.color,
                active: true,
                type: i % 3 === 0 ? 'fast' : 'normal'
            });
        }
        
        // 🔥 القصر الملكي
        this.castle = {
            x: this.worldWidth - 350,
            y: groundY - 200,
            width: 250,
            height: 200,
            reached: false,
            color: '#8B4513',
            flagColor: '#E74C3C'
        };
        
        console.log(`🌍 العالم مخلوق - العرض: ${this.worldWidth}px`);
    },
    
    startTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            if (this.state === 'playing') {
                this.timeLeft--;
                this.updateUI();
                
                // تحديث البوصلة
                this.updateCompass();
                
                // تحديث شريط التقدم
                this.updateProgressBar();
                
                if (this.timeLeft <= 0) {
                    this.endGame(false, '⏰ انتهى الوقت!');
                }
                
                // تحديث نص المهمة
                this.updateMissionText();
            }
        }, 1000);
    },
    
    updateUI() {
        // الوقت
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('time-count').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // النتيجة
        document.getElementById('score-count').textContent = this.score;
        
        // الأرواح
        document.getElementById('lives-count').textContent = this.lives;
        
        // العملات
        document.getElementById('coins-count').textContent = `${this.coins}/${this.totalCoins}`;
    },
    
    updateMissionText() {
        const missionText = document.getElementById('mission-text');
        if (!missionText) return;
        
        const remainingCoins = this.totalCoins - this.coins;
        
        if (remainingCoins > 20) {
            missionText.textContent = '🎯 اجمع العملات الذهبية!';
        } else if (remainingCoins > 10) {
            missionText.textContent = '💰 استمر! العملات تكاد تنتهي!';
        } else if (remainingCoins > 5) {
            missionText.textContent = '🔥 قريب من النهاية!';
        } else if (remainingCoins > 0) {
            missionText.textContent = '⚡ آخر عملات قليلة!';
        } else {
            missionText.textContent = '🏃‍♂️ تقدم نحو القصر!';
        }
    },
    
    updateCompass() {
        if (!this.player || !this.castle) return;
        
        const arrow = document.getElementById('compass-arrow');
        const distanceText = document.getElementById('distance-text');
        
        if (!arrow || !distanceText) return;
        
        const distance = this.castle.x - this.player.x;
        const distanceMeters = Math.abs(Math.round(distance / 10));
        
        // تحديث السهم
        if (distance > 200) {
            arrow.textContent = '→';
            arrow.style.transform = 'rotate(0deg)';
        } else if (distance < -200) {
            arrow.textContent = '←';
            arrow.style.transform = 'rotate(180deg)';
        } else {
            arrow.textContent = '↓';
            arrow.style.transform = 'rotate(0deg)';
        }
        
        // تحديث المسافة
        distanceText.textContent = `المسافة: ${distanceMeters}m`;
    },
    
    updateProgressBar() {
        const progressFill = document.getElementById('game-progress');
        const currentProgress = document.getElementById('current-progress');
        
        if (!progressFill || !currentProgress) return;
        
        // حساب التقدم بناءً على العملات والموقع
        const coinProgress = (this.coins / this.totalCoins) * 50;
        const positionProgress = this.player ? (this.player.x / this.worldWidth) * 50 : 0;
        const totalProgress = Math.min(100, coinProgress + positionProgress);
        
        progressFill.style.width = `${totalProgress}%`;
        currentProgress.textContent = `${Math.round(totalProgress)}%`;
    },
    
    // ======================
    // حلقة اللعبة الرئيسية
    // ======================
    
    startGameLoop() {
        if (this.state !== 'playing') return;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.lastTime = performance.now();
        this.gameLoop();
    },
    
    gameLoop(currentTime = 0) {
        if (this.state !== 'playing') return;
        
        // حساب deltaTime
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
            this.showNotification('⚠️ خطأ في اللعبة، جاري الإصلاح...');
            setTimeout(() => this.startGameLoop(), 100);
            return;
        }
        
        // الاستمرار في الحلقة
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
        
        // تحديث الرسوم المتحركة
        this.updateAnimations(deltaTime);
        
        // التحقق من الاصطدامات
        this.checkCollisions();
        
        // التحقق من شروط النهاية
        this.checkEndConditions();
    },
    
    updatePlayer(deltaTime) {
        const p = this.player;
        
        // حركة أفقية
        p.velX = 0;
        
        if (this.keys['arrowleft'] || this.keys['a'] || this.touchControls.left) {
            p.velX = -p.speed;
            p.facingRight = false;
        }
        
        if (this.keys['arrowright'] || this.keys['d'] || this.touchControls.right) {
            p.velX = p.speed;
            p.facingRight = true;
        }
        
        // قفز
        const jumpPressed = this.keys[' '] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump;
        
        if (jumpPressed && p.grounded) {
            p.velY = p.jumpPower;
            p.grounded = false;
            this.playSound('jump');
            this.showNotification('⬆️ قفزة قوية!');
        }
        
        // جاذبية
        p.velY += 0.8;
        p.velY = Math.min(p.velY, 16);
        
        // تحديث الموقع
        p.x += p.velX;
        p.y += p.velY;
        
        // حدود العالم
        p.x = Math.max(0, Math.min(this.worldWidth - p.width, p.x));
        
        // اكتشاف الاصطدام مع المنصات
        p.grounded = false;
        
        for (const platform of this.platforms) {
            if (p.x < platform.x + platform.width &&
                p.x + p.width > platform.x &&
                p.y + p.height > platform.y &&
                p.y + p.height < platform.y + platform.height + p.velY &&
                p.velY > 0) {
                
                p.y = platform.y - p.height;
                p.velY = 0;
                p.grounded = true;
                break;
            }
        }
        
        // سقوط في الهاوية
        if (p.y > this.canvas.height + 100) {
            this.playerDamaged('💀 سقوط في الهاوية!');
            p.x = 200;
            p.y = this.canvas.height - 200;
        }
        
        // تحديث المناعة
        if (p.invincible) {
            p.invincibleTime -= deltaTime;
            if (p.invincibleTime <= 0) {
                p.invincible = false;
            }
        }
    },
    
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // حركة العدو
            enemy.x += enemy.speed * enemy.dir * deltaTime * 60;
            
            // تغيير الاتجاه عند الوصول للحافة
            if (enemy.x < 50 || enemy.x + enemy.width > this.worldWidth - 50) {
                enemy.dir *= -1;
            }
            
            // رسوم متحركة بسيطة (تأرجح)
            enemy.y += Math.sin(this.frameCount * 0.05 + enemy.x * 0.01) * 0.5;
        });
    },
    
    updateAnimations(deltaTime) {
        // تحريك العملات
        this.coinsArr.forEach(coin => {
            if (!coin.collected) {
                coin.anim += deltaTime * 2;
            }
        });
    },
    
    updateCamera() {
        if (!this.player) return;
        
        const p = this.player;
        const targetX = p.x - this.canvas.width / 2 + p.width / 2;
        
        // كاميرا سلسة
        this.camera.x += (targetX - this.camera.x) * 0.1;
        
        // حدود الكاميرا
        this.camera.x = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.camera.x));
    },
    
    checkCollisions() {
        const p = this.player;
        if (!p) return;
        
        // جمع العملات
        this.coinsArr.forEach(coin => {
            if (!coin.collected) {
                const dx = p.x + p.width / 2 - coin.x;
                const dy = p.y + p.height / 2 - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30) {
                    coin.collected = true;
                    this.coins++;
                    this.score += coin.value;
                    this.updateUI();
                    this.updateProgressBar();
                    this.playSound('coin');
                    this.showNotification(`💰 +${coin.value} نقطة!`);
                    
                    // تأثير بصرعند جمع عملة
                    this.createCoinEffect(coin.x, coin.y);
                }
            }
        });
        
        // الاصطدام بالأعداء
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            if (p.x < enemy.x + enemy.width &&
                p.x + p.width > enemy.x &&
                p.y < enemy.y + enemy.height &&
                p.y + p.height > enemy.y) {
                
                if (p.velY > 0 && p.y + p.height < enemy.y + enemy.height / 2) {
                    // قفز على العدو
                    enemy.active = false;
                    this.score += 200;
                    this.kills++;
                    p.velY = -12;
                    this.updateUI();
                    this.playSound('hit');
                    this.showNotification(`👊 +200 نقطة! عدو مهزوم!`);
                    
                    // تأثير عند هزيمة العدو
                    this.createEnemyDefeatEffect(enemy.x, enemy.y);
                } else if (!p.invincible) {
                    // اصطدام بالعدو
                    this.playerDamaged('👾 اصطدمت بعدو!');
                }
            }
        });
    },
    
    checkEndConditions() {
        // الفوز بجمع كل العملات
        if (this.coins >= this.totalCoins) {
            this.endGame(true, '🎊 جمعت كل العملات!');
            return;
        }
        
        // الفوز بالوصول للقصر
        if (this.castle && !this.castle.reached) {
            const p = this.player;
            const c = this.castle;
            
            const dx = p.x + p.width / 2 - (c.x + c.width / 2);
            const dy = p.y + p.height / 2 - (c.y + c.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 180) {
                c.reached = true;
                this.score += 2000;
                this.endGame(true, '🏰 وصلت للقصر الملكي!');
                return;
            }
        }
        
        // الفوز بالوصول لنهاية العالم
        if (this.player.x >= this.worldWidth - 200) {
            this.endGame(true, '🚀 وصلت لنهاية العالم!');
            return;
        }
    },
    
    playerDamaged(message) {
        const p = this.player;
        if (p.invincible) return;
        
        this.lives--;
        this.updateUI();
        this.playSound('hit');
        this.showNotification(`${message} ❤️ ${this.lives} أرواح متبقية`);
        
        if (this.lives <= 0) {
            this.endGame(false, '💔 نفدت الأرواح!');
        } else {
            p.invincible = true;
            p.invincibleTime = 3;
            p.velY = -10;
        }
    },
    
    createCoinEffect(x, y) {
        // يمكن إضافة جسيمات أو تأثيرات بصرية هنا
        console.log(`✨ تأثير عملة في (${x}, ${y})`);
    },
    
    createEnemyDefeatEffect(x, y) {
        // يمكن إضافة جسيمات أو تأثيرات بصرية هنا
        console.log(`💥 تأثير هزيمة عدو في (${x}, ${y})`);
    },
    
    // ======================
    // نهاية اللعبة
    // ======================
    
    endGame(isWin, message) {
        console.log(isWin ? '🏆 فوز!' : '💀 خسارة!');
        
        this.state = 'ended';
        
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
        if (this.score > this.highScore) {
            this.highScore = this.score;
            try {
                localStorage.setItem('mario_high_score', this.highScore.toString());
                document.getElementById('high-score').textContent = this.highScore;
            } catch (e) {
                console.warn('⚠️ فشل حفظ أفضل نتيجة:', e);
            }
        }
        
        // تحديث شاشة النهاية
        this.updateEndScreen(isWin, message);
        
        // تحديث الإنجازات
        this.updateAchievements();
        
        // إظهار شاشة النهاية
        this.showScreen('end');
        
        // إظهار إشعار
        this.showNotification(isWin ? '🎉 انتصار رائع!' : '💪 حاول مرة أخرى!');
    },
    
    updateEndScreen(isWin, message) {
        const endIcon = document.getElementById('victory-icon');
        const endTitle = document.getElementById('end-title');
        const endMessage = document.getElementById('end-message');
        
        if (endIcon) {
            endIcon.innerHTML = isWin ? '<i class="fas fa-trophy"></i>' : '<i class="fas fa-skull-crossbones"></i>';
        }
        
        if (endTitle) {
            endTitle.textContent = isWin ? '🎉 انتصار مذهل!' : '💔 انتهت اللعبة';
        }
        
        if (endMessage) {
            endMessage.textContent = message;
        }
        
        // تحديث الإحصائيات النهائية
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-coins').textContent = `${this.coins}/${this.totalCoins}`;
        document.getElementById('final-time').textContent = this.formatTime(120 - this.timeLeft);
        document.getElementById('final-kills').textContent = this.kills;
        
        // حساب سرعة الإنجاز
        const speed = Math.round((120 - this.timeLeft) / 120 * 100);
        document.getElementById('final-speed').textContent = `${100 - speed}%`;
    },
    
    updateAchievements() {
        // سيد العملات
        const coinAchievement = document.getElementById('achievement-coins');
        if (coinAchievement && this.coins >= this.totalCoins) {
            coinAchievement.classList.add('completed');
            coinAchievement.innerHTML = '<i class="fas fa-check-circle"></i><span>سيد العملات</span>';
        }
        
        // عداء سريع
        const speedAchievement = document.getElementById('achievement-speed');
        if (speedAchievement && this.timeLeft >= 60) {
            speedAchievement.classList.add('completed');
            speedAchievement.innerHTML = '<i class="fas fa-check-circle"></i><span>عداء سريع</span>';
        }
        
        // أداء مثالي
        const perfectAchievement = document.getElementById('achievement-perfect');
        if (perfectAchievement && this.lives === 3 && this.coins >= this.totalCoins) {
            perfectAchievement.classList.add('completed');
            perfectAchievement.innerHTML = '<i class="fas fa-check-circle"></i><span>أداء مثالي</span>';
        }
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // ======================
    // الرسم
    // ======================
    
    draw() {
        if (!this.canvas || !this.ctx || !this.player) return;
        
        const ctx = this.ctx;
        
        // مسح الشاشة
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // حفظ حالة Canvas
        ctx.save();
        
        // تطبيق حركة الكاميرا
        ctx.translate(-this.camera.x, 0);
        
        // رسم الخلفية
        this.drawBackground();
        
        // رسم الأرض والمنصات
        this.drawPlatforms();
        
        // رسم العملات
        this.drawCoins();
        
        // رسم الأعداء
        this.drawEnemies();
        
        // رسم القصر
        this.drawCastle();
        
        // رسم اللاعب
        this.drawPlayer();
        
        // استعادة حالة Canvas
        ctx.restore();
        
        // رسم واجهة اللاعب
        this.drawHUD();
    },
    
    drawBackground() {
        const ctx = this.ctx;
        
        // السماء المتدرجة
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.worldWidth, this.canvas.height);
        
        // سحب متحركة
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        for (let i = 0; i < 12; i++) {
            const x = (this.camera.x * 0.03 + i * 280) % (this.worldWidth + 400);
            const y = 40 + Math.sin(this.frameCount * 0.002 + i * 0.5) * 25;
            const size = 18 + Math.sin(i * 0.7) * 4;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.arc(x + size * 1.2, y - size * 0.4, size * 0.9, 0, Math.PI * 2);
            ctx.arc(x + size * 2.4, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // جبال في الخلفية
        ctx.fillStyle = 'rgba(52, 73, 94, 0.4)';
        for (let i = 0; i < 7; i++) {
            const x = (i * 550) % this.worldWidth;
            const height = 120 + Math.sin(i) * 60;
            
            ctx.beginPath();
            ctx.moveTo(x, this.canvas.height - 80);
            ctx.lineTo(x + 250, this.canvas.height - 80 - height);
            ctx.lineTo(x + 500, this.canvas.height - 80);
            ctx.closePath();
            ctx.fill();
        }
    },
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            // جسم المنصة
            if (platform.type === 'ground') {
                // الأرض مع نسيج
                const gradient = ctx.createLinearGradient(
                    platform.x, platform.y,
                    platform.x, platform.y + platform.height
                );
                gradient.addColorStop(0, '#8B4513');
                gradient.addColorStop(0.5, '#734322');
                gradient.addColorStop(1, '#654321');
                ctx.fillStyle = gradient;
            } else {
                // المنصات العائمة
                const gradient = ctx.createLinearGradient(
                    platform.x, platform.y,
                    platform.x, platform.y + platform.height
                );
                gradient.addColorStop(0, platform.color);
                gradient.addColorStop(1, '#8B4513');
                ctx.fillStyle = gradient;
            }
            
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل المنصة (خطوط)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let i = 0; i < platform.width; i += 35) {
                ctx.fillRect(platform.x + i, platform.y, 25, 5);
            }
        });
    },
    
    drawCoins() {
        const ctx = this.ctx;
        
        this.coinsArr.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.anim + this.frameCount * 0.1) * 12;
                const y = coin.y + bounce;
                
                // العملة الذهبية
                const gradient = ctx.createRadialGradient(
                    coin.x, y, 0,
                    coin.x, y, coin.radius
                );
                gradient.addColorStop(0, '#FFF');
                gradient.addColorStop(0.3, '#FFD700');
                gradient.addColorStop(1, '#FFA500');
                ctx.fillStyle = gradient;
                
                ctx.beginPath();
                ctx.arc(coin.x, y, coin.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // بريق
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(coin.x - 3, y - 3, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // تأثير الوميض
                if (Math.sin(this.frameCount * 0.2) > 0.8) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(coin.x, y, coin.radius + 6, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        });
    },
    
    drawEnemies() {
        const ctx = this.ctx;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // جسم العدو
            const gradient = ctx.createLinearGradient(
                enemy.x, enemy.y,
                enemy.x, enemy.y + enemy.height
            );
            gradient.addColorStop(0, enemy.color);
            gradient.addColorStop(1, '#C0392B');
            ctx.fillStyle = gradient;
            
            // جسم مستدير قليلاً
            ctx.beginPath();
            ctx.roundRect(enemy.x, enemy.y, enemy.width, enemy.height, 10);
            ctx.fill();
            
            // عيون العدو
            ctx.fillStyle = '#2C3E50';
            ctx.beginPath();
            ctx.arc(enemy.x + 15, enemy.y + 15, 6, 0, Math.PI * 2);
            ctx.arc(enemy.x + enemy.width - 15, enemy.y + 15, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // بؤبؤ العين
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(enemy.x + 15, enemy.y + 15, 2, 0, Math.PI * 2);
            ctx.arc(enemy.x + enemy.width - 15, enemy.y + 15, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // فم العدو
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 20, enemy.y + 30, enemy.width - 40, 6);
            
            // قرون/أذنان
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x + 10, enemy.y - 10, 8, 10);
            ctx.fillRect(enemy.x + enemy.width - 18, enemy.y - 10, 8, 10);
        });
    },
    
    drawCastle() {
        if (!this.castle) return;
        
        const ctx = this.ctx;
        const c = this.castle;
        
        // قاعدة القصر
        const baseGradient = ctx.createLinearGradient(
            c.x, c.y,
            c.x, c.y + c.height
        );
        baseGradient.addColorStop(0, '#8B4513');
        baseGradient.addColorStop(1, '#654321');
        ctx.fillStyle = baseGradient;
        ctx.fillRect(c.x, c.y, c.width, c.height);
        
        // نسيج القصر (طوب)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let i = 0; i < c.width; i += 30) {
            for (let j = 0; j < c.height; j += 25) {
                ctx.fillRect(c.x + i + 2, c.y + j + 2, 25, 20);
            }
        }
        
        // أبراج القصر
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(c.x - 15, c.y - 120, 50, 120);
        ctx.fillRect(c.x + c.width - 35, c.y - 120, 50, 120);
        
        // نوافذ القصر
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                ctx.fillRect(c.x + 30 + i * 45, c.y + 25 + j * 50, 20, 30);
            }
        }
        
        // البوابة الرئيسية
        ctx.fillStyle = '#654321';
        ctx.fillRect(c.x + c.width/2 - 30, c.y + c.height - 60, 60, 60);
        
        // علم القصر
        ctx.fillStyle = '#654321';
        ctx.fillRect(c.x + c.width/2 - 3, c.y - 140, 6, 80);
        
        ctx.fillStyle = c.flagColor;
        ctx.beginPath();
        ctx.moveTo(c.x + c.width/2, c.y - 140);
        ctx.lineTo(c.x + c.width/2 + 35, c.y - 125);
        ctx.lineTo(c.x + c.width/2, c.y - 110);
        ctx.closePath();
        ctx.fill();
        
        // تفاصيل العلم
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(c.x + c.width/2 + 18, c.y - 118, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // تأثير وميض العلم
        if (Math.sin(this.frameCount * 0.05) > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.moveTo(c.x + c.width/2, c.y - 140);
            ctx.lineTo(c.x + c.width/2 + 20, c.y - 130);
            ctx.lineTo(c.x + c.width/2, c.y - 120);
            ctx.closePath();
            ctx.fill();
        }
    },
    
    drawPlayer() {
        if (!this.player) return;
        
        const ctx = this.ctx;
        const p = this.player;
        
        // لون اللاعب (يتغير إذا كان منيعاً)
        const playerColor = p.invincible && Math.floor(Date.now() / 200) % 2 === 0 ? '#9B59B6' : p.color;
        
        // جسم اللاعب
        const gradient = ctx.createLinearGradient(
            p.x, p.y,
            p.x, p.y + p.height
        );
        gradient.addColorStop(0, playerColor);
        gradient.addColorStop(1, '#C0392B');
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 8);
        ctx.fill();
        
        // رأس اللاعب
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.roundRect(p.x + 8, p.y + 8, 24, 24, 12);
        ctx.fill();
        
        // عيون اللاعب
        const eyeOffset = p.facingRight ? 0 : 4;
        ctx.fillStyle = '#FFF';
        ctx.fillRect(p.x + 12 + eyeOffset, p.y + 12, 6, 6);
        ctx.fillRect(p.x + 22 + eyeOffset, p.y + 12, 6, 6);
        
        // بؤبؤ العين
        ctx.fillStyle = '#000';
        ctx.fillRect(p.x + 14 + eyeOffset, p.y + 14, 2, 2);
        ctx.fillRect(p.x + 24 + eyeOffset, p.y + 14, 2, 2);
        
        // فم اللاعب
        ctx.fillStyle = '#FFF';
        ctx.fillRect(p.x + 14, p.y + 25, 12, 4);
        
        // تأثير المناعة
        if (p.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.roundRect(p.x - 2, p.y - 2, p.width + 4, p.height + 4, 12);
            ctx.stroke();
        }
        
        // تأثير الحركة (ظل تحت اللاعب)
        if (!p.grounded) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(
                p.x + p.width/2,
                p.y + p.height + 5,
                p.width/2.5,
                6,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }
    },
    
    drawHUD() {
        const ctx = this.ctx;
        
        // معلومات سريعة في الزاوية
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 180, 80);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 22px Cairo';
        ctx.fillText(`🏆 ${this.score}`, 20, 45);
        
        ctx.fillStyle = '#E74C3C';
        ctx.font = '18px Cairo';
        ctx.fillText(`❤️ ${this.lives}`, 20, 75);
        
        // تلميح سريع
        if (this.frameCount % 120 < 60) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '16px Cairo';
            ctx.fillText('🎯 اجمع كل العملات!', this.canvas.width - 200, 40);
        }
    },
    
    // ======================
    // وظائف مساعدة
    // ======================
    
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            if (this.gameTimer) clearInterval(this.gameTimer);
            if (this.animationId) cancelAnimationFrame(this.animationId);
            document.getElementById('pause-button').innerHTML = '<i class="fas fa-play"></i>';
            document.getElementById('pause-button').title = 'متابعة اللعبة';
            this.showNotification('⏸️ اللعبة متوقفة');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.startTimer();
            this.startGameLoop();
            document.getElementById('pause-button').innerHTML = '<i class="fas fa-pause"></i>';
            document.getElementById('pause-button').title = 'إيقاف اللعبة';
            this.showNotification('▶️ اللعبة مستمرة');
        }
    },
    
    toggleSound() {
        const btn = document.getElementById('sound-button');
        if (btn.innerHTML.includes('volume-up')) {
            btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            btn.title = 'تشغيل الصوت';
            this.soundEnabled = false;
            this.showNotification('🔇 الصوت متوقف');
        } else {
            btn.innerHTML = '<i class="fas fa-volume-up"></i>';
            btn.title = 'إيقاف الصوت';
            this.soundEnabled = true;
            this.showNotification('🔊 الصوت مفعل');
        }
    },
    
    toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                this.showNotification('🖥️ وضع ملء الشاشة مفعل');
            } else {
                document.exitFullscreen();
                this.showNotification('📱 الخروج من ملء الشاشة');
            }
        } catch (error) {
            console.log('⚠️ خطأ في ملء الشاشة:', error);
            this.showNotification('⚠️ لا يدعم المتصفح ملء الشاشة');
        }
    },
    
    playSound(soundName) {
        if (!this.soundEnabled) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('🔇 فشل تشغيل الصوت:', e));
        }
    },
    
    showNotification(message) {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notification-text');
        
        if (notification && text) {
            text.textContent = message;
            notification.style.display = 'flex';
            
            // إخفاء تلقائي بعد 3 ثواني
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
        
        // تسجيل في الكونسول أيضاً
        console.log('📢 ' + message);
    },
    
    restartGame() {
        this.backToMenu();
        setTimeout(() => this.startGame(), 300);
    },
    
    shareScore() {
        const shareText = `🎮 حققت ${this.score} نقطة في لعبة ماريو الخارقة! جمعت ${this.coins}/${this.totalCoins} عملة. جربها الآن!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'نتيجتي في لعبة ماريو الخارقة',
                text: shareText,
                url: window.location.href
            }).then(() => {
                this.showNotification('📢 تم مشاركة النتيجة بنجاح!');
            }).catch(() => {
                this.copyToClipboard(shareText);
            });
        } else {
            this.copyToClipboard(shareText);
        }
    },
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('📋 تم نسخ النتيجة للحافظة!');
        }).catch(() => {
            // طريقة بديلة
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('📋 تم نسخ النتيجة!');
        });
    },
    
    showEmergencyScreen(error) {
        console.error('🚨 حالة طوارئ:', error);
        
        const emergencyHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:#0a0a1a; color:white; display:flex; justify-content:center; align-items:center; z-index:9999;">
                <div style="text-align:center; padding:40px; max-width:600px;">
                    <h1 style="color:#E74C3C;">⚠️ خطأ في النظام</h1>
                    <p style="margin:20px 0; color:#aaa;">${error.message}</p>
                    <div style="margin:30px 0;">
                        <button onclick="location.reload()" style="margin:10px; padding:15px 30px; background:#3498DB; color:white; border:none; border-radius:10px; cursor:pointer; font-size:16px;">
                            🔄 إعادة تحميل الصفحة
                        </button>
                        <button onclick="startSimpleVersion()" style="margin:10px; padding:15px 30px; background:#2ECC71; color:white; border:none; border-radius:10px; cursor:pointer; font-size:16px;">
                            🎮 بدء نسخة مبسطة
                        </button>
                    </div>
                    <p style="color:#666; font-size:14px;">إذا استمرت المشكلة، تأكد من استخدام متصفح حديث</p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', emergencyHTML);
    }
};

// ============================================
// تهيئة اللعبة عند تحميل الصفحة
// ============================================

window.addEventListener('load', () => {
    console.log('📄 الصفحة محملة - جاري تهيئة اللعبة...');
    
    // تأخير بسيط للتأكد من تحميل كل شيء
    setTimeout(() => {
        try {
            MarioGame.init();
            
            // إضافة دالة startMarioGame للاستدعاء من الخارج
            window.startMarioGame = () => MarioGame.startGame();
            window.togglePause = () => MarioGame.togglePause();
            window.restartGame = () => MarioGame.restartGame();
            window.backToMenu = () => MarioGame.backToMenu();
            
            console.log('✅ جميع الأنظمة جاهزة للعمل!');
            
        } catch (error) {
            console.error('❌ فشل تهيئة اللعبة:', error);
            alert('🚨 خطأ في تحميل اللعبة!\n\n' + error.message + '\n\nجاري إعادة التحميل...');
            setTimeout(() => location.reload(), 3000);
        }
    }, 500);
});

// ============================================
// دالات الطوارئ العالمية
// ============================================

window.forceStart = () => {
    if (typeof MarioGame.startGame === 'function') {
        MarioGame.startGame();
        MarioGame.showNotification('🚀 بدء طارئ للعبة!');
    }
};

window.resetGame = () => {
    if (confirm('⚠️ هل تريد إعادة تعيين اللعبة؟ ستفقد أفضل النتائج المحفوظة.')) {
        localStorage.removeItem('mario_high_score');
        location.reload();
    }
};

window.showDebug = () => {
    console.log('🔍 معلومات التصحيح:', {
        game: MarioGame,
        canvas: MarioGame.canvas,
        state: MarioGame.state,
        score: MarioGame.score,
        highScore: MarioGame.highScore
    });
    
    if (typeof MarioGame.showNotification === 'function') {
        MarioGame.showNotification('🐛 معلومات التصحيح في الكونسول (F12)');
    }
};

// ============================================
// تحسينات إضافية
// ============================================

// إضافة دالة roundRect إذا لم تكن موجودة
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };
}

// إدارة وضع ملء الشاشة
document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('fullscreen-btn');
    if (btn) {
        if (document.fullscreenElement) {
            btn.innerHTML = '<i class="fas fa-compress"></i>';
            btn.title = 'تصغير الشاشة';
        } else {
            btn.innerHTML = '<i class="fas fa-expand"></i>';
            btn.title = 'ملء الشاشة';
        }
    }
});

// منع الإجراءات الافتراضية للتحكم في اللعبة
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});

console.log('🎮 نظام اللعبة محمل وجاهز للعمل!');
