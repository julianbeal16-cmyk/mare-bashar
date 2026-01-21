// ============================================
// 🎮 محرك لعبة ماريو الخارقة - النسخة النهائية 100% مرئية
// ============================================

'use strict';

// الكائن الرئيسي للعبة
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
    totalCoins: 20,
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
    worldWidth: 2500,
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
    
    // الصورة
    playerImage: null,
    imageLoaded: false,
    
    // ======================
    // التهيئة الأساسية
    // ======================
    init() {
        console.log('🎮 بدء تهيئة اللعبة...');
        
        try {
            // الحصول على Canvas
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');
            
            if (!this.canvas || !this.ctx) {
                throw new Error('تعذر تحميل Canvas');
            }
            
            // ضبط حجم Canvas مباشرة
            this.setupCanvas();
            
            // تحميل الصورة
            this.loadPlayerImage();
            
            // تحميل أفضل نتيجة
            this.loadBestScore();
            
            // إعداد التحكم
            this.setupControls();
            
            // إعداد الصوت
            this.setupAudio();
            
            // اللعبة جاهزة
            this.state = 'menu';
            console.log('✅ اللعبة مهيأة بنجاح!');
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showError('خطأ في التهيئة: ' + error.message);
        }
    },
    
    setupCanvas() {
        console.log('📏 ضبط حجم Canvas...');
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer && this.canvas) {
            const width = gameContainer.clientWidth;
            const height = gameContainer.clientHeight;
            
            this.canvas.width = width;
            this.canvas.height = height;
            this.worldHeight = height;
            
            console.log(`✅ Canvas: ${width}x${height}`);
            
            // رسم رسالة اختبار
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, width, height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('🎮 Canvas جاهز!', 10, 30);
        }
        
        // عند تغيير الحجم
        window.addEventListener('resize', () => {
            if (this.canvas) {
                const gameContainer = document.querySelector('.game-container');
                if (gameContainer) {
                    this.canvas.width = gameContainer.clientWidth;
                    this.canvas.height = gameContainer.clientHeight;
                    console.log(`🔄 Canvas جديد: ${this.canvas.width}x${this.canvas.height}`);
                }
            }
        });
    },
    
    loadPlayerImage() {
        console.log('🖼️ تحميل صورة اللاعب...');
        this.playerImage = new Image();
        
        this.playerImage.onload = () => {
            console.log('✅ تم تحميل صورة اللاعب بنجاح');
            this.imageLoaded = true;
        };
        
        this.playerImage.onerror = () => {
            console.warn('⚠️ فشل تحميل صورة اللاعب، إنشاء صورة بديلة');
            this.createFallbackImage();
        };
        
        // حاول تحميل الصورة
        this.playerImage.src = 'player.png';
        
        // انتظر 2 ثانية ثم تحقق
        setTimeout(() => {
            if (!this.imageLoaded) {
                console.log('⏱️ إنشاء صورة بديلة...');
                this.createFallbackImage();
            }
        }, 2000);
    },
    
    createFallbackImage() {
        console.log('🎨 إنشاء صورة بديلة...');
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        
        // جسم أحمر
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(5, 30, 40, 50);
        
        // رأس
        ctx.fillStyle = '#C0392B';
        ctx.beginPath();
        ctx.arc(25, 20, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // عينان
        ctx.fillStyle = 'white';
        ctx.fillRect(18, 15, 6, 6);
        ctx.fillRect(32, 15, 6, 6);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(20, 17, 2, 2);
        ctx.fillRect(34, 17, 2, 2);
        
        // قبعة زرقاء
        ctx.fillStyle = '#2980B9';
        ctx.fillRect(15, 5, 20, 10);
        ctx.fillRect(20, 0, 10, 10);
        
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
        // لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            // منع السلوك الافتراضي
            if ([' ', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }
            
            this.keys[key] = true;
            
            // مفتاح P للإيقاف
            if (key === 'p') {
                this.togglePause();
            }
            
            // مفتاح ESC للعودة
            if (key === 'escape') {
                if (this.state === 'playing' || this.state === 'paused') {
                    this.showScreen('start');
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // التحكم باللمس
        this.setupTouchControls();
    },
    
    setupTouchControls() {
        const setupButton = (id, control) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    this.touchControls[control] = true;
                    e.preventDefault();
                    btn.classList.add('active');
                });
                
                btn.addEventListener('touchend', (e) => {
                    this.touchControls[control] = false;
                    e.preventDefault();
                    btn.classList.remove('active');
                });
                
                btn.addEventListener('touchcancel', (e) => {
                    this.touchControls[control] = false;
                    e.preventDefault();
                    btn.classList.remove('active');
                });
                
                // للماوس أيضاً
                btn.addEventListener('mousedown', () => {
                    this.touchControls[control] = true;
                    btn.classList.add('active');
                });
                
                btn.addEventListener('mouseup', () => {
                    this.touchControls[control] = false;
                    btn.classList.remove('active');
                });
                
                btn.addEventListener('mouseleave', () => {
                    this.touchControls[control] = false;
                    btn.classList.remove('active');
                });
            }
        };
        
        setupButton('btn-left', 'left');
        setupButton('btn-right', 'right');
        setupButton('btn-jump', 'jump');
        setupButton('btn-slide', 'slide');
    },
    
    setupAudio() {
        this.sounds = {
            jump: document.getElementById('sound-jump'),
            coin: document.getElementById('sound-coin'),
            hit: document.getElementById('sound-hit')
        };
        
        // ضبط مستوى الصوت
        Object.values(this.sounds).forEach(sound => {
            if (sound) sound.volume = 0.4;
        });
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
        
        // الانتقال لشاشة اللعب
        this.showScreen('game');
        
        // بدء المؤقتات
        this.startTimer();
        this.startGameLoop();
        
        // إشعار البدء
        this.showNotification('🚀 ابدأ مغامرتك! حرك اللاعب باستخدام الأسهم');
        
        console.log('🎮 اللعبة بدأت!');
    },
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
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
    },
    
    createWorld() {
        console.log('🌍 إنشاء عالم اللعبة...');
        const canvas = this.canvas;
        const groundY = canvas.height - 100; // الأرض على بعد 100px من الأسفل
        
        // اللاعب - في بداية العالم
        this.player = {
            x: 100,
            y: groundY - 100,
            width: 50,
            height: 80,
            speed: 5,
            velX: 0,
            velY: 0,
            jumpPower: -15,
            gravity: 0.8,
            grounded: false,
            facingRight: true,
            color: '#E74C3C',
            isSliding: false,
            slideTimer: 0
        };
        
        console.log(`👤 اللاعب في: ${this.player.x}, ${this.player.y}`);
        
        // الأرض الأساسية
        this.platforms = [
            {
                x: 0,
                y: groundY,
                width: this.worldWidth,
                height: 100,
                type: 'ground',
                color: '#8B4513'
            }
        ];
        
        console.log(`🌱 الأرض: من 0 إلى ${this.worldWidth} على ارتفاع ${groundY}`);
        
        // منصات إضافية
        const platformData = [
            { x: 300, y: groundY - 100, width: 150, height: 25 },
            { x: 600, y: groundY - 120, width: 140, height: 25 },
            { x: 900, y: groundY - 90, width: 160, height: 25 },
            { x: 1200, y: groundY - 110, width: 150, height: 25 },
            { x: 1500, y: groundY - 130, width: 170, height: 25 },
            { x: 1800, y: groundY - 100, width: 160, height: 25 },
            { x: 2100, y: groundY - 120, width: 150, height: 25 }
        ];
        
        platformData.forEach(p => {
            this.platforms.push({
                x: p.x,
                y: p.y,
                width: p.width,
                height: p.height,
                type: 'platform',
                color: '#A0522D'
            });
        });
        
        console.log(`📦 ${this.platforms.length - 1} منصة إضافية`);
        
        // العملات
        this.coins = [];
        for (let i = 0; i < this.totalCoins; i++) {
            let x, y;
            
            if (i < 5) {
                // عملات على الأرض في البداية
                x = 200 + i * 120;
                y = groundY - 60;
            } else {
                // عملات على المنصات
                const platformIndex = Math.floor(Math.random() * (this.platforms.length - 1)) + 1;
                const platform = this.platforms[platformIndex];
                x = platform.x + 30 + Math.random() * (platform.width - 60);
                y = platform.y - 30;
            }
            
            this.coins.push({
                x: x,
                y: y,
                collected: false,
                radius: 15,
                animation: Math.random() * Math.PI * 2
            });
        }
        
        console.log(`💰 ${this.coins.length} عملة`);
        
        // الأعداء
        this.enemies = [];
        const enemyCount = 6;
        
        for (let i = 0; i < enemyCount; i++) {
            const x = 400 + i * 350;
            this.enemies.push({
                x: x,
                y: groundY - 50,
                width: 50,
                height: 50,
                speed: 2 + Math.random(),
                direction: Math.random() > 0.5 ? 1 : -1,
                color: ['#EF476F', '#FF6B6B', '#E74C3C'][i % 3],
                active: true,
                originalX: x,
                moveRange: 100
            });
        }
        
        console.log(`👾 ${this.enemies.length} عدو`);
        
        // القصر في النهاية
        this.castle = {
            x: this.worldWidth - 350,
            y: groundY - 200,
            width: 250,
            height: 180,
            color: '#8B4513',
            flagColor: '#E74C3C',
            reached: false
        };
        
        console.log(`🏰 القصر في: ${this.castle.x}, ${this.castle.y}`);
        console.log('✅ العالم مخلوق بنجاح!');
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
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    },
    
    update() {
        if (!this.player) return;
        
        this.updatePlayer();
        this.updateEnemies();
        this.updateParticles();
        this.updateCamera();
        this.checkCollisions();
        this.checkGameEnd();
    },
    
    updatePlayer() {
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
        
        // التزحلق
        if (this.touchControls.slide || this.keys['arrowdown'] || this.keys['s']) {
            if (player.grounded && !player.isSliding) {
                player.isSliding = true;
                player.slideTimer = 0.5;
                player.height = 40;
                player.y += 40;
            }
        }
        
        if (player.isSliding) {
            player.slideTimer -= this.deltaTime;
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
        if (player.velY > 20) player.velY = 20;
        
        // الحركة
        player.x += player.velX;
        player.y += player.velY;
        
        // حدود العالم الأفقية
        if (player.x < 0) player.x = 0;
        if (player.x > this.worldWidth - player.width) {
            player.x = this.worldWidth - player.width;
        }
        
        // تصادم مع الأرض والمنصات
        player.grounded = false;
        
        for (const platform of this.platforms) {
            // تصادم من الأعلى
            if (player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y + player.height > platform.y &&
                player.y + player.height < platform.y + platform.height + 10 &&
                player.velY > 0) {
                
                player.y = platform.y - player.height;
                player.velY = 0;
                player.grounded = true;
            }
        }
        
        // السقوط في الهاوية
        if (player.y > this.canvas.height + 200) {
            this.playerHit('💀 سقوط في الهاوية!');
            player.x = Math.max(100, this.camera.x + 100);
            player.y = 100;
            player.velY = 0;
        }
    },
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            enemy.x += enemy.speed * enemy.direction * this.deltaTime * 60;
            
            // تغيير الاتجاه عند حدود النطاق
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
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life -= 0.02;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    updateCamera() {
        if (!this.player) return;
        
        // الكامرا تتابع اللاعب
        const targetX = this.player.x - this.canvas.width / 3;
        this.camera.x += (targetX - this.camera.x) * 0.08;
        
        // حدود الكاميرا
        this.camera.x = Math.max(0, this.camera.x);
        this.camera.x = Math.min(this.worldWidth - this.canvas.width, this.camera.x);
    },
    
    // ======================
    // التصادمات
    // ======================
    checkCollisions() {
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
                    this.score += 100;
                    this.updateUI();
                    this.playSound('coin');
                    this.createParticles(coin.x, coin.y, 8, '#FFD700');
                    this.showNotification('💰 +100 نقطة!');
                }
            }
        });
        
        // الأعداء
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // تصادم مربع بسيط
            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {
                
                // إذا قفز على العدو من الأعلى
                if (player.velY > 0 && player.y + player.height < enemy.y + enemy.height/2) {
                    enemy.active = false;
                    this.score += 200;
                    this.enemiesKilled++;
                    player.velY = -12;
                    this.updateUI();
                    this.playSound('hit');
                    this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 12, enemy.color);
                    this.showNotification('👊 +200 نقطة! عدو هزم!');
                } else {
                    // اصطدام جانبي
                    this.playerHit('👾 اصطدمت بعدو!');
                }
            }
        });
        
        // القصر
        if (this.castle && !this.castle.reached && this.coinsCollected >= this.totalCoins) {
            const dx = (player.x + player.width/2) - (this.castle.x + this.castle.width/2);
            const dy = (player.y + player.height/2) - (this.castle.y + this.castle.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                this.castle.reached = true;
                this.endGame(true, '🏰 وصلت للقصر الملكي! انتصار!');
            }
        }
    },
    
    playerHit(message) {
        this.lives--;
        this.updateUI();
        this.playSound('hit');
        this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 10, '#E74C3C');
        this.showNotification(`${message} ❤️ ${this.lives}`);
        
        if (this.lives <= 0) {
            this.endGame(false, '💔 نفدت الأرواح! حاول مرة أخرى');
        } else {
            // ارتداد
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
    
    // ======================
    // نهاية اللعبة
    // ======================
    checkGameEnd() {
        if (this.timeLeft <= 0) {
            this.endGame(false, '⏰ انتهى الوقت!');
        }
    },
    
    endGame(isWin, message) {
        console.log(isWin ? '🏆 فوز!' : '💔 خسارة!');
        
        this.state = 'gameOver';
        this.stopTimer();
        
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
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-coins').textContent = `${this.coinsCollected}/${this.totalCoins}`;
        
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('final-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('final-enemies').textContent = this.enemiesKilled;
        
        const efficiency = Math.min(Math.round((this.score / 5000) * 100), 100);
        document.getElementById('final-efficiency').textContent = `${efficiency}%`;
    },
    
    // ======================
    // الرسم - الإصلاح الكامل
    // ======================
    draw() {
        if (!this.canvas || !this.ctx) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // مسح الشاشة
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // حفظ حالة الـ context
        ctx.save();
        
        // تطبيق حركة الكاميرا
        ctx.translate(-this.camera.x, 0);
        
        // رسم الخلفية
        this.drawBackground();
        
        // رسم جميع العناصر
        this.drawPlatforms();
        this.drawCoins();
        this.drawEnemies();
        this.drawCastle();
        this.drawParticles();
        this.drawPlayer();
        
        // إعادة حالة الـ context
        ctx.restore();
        
        // رسم واجهة المستخدم (HUD)
        this.drawHUD();
        
        // رسم إحداثيات للمساعدة في التصحيح
        if (this.player) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`اللاعب: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, 10, 60);
            ctx.fillText(`الكاميرا: ${Math.round(this.camera.x)}`, 10, 80);
            ctx.fillText(`العملات: ${this.coinsCollected}/${this.totalCoins}`, 10, 100);
        }
    },
    
    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // سماء زرقاء
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.worldWidth, canvas.height);
        
        // سحب
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 5; i++) {
            const x = (this.camera.x * 0.1 + i * 300) % (this.worldWidth + 400);
            const y = 40 + Math.sin(i) * 20;
            const size = 20;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.arc(x + size * 1.2, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // جبال بعيدة
        ctx.fillStyle = 'rgba(44, 62, 80, 0.2)';
        for (let i = 0; i < 4; i++) {
            const x = i * 600;
            const height = 100;
            
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 100);
            ctx.lineTo(x + 300, canvas.height - 100 - height);
            ctx.lineTo(x + 600, canvas.height - 100);
            ctx.closePath();
            ctx.fill();
        }
    },
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            // جسم المنصة
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل السطح
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let i = 0; i < platform.width; i += 30) {
                ctx.fillRect(platform.x + i, platform.y, 25, 5);
            }
            
            // جوانب المنصة
            if (platform.type === 'platform') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 3);
            }
        });
    },
    
    drawCoins() {
        const ctx = this.ctx;
        
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.animation += 0.1;
                const floatY = Math.sin(coin.animation) * 5;
                
                // عملة ذهبية لامعة
                const gradient = ctx.createRadialGradient(
                    coin.x, coin.y + floatY, 0,
                    coin.x, coin.y + floatY, coin.radius
                );
                gradient.addColorStop(0, '#FFF');
                gradient.addColorStop(0.3, '#FFD700');
                gradient.addColorStop(1, '#FFA500');
                ctx.fillStyle = gradient;
                
                ctx.beginPath();
                ctx.arc(coin.x, coin.y + floatY, coin.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // لمعة
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(coin.x - 3, coin.y + floatY - 3, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    },
    
    drawEnemies() {
        const ctx = this.ctx;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // جسم العدو
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // عيون
            ctx.fillStyle = 'black';
            ctx.fillRect(enemy.x + 10, enemy.y + 10, 8, 8);
            ctx.fillRect(enemy.x + enemy.width - 18, enemy.y + 10, 8, 8);
            
            // بؤبؤ العين
            ctx.fillStyle = 'white';
            ctx.fillRect(enemy.x + 12, enemy.y + 12, 4, 4);
            ctx.fillRect(enemy.x + enemy.width - 16, enemy.y + 12, 4, 4);
            
            // فم
            ctx.fillStyle = 'black';
            ctx.fillRect(enemy.x + 15, enemy.y + 25, enemy.width - 30, 6);
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
        
        // القلعة
        ctx.fillStyle = castle.color;
        ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        // نوافذ
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.fillRect(castle.x + 30 + i * 70, castle.y + 20 + j * 60, 20, 30);
            }
        }
        
        // باب
        ctx.fillStyle = '#654321';
        ctx.fillRect(castle.x + castle.width/2 - 25, castle.y + castle.height - 50, 50, 50);
        
        // سارية العلم
        if (!castle.reached) {
            ctx.fillStyle = '#654321';
            ctx.fillRect(castle.x + castle.width/2 - 3, castle.y - 50, 6, 50);
            
            // العلم
            ctx.fillStyle = castle.flagColor;
            ctx.beginPath();
            ctx.moveTo(castle.x + castle.width/2, castle.y - 50);
            ctx.lineTo(castle.x + castle.width/2 + 40, castle.y - 30);
            ctx.lineTo(castle.x + castle.width/2, castle.y - 10);
            ctx.closePath();
            ctx.fill();
        }
    },
    
    drawPlayer() {
        if (!this.player) return;
        
        const ctx = this.ctx;
        const player = this.player;
        
        ctx.save();
        
        if (this.imageLoaded && this.playerImage) {
            try {
                // حساب إحداثيات الرسم
                let drawX = player.x;
                let drawY = player.y;
                
                // إذا كان اللاعب يواجه اليسار، انعكس الصورة
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
                console.warn('⚠️ خطأ في رسم الصورة، استخدام رسم بديل');
                this.drawFallbackPlayer();
            }
        } else {
            // رسم بديل
            this.drawFallbackPlayer();
        }
        
        ctx.restore();
    },
    
    drawFallbackPlayer() {
        const ctx = this.ctx;
        const player = this.player;
        
        // الجسم
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // الرأس
        ctx.fillStyle = '#C0392B';
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y - 10, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // العيون
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x + 15, player.y - 5, 6, 6);
        ctx.fillRect(player.x + 29, player.y - 5, 6, 6);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(player.x + 17, player.y - 3, 2, 2);
        ctx.fillRect(player.x + 31, player.y - 3, 2, 2);
        
        // القبعة
        ctx.fillStyle = '#2980B9';
        ctx.fillRect(player.x + 10, player.y - 25, 30, 10);
        ctx.fillRect(player.x + 15, player.y - 30, 20, 10);
    },
    
    drawHUD() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // خلفية HUD
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 180, 40);
        ctx.fillRect(canvas.width - 190, 10, 180, 40);
        
        // النقاط والأرواح
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Cairo';
        ctx.textAlign = 'left';
        ctx.fillText(`🏆 ${this.score}`, 20, 35);
        ctx.fillText(`❤️ ${this.lives}`, 100, 35);
        
        // العملات
        ctx.fillStyle = '#4ECDC4';
        ctx.textAlign = 'right';
        ctx.fillText(`💰 ${this.coinsCollected}/${this.totalCoins}`, canvas.width - 20, 35);
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
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // تحديث واجهة اللعبة
        const hudTimer = document.getElementById('hud-timer');
        const hudScore = document.getElementById('hud-score');
        const hudLives = document.getElementById('hud-lives');
        const hudCoins = document.getElementById('hud-coins');
        
        if (hudTimer) hudTimer.textContent = timeString;
        if (hudScore) hudScore.textContent = this.score;
        if (hudLives) hudLives.textContent = this.lives;
        if (hudCoins) hudCoins.textContent = `${this.coinsCollected}/${this.totalCoins}`;
        
        // رسالة المهمة
        const missionText = document.getElementById('mission-text');
        if (missionText) {
            const remainingCoins = this.totalCoins - this.coinsCollected;
            missionText.textContent = remainingCoins > 0 ? 
                `🎯 اجمع ${remainingCoins} عملة أخرى!` : 
                '🏃‍♂️ تقدم نحو القصر!';
        }
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
            screen.style.display = 'block';
            
            // تحديث حالة اللعبة
            if (screenId === 'game') {
                this.state = 'playing';
            } else if (screenId === 'start') {
                this.state = 'menu';
            } else if (screenId === 'end') {
                this.state = 'gameOver';
            }
        }
    },
    
    playSound(soundName) {
        if (!this.soundEnabled || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName];
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.log('🔇 لا يمكن تشغيل الصوت');
            });
        } catch (e) {
            console.log('🔇 خطأ في الصوت');
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
        alert('🚨 خطأ: ' + message);
    },
    
    togglePause() {
        const btn = document.getElementById('pause-btn');
        const icon = btn.querySelector('i');
        
        if (this.state === 'playing') {
            this.state = 'paused';
            this.stopTimer();
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            icon.className = 'fas fa-play';
            this.showNotification('⏸️ اللعبة متوقفة');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.startTimer();
            this.startGameLoop();
            icon.className = 'fas fa-pause';
            this.showNotification('▶️ اللعبة مستمرة');
        }
    },
    
    toggleSound() {
        const btn = document.getElementById('sound-btn');
        const icon = btn.querySelector('i');
        this.soundEnabled = !this.soundEnabled;
        
        if (this.soundEnabled) {
            icon.className = 'fas fa-volume-up';
            this.showNotification('🔊 الصوت مفعل');
        } else {
            icon.className = 'fas fa-volume-mute';
            this.showNotification('🔇 الصوت متوقف');
        }
    },
    
    restartGame() {
        this.showScreen('start');
        setTimeout(() => this.startGame(), 300);
    }
};

// ============================================
// تهيئة اللعبة عند تحميل الصفحة
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 الصفحة محملة، بدء تحميل اللعبة...');
    
    // محاكاة شريط التقدم
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            if (progress > 100) progress = 100;
            progressFill.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 300);
    }
    
    // تهيئة اللعبة بعد تأخير
    setTimeout(() => {
        try {
            MarioGame.init();
            
            // جعل الدوال متاحة عالمياً
            window.MarioGame = MarioGame;
            window.startGame = () => MarioGame.startGame();
            window.restartGame = () => MarioGame.restartGame();
            
            console.log('✅ اللعبة جاهزة تماماً!');
            
            // إخفاء شاشة التحميل
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
            
            MarioGame.showNotification('🎮 اللعبة جاهزة! اضغط ابدأ');
            
        } catch (error) {
            console.error('❌ فشل التهيئة:', error);
            alert('خطأ في تحميل اللعبة: ' + error.message);
        }
    }, 2000);
});

// جعل دالة showScreen متاحة
window.showScreen = (screen) => {
    if (MarioGame) {
        MarioGame.showScreen(screen);
    }
};
