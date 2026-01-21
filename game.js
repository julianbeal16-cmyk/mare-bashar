// ============================================
// 🎮 محرك لعبة ماريو الخارقة - النسخة النهائية 100%
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
    worldWidth: 2800,
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
    imageLoading: false,
    
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
            
            // ضبط حجم Canvas
            this.setupCanvas();
            
            // تحميل الصورة المسبق
            this.preloadPlayerImage();
            
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
        const resizeCanvas = () => {
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer && this.canvas) {
                const width = gameContainer.clientWidth;
                const height = gameContainer.clientHeight;
                
                this.canvas.width = width;
                this.canvas.height = height;
                
                this.worldHeight = height;
                console.log(`📐 Canvas: ${width}x${height}`);
            }
        };
        
        resizeCanvas();
        
        // استخدم ResizeObserver للكشف عن تغييرات الحجم
        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => resizeCanvas());
        });
        
        if (this.canvas.parentElement) {
            observer.observe(this.canvas.parentElement);
        }
        
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 300);
        });
    },
    
    preloadPlayerImage() {
        if (this.imageLoading) return;
        
        this.imageLoading = true;
        this.playerImage = new Image();
        this.playerImage.crossOrigin = "anonymous";
        
        const imageLoadHandler = () => {
            console.log('✅ تم تحميل صورة اللاعب بنجاح');
            console.log(`📏 أبعاد الصورة الأصلية: ${this.playerImage.naturalWidth}x${this.playerImage.naturalHeight}`);
            this.imageLoaded = true;
            this.imageLoading = false;
        };
        
        const imageErrorHandler = () => {
            console.warn('⚠️ فشل تحميل صورة اللاعب، جاري استخدام صورة بديلة...');
            this.createFallbackImage();
            this.imageLoading = false;
        };
        
        this.playerImage.onload = imageLoadHandler;
        this.playerImage.onerror = imageErrorHandler;
        
        // محاولة تحميل الصورة
        this.playerImage.src = 'player.png';
        
        // وقت الانتظار للصورة
        setTimeout(() => {
            if (!this.imageLoaded && this.imageLoading) {
                console.log('⏳ فشل تحميل الصورة في الوقت المحدد، استخدام بديل...');
                this.createFallbackImage();
            }
        }, 3000);
    },
    
    createFallbackImage() {
        console.log('🎨 إنشاء صورة بديلة...');
        
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        
        // رسم شخصية بديلة احترافية
        // الجسم
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(20, 40, 60, 90);
        
        // الرأس
        ctx.fillStyle = '#C0392B';
        ctx.beginPath();
        ctx.arc(50, 30, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // العينان
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(40, 25, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(60, 25, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // بؤبؤ العين
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(40, 25, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(60, 25, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // الابتسامة
        ctx.beginPath();
        ctx.arc(50, 35, 8, 0, Math.PI, false);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // القبعة
        ctx.fillStyle = '#2980B9';
        ctx.fillRect(25, 10, 50, 15);
        ctx.fillRect(35, 0, 30, 15);
        
        // الاسم
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ME', 50, 115);
        
        this.playerImage = canvas;
        this.imageLoaded = true;
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
            console.warn('⚠️ لا يمكن تحميل أفضل نتيجة:', e);
        }
    },
    
    setupControls() {
        // لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            // منع السلوك الافتراضي لأزرار التحكم
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
        
        // التحكم باللمس - محسّن للجوال
        this.setupTouchControls();
    },
    
    setupTouchControls() {
        const setupButton = (id, control) => {
            const btn = document.getElementById(id);
            if (btn) {
                // لمنع السلوك الافتراضي على الجوال
                const handleStart = (e) => {
                    this.touchControls[control] = true;
                    e.preventDefault();
                    e.stopPropagation();
                    btn.classList.add('active');
                    
                    // اهتزاز خفيف على الجوال
                    if (navigator.vibrate) {
                        navigator.vibrate(10);
                    }
                };
                
                const handleEnd = (e) => {
                    this.touchControls[control] = false;
                    e.preventDefault();
                    e.stopPropagation();
                    btn.classList.remove('active');
                };
                
                // أحداث اللمس
                btn.addEventListener('touchstart', handleStart, { passive: false });
                btn.addEventListener('touchend', handleEnd, { passive: false });
                btn.addEventListener('touchcancel', handleEnd, { passive: false });
                
                // أحداث الماوس (للاختبار على الكمبيوتر)
                btn.addEventListener('mousedown', handleStart);
                btn.addEventListener('mouseup', handleEnd);
                btn.addEventListener('mouseleave', handleEnd);
                
                console.log(`✅ زر ${id} جاهز للتحكم`);
            } else {
                console.warn(`⚠️ زر ${id} غير موجود`);
            }
        };
        
        setupButton('btn-left', 'left');
        setupButton('btn-right', 'right');
        setupButton('btn-jump', 'jump');
        setupButton('btn-slide', 'slide');
        
        console.log('✅ أزرار التحكم باللمس جاهزة');
    },
    
    setupAudio() {
        // إنشاء عناصر صوت جديدة
        this.sounds = {
            jump: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-player-jumping-in-a-video-game-2043.mp3'),
            coin: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
            hit: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-retro-game-emergency-alarm-1000.mp3')
        };
        
        // ضبط جميع الأصوات
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.4;
            sound.preload = 'auto';
            sound.load();
        });
        
        console.log('✅ الأصوات جاهزة');
    },
    
    // ======================
    // بدء اللعبة
    // ======================
    startGame() {
        console.log('🚀 بدء لعبة جديدة...');
        
        // التأكد من تحميل الصورة
        if (!this.imageLoaded) {
            console.log('⏳ في انتظار تحميل صورة اللاعب...');
            this.showNotification('🔄 جاري تحميل شخصيتك...');
            
            // إنشاء صورة بديلة مؤقتاً
            if (!this.playerImage) {
                this.createFallbackImage();
            }
        }
        
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
        this.showNotification('🚀 ابدأ مغامرتك!');
        
        console.log('🎮 اللعبة بدأت بنجاح!');
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
        const canvas = this.canvas;
        const groundY = canvas.height - 100;
        
        // اللاعب - تحسين المعاملات
        this.player = {
            x: 150,
            y: groundY - 150,
            width: 50,
            height: 80,
            speed: 6,
            velX: 0,
            velY: 0,
            jumpPower: -14,
            gravity: 0.7,
            grounded: false,
            facingRight: true,
            color: '#E74C3C',
            isSliding: false,
            slideTimer: 0
        };
        
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
        
        // منصات إضافية - تحسين التوزيع
        const platformData = [
            { x: 300, y: groundY - 120, width: 180, height: 25 },
            { x: 550, y: groundY - 140, width: 160, height: 25 },
            { x: 850, y: groundY - 110, width: 190, height: 25 },
            { x: 1150, y: groundY - 130, width: 170, height: 25 },
            { x: 1450, y: groundY - 150, width: 200, height: 25 },
            { x: 1750, y: groundY - 120, width: 180, height: 25 },
            { x: 2050, y: groundY - 140, width: 190, height: 25 },
            { x: 2350, y: groundY - 160, width: 150, height: 25 }
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
        
        // العملات - توزيع أفضل
        this.coins = [];
        const coinsPerPlatform = Math.ceil(this.totalCoins / (platformData.length + 1));
        let coinsCreated = 0;
        
        // عملات على الأرض
        for (let i = 0; i < 5; i++) {
            this.coins.push({
                x: 200 + i * 150,
                y: groundY - 50,
                collected: false,
                radius: 12,
                animation: Math.random() * Math.PI * 2
            });
            coinsCreated++;
        }
        
        // عملات على المنصات
        for (let i = 0; i < platformData.length && coinsCreated < this.totalCoins; i++) {
            const platform = platformData[i];
            const coinsOnThisPlatform = Math.min(coinsPerPlatform, this.totalCoins - coinsCreated);
            
            for (let j = 0; j < coinsOnThisPlatform; j++) {
                this.coins.push({
                    x: platform.x + 30 + j * ((platform.width - 60) / coinsOnThisPlatform),
                    y: platform.y - 35,
                    collected: false,
                    radius: 12,
                    animation: Math.random() * Math.PI * 2
                });
                coinsCreated++;
            }
        }
        
        // الأعداء - توزيع محسّن
        this.enemies = [];
        const enemyCount = 8;
        const enemyPositions = [400, 700, 1000, 1300, 1600, 1900, 2200, 2500];
        
        for (let i = 0; i < enemyCount; i++) {
            this.enemies.push({
                x: enemyPositions[i % enemyPositions.length],
                y: groundY - 50,
                width: 45,
                height: 45,
                speed: 1.5 + Math.random() * 1,
                direction: i % 2 === 0 ? 1 : -1,
                color: ['#EF476F', '#FF6B6B', '#E74C3C', '#FF9A8B'][i % 4],
                active: true,
                moveRange: 150
            });
        }
        
        // القصر - في نهاية العالم
        this.castle = {
            x: this.worldWidth - 400,
            y: groundY - 250,
            width: 300,
            height: 250,
            color: '#8B4513',
            flagColor: '#E74C3C',
            reached: false
        };
        
        console.log(`🌍 العالم مخلوق: ${this.platforms.length} منصة، ${this.coins.length} عملة، ${this.enemies.length} عدو`);
    },
    
    // ======================
    // حلقة اللعبة الرئيسية
    // ======================
    startGameLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.lastTime = performance.now();
        this.state = 'playing';
        this.gameLoop();
    },
    
    gameLoop(currentTime = 0) {
        if (this.state !== 'playing') return;
        
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.deltaTime = Math.min(this.deltaTime, 0.1); // لمنع قفزات كبيرة
        this.lastTime = currentTime;
        
        try {
            this.update();
            this.draw();
        } catch (error) {
            console.error('❌ خطأ في حلقة اللعبة:', error);
            this.showError('خطأ في اللعبة، جاري الإصلاح...');
            this.state = 'menu';
            return;
        }
        
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
        
        // إعادة تعيين السرعة
        player.velX = 0;
        
        // التحكم بالحركة - دعم اللمس والكيبورد
        const moveLeft = this.keys['arrowleft'] || this.keys['a'] || this.touchControls.left;
        const moveRight = this.keys['arrowright'] || this.keys['d'] || this.touchControls.right;
        
        if (moveLeft && !moveRight) {
            player.velX = -player.speed;
            player.facingRight = false;
        }
        
        if (moveRight && !moveLeft) {
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
        player.velY = Math.min(player.velY, 20);
        
        // الحركة
        player.x += player.velX;
        player.y += player.velY;
        
        // حدود العالم
        player.x = Math.max(0, Math.min(this.worldWidth - player.width, player.x));
        
        // تصادم مع المنصات
        player.grounded = false;
        
        for (const platform of this.platforms) {
            if (player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y + player.height > platform.y &&
                player.y + player.height < platform.y + platform.height + 5 &&
                player.velY > 0) {
                
                player.y = platform.y - player.height;
                player.velY = 0;
                player.grounded = true;
                break;
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
            
            // حركة الأعداء داخل نطاق محدد
            enemy.x += enemy.speed * enemy.direction * this.deltaTime * 60;
            
            // تغيير الاتجاه عند حدود النطاق
            const startX = enemy.originalX || enemy.x;
            if (Math.abs(enemy.x - startX) > enemy.moveRange || 
                enemy.x < 50 || enemy.x > this.worldWidth - enemy.width - 50) {
                enemy.direction *= -1;
            }
        });
    },
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life -= 0.03;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    updateCamera() {
        if (!this.player) return;
        
        // متابعة الكاميرا للاعب
        const targetX = this.player.x - this.canvas.width / 3;
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.x = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.camera.x));
    },
    
    // ======================
    // التصادمات
    // ======================
    checkCollisions() {
        const player = this.player;
        
        // العملات
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const dx = player.x + player.width/2 - coin.x;
                const dy = player.y + player.height/2 - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30) {
                    coin.collected = true;
                    this.coinsCollected++;
                    this.score += 100;
                    this.updateUI();
                    this.playSound('coin');
                    this.createParticles(coin.x, coin.y, 10, '#FFD700');
                    this.showNotification('💰 +100 نقطة!');
                    
                    // تحقق إذا تم جمع كل العملات
                    if (this.coinsCollected >= this.totalCoins) {
                        this.showNotification('🎉 لقد جمعت كل العملات! تقدم للقصر!');
                    }
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
                    player.velY = -12;
                    this.updateUI();
                    this.playSound('hit');
                    this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 15, enemy.color);
                    this.showNotification('👊 +200 نقطة! عدو هزم!');
                } else {
                    // اصطدام بالعدو
                    this.playerHit('👾 اصطدمت بعدو!');
                }
            }
        });
        
        // القصر
        if (this.castle && !this.castle.reached && this.coinsCollected >= this.totalCoins) {
            const castleCenterX = this.castle.x + this.castle.width/2;
            const castleCenterY = this.castle.y + this.castle.height/2;
            const playerCenterX = player.x + player.width/2;
            const playerCenterY = player.y + player.height/2;
            
            const dx = playerCenterX - castleCenterX;
            const dy = playerCenterY - castleCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
                this.castle.reached = true;
                this.endGame(true, '🏰 وصلت للقصر الملكي! انتصار كامل!');
            }
        }
    },
    
    playerHit(message) {
        this.lives--;
        this.updateUI();
        this.playSound('hit');
        this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 12, '#E74C3C');
        this.showNotification(`${message} ❤️ ${this.lives}`);
        
        if (this.lives <= 0) {
            this.endGame(false, '💔 نفدت الأرواح! حاول مرة أخرى');
        } else {
            // ارتداد اللاعب
            this.player.velY = -10;
            this.player.x -= 50 * (this.player.facingRight ? 1 : -1);
            
            // منع الحركة المؤقتة
            setTimeout(() => {
                if (this.state === 'playing') {
                    this.showNotification('⚡ استعد للمواصلة!');
                }
            }, 500);
        }
    },
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: 0.8 + Math.random() * 0.4,
                color: color,
                size: 3 + Math.random() * 5
            });
        }
    },
    
    // ======================
    // نهاية اللعبة
    // ======================
    checkGameEnd() {
        if (this.timeLeft <= 0) {
            this.endGame(false, '⏰ انتهى الوقت! حاول بسرعة أكبر');
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
                const bestScoreElement = document.getElementById('best-score');
                if (bestScoreElement) {
                    bestScoreElement.textContent = this.bestScore;
                }
                this.showNotification('🏆 رقم قياسي جديد!');
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
        
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const finalScoreElement = document.getElementById('final-score');
        const finalCoinsElement = document.getElementById('final-coins');
        const finalTimeElement = document.getElementById('final-time');
        const finalEnemiesElement = document.getElementById('final-enemies');
        const finalEfficiencyElement = document.getElementById('final-efficiency');
        
        if (finalScoreElement) finalScoreElement.textContent = this.score;
        if (finalCoinsElement) finalCoinsElement.textContent = `${this.coinsCollected}/${this.totalCoins}`;
        if (finalTimeElement) finalTimeElement.textContent = timeString;
        if (finalEnemiesElement) finalEnemiesElement.textContent = this.enemiesKilled;
        
        const efficiency = Math.min(Math.round((this.score / 5000) * 100), 100);
        if (finalEfficiencyElement) finalEfficiencyElement.textContent = `${efficiency}%`;
    },
    
    // ======================
    // الرسم - محسّن بالكامل
    // ======================
    draw() {
        if (!this.canvas || !this.ctx || !this.player) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(-this.camera.x, 0);
        
        this.drawBackground();
        this.drawPlatforms();
        this.drawCoins();
        this.drawEnemies();
        this.drawParticles();
        this.drawCastle();
        this.drawPlayer();
        
        ctx.restore();
        
        this.drawHUD();
    },
    
    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // سماء متدرجة
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.worldWidth, canvas.height);
        
        // سحب متحركة
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const time = Date.now() / 1000;
        for (let i = 0; i < 8; i++) {
            const x = (this.camera.x * 0.02 + i * 400 + time * 20) % (this.worldWidth + 600);
            const y = 40 + Math.sin(i * 0.5 + time) * 20;
            const size = 15 + Math.sin(i * 0.7) * 5;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.arc(x + size * 1.2, y - size * 0.4, size * 0.7, 0, Math.PI * 2);
            ctx.arc(x + size * 2.1, y + size * 0.2, size * 0.9, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // جبال خلفية
        ctx.fillStyle = 'rgba(44, 62, 80, 0.15)';
        for (let i = 0; i < 6; i++) {
            const x = (i * 650) % (this.worldWidth + 800);
            const height = 80 + Math.sin(i) * 30;
            
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 70);
            ctx.lineTo(x + 280, canvas.height - 70 - height);
            ctx.lineTo(x + 560, canvas.height - 70);
            ctx.closePath();
            ctx.fill();
        }
        
        // أشجار بعيدة
        ctx.fillStyle = 'rgba(46, 125, 50, 0.2)';
        for (let i = 0; i < 15; i++) {
            const x = (i * 180 + this.camera.x * 0.1) % (this.worldWidth + 300);
            const y = canvas.height - 150;
            const height = 40 + Math.sin(i) * 15;
            
            // جذع
            ctx.fillStyle = 'rgba(121, 85, 72, 0.3)';
            ctx.fillRect(x, y, 8, height);
            
            // أوراق
            ctx.fillStyle = 'rgba(46, 125, 50, 0.2)';
            ctx.beginPath();
            ctx.arc(x + 4, y - 15, 25, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            // تدرج اللون
            const gradient = ctx.createLinearGradient(
                platform.x, platform.y,
                platform.x, platform.y + platform.height
            );
            
            if (platform.type === 'ground') {
                gradient.addColorStop(0, '#8B4513');
                gradient.addColorStop(0.3, '#734322');
                gradient.addColorStop(1, '#654321');
            } else {
                gradient.addColorStop(0, '#A0522D');
                gradient.addColorStop(1, '#8B4513');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل السطح
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            for (let i = 0; i < platform.width; i += 32) {
                ctx.fillRect(platform.x + i, platform.y, 28, 4);
            }
            
            // ظل تحت المنصة
            if (platform.type === 'platform') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 5);
            }
        });
    },
    
    drawCoins() {
        const ctx = this.ctx;
        const time = Date.now() / 1000;
        
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.animation += 0.1;
                const floatY = Math.sin(coin.animation + time) * 6;
                
                // عملة لامعة
                const gradient = ctx.createRadialGradient(
                    coin.x, coin.y + floatY, 0,
                    coin.x, coin.y + floatY, coin.radius
                );
                gradient.addColorStop(0, '#FFF');
                gradient.addColorStop(0.2, '#FFEB3B');
                gradient.addColorStop(0.5, '#FFD700');
                gradient.addColorStop(1, '#FFA500');
                ctx.fillStyle = gradient;
                
                ctx.beginPath();
                ctx.arc(coin.x, coin.y + floatY, coin.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // لمعة
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(coin.x - 4, coin.y + floatY - 4, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // تفاصيل العملة
                ctx.strokeStyle = '#FFA500';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(coin.x, coin.y + floatY, coin.radius - 2, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
    },
    
    drawEnemies() {
        const ctx = this.ctx;
        const time = Date.now() / 1000;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // حركة بسيطة
            const bounce = Math.sin(time * 3 + enemy.x * 0.01) * 2;
            
            // تدرج اللون للعدو
            const gradient = ctx.createLinearGradient(
                enemy.x, enemy.y,
                enemy.x, enemy.y + enemy.height
            );
            gradient.addColorStop(0, enemy.color);
            gradient.addColorStop(1, '#C0392B');
            ctx.fillStyle = gradient;
            
            // جسم العدو
            ctx.beginPath();
            this.roundRect(ctx, enemy.x, enemy.y + bounce, enemy.width, enemy.height, 6);
            ctx.fill();
            
            // عيون
            ctx.fillStyle = '#000';
            const eyeX1 = enemy.direction > 0 ? enemy.x + 12 : enemy.x + enemy.width - 19;
            const eyeX2 = enemy.direction > 0 ? enemy.x + enemy.width - 19 : enemy.x + 12;
            
            ctx.fillRect(eyeX1, enemy.y + 12 + bounce, 7, 7);
            ctx.fillRect(eyeX2, enemy.y + 12 + bounce, 7, 7);
            
            // بؤبؤ العين
            ctx.fillStyle = '#FFF';
            ctx.fillRect(eyeX1 + 2, enemy.y + 14 + bounce, 3, 3);
            ctx.fillRect(eyeX2 + 2, enemy.y + 14 + bounce, 3, 3);
            
            // فم
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 15, enemy.y + 28 + bounce, enemy.width - 30, 6);
            
            // أرجل
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(enemy.x + 8, enemy.y + enemy.height + bounce, 8, 6);
            ctx.fillRect(enemy.x + enemy.width - 16, enemy.y + enemy.height + bounce, 8, 6);
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
        const gradient = ctx.createLinearGradient(
            castle.x, castle.y,
            castle.x, castle.y + castle.height
        );
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(1, '#654321');
        ctx.fillStyle = gradient;
        ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        // تفاصيل القلعة
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let i = 0; i < castle.width; i += 35) {
            for (let j = 0; j < castle.height; j += 30) {
                ctx.fillRect(castle.x + i + 5, castle.y + j + 5, 25, 20);
            }
        }
        
        // أبراج
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(castle.x - 15, castle.y - 130, 50, 130);
        ctx.fillRect(castle.x + castle.width - 35, castle.y - 130, 50, 130);
        
        // نوافذ مضيئة
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.fillRect(castle.x + 40 + i * 70, castle.y + 30 + j * 80, 25, 40);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(castle.x + 45 + i * 70, castle.y + 35 + j * 80, 4, 4);
                ctx.fillRect(castle.x + 56 + i * 70, castle.y + 35 + j * 80, 4, 4);
                ctx.fillStyle = '#FFD700';
            }
        }
        
        // باب
        ctx.fillStyle = '#654321';
        ctx.fillRect(castle.x + castle.width/2 - 35, castle.y + castle.height - 70, 70, 70);
        
        // مقبض الباب
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(castle.x + castle.width/2 + 20, castle.y + castle.height - 35, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // العلم
        if (!castle.reached) {
            // سارية العلم
            ctx.fillStyle = '#654321';
            ctx.fillRect(castle.x + castle.width/2 - 4, castle.y - 130, 8, 100);
            
            // العلم
            ctx.fillStyle = castle.flagColor;
            ctx.beginPath();
            ctx.moveTo(castle.x + castle.width/2, castle.y - 130);
            ctx.lineTo(castle.x + castle.width/2 + 50, castle.y - 110);
            ctx.lineTo(castle.x + castle.width/2, castle.y - 90);
            ctx.closePath();
            ctx.fill();
            
            // تفاصيل العلم
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(castle.x + castle.width/2 + 25, castle.y - 110, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    drawPlayer() {
        const ctx = this.ctx;
        const player = this.player;
        
        ctx.save();
        
        if (this.imageLoaded && this.playerImage) {
            // رسم الصورة المحملة
            try {
                const drawX = player.x;
                const drawY = player.y;
                const drawWidth = player.width;
                const drawHeight = player.height;
                
                if (!player.facingRight) {
                    ctx.scale(-1, 1);
                    ctx.translate(-drawX - drawWidth, 0);
                }
                
                ctx.drawImage(
                    this.playerImage,
                    drawX,
                    drawY,
                    drawWidth,
                    drawHeight
                );
            } catch (error) {
                console.warn('⚠️ خطأ في رسم صورة اللاعب، استخدام الرسم البديل:', error);
                this.drawFallbackPlayer();
            }
        } else {
            // رسم بديل
            this.drawFallbackPlayer();
        }
        
        ctx.restore();
        
        // تأثير التزحلق
        if (player.isSliding) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(player.x, player.y + player.height, player.width, 10);
        }
    },
    
    drawFallbackPlayer() {
        const ctx = this.ctx;
        const player = this.player;
        
        // الجسم
        const bodyGradient = ctx.createLinearGradient(
            player.x, player.y,
            player.x, player.y + player.height
        );
        bodyGradient.addColorStop(0, player.color);
        bodyGradient.addColorStop(1, '#C0392B');
        ctx.fillStyle = bodyGradient;
        
        if (player.isSliding) {
            // وضع التزحلق
            ctx.fillRect(player.x, player.y, player.width, player.height);
            
            // الرأس في وضع التزحلق
            ctx.fillStyle = '#C0392B';
            ctx.fillRect(player.x + 10, player.y - 10, 30, 20);
            
            // الخوذة
            ctx.fillStyle = '#2980B9';
            ctx.fillRect(player.x + 5, player.y - 15, 40, 10);
            
        } else {
            // الوضع الطبيعي
            ctx.fillRect(player.x, player.y, player.width, player.height);
            
            // الرأس
            ctx.fillStyle = '#C0392B';
            ctx.beginPath();
            ctx.arc(player.x + player.width/2, player.y - 20, 20, 0, Math.PI * 2);
            ctx.fill();
            
            // الخوذة
            ctx.fillStyle = '#2980B9';
            ctx.fillRect(player.x + 10, player.y - 40, 30, 25);
            ctx.fillRect(player.x + 15, player.y - 45, 20, 10);
        }
        
        // العيون (تتجه دائماً للأمام)
        const eyeOffset = player.facingRight ? 0 : 5;
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x + 15 + eyeOffset, player.y - 15, 8, 8);
        ctx.fillRect(player.x + 30 + eyeOffset, player.y - 15, 8, 8);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(player.x + 17 + eyeOffset, player.y - 13, 4, 4);
        ctx.fillRect(player.x + 32 + eyeOffset, player.y - 13, 4, 4);
        
        // الفم
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x + 20, player.y, 15, 5);
        
        // الذراعان
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x - 10, player.y + 20, 10, 15);
        ctx.fillRect(player.x + player.width, player.y + 20, 10, 15);
        
        // القدمان
        ctx.fillStyle = '#2980B9';
        ctx.fillRect(player.x + 5, player.y + player.height, 15, 10);
        ctx.fillRect(player.x + 30, player.y + player.height, 15, 10);
    },
    
    drawHUD() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // خلفية شفافة للHUD
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 45);
        ctx.fillRect(canvas.width - 210, 10, 200, 45);
        
        // النقاط
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Cairo';
        ctx.textAlign = 'left';
        ctx.fillText(`🏆 ${this.score}`, 20, 40);
        
        // الأرواح
        ctx.fillStyle = '#E74C3C';
        ctx.font = '18px Cairo';
        ctx.fillText(`❤️ ${this.lives}`, 120, 40);
        
        // العملات
        ctx.fillStyle = '#4ECDC4';
        ctx.textAlign = 'right';
        ctx.fillText(`💰 ${this.coinsCollected}/${this.totalCoins}`, canvas.width - 20, 40);
        
        // مؤقت صغير في الأعلى
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        ctx.fillStyle = this.timeLeft < 30 ? '#E74C3C' : '#2ECC71';
        ctx.font = 'bold 16px Cairo';
        ctx.textAlign = 'center';
        ctx.fillText(`⏱️ ${timeString}`, canvas.width / 2, 35);
    },
    
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
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
                
                if (this.timeLeft <= 10) {
                    // تحذير عندما يقل الوقت عن 10 ثواني
                    if (this.timeLeft === 10) {
                        this.showNotification('⚠️ الوقت قارب على الانتهاء!');
                    }
                    
                    // تغيير لون المؤقت
                    const timerElement = document.getElementById('hud-timer');
                    if (timerElement) {
                        timerElement.style.color = '#E74C3C';
                        if (this.timeLeft <= 5) {
                            timerElement.style.animation = 'pulse 0.5s infinite';
                        }
                    }
                }
                
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
        
        // إعادة تعيين نمط المؤقت
        const timerElement = document.getElementById('hud-timer');
        if (timerElement) {
            timerElement.style.color = '';
            timerElement.style.animation = '';
        }
    },
    
    // ======================
    // تحديث الواجهة
    // ======================
    updateUI() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // تحديث عناصر HUD
        const hudTimer = document.getElementById('hud-timer');
        const hudScore = document.getElementById('hud-score');
        const hudLives = document.getElementById('hud-lives');
        const hudCoins = document.getElementById('hud-coins');
        const missionText = document.getElementById('mission-text');
        
        if (hudTimer) hudTimer.textContent = timeString;
        if (hudScore) hudScore.textContent = this.score;
        if (hudLives) hudLives.textContent = this.lives;
        if (hudCoins) hudCoins.textContent = `${this.coinsCollected}/${this.totalCoins}`;
        
        if (missionText) {
            const remainingCoins = this.totalCoins - this.coinsCollected;
            if (remainingCoins > 0) {
                missionText.textContent = `🎯 اجمع ${remainingCoins} عملة أخرى!`;
            } else {
                missionText.textContent = '🏃‍♂️ تقدم نحو القصر!';
            }
            
            // تحريك رسالة المهمة
            missionText.style.animation = 'pulse 2s infinite';
        }
        
        // تحديث لون المؤقت عند الضرورة
        if (hudTimer) {
            if (this.timeLeft < 30) {
                hudTimer.style.color = '#E74C3C';
            } else {
                hudTimer.style.color = '';
            }
        }
    },
    
    // ======================
    // وظائف مساعدة
    // ======================
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });
        
        const screen = document.getElementById(screenId + '-screen');
        if (screen) {
            screen.classList.add('active');
            screen.style.display = 'block';
            
            if (screenId === 'game') {
                this.state = 'playing';
            } else if (screenId === 'start') {
                this.state = 'menu';
            } else if (screenId === 'end') {
                this.state = 'gameOver';
            }
            
            // إعادة ضبط Canvas عند تغيير الشاشة
            setTimeout(() => {
                if (this.canvas) {
                    const gameContainer = document.querySelector('.game-container');
                    if (gameContainer) {
                        this.canvas.width = gameContainer.clientWidth;
                        this.canvas.height = gameContainer.clientHeight;
                    }
                }
            }, 100);
        }
    },
    
    playSound(soundName) {
        if (!this.soundEnabled || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName];
            sound.currentTime = 0;
            const playPromise = sound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log('🔇 فشل تشغيل الصوت، قد يحتاج المستخدم للتفاعل أولاً');
                });
            }
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
        console.error('🚨 خطأ:', message);
        this.showNotification('⚠️ ' + message);
    },
    
    togglePause() {
        const btn = document.getElementById('pause-btn');
        const icon = btn.querySelector('i');
        
        if (this.state === 'playing') {
            this.state = 'paused';
            this.stopTimer();
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
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
        // إعطاء وقت للانتقال
        setTimeout(() => {
            this.startGame();
        }, 300);
    },
    
    // تنظيف الموارد
    cleanup() {
        this.stopTimer();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.state = 'menu';
    }
};

// ============================================
// تهيئة اللعبة عند تحميل الصفحة
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 تحميل اللعبة...');
    
    // محاكاة شريط التقدم
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressFill.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 300);
    }
    
    // تهيئة اللعبة بعد تحميل الصفحة
    setTimeout(() => {
        try {
            MarioGame.init();
            
            // جعل اللعبة متاحة عالمياً
            window.MarioGame = MarioGame;
            window.startGame = () => MarioGame.startGame();
            window.restartGame = () => MarioGame.restartGame();
            window.showScreen = (screen) => MarioGame.showScreen(screen);
            
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

// منع الإغلاق المفاجئ
window.addEventListener('beforeunload', (e) => {
    if (MarioGame.state === 'playing') {
        e.preventDefault();
        e.returnValue = 'هل تريد حقاً الخروج؟ تقدمك في اللعبة قد يضيع.';
        return e.returnValue;
    }
});
