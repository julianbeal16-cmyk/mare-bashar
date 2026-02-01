// ============================================
// 🎮 محرك لعبة ماريو - النسخة المحسنة
// ============================================

'use strict';

const MarioGame = {
    // ======================
    // الإعدادات الأساسية
    // ======================
    canvas: null,
    ctx: null,
    state: 'menu',
    currentLevel: 1,
    totalLevels: 3,
    
    // الإحصائيات
    score: 0,
    bestScore: 0,
    lives: 3,
    timeLeft: 180,
    coinsCollected: 0,
    totalCoins: 0,
    enemiesKilled: 0,
    
    // المؤقتات
    gameTimer: null,
    animationId: null,
    lastTime: 0,
    deltaTime: 0,
    
    // عناصر اللعبة
    player: null,
    platforms: [],
    coins: [],
    enemies: [],
    castle: null,
    particles: [],
    camera: { x: 0, y: 0 },
    worldWidth: 4000,
    worldHeight: 600,
    
    // التحكم
    keys: {},
    touchControls: {
        left: false,
        right: false,
        jump: false,
        slide: false
    },
    
    // الصوت
    soundEnabled: true,
    sounds: {},
    
    // الصور
    playerImage: null,
    imageLoaded: false,
    imageError: false,
    
    // بيانات المرحلة الحالية
    currentLevelData: null,
    
    // ======================
    // التهيئة الأساسية
    // ======================
    init() {
        console.log('🎮 بدء تهيئة اللعبة...');
        
        try {
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');
            
            if (!this.canvas || !this.ctx) {
                throw new Error('تعذر تحميل Canvas');
            }
            
            this.setupCanvas();
            this.loadPlayerImage();
            this.loadBestScore();
            this.setupControls();
            this.setupAudio();
            
            this.state = 'menu';
            console.log('✅ اللعبة مهيأة بنجاح!');
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showError('خطأ في التهيئة: ' + error.message);
        }
    },
    
    setupCanvas() {
        console.log('📏 ضبط حجم Canvas...');
        this.updateCanvasSize();
        
        // إضافة resize debounced
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateCanvasSize();
            }, 250);
        });
    },
    
    updateCanvasSize() {
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer && this.canvas) {
            const width = gameContainer.clientWidth;
            const height = gameContainer.clientHeight;
            
            this.canvas.width = Math.floor(width);
            this.canvas.height = Math.floor(height);
            
            console.log(`✅ Canvas: ${this.canvas.width}x${this.canvas.height}`);
            
            // رسم خلفية مؤقتة
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },
    
    loadPlayerImage() {
        console.log('🖼️ تحميل صورة اللاعب...');
        this.playerImage = new Image();
        this.imageLoaded = false;
        this.imageError = false;
        
        this.playerImage.onload = () => {
            console.log('✅ تم تحميل صورة اللاعب بنجاح');
            this.imageLoaded = true;
            this.imageError = false;
        };
        
        this.playerImage.onerror = () => {
            console.warn('⚠️ فشل تحميل صورة اللاعب، استخدام البديل');
            this.imageLoaded = false;
            this.imageError = true;
            this.createFallbackImage();
        };
        
        // استخدام مسار نسبي
        this.playerImage.src = 'player.png';
        
        // بديل إذا لم تحمل خلال 2 ثانية
        setTimeout(() => {
            if (!this.imageLoaded && !this.imageError) {
                console.log('⏰ مهلة تحميل الصورة، استخدام البديل');
                this.createFallbackImage();
            }
        }, 2000);
    },
    
    createFallbackImage() {
        console.log('🎨 إنشاء صورة بديلة للاعب...');
        
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        
        // جسم أحمر
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(10, 40, 40, 50);
        
        // رأس
        ctx.fillStyle = '#C0392B';
        ctx.beginPath();
        ctx.arc(30, 25, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // عينان
        ctx.fillStyle = 'white';
        ctx.fillRect(22, 20, 6, 6);
        ctx.fillRect(36, 20, 6, 6);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(24, 22, 2, 2);
        ctx.fillRect(38, 22, 2, 2);
        
        // قبعة زرقاء
        ctx.fillStyle = '#2980B9';
        ctx.fillRect(18, 5, 24, 12);
        ctx.fillRect(23, 0, 14, 12);
        
        // حذاءان
        ctx.fillStyle = '#34495E';
        ctx.fillRect(12, 85, 16, 5);
        ctx.fillRect(32, 85, 16, 5);
        
        this.playerImage = canvas;
        this.imageLoaded = true;
        console.log('✅ صورة بديلة جاهزة');
    },
    
    loadBestScore() {
        try {
            const saved = localStorage.getItem('mario_best_score');
            this.bestScore = saved ? parseInt(saved) : 0;
            const bestScoreElement = document.getElementById('best-score');
            if (bestScoreElement) {
                bestScoreElement.textContent = this.bestScore;
            }
        } catch (e) {
            console.warn('⚠️ لا يمكن تحميل أفضل نتيجة');
        }
    },
    
    setupControls() {
        // تحكم لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            // منع السلوك الافتراضي لأزرار التحكم
            if ([' ', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key)) {
                e.preventDefault();
            }
            
            this.keys[key] = true;
            
            // اختصارات لوحة المفاتيح
            if (key === 'p' || key === 'ف') this.togglePause();
            if (key === 'm' || key === 'م') this.toggleSound();
            if (key === 'escape' && (this.state === 'playing' || this.state === 'paused')) {
                this.showScreen('start');
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // تحكم لمس محسّن
        this.setupTouchControls();
        
        console.log('🎮 نظام التحكم جاهز');
    },
    
    setupTouchControls() {
        const setupButton = (id, control) => {
            const btn = document.getElementById(id);
            if (!btn) {
                console.warn(`⚠️ زر ${id} غير موجود`);
                return;
            }
            
            const activate = (e) => {
                this.touchControls[control] = true;
                e.preventDefault();
                btn.classList.add('active');
                
                // اهتزاز خفيف على الجوال
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
            };
            
            const deactivate = (e) => {
                this.touchControls[control] = false;
                e.preventDefault();
                btn.classList.remove('active');
            };
            
            // Pointer Events (تدعم اللمس والفأرة)
            btn.addEventListener('pointerdown', activate);
            btn.addEventListener('pointerup', deactivate);
            btn.addEventListener('pointerleave', deactivate);
            btn.addEventListener('pointercancel', deactivate);
            
            // Touch Events كبديل
            btn.addEventListener('touchstart', activate, { passive: false });
            btn.addEventListener('touchend', deactivate, { passive: false });
            btn.addEventListener('touchcancel', deactivate, { passive: false });
            
            // Mouse Events للكمبيوتر
            btn.addEventListener('mousedown', activate);
            btn.addEventListener('mouseup', deactivate);
            btn.addEventListener('mouseleave', deactivate);
        };
        
        setupButton('btn-left', 'left');
        setupButton('btn-right', 'right');
        setupButton('btn-jump', 'jump');
        setupButton('btn-slide', 'slide');
    },
    
    setupAudio() {
        // إنشاء عناصر صوتية ديناميكية
        this.sounds = {
            jump: this.createAudio('https://assets.mixkit.co/sfx/preview/mixkit-player-jumping-in-a-video-game-2043.mp3'),
            coin: this.createAudio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
            hit: this.createAudio('https://assets.mixkit.co/sfx/preview/mixkit-retro-game-emergency-alarm-1000.mp3')
        };
        
        console.log('🔊 نظام الصوت جاهز');
    },
    
    createAudio(src) {
        const audio = new Audio();
        audio.src = src;
        audio.volume = 0.5;
        audio.preload = 'auto';
        return audio;
    },
    
    // ======================
    // إدارة المراحل
    // ======================
    loadLevel(levelNumber) {
        console.log(`🗺️ تحميل المرحلة ${levelNumber}...`);
        
        // التحقق من وجود مدير المراحل
        if (!window.LevelManager) {
            console.error('❌ مدير المراحل غير محمل');
            this.showNotification('⚠️ خطأ في تحميل المراحل');
            return;
        }
        
        // تحميل بيانات المرحلة
        const levelData = LevelManager.loadLevel(levelNumber);
        if (!levelData) {
            console.error(`❌ المرحلة ${levelNumber} غير موجودة`);
            this.showNotification('⚠️ المرحلة غير موجودة');
            return;
        }
        
        this.currentLevelData = levelData;
        this.currentLevel = levelNumber;
        
        // إعادة تعيين اللعبة
        this.resetGame();
        
        // تحديث واجهة المستخدم
        this.updateUI();
        
        // إنشاء عناصر المرحلة
        this.createLevelFromData(levelData);
        
        // عرض شاشة اللعب
        this.showScreen('game');
        
        // بدء المؤقتات
        this.startTimer();
        this.startGameLoop();
        
        // إشعار البدء
        this.showNotification(`🚀 ${levelData.name} - ${levelData.description}`);
        
        console.log(`✅ المرحلة ${levelNumber} محملة بنجاح`);
    },
    
    createLevelFromData(levelData) {
        console.log(`🌍 إنشاء المرحلة من البيانات...`);
        
        const canvas = this.canvas;
        const groundY = canvas ? canvas.height - 100 : 500;
        
        // إعدادات العالم
        this.worldWidth = levelData.castle.x + 500;
        this.worldHeight = groundY + 200;
        this.totalCoins = levelData.totalCoins || 50;
        this.timeLeft = levelData.timeLimit || 180;
        
        // اللاعب
        const startX = levelData.playerStart?.x || 150;
        const startY = levelData.playerStart?.y || groundY - 150;
        
        this.player = {
            x: startX,
            y: startY,
            width: 50,
            height: 80,
            speed: 6,
            velX: 0,
            velY: 0,
            jumpPower: -15,
            gravity: 0.8,
            grounded: false,
            facingRight: true,
            color: '#E74C3C',
            isSliding: false,
            slideTimer: 0,
            invincible: false,
            invincibleTimer: 0
        };
        
        // الأرض الأساسية
        this.platforms = [
            {
                x: 0,
                y: groundY,
                width: this.worldWidth,
                height: 100,
                type: 'ground',
                color: levelData.platforms?.[0]?.color || '#8B4513'
            }
        ];
        
        // إضافة المنصات
        if (levelData.platforms && Array.isArray(levelData.platforms)) {
            levelData.platforms.forEach(p => {
                if (p && p.x !== undefined && p.y !== undefined) {
                    this.platforms.push({
                        x: p.x,
                        y: p.y,
                        width: p.width || 100,
                        height: p.height || 25,
                        type: p.type || 'platform',
                        color: p.color || '#A0522D'
                    });
                }
            });
        }
        
        // العملات
        this.coins = [];
        if (levelData.coins && Array.isArray(levelData.coins)) {
            levelData.coins.forEach(c => {
                if (c && c.x !== undefined && c.y !== undefined) {
                    this.coins.push({
                        x: c.x,
                        y: c.y,
                        collected: false,
                        radius: 12,
                        animation: Math.random() * Math.PI * 2,
                        value: 100
                    });
                }
            });
        }
        
        // الأعداء
        this.enemies = [];
        if (levelData.enemies && Array.isArray(levelData.enemies)) {
            levelData.enemies.forEach(e => {
                if (e && e.x !== undefined && e.y !== undefined) {
                    this.enemies.push({
                        x: e.x,
                        y: e.y,
                        width: e.width || 45,
                        height: e.height || 45,
                        speed: e.speed || 2,
                        direction: e.direction || (Math.random() > 0.5 ? 1 : -1),
                        color: e.color || '#EF476F',
                        type: e.type || 'normal',
                        active: true,
                        originalX: e.x,
                        moveRange: e.moveRange || 100
                    });
                }
            });
        }
        
        // القصر
        if (levelData.castle) {
            this.castle = {
                x: levelData.castle.x,
                y: levelData.castle.y,
                width: levelData.castle.width || 280,
                height: levelData.castle.height || 200,
                color: levelData.castle.color || '#8B4513',
                reached: false
            };
        } else {
            this.castle = {
                x: this.worldWidth - 400,
                y: groundY - 250,
                width: 280,
                height: 200,
                color: '#8B4513',
                reached: false
            };
        }
        
        console.log(`✅ المرحلة مخلوقة:
        - ${this.platforms.length} منصة
        - ${this.coins.length} عملة
        - ${this.enemies.length} عدو
        - العالم: ${this.worldWidth}px
        - العملات المطلوبة: ${this.totalCoins}
        `);
    },
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.coinsCollected = 0;
        this.enemiesKilled = 0;
        this.camera = { x: 0, y: 0 };
        this.particles = [];
        this.keys = {};
        this.touchControls = {
            left: false,
            right: false,
            jump: false,
            slide: false
        };
        
        // تحديث واجهة المستخدم
        this.updateUI();
        
        console.log('🔄 اللعبة معادة التعيين');
    },
    
    // ======================
    // حلقة اللعبة الرئيسية
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
        
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.deltaTime = Math.min(this.deltaTime, 0.1);
        this.lastTime = currentTime;
        
        this.update(this.deltaTime);
        this.draw();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    },
    
    update(deltaTime) {
        if (!this.player) return;
        
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateParticles(deltaTime);
        this.updateCamera();
        this.checkCollisions();
        this.checkGameEnd();
    },
    
    updatePlayer(deltaTime) {
        const player = this.player;
        
        // إعادة تعيين السرعة الأفقية
        player.velX = 0;
        
        // التحكم في الحركة
        if (this.keys['arrowleft'] || this.keys['a'] || this.touchControls.left) {
            player.velX = -player.speed;
            player.facingRight = false;
        }
        
        if (this.keys['arrowright'] || this.keys['d'] || this.touchControls.right) {
            player.velX = player.speed;
            player.facingRight = true;
        }
        
        // التزحلق
        if (this.touchControls.slide || this.keys['arrowdown'] || this.keys['s']) {
            if (player.grounded && !player.isSliding) {
                player.isSliding = true;
                player.slideTimer = 0.5;
                player.height = 40;
                player.y += 40;
            }
        }
        
        // إدارة التزحلق
        if (player.isSliding) {
            player.slideTimer -= deltaTime;
            if (player.slideTimer <= 0) {
                player.isSliding = false;
                player.height = 80;
                player.y -= 40;
            }
        }
        
        // القفز
        const jumpPressed = this.keys[' '] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump;
        if (jumpPressed && player.grounded && !player.isSliding) {
            player.velY = player.jumpPower;
            player.grounded = false;
            this.playSound('jump');
        }
        
        // الجاذبية
        player.velY += player.gravity;
        player.velY = Math.min(player.velY, 20);
        
        // تحديث الموضع
        player.x += player.velX * (deltaTime * 60);
        player.y += player.velY * (deltaTime * 60);
        
        // حدود العالم
        player.x = Math.max(0, Math.min(this.worldWidth - player.width, player.x));
        
        // كشف التصادم مع المنصات
        player.grounded = false;
        for (const platform of this.platforms) {
            if (this.checkCollision(player, platform)) {
                // تصادم من الأعلى
                if (player.velY > 0 && 
                    player.y + player.height > platform.y &&
                    player.y + player.height < platform.y + platform.height + 5) {
                    
                    player.y = platform.y - player.height;
                    player.velY = 0;
                    player.grounded = true;
                    break;
                }
                // تصادم من الأسفل
                else if (player.velY < 0 &&
                         player.y < platform.y + platform.height &&
                         player.y > platform.y) {
                    
                    player.y = platform.y + platform.height;
                    player.velY = 0;
                }
                // تصادم جانبي
                else if (player.velX !== 0) {
                    if (player.x + player.width > platform.x &&
                        player.x < platform.x + platform.width) {
                        
                        if (player.velX > 0) {
                            player.x = platform.x - player.width;
                        } else {
                            player.x = platform.x + platform.width;
                        }
                        player.velX = 0;
                    }
                }
            }
        }
        
        // السقوط في الهاوية
        if (player.y > this.canvas.height + 300) {
            this.playerHit('💀 سقوط في الهاوية!');
            player.x = Math.max(100, this.camera.x + 100);
            player.y = 100;
            player.velY = 0;
        }
        
        // تحديث حالة المناعة
        if (player.invincible) {
            player.invincibleTimer -= deltaTime;
            if (player.invincibleTimer <= 0) {
                player.invincible = false;
            }
        }
    },
    
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // حركة الأعداء
            enemy.x += enemy.speed * enemy.direction * deltaTime * 60;
            
            // تغيير الاتجاه عند حدود الحركة
            if (Math.abs(enemy.x - enemy.originalX) > enemy.moveRange) {
                enemy.direction *= -1;
            }
            
            // حدود العالم
            if (enemy.x < 50) {
                enemy.x = 50;
                enemy.direction = 1;
            }
            if (enemy.x > this.worldWidth - enemy.width - 50) {
                enemy.x = this.worldWidth - enemy.width - 50;
                enemy.direction = -1;
            }
        });
    },
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx * deltaTime * 60;
            p.y += p.vy * deltaTime * 60;
            p.vy += 0.2;
            p.life -= deltaTime;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    updateCamera() {
        if (!this.player) return;
        
        // تتبع الكاميرا مع سلاسة
        const targetX = this.player.x - this.canvas.width / 3;
        this.camera.x += (targetX - this.camera.x) * 0.08;
        
        // حدود الكاميرا
        this.camera.x = Math.max(0, this.camera.x);
        this.camera.x = Math.min(this.worldWidth - this.canvas.width, this.camera.x);
    },
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    checkCollisions() {
        if (!this.player || this.player.invincible) return;
        
        const player = this.player;
        
        // العملات
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const dx = (player.x + player.width/2) - coin.x;
                const dy = (player.y + player.height/2) - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30) {
                    coin.collected = true;
                    this.coinsCollected++;
                    this.score += coin.value || 100;
                    this.updateUI();
                    this.playSound('coin');
                    this.createParticles(coin.x, coin.y, 8, '#FFD700');
                    
                    // إشعار العملات الكبيرة
                    if (this.coinsCollected % 10 === 0) {
                        this.showNotification(`💰 مجموعة ${this.coinsCollected} عملة!`);
                    }
                }
            }
        });
        
        // الأعداء
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            if (this.checkCollision(player, enemy)) {
                // التحقق إذا كان اللاعب يقفز على العدو
                if (player.velY > 0 && 
                    player.y + player.height - 10 < enemy.y + enemy.height/2) {
                    
                    // هزيمة العدو
                    enemy.active = false;
                    this.score += 200;
                    this.enemiesKilled++;
                    player.velY = -12;
                    this.updateUI();
                    this.playSound('hit');
                    this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 12, enemy.color);
                    this.showNotification('👊 +200 نقطة! عدو هزم!');
                } else {
                    // اللاعب تضرر
                    this.playerHit('👾 اصطدمت بعدو!');
                }
            }
        });
        
        // القصر
        if (this.castle && !this.castle.reached && this.coinsCollected >= this.totalCoins) {
            if (this.checkCollision(player, this.castle)) {
                this.castle.reached = true;
                this.endLevel(true);
            }
        }
    },
    
    playerHit(message) {
        if (this.player.invincible) return;
        
        this.lives--;
        this.updateUI();
        this.playSound('hit');
        this.createParticles(
            this.player.x + this.player.width/2, 
            this.player.y + this.player.height/2, 
            10, '#E74C3C'
        );
        this.showNotification(`${message} ❤️ ${this.lives}`);
        
        // مناعة بعد الضرر
        this.player.invincible = true;
        this.player.invincibleTimer = 2;
        
        if (this.lives <= 0) {
            this.endGame(false, '💔 نفدت الأرواح! حاول مرة أخرى');
        } else {
            // ارتداد بعد الضرر
            this.player.velY = -8;
            this.player.x -= 50 * (this.player.facingRight ? 1 : -1);
        }
    },
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6 - 3,
                life: 0.7 + Math.random() * 0.3,
                color: color,
                size: 2 + Math.random() * 4
            });
        }
    },
    
    checkGameEnd() {
        if (this.timeLeft <= 0) {
            this.endGame(false, '⏰ انتهى الوقت!');
        }
    },
    
    endLevel(isWin) {
        this.state = 'levelComplete';
        this.stopTimer();
        
        // حساب المكافآت
        const timeBonus = this.timeLeft * 10;
        const coinBonus = this.coinsCollected * 50;
        const enemyBonus = this.enemiesKilled * 100;
        const totalBonus = timeBonus + coinBonus + enemyBonus;
        
        this.score += totalBonus;
        
        // إشعارات النجاح
        this.showNotification(`🎉 أكملت المرحلة ${this.currentLevel}!`);
        this.showNotification(`💰 المكافأة: ${totalBonus} نقطة`);
        
        // حفظ التقدم
        this.saveProgress(isWin);
        
        // الانتقال للشاشة التالية
        setTimeout(() => {
            this.updateEndScreen(isWin, '🏁 انتهت المرحلة بنجاح!');
            this.showScreen('end');
        }, 2000);
    },
    
    saveProgress(isWin) {
        try {
            // حفظ أفضل نتيجة عامة
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('mario_best_score', this.bestScore.toString());
                const bestScoreElement = document.getElementById('best-score');
                if (bestScoreElement) {
                    bestScoreElement.textContent = this.bestScore;
                }
            }
            
            // حفظ آخر مرحلة لعب
            if (isWin && this.currentLevel < this.totalLevels) {
                const nextLevel = this.currentLevel + 1;
                localStorage.setItem('mario_last_level', nextLevel.toString());
            } else {
                localStorage.setItem('mario_last_level', this.currentLevel.toString());
            }
            
            // حفظ نتيجة المرحلة
            if (window.LevelManager) {
                LevelManager.saveLevelScore(this.currentLevel, this.score);
            }
            
            console.log(`💾 تم حفظ تقدم المرحلة ${this.currentLevel}`);
            
        } catch (e) {
            console.warn('⚠️ لا يمكن حفظ التقدم:', e);
        }
    },
    
    endGame(isWin, message) {
        this.state = 'gameOver';
        this.stopTimer();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.updateEndScreen(isWin, message);
        this.showScreen('end');
    },
    
    updateEndScreen(isWin, message) {
        const icon = document.getElementById('result-icon');
        const title = document.getElementById('end-title');
        const msg = document.getElementById('end-message');
        
        if (icon) {
            icon.innerHTML = isWin ? 
                '<i class="fas fa-trophy"></i>' : 
                '<i class="fas fa-skull-crossbones"></i>';
        }
        
        if (title) title.textContent = isWin ? '🎉 انتصار رائع!' : '💔 انتهت اللعبة';
        if (msg) msg.textContent = message;
        
        // تحديث الإحصائيات
        const elements = {
            'final-score': this.score,
            'final-coins': `${this.coinsCollected}/${this.totalCoins}`,
            'final-time': this.formatTime(this.timeLeft),
            'final-enemies': this.enemiesKilled,
            'final-level': this.currentLevel
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    },
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },
    
    // ======================
    // الرسم
    // ======================
    draw() {
        if (!this.canvas || !this.ctx) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // مسح الشاشة
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // حفظ حالة الـ context
        ctx.save();
        
        // تطبيق تحريك الكاميرا
        ctx.translate(-this.camera.x, 0);
        
        // رسم الخلفية
        this.drawBackground();
        
        // رسم عناصر اللعبة
        this.drawPlatforms();
        this.drawCoins();
        this.drawEnemies();
        this.drawParticles();
        this.drawCastle();
        this.drawPlayer();
        
        // استعادة حالة الـ context
        ctx.restore();
        
        // واجهة المستخدم الثابتة
        this.drawHUD();
    },
    
    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const time = Date.now() / 1000;
        
        // خلفية متدرجة
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        
        // استخدام ألوان المرحلة إذا موجودة
        if (this.currentLevelData && this.currentLevelData.background) {
            gradient.addColorStop(0, this.currentLevelData.background.colors[0]);
            gradient.addColorStop(1, this.currentLevelData.background.colors[1]);
        } else {
            // خلفية افتراضية
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#3498DB');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.worldWidth, canvas.height);
        
        // غيوم متحركة
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 15; i++) {
            const x = (this.camera.x * 0.05 + i * 300 + time * 20) % (this.worldWidth + 500);
            const y = 40 + Math.sin(i + time) * 20;
            const size = 15 + Math.sin(i * 0.8) * 8;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.arc(x + size * 1.3, y - size * 0.3, size * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            const gradient = ctx.createLinearGradient(
                platform.x, platform.y,
                platform.x, platform.y + platform.height
            );
            
            if (platform.type === 'ground') {
                gradient.addColorStop(0, platform.color);
                gradient.addColorStop(0.3, this.darkenColor(platform.color, 20));
                gradient.addColorStop(1, this.darkenColor(platform.color, 40));
            } else {
                gradient.addColorStop(0, platform.color);
                gradient.addColorStop(1, this.darkenColor(platform.color, 30));
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل المنصة
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let i = 0; i < platform.width; i += 32) {
                ctx.fillRect(platform.x + i, platform.y, 28, 5);
            }
            
            // حدود المنصة
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        });
    },
    
    drawCoins() {
        const ctx = this.ctx;
        const time = Date.now() / 1000;
        
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.animation += 0.1;
                const floatY = Math.sin(coin.animation + time) * 6;
                
                // عملة ذهبية لامعة
                const gradient = ctx.createRadialGradient(
                    coin.x, coin.y + floatY, 0,
                    coin.x, coin.y + floatY, coin.radius
                );
                gradient.addColorStop(0, '#FFF');
                gradient.addColorStop(0.3, '#FFD700');
                gradient.addColorStop(0.6, '#FFA500');
                gradient.addColorStop(1, '#FF8C00');
                ctx.fillStyle = gradient;
                
                ctx.beginPath();
                ctx.arc(coin.x, coin.y + floatY, coin.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // لمعان
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(coin.x - 3, coin.y + floatY - 3, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // حد ذهبي
                ctx.strokeStyle = '#FF8C00';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(coin.x, coin.y + floatY, coin.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
    },
    
    drawEnemies() {
        const ctx = this.ctx;
        const time = Date.now() / 1000;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            const bounce = Math.sin(time * 3 + enemy.x * 0.01) * 2;
            
            // جسم العدو
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y + bounce, enemy.width, enemy.height);
            
            // عيون
            ctx.fillStyle = 'black';
            ctx.fillRect(enemy.x + 10, enemy.y + 10 + bounce, 8, 8);
            ctx.fillRect(enemy.x + enemy.width - 18, enemy.y + 10 + bounce, 8, 8);
            
            // لمعان العيون
            ctx.fillStyle = 'white';
            ctx.fillRect(enemy.x + 12, enemy.y + 12 + bounce, 4, 4);
            ctx.fillRect(enemy.x + enemy.width - 16, enemy.y + 12 + bounce, 4, 4);
            
            // فم
            ctx.fillStyle = 'black';
            ctx.fillRect(enemy.x + 15, enemy.y + 25 + bounce, enemy.width - 30, 6);
            
            // حد الجسم
            ctx.strokeStyle = this.darkenColor(enemy.color, 30);
            ctx.lineWidth = 2;
            ctx.strokeRect(enemy.x, enemy.y + bounce, enemy.width, enemy.height);
        });
    },
    
    drawParticles() {
        const ctx = this.ctx;
        
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    },
    
    drawCastle() {
        if (!this.castle) return;
        
        const ctx = this.ctx;
        const castle = this.castle;
        
        // قاعدة القصر
        const gradient = ctx.createLinearGradient(
            castle.x, castle.y,
            castle.x, castle.y + castle.height
        );
        gradient.addColorStop(0, castle.color);
        gradient.addColorStop(1, this.darkenColor(castle.color, 40));
        ctx.fillStyle = gradient;
        ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        // نوافذ
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.fillRect(
                    castle.x + 30 + i * 70, 
                    castle.y + 20 + j * 60, 
                    20, 
                    30
                );
            }
        }
        
        // باب
        ctx.fillStyle = this.darkenColor(castle.color, 60);
        ctx.fillRect(
            castle.x + castle.width/2 - 25, 
            castle.y + castle.height - 50, 
            50, 
            50
        );
        
        // تفاصيل الباب
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(
            castle.x + castle.width/2, 
            castle.y + castle.height - 25, 
            5, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        
        // حدود القصر
        ctx.strokeStyle = this.darkenColor(castle.color, 50);
        ctx.lineWidth = 3;
        ctx.strokeRect(castle.x, castle.y, castle.width, castle.height);
        
        // إذا تم الوصول للقصر
        if (castle.reached) {
            ctx.fillStyle = 'rgba(46, 204, 113, 0.5)';
            ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        }
    },
    
    drawPlayer() {
        if (!this.player) return;
        
        const ctx = this.ctx;
        const player = this.player;
        
        ctx.save();
        
        // تأثير المناعة (وميض)
        if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        if (this.imageLoaded && this.playerImage && !this.imageError) {
            try {
                let drawX = player.x;
                let drawY = player.y;
                
                // قلب الصورة إذا كان متجهًا لليسار
                if (!player.facingRight) {
                    ctx.scale(-1, 1);
                    drawX = -drawX - player.width;
                }
                
                // رسم الصورة
                ctx.drawImage(
                    this.playerImage,
                    drawX,
                    drawY,
                    player.width,
                    player.height
                );
            } catch (error) {
                this.drawFallbackPlayer();
            }
        } else {
            this.drawFallbackPlayer();
        }
        
        ctx.restore();
    },
    
    drawFallbackPlayer() {
        const ctx = this.ctx;
        const player = this.player;
        
        // جسم اللاعب
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // رأس
        ctx.fillStyle = this.darkenColor(player.color, 20);
        ctx.beginPath();
        ctx.arc(
            player.x + player.width/2, 
            player.y - 10, 
            15, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        
        // عيون (تتجه حسب الاتجاه)
        const eyeOffset = player.facingRight ? 0 : 5;
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x + 15 + eyeOffset, player.y - 5, 6, 6);
        ctx.fillRect(player.x + 29 + eyeOffset, player.y - 5, 6, 6);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(player.x + 17 + eyeOffset, player.y - 3, 2, 2);
        ctx.fillRect(player.x + 31 + eyeOffset, player.y - 3, 2, 2);
        
        // قبعة
        ctx.fillStyle = '#2980B9';
        ctx.fillRect(player.x + 10, player.y - 25, 30, 10);
        ctx.fillRect(player.x + 15, player.y - 30, 20, 10);
        
        // حدود
        ctx.strokeStyle = this.darkenColor(player.color, 30);
        ctx.lineWidth = 2;
        ctx.strokeRect(player.x, player.y, player.width, player.height);
    },
    
    drawHUD() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // خلفية HUD
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(10, 10, canvas.width - 20, 50);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, canvas.width - 20, 50);
        
        // النقاط
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Cairo';
        ctx.textAlign = 'right';
        ctx.fillText(`🏆 ${this.score}`, canvas.width - 20, 40);
        
        // الأرواح
        ctx.fillStyle = '#E74C3C';
        ctx.textAlign = 'center';
        ctx.fillText(`❤️ ${this.lives}`, canvas.width / 2, 40);
        
        // العملات
        ctx.fillStyle = '#4ECDC4';
        ctx.textAlign = 'left';
        ctx.fillText(`💰 ${this.coinsCollected}/${this.totalCoins}`, 20, 40);
        
        // شريط تقدم العملات
        const progressWidth = 200;
        const progress = (this.coinsCollected / this.totalCoins) * progressWidth;
        const progressX = canvas.width / 2 - progressWidth / 2;
        const progressY = 55;
        
        // خلفية الشريط
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(progressX, progressY, progressWidth, 8);
        
        // شريط التقدم
        const gradient = ctx.createLinearGradient(progressX, 0, progressX + progressWidth, 0);
        gradient.addColorStop(0, '#4ECDC4');
        gradient.addColorStop(1, '#2ECC71');
        ctx.fillStyle = gradient;
        ctx.fillRect(progressX, progressY, progress, 8);
        
        // حدود الشريط
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(progressX, progressY, progressWidth, 8);
    },
    
    darkenColor(color, percent) {
        // تحويل اللون Hex إلى RGB
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        
        // تظليل اللون
        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);
        
        // تحويل RGB إلى Hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },
    
    // ======================
    // إدارة المؤقت
    // ======================
    startTimer() {
        this.stopTimer();
        
        this.gameTimer = setInterval(() => {
            if (this.state === 'playing') {
                this.timeLeft--;
                this.updateUI();
                
                if (this.timeLeft <= 0) {
                    this.endGame(false, '⏰ انتهى الوقت!');
                }
                
                // تحذير الوقت المنخفض
                if (this.timeLeft === 30) {
                    this.showNotification('⏳ الوقت قليل! أسرع!');
                }
            }
        }, 1000);
    },
    
    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    },
    
    // ======================
    // تحديث الواجهة
    // ======================
    updateUI() {
        // الوقت
        const timeString = this.formatTime(this.timeLeft);
        const timerElement = document.getElementById('hud-timer');
        if (timerElement) timerElement.textContent = timeString;
        
        // تحديث الوقت بلون تحذيري إذا كان قليلاً
        if (timerElement && this.timeLeft <= 30) {
            timerElement.style.color = '#E74C3C';
            timerElement.style.animation = 'pulse 1s infinite';
        } else if (timerElement) {
            timerElement.style.color = '';
            timerElement.style.animation = '';
        }
        
        // العناصر الأخرى
        const elements = {
            'hud-score': this.score,
            'hud-lives': this.lives,
            'hud-coins': `${this.coinsCollected}/${this.totalCoins}`,
            'hud-level': this.currentLevel
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    },
    
    // ======================
    // وظائف مساعدة
    // ======================
    showScreen(screenId) {
        // إخفاء جميع الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });
        
        // إظهار الشاشة المطلوبة
        const screen = document.getElementById(screenId + '-screen');
        if (screen) {
            screen.classList.add('active');
            screen.style.display = screenId === 'game' ? 'block' : 'flex';
            
            // تحديث حالة اللعبة
            if (screenId === 'game') {
                this.state = 'playing';
                this.updateCanvasSize();
            } else if (screenId === 'start') {
                this.state = 'menu';
                // تحديث قائمة المراحل
                if (window.App && typeof App.updateLevelsList === 'function') {
                    App.updateLevelsList();
                }
            }
        }
    },
    
    startGame() {
        this.loadLevel(1);
    },
    
    playSound(soundName) {
        if (!this.soundEnabled || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName];
            
            // إعادة التعيين إذا كان الصوت يعمل بالفعل
            if (!sound.paused) {
                sound.pause();
                sound.currentTime = 0;
            }
            
            // تشغيل الصوت
            sound.play().catch(error => {
                console.warn('⚠️ لا يمكن تشغيل الصوت:', error);
            });
        } catch (e) {
            console.warn('⚠️ خطأ في تشغيل الصوت:', e);
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
            }, 3000);
        }
    },
    
    showError(message) {
        console.error('❌ خطأ في اللعبة:', message);
    },
    
    togglePause() {
        const btn = document.getElementById('pause-btn');
        if (!btn) return;
        
        const icon = btn.querySelector('i');
        
        if (this.state === 'playing') {
            this.state = 'paused';
            this.stopTimer();
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            if (icon) icon.className = 'fas fa-play';
            this.showNotification('⏸️ اللعبة متوقفة');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.startTimer();
            this.startGameLoop();
            if (icon) icon.className = 'fas fa-pause';
            this.showNotification('▶️ اللعبة مستمرة');
        }
    },
    
    toggleSound() {
        const btn = document.getElementById('sound-btn');
        if (!btn) return;
        
        const icon = btn.querySelector('i');
        this.soundEnabled = !this.soundEnabled;
        
        if (this.soundEnabled) {
            if (icon) icon.className = 'fas fa-volume-up';
            this.showNotification('🔊 الصوت مفعل');
        } else {
            if (icon) icon.className = 'fas fa-volume-mute';
            this.showNotification('🔇 الصوت متوقف');
        }
    },
    
    restartGame() {
        if (this.currentLevel) {
            this.loadLevel(this.currentLevel);
        } else {
            this.startGame();
        }
    },
    
    nextLevel() {
        if (this.currentLevel < this.totalLevels) {
            this.currentLevel++;
            this.loadLevel(this.currentLevel);
        } else {
            this.endGame(true, '🏆 أكملت جميع المراحل! أنت بطل!');
        }
    }
};

// ============================================
// تهيئة اللعبة
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 بدء تحميل اللعبة...');
    
    // تأخير لضمان تحميل جميع المكونات
    setTimeout(() => {
        try {
            // تهيئة اللعبة
            MarioGame.init();
            
            // جعل اللعبة متاحة عالمياً
            window.MarioGame = MarioGame;
            
            console.log('✅ اللعبة جاهزة تماماً!');
            
            // إخفاء شاشة التحميل
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
            
        } catch (error) {
            console.error('❌ خطأ في تحميل اللعبة:', error);
        }
    }, 1000);
});

// جعل MarioGame متاحة عالمياً
window.MarioGame = MarioGame;
console.log('✅ ملف game-engine.js محمل بنجاح!');
