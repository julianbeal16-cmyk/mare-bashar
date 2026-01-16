// ============================================
// 🎮 لعبة ماريو الخارقة - المحرك النهائي
// ============================================

'use strict';

// إضافة دالة roundRect إذا لم تكن موجودة
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (typeof radius === 'undefined') radius = 5;
        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        } else {
            var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        
        this.beginPath();
        this.moveTo(x + radius.tl, y);
        this.lineTo(x + width - radius.tr, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        this.lineTo(x + width, y + height - radius.br);
        this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        this.lineTo(x + radius.bl, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        this.lineTo(x, y + radius.tl);
        this.quadraticCurveTo(x, y, x + radius.tl, y);
        this.closePath();
        return this;
    };
}

// الكائن الرئيسي للعبة
const MarioGame = {
    // ======================
    // إعدادات النظام
    // ======================
    
    canvas: null,
    ctx: null,
    state: 'start',
    score: 0,
    highScore: 0,
    lives: 3,
    timeLeft: 120,
    coins: 0,
    totalCoins: 30,
    kills: 0,
    level: 1,
    gameTimer: null,
    animationId: null,
    frameCount: 0,
    lastTime: 0,
    player: null,
    platforms: [],
    coinsArr: [],
    enemies: [],
    camera: { x: 0, y: 0 },
    castle: null,
    worldWidth: 3000,
    keys: {},
    touchControls: { left: false, right: false, jump: false, action: false },
    soundEnabled: true,
    musicEnabled: true,
    sounds: {},
    playerImage: null, // صورة اللاعب المخصصة
    useCustomImage: false, // هل نستخدم صورة مخصصة؟
    
    // ======================
    // التهيئة الأساسية
    // ======================
    
    init() {
        console.log('🚀 تهيئة لعبة ماريو الخارقة...');
        
        try {
            document.getElementById('loading').style.display = 'none';
            this.setupCanvas();
            this.loadHighScore();
            this.loadPlayerImage(); // تحميل الصورة الشخصية
            this.setupControls();
            this.setupButtons();
            this.setupAudio();
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
        if (!this.canvas) throw new Error('Canvas غير موجود!');
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) throw new Error('سياق Canvas غير مدعوم!');
        
        const resizeCanvas = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                this.canvas.width = gameArea.clientWidth;
                this.canvas.height = gameArea.clientHeight;
            }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
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
    
    loadPlayerImage() {
        this.playerImage = new Image();
        this.playerImage.crossOrigin = "anonymous";
        
        // تحميل الصورة المخصصة من localStorage إذا كانت موجودة
        try {
            const savedImage = localStorage.getItem('player_custom_image');
            if (savedImage) {
                this.playerImage.src = savedImage;
                this.useCustomImage = true;
                console.log('✅ تم تحميل الصورة الشخصية المخصصة');
            } else {
                // محاولة تحميل الصورة الافتراضية
                this.playerImage.src = 'player.png';
                this.useCustomImage = false;
            }
        } catch (e) {
            console.warn('⚠️ خطأ في تحميل الصورة:', e);
            this.useCustomImage = false;
        }
        
        // معالجة نجاح تحميل الصورة
        this.playerImage.onload = () => {
            console.log('✅ صورة اللاعب محملة بنجاح');
            // تحديث أيقونة اللاعب في القائمة الرئيسية
            const playerImg = document.getElementById('player-img');
            const avatarFallback = document.getElementById('avatar-fallback');
            if (playerImg && avatarFallback) {
                playerImg.src = this.playerImage.src;
                playerImg.style.display = 'block';
                avatarFallback.style.display = 'none';
            }
        };
        
        // معالجة فشل تحميل الصورة
        this.playerImage.onerror = () => {
            console.warn('⚠️ فشل تحميل صورة اللاعب، استخدام التصميم الافتراضي');
            this.useCustomImage = false;
        };
    },
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }
            
            if (key === 'p') {
                this.togglePause();
                e.preventDefault();
            }
            
            if (key === 'f') {
                this.toggleFullscreen();
                e.preventDefault();
            }
            
            if (key === 'r' && this.state === 'ended') {
                this.restartGame();
                e.preventDefault();
            }
            
            if (key === 'escape') {
                this.backToMenu();
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        this.setupMobileControls();
    },
    
    setupMobileControls() {
        const setupButton = (id, control) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            ['touchstart', 'mousedown'].forEach(event => {
                btn.addEventListener(event, (e) => {
                    this.touchControls[control] = true;
                    if (event === 'touchstart') e.preventDefault();
                });
            });
            
            ['touchend', 'touchcancel', 'mouseup', 'mouseleave'].forEach(event => {
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
        
        const specialBtn = document.getElementById('btn-special');
        if (specialBtn) {
            specialBtn.addEventListener('click', () => {
                this.showNotification('🌟 مهارة خاصة مفعلة!');
            });
        }
    },
    
    setupButtons() {
        // زر البدء
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        
        // زر الإيقاف/المتابعة
        document.getElementById('pause-button').addEventListener('click', () => this.togglePause());
        
        // زر القائمة
        document.getElementById('menu-button').addEventListener('click', () => this.backToMenu());
        
        // زر الصوت
        document.getElementById('sound-button').addEventListener('click', () => this.toggleSound());
        
        // زر ملء الشاشة في الهيدر
        document.getElementById('fullscreen-button').addEventListener('click', () => this.toggleFullscreen());
        
        // زر ملء الشاشة العائم
        document.getElementById('quick-fullscreen').addEventListener('click', () => this.toggleFullscreen());
        
        // زر إعادة اللعب
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        
        // زر العودة للقائمة
        document.getElementById('return-menu-btn').addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // زر المشاركة
        document.getElementById('share-btn').addEventListener('click', () => this.shareScore());
    },
    
    setupAudio() {
        this.sounds = {
            jump: document.getElementById('jump-sound'),
            coin: document.getElementById('coin-sound'),
            hit: document.getElementById('hit-sound')
        };
        
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = 0.5;
                sound.preload = 'auto';
            }
        });
    },
    
    systemCheck() {
        console.log('🔍 فحص النظام:', {
            canvas: !!this.canvas,
            context: !!this.ctx,
            playerImage: !!this.playerImage
        });
    },
    
    // ======================
    // إدارة الشاشات
    // ======================
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
        
        const screen = document.getElementById(screenId + '-screen');
        if (screen) {
            screen.style.display = 'flex';
            this.state = screenId === 'game' ? 'playing' : screenId;
            
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
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.showScreen('start');
    },
    
    // ======================
    // بدء اللعبة
    // ======================
    
    startGame() {
        console.log('🚀 بدء لعبة جديدة...');
        
        // إعادة تعيين كل شيء
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coins = 0;
        this.kills = 0;
        this.camera = { x: 0, y: 0 };
        this.frameCount = 0;
        
        // إعادة تعيين القصر والأعداء والعملات
        if (this.castle) {
            this.castle.reached = false;
        }
        
        if (this.enemies && this.enemies.length > 0) {
            this.enemies.forEach(enemy => {
                enemy.active = true;
            });
        }
        
        if (this.coinsArr && this.coinsArr.length > 0) {
            this.coinsArr.forEach(coin => {
                coin.collected = false;
            });
        }
        
        // إنشاء عالم جديد إذا لم يكن موجوداً
        if (!this.player) {
            this.createGameWorld();
        } else {
            const groundY = this.canvas.height - 80;
            this.player.x = 200;
            this.player.y = groundY - 100;
            this.player.velX = 0;
            this.player.velY = 0;
            this.player.grounded = false;
            this.player.invincible = false;
            this.player.invincibleTime = 0;
        }
        
        this.updateUI();
        this.showScreen('game');
        
        // بدء المؤقت بعد تأخير
        setTimeout(() => {
            this.startTimer();
            this.startGameLoop();
            this.showNotification('🚀 ابدأ مغامرتك! اجمع العملات وتجنب الأعداء!');
        }, 500);
        
        console.log('🎮 اللعبة بدأت!');
    },
    
    createGameWorld() {
        if (!this.canvas) return;
        
        this.worldWidth = this.canvas.width * 3;
        const groundY = this.canvas.height - 80;
        
        // اللاعب
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
        
        // الأرض
        this.platforms = [
            { x: 0, y: groundY, width: this.worldWidth, height: 80, type: 'ground', color: '#8B4513' }
        ];
        
        // منصات
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
        
        // عملات
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
        
        // أعداء
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
        
        // القصر
        this.castle = {
            x: this.worldWidth - 350,
            y: groundY - 200,
            width: 250,
            height: 200,
            reached: false,
            color: '#8B4513',
            flagColor: '#E74C3C'
        };
    },
    
    startTimer() {
        if (this.gameTimer) clearInterval(this.gameTimer);
        
        this.gameTimer = setInterval(() => {
            if (this.state === 'playing') {
                this.timeLeft--;
                this.updateUI();
                this.updateCompass();
                this.updateProgressBar();
                this.updateMissionText();
                
                if (this.timeLeft <= 0) {
                    this.endGame(false, '⏰ انتهى الوقت!');
                }
            }
        }, 1000);
    },
    
    updateUI() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        const timeElement = document.getElementById('time-count');
        if (timeElement) timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const scoreElement = document.getElementById('score-count');
        if (scoreElement) scoreElement.textContent = this.score;
        
        const livesElement = document.getElementById('lives-count');
        if (livesElement) livesElement.textContent = this.lives;
        
        const coinsElement = document.getElementById('coins-count');
        if (coinsElement) coinsElement.textContent = `${this.coins}/${this.totalCoins}`;
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
        
        distanceText.textContent = `المسافة: ${distanceMeters}m`;
    },
    
    updateProgressBar() {
        const progressFill = document.getElementById('game-progress');
        const currentProgress = document.getElementById('current-progress');
        
        if (!progressFill || !currentProgress) return;
        
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
        
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        this.frameCount++;
        
        try {
            this.update(deltaTime);
            this.draw();
        } catch (error) {
            console.error('❌ خطأ في حلقة اللعبة:', error);
            setTimeout(() => this.startGameLoop(), 100);
            return;
        }
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    },
    
    update(deltaTime) {
        if (!this.player) return;
        
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateCamera();
        this.updateAnimations(deltaTime);
        this.checkCollisions();
        this.checkEndConditions();
    },
    
    updatePlayer(deltaTime) {
        const p = this.player;
        
        p.velX = 0;
        
        if (this.keys['arrowleft'] || this.keys['a'] || this.touchControls.left) {
            p.velX = -p.speed;
            p.facingRight = false;
        }
        
        if (this.keys['arrowright'] || this.keys['d'] || this.touchControls.right) {
            p.velX = p.speed;
            p.facingRight = true;
        }
        
        const jumpPressed = this.keys[' '] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump;
        
        if (jumpPressed && p.grounded) {
            p.velY = p.jumpPower;
            p.grounded = false;
            this.playSound('jump');
        }
        
        p.velY += 0.8;
        p.velY = Math.min(p.velY, 16);
        
        p.x += p.velX;
        p.y += p.velY;
        
        p.x = Math.max(0, Math.min(this.worldWidth - p.width, p.x));
        
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
        
        if (p.y > this.canvas.height + 100) {
            this.playerDamaged('💀 سقوط في الهاوية!');
            p.x = 200;
            p.y = this.canvas.height - 200;
        }
        
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
            
            enemy.x += enemy.speed * enemy.dir * deltaTime * 60;
            
            if (enemy.x < 50 || enemy.x + enemy.width > this.worldWidth - 50) {
                enemy.dir *= -1;
            }
            
            enemy.y += Math.sin(this.frameCount * 0.05 + enemy.x * 0.01) * 0.5;
        });
    },
    
    updateAnimations(deltaTime) {
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
        
        this.camera.x += (targetX - this.camera.x) * 0.1;
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
                } else if (!p.invincible) {
                    // اصطدام بالعدو
                    this.playerDamaged('👾 اصطدمت بعدو!');
                }
            }
        });
    },
    
    checkEndConditions() {
        // 🔥 إصلاح: منع الفوز التلقائي في البداية
        if (this.frameCount < 60) return;
        
        // الفوز بجمع كل العملات
        if (this.coins >= this.totalCoins) {
            // 🔥 إصلاح: تأكد من تحقيق إنجاز حقيقي
            if (this.player.x > 500 && this.lives > 0) {
                this.endGame(true, '🎊 جمعت كل العملات!');
            }
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
                // 🔥 إصلاح: تأكد من تحقيق إنجاز حقيقي
                if (this.coins > 10 && this.lives > 0) {
                    c.reached = true;
                    this.score += 2000;
                    this.endGame(true, '🏰 وصلت للقصر الملكي!');
                }
                return;
            }
        }
        
        // الفوز بالوصول لنهاية العالم
        if (this.player.x >= this.worldWidth - 200) {
            // 🔥 إصلاح: تأكد من تحقيق إنجاز حقيقي
            if (this.coins > 15 && this.timeLeft > 30) {
                this.endGame(true, '🚀 وصلت لنهاية العالم!');
            }
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
    
    // ======================
    // نهاية اللعبة
    // ======================
    
    endGame(isWin, message) {
        console.log(isWin ? '🏆 فوز!' : '💀 خسارة!');
        
        this.state = 'ended';
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            try {
                localStorage.setItem('mario_high_score', this.highScore.toString());
                document.getElementById('high-score').textContent = this.highScore;
            } catch (e) {
                console.warn('⚠️ فشل حفظ أفضل نتيجة:', e);
            }
        }
        
        this.updateEndScreen(isWin, message);
        this.updateAchievements();
        this.showScreen('end');
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
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-coins').textContent = `${this.coins}/${this.totalCoins}`;
        document.getElementById('final-time').textContent = this.formatTime(120 - this.timeLeft);
        document.getElementById('final-kills').textContent = this.kills;
        
        const speed = Math.round((120 - this.timeLeft) / 120 * 100);
        document.getElementById('final-speed').textContent = `${100 - speed}%`;
    },
    
    updateAchievements() {
        const coinAchievement = document.getElementById('achievement-coins');
        if (coinAchievement && this.coins >= this.totalCoins) {
            coinAchievement.classList.add('completed');
            coinAchievement.innerHTML = '<i class="fas fa-check-circle"></i><span>سيد العملات</span>';
        }
        
        const speedAchievement = document.getElementById('achievement-speed');
        if (speedAchievement && this.timeLeft >= 60) {
            speedAchievement.classList.add('completed');
            speedAchievement.innerHTML = '<i class="fas fa-check-circle"></i><span>عداء سريع</span>';
        }
        
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
    // الرسم مع الصورة الشخصية
    // ======================
    
    draw() {
        if (!this.canvas || !this.ctx || !this.player) return;
        
        const ctx = this.ctx;
        
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        ctx.translate(-this.camera.x, 0);
        
        this.drawBackground();
        this.drawPlatforms();
        this.drawCoins();
        this.drawEnemies();
        this.drawCastle();
        this.drawPlayer();
        
        ctx.restore();
        this.drawHUD();
    },
    
    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.worldWidth, canvas.height);
        
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
    },
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            if (platform.type === 'ground') {
                const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
                gradient.addColorStop(0, '#8B4513');
                gradient.addColorStop(0.5, '#734322');
                gradient.addColorStop(1, '#654321');
                ctx.fillStyle = gradient;
            } else {
                const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
                gradient.addColorStop(0, platform.color);
                gradient.addColorStop(1, '#8B4513');
                ctx.fillStyle = gradient;
            }
            
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
    },
    
    drawCoins() {
        const ctx = this.ctx;
        
        this.coinsArr.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.anim + this.frameCount * 0.1) * 12;
                const y = coin.y + bounce;
                
                const gradient = ctx.createRadialGradient(coin.x, y, 0, coin.x, y, coin.radius);
                gradient.addColorStop(0, '#FFF');
                gradient.addColorStop(0.3, '#FFD700');
                gradient.addColorStop(1, '#FFA500');
                ctx.fillStyle = gradient;
                
                ctx.beginPath();
                ctx.arc(coin.x, y, coin.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    },
    
    drawEnemies() {
        const ctx = this.ctx;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            const gradient = ctx.createLinearGradient(enemy.x, enemy.y, enemy.x, enemy.y + enemy.height);
            gradient.addColorStop(0, enemy.color);
            gradient.addColorStop(1, '#C0392B');
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.roundRect(enemy.x, enemy.y, enemy.width, enemy.height, 10);
            ctx.fill();
        });
    },
    
    drawCastle() {
        if (!this.castle) return;
        
        const ctx = this.ctx;
        const c = this.castle;
        
        const gradient = ctx.createLinearGradient(c.x, c.y, c.x, c.y + c.height);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(1, '#654321');
        ctx.fillStyle = gradient;
        ctx.fillRect(c.x, c.y, c.width, c.height);
    },
    
    drawPlayer() {
        if (!this.player) return;
        
        const ctx = this.ctx;
        const p = this.player;
        const canvas = this.canvas;
        
        // لون اللاعب (يتغير إذا كان منيعاً)
        const playerColor = p.invincible && Math.floor(Date.now() / 200) % 2 === 0 ? '#9B59B6' : p.color;
        
        // هل نستخدم الصورة الشخصية؟
        if (this.useCustomImage && this.playerImage && this.playerImage.complete) {
            try {
                // رسم الصورة الشخصية
                ctx.save();
                
                // انعكاس إذا كان اللاعب يواجه اليسار
                if (!p.facingRight) {
                    ctx.scale(-1, 1);
                    ctx.translate(-p.x * 2 - p.width, 0);
                }
                
                // تأثير المناعة (وميض)
                if (p.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
                    ctx.globalAlpha = 0.5;
                }
                
                ctx.drawImage(this.playerImage, p.x, p.y, p.width, p.height);
                
                // تأثير ظل تحت اللاعب عند القفز
                if (!p.grounded) {
                    ctx.globalAlpha = 0.2;
                    ctx.fillStyle = '#000';
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
                
                ctx.restore();
                
            } catch (error) {
                console.warn('⚠️ خطأ في رسم الصورة، استخدام التصميم الافتراضي:', error);
                this.drawDefaultPlayer();
            }
        } else {
            // استخدام التصميم الافتراضي
            this.drawDefaultPlayer();
        }
        
        // تأثير المناعة (حدود ذهبية)
        if (p.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.roundRect(p.x - 2, p.y - 2, p.width + 4, p.height + 4, 12);
            ctx.stroke();
        }
    },
    
    drawDefaultPlayer() {
        const ctx = this.ctx;
        const p = this.player;
        
        const playerColor = p.invincible && Math.floor(Date.now() / 200) % 2 === 0 ? '#9B59B6' : p.color;
        
        // جسم اللاعب
        const gradient = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
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
    },
    
    drawHUD() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
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
            ctx.fillText('🎯 اجمع كل العملات!', canvas.width - 200, 40);
        }
    },
    
    // ======================
    // وظائف مساعدة
    // ======================
    
    togglePause() {
        const pauseBtn = document.getElementById('pause-button');
        
        if (this.state === 'playing') {
            this.state = 'paused';
            if (this.gameTimer) clearInterval(this.gameTimer);
            if (this.animationId) cancelAnimationFrame(this.animationId);
            if (pauseBtn) {
                pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                pauseBtn.title = 'متابعة اللعبة';
            }
            this.showNotification('⏸️ اللعبة متوقفة');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.startTimer();
            this.startGameLoop();
            if (pauseBtn) {
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                pauseBtn.title = 'إيقاف اللعبة';
            }
            this.showNotification('▶️ اللعبة مستمرة');
        }
    },
    
    toggleSound() {
        const btn = document.getElementById('sound-button');
        if (btn) {
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
        }
    },
    
    toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                // دخول وضع ملء الشاشة
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                }
                
                // تحديث الأزرار
                const fullscreenBtn = document.getElementById('fullscreen-button');
                const quickFullscreenBtn = document.getElementById('quick-fullscreen');
                
                if (fullscreenBtn) {
                    fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                    fullscreenBtn.title = 'تصغير الشاشة';
                    fullscreenBtn.classList.add('fullscreen-active');
                }
                
                if (quickFullscreenBtn) {
                    quickFullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                    quickFullscreenBtn.title = 'تصغير الشاشة';
                }
                
                this.showNotification('🖥️ وضع ملء الشاشة مفعل');
                
            } else {
                // الخروج من وضع ملء الشاشة
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                
                // تحديث الأزرار
                const fullscreenBtn = document.getElementById('fullscreen-button');
                const quickFullscreenBtn = document.getElementById('quick-fullscreen');
                
                if (fullscreenBtn) {
                    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                    fullscreenBtn.title = 'ملء الشاشة';
                    fullscreenBtn.classList.remove('fullscreen-active');
                }
                
                if (quickFullscreenBtn) {
                    quickFullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                    quickFullscreenBtn.title = 'ملء الشاشة';
                }
                
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
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
        
        console.log('📢 ' + message);
    },
    
    restartGame() {
        this.backToMenu();
        setTimeout(() => this.startGame(), 300);
    },
    
    shareScore() {
        const shareText = `🎮 حققت ${this.score} نقطة في لعبة ماريو الخارقة!`;
        alert(shareText);
    },
    
    showEmergencyScreen(error) {
        console.error('🚨 حالة طوارئ:', error);
        alert('🚨 خطأ في اللعبة: ' + error.message + '\n\nجاري إعادة التحميل...');
        setTimeout(() => location.reload(), 3000);
    },
    
    // تحديث الصورة الشخصية
    updatePlayerImage(imageSrc) {
        try {
            this.playerImage.src = imageSrc;
            this.useCustomImage = true;
            console.log('✅ تم تحديث صورة اللاعب');
        } catch (e) {
            console.error('❌ خطأ في تحديث صورة اللاعب:', e);
            this.useCustomImage = false;
        }
    }
};

// ============================================
// تهيئة اللعبة
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 الصفحة محملة - جاري تهيئة اللعبة...');
    
    setTimeout(() => {
        try {
            MarioGame.init();
            
            window.startMarioGame = () => MarioGame.startGame();
            window.togglePause = () => MarioGame.togglePause();
            window.restartGame = () => MarioGame.restartGame();
            window.backToMenu = () => MarioGame.backToMenu();
            window.showNotification = (msg) => MarioGame.showNotification(msg);
            window.updatePlayerImage = (src) => MarioGame.updatePlayerImage(src);
            
            console.log('✅ جميع الأنظمة جاهزة للعمل!');
            
        } catch (error) {
            console.error('❌ فشل تهيئة اللعبة:', error);
            setTimeout(() => location.reload(), 3000);
        }
    }, 500);
});

// ============================================
// دالات مساعدة
// ============================================

// تحديث أزرار ملء الشاشة تلقائياً
function updateFullscreenButton() {
    const fullscreenBtn = document.getElementById('fullscreen-button');
    const quickFullscreenBtn = document.getElementById('quick-fullscreen');
    
    const isFullscreen = document.fullscreenElement || 
                         document.webkitFullscreenElement || 
                         document.mozFullScreenElement || 
                         document.msFullscreenElement;
    
    if (fullscreenBtn) {
        if (isFullscreen) {
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            fullscreenBtn.title = 'تصغير الشاشة';
            fullscreenBtn.classList.add('fullscreen-active');
        } else {
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            fullscreenBtn.title = 'ملء الشاشة';
            fullscreenBtn.classList.remove('fullscreen-active');
        }
    }
    
    if (quickFullscreenBtn) {
        if (isFullscreen) {
            quickFullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            quickFullscreenBtn.title = 'تصغير الشاشة';
        } else {
            quickFullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            quickFullscreenBtn.title = 'ملء الشاشة';
        }
    }
}

// استمع لتغييرات وضع ملء الشاشة
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('mozfullscreenchange', updateFullscreenButton);
document.addEventListener('MSFullscreenChange', updateFullscreenButton);

// تحديث عند تحميل الصفحة
window.addEventListener('load', updateFullscreenButton);

console.log('🎮 نظام اللعبة محمل وجاهز للعمل!');
