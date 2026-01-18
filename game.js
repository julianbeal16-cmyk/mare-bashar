// ============================================
// 🎮 لعبة ماريو الخارقة - النسخة المحسنة 100%
// ============================================

'use strict';

// نظام اللعبة الرئيسي
const MarioGame = {
    // ======================
    // إعدادات النظام
    // ======================
    canvas: null,
    ctx: null,
    state: 'loading',
    
    // الإحصائيات
    score: 0,
    bestScore: 0,
    lives: 3,
    timeLeft: 120,
    collectedCoins: 0,
    totalCoins: 20,
    enemiesKilled: 0,
    
    // المؤقتات
    gameTimer: null,
    animationId: null,
    frameCount: 0,
    lastTime: 0,
    deltaTime: 0.016,
    
    // عناصر اللعبة
    player: null,
    platforms: [],
    coins: [],
    enemies: [],
    particles: [],
    castle: null,
    camera: { x: 0, y: 0 },
    worldWidth: 2400,
    worldHeight: 600,
    
    // التحكم
    keys: {},
    touchControls: {
        left: false,
        right: false,
        jump: false
    },
    
    // الصوت
    soundEnabled: true,
    sounds: {},
    
    // الأداء
    performanceMode: false,
    backgroundCache: null,
    
    // ======================
    // التهيئة الأساسية
    // ======================
    init() {
        console.log('🎮 تهيئة اللعبة...');
        
        try {
            // تحميل العناصر
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');
            
            if (!this.canvas || !this.ctx) {
                throw new Error('فشل تحميل Canvas');
            }
            
            // ضبط دقة Canvas
            this.setupCanvas();
            
            // تحميل أفضل نتيجة
            this.loadBestScore();
            
            // إعداد التحكم
            this.setupControls();
            
            // إعداد الصوت
            this.setupAudio();
            
            // تحسين الأداء
            this.optimizePerformance();
            
            // التهيئة الناجحة
            this.state = 'menu';
            this.showScreen('start');
            
            console.log('✅ اللعبة مهيأة بنجاح!');
            this.showNotification('مرحباً في لعبة ماريو الخارقة! 🎮');
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showEmergencyMessage(error.message);
        }
    },
    
    setupCanvas() {
        const resizeCanvas = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                // احصل على أبعاد منطقة اللعبة
                const width = gameArea.clientWidth;
                const height = gameArea.clientHeight;
                
                // ضبط دقة Canvas للتطابق مع العرض الحقيقي
                this.canvas.width = width * window.devicePixelRatio;
                this.canvas.height = height * window.devicePixelRatio;
                
                // ضبط حجم العرض للشاشة
                this.canvas.style.width = width + 'px';
                this.canvas.style.height = height + 'px';
                
                // مقياس الرسم
                this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                
                // ضبط حجم العالم بناءً على حجم الشاشة
                this.worldWidth = Math.max(width * 3, 2000);
                this.worldHeight = height;
                
                console.log(`📐 Canvas: ${width}x${height}, World: ${this.worldWidth}x${this.worldHeight}`);
            }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 300);
        });
        
        // إعادة الضبط بعد تحميل الصفحة
        setTimeout(resizeCanvas, 100);
        setTimeout(resizeCanvas, 500);
    },
    
    loadBestScore() {
        try {
            const saved = localStorage.getItem('mario_best_score');
            this.bestScore = saved ? parseInt(saved) : 0;
            document.getElementById('best-score').textContent = this.bestScore;
        } catch (e) {
            console.warn('⚠️ لا يمكن تحميل أفضل نتيجة');
        }
    },
    
    setupControls() {
        // لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            // تحديث حالة المفاتيح
            this.keys[key] = true;
            
            // اختصارات خاصة
            if (key === 'p') {
                this.togglePause();
                e.preventDefault();
            }
            if (key === 'f') {
                this.toggleFullscreen();
                e.preventDefault();
            }
            if (key === 'r' && this.state === 'gameOver') {
                this.restartGame();
                e.preventDefault();
            }
            if (key === 'escape') {
                this.backToMenu();
                e.preventDefault();
            }
            
            // منع السلوك الافتراضي لأزرار التحكم
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // التحكم باللمس للجوال
        this.setupTouchControls();
    },
    
    setupTouchControls() {
        // زر اليسار
        const leftBtn = document.getElementById('btn-left');
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => {
                this.touchControls.left = true;
                e.preventDefault();
            });
            leftBtn.addEventListener('touchend', (e) => {
                this.touchControls.left = false;
                e.preventDefault();
            });
            leftBtn.addEventListener('touchcancel', (e) => {
                this.touchControls.left = false;
                e.preventDefault();
            });
        }
        
        // زر اليمين
        const rightBtn = document.getElementById('btn-right');
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => {
                this.touchControls.right = true;
                e.preventDefault();
            });
            rightBtn.addEventListener('touchend', (e) => {
                this.touchControls.right = false;
                e.preventDefault();
            });
            rightBtn.addEventListener('touchcancel', (e) => {
                this.touchControls.right = false;
                e.preventDefault();
            });
        }
        
        // زر القفز
        const jumpBtn = document.getElementById('btn-jump');
        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', (e) => {
                this.touchControls.jump = true;
                e.preventDefault();
            });
            jumpBtn.addEventListener('touchend', (e) => {
                this.touchControls.jump = false;
                e.preventDefault();
            });
            jumpBtn.addEventListener('touchcancel', (e) => {
                this.touchControls.jump = false;
                e.preventDefault();
            });
        }
    },
    
    setupAudio() {
        this.sounds = {
            jump: document.getElementById('jump-sound'),
            coin: document.getElementById('coin-sound'),
            hit: document.getElementById('hit-sound')
        };
        
        // خفض صوت المؤثرات
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = 0.3;
            }
        });
    },
    
    optimizePerformance() {
        // تمكين استنزاف أقل للبطارية
        if (this.ctx) {
            this.ctx.imageSmoothingEnabled = false;
        }
        
        // اكتشاف أجهزة الضعيفة
        this.performanceMode = window.innerWidth < 768 || 
                              ('hardwareConcurrency' in navigator && navigator.hardwareConcurrency < 4);
        
        if (this.performanceMode) {
            console.log('🔋 وضع الأداء المنخفض مفعل');
        }
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
        this.collectedCoins = 0;
        this.enemiesKilled = 0;
        this.frameCount = 0;
        this.camera = { x: 0, y: 0 };
        this.particles = [];
        
        // إنشاء عالم اللعبة
        this.createGameWorld();
        
        // تحديث واجهة المستخدم
        this.updateUI();
        
        // الانتقال لشاشة اللعب
        this.showScreen('game');
        this.state = 'playing';
        
        // بدء المؤقتات
        this.startTimer();
        this.startGameLoop();
        
        // إشعار البدء
        this.showNotification('🚀 ابدأ مغامرتك! اجمع العملات وتجنب الأعداء!');
        
        console.log('🎮 اللعبة بدأت!');
    },
    
    createGameWorld() {
        const canvas = this.canvas;
        const groundY = canvas.height - 100;
        
        // 🔥 اللاعب
        this.player = {
            x: 100,
            y: groundY - 150,
            width: 40,
            height: 60,
            speed: 6,
            velX: 0,
            velY: 0,
            jumpPower: -15,
            gravity: 0.8,
            grounded: false,
            facingRight: true,
            invincible: false,
            invincibleTime: 0,
            color: '#E74C3C',
            health: 100
        };
        
        // 🔥 الأرض
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
        
        // 🔥 منصات إضافية
        const platformTemplates = [
            { x: 300, y: groundY - 120, width: 180 },
            { x: 600, y: groundY - 150, width: 160 },
            { x: 900, y: groundY - 130, width: 200 },
            { x: 1200, y: groundY - 160, width: 170 },
            { x: 1500, y: groundY - 140, width: 190 },
            { x: 1800, y: groundY - 170, width: 180 },
            { x: 2100, y: groundY - 125, width: 210 }
        ];
        
        platformTemplates.forEach(platform => {
            this.platforms.push({
                x: platform.x,
                y: platform.y,
                width: platform.width,
                height: 20,
                type: 'platform',
                color: '#A0522D'
            });
        });
        
        // 🔥 العملات
        this.coins = [];
        for (let i = 0; i < this.totalCoins; i++) {
            const platformIndex = Math.floor(Math.random() * (this.platforms.length - 1)) + 1;
            const platform = this.platforms[platformIndex];
            
            this.coins.push({
                id: i,
                x: platform.x + Math.random() * (platform.width - 30) + 15,
                y: platform.y - 25,
                collected: false,
                radius: 10,
                animation: Math.random() * Math.PI * 2,
                value: 100,
                type: 'coin'
            });
        }
        
        // 🔥 الأعداء
        this.enemies = [];
        const enemyCount = 6;
        
        for (let i = 0; i < enemyCount; i++) {
            this.enemies.push({
                id: i,
                x: 400 + i * 300,
                y: groundY - 45,
                width: 40,
                height: 40,
                speed: 1.5 + Math.random() * 1,
                direction: i % 2 === 0 ? 1 : -1,
                color: ['#EF476F', '#FF6B6B', '#E74C3C'][i % 3],
                active: true,
                moveRange: 150,
                health: 1
            });
        }
        
        // 🔥 القصر
        this.castle = {
            x: this.worldWidth - 350,
            y: groundY - 200,
            width: 250,
            height: 200,
            color: '#8B4513',
            flagColor: '#E74C3C',
            reached: false
        };
        
        console.log('🌍 تم إنشاء عالم اللعبة:', {
            platforms: this.platforms.length,
            coins: this.coins.length,
            enemies: this.enemies.length
        });
    },
    
    // ======================
    // حلقة اللعبة
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
        
        // حساب الوقت المنقضي
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.deltaTime = Math.min(this.deltaTime, 0.033); // 30fps كحد أقصى
        this.lastTime = currentTime;
        this.frameCount++;
        
        try {
            // تحديث المنطق
            this.update();
            
            // الرسم
            this.draw();
            
        } catch (error) {
            console.error('❌ خطأ في حلقة اللعبة:', error);
            // محاولة استعادة اللعبة
            this.recoverFromError(error);
        }
        
        // الاستمرار في الحلقة
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    },
    
    update() {
        if (!this.player) return;
        
        // تحديث اللاعب
        this.updatePlayer();
        
        // تحديث الأعداء
        this.updateEnemies();
        
        // تحديث الجسيمات
        this.updateParticles();
        
        // تحديث الكاميرا
        this.updateCamera();
        
        // التحقق من التصادمات
        this.checkCollisions();
        
        // التحقق من شروط النهاية
        this.checkGameConditions();
        
        // تحديث الرسوم المتحركة
        this.updateAnimations();
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
        
        // القفز
        const jumpPressed = this.keys[' '] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump;
        
        if (jumpPressed && player.grounded) {
            player.velY = player.jumpPower;
            player.grounded = false;
            this.playSound('jump');
            this.createJumpParticles(player.x + player.width/2, player.y + player.height);
        }
        
        // الجاذبية
        player.velY += player.gravity;
        player.velY = Math.min(player.velY, 20);
        
        // التحرك
        player.x += player.velX;
        player.y += player.velY;
        
        // حدود العالم الأفقية
        player.x = Math.max(0, Math.min(this.worldWidth - player.width, player.x));
        
        // اكتشاف التصادم مع المنصات
        player.grounded = false;
        
        for (const platform of this.platforms) {
            // التحقق من الاصطدام من الأعلى
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
        
        // التحقق من السقوط في الهاوية
        if (player.y > this.canvas.height + 200) {
            this.playerHit('💀 سقوط في الهاوية!');
            player.x = Math.max(50, Math.min(this.camera.x + 100, this.worldWidth - player.width - 50));
            player.y = 100;
            player.velY = 0;
        }
        
        // تحديث وقت المناعة
        if (player.invincible) {
            player.invincibleTime -= this.deltaTime;
            if (player.invincibleTime <= 0) {
                player.invincible = false;
            }
        }
    },
    
    updateEnemies() {
        const wave = Math.sin(this.frameCount * 0.05) * 0.3;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // حركة العدو
            enemy.x += enemy.speed * enemy.direction * this.deltaTime * 60;
            
            // تغيير الاتجاه عند الحافة
            if (enemy.x <= 50 || enemy.x >= this.worldWidth - enemy.width - 50) {
                enemy.direction *= -1;
            }
            
            // حركة تموجية خفيفة
            enemy.y += wave;
        });
    },
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // جاذبية
            p.life -= 0.02;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    updateCamera() {
        if (!this.player) return;
        
        const canvas = this.canvas;
        const player = this.player;
        
        // تتبع اللاعب مع تقدم بسيط
        const targetX = player.x - canvas.width / 3;
        
        // كاميرا سلسة
        this.camera.x += (targetX - this.camera.x) * 0.08;
        
        // حدود الكاميرا
        this.camera.x = Math.max(0, Math.min(this.worldWidth - canvas.width, this.camera.x));
    },
    
    updateAnimations() {
        // تحريك العملات
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.animation += this.deltaTime * 4;
            }
        });
    },
    
    checkCollisions() {
        const player = this.player;
        
        // جمع العملات
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const dx = player.x + player.width/2 - coin.x;
                const dy = player.y + player.height/2 - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 25) {
                    coin.collected = true;
                    this.collectedCoins++;
                    this.score += coin.value;
                    this.updateUI();
                    this.playSound('coin');
                    this.createCoinParticles(coin.x, coin.y, coin.color || '#FFD700');
                    this.showNotification(`💰 +${coin.value} نقطة!`);
                }
            }
        });
        
        // التصادم مع الأعداء
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {
                
                if (player.velY > 0 && player.y + player.height < enemy.y + enemy.height / 2) {
                    // قفز على العدو
                    enemy.active = false;
                    this.score += 200;
                    this.enemiesKilled++;
                    player.velY = -10;
                    this.updateUI();
                    this.playSound('hit');
                    this.createEnemyParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    this.showNotification(`👊 +200 نقطة! عدو مهزوم!`);
                } else if (!player.invincible) {
                    // اصطدام بالعدو
                    this.playerHit('👾 اصطدمت بعدو!');
                }
            }
        });
        
        // الوصول للقصر
        if (this.castle && !this.castle.reached) {
            const dx = player.x + player.width/2 - (this.castle.x + this.castle.width/2);
            const dy = player.y + player.height/2 - (this.castle.y + this.castle.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150 && this.collectedCoins >= this.totalCoins) {
                this.castle.reached = true;
                this.endGame(true, '🏰 وصلت للقصر الملكي!');
            }
        }
    },
    
    playerHit(message) {
        const player = this.player;
        if (player.invincible) return;
        
        this.lives--;
        this.updateUI();
        this.playSound('hit');
        this.createHitParticles(player.x + player.width/2, player.y + player.height/2);
        this.showNotification(`${message} ❤️ ${this.lives} أرواح متبقية`);
        
        if (this.lives <= 0) {
            this.endGame(false, '💔 نفدت الأرواح!');
        } else {
            // مناعة مؤقتة بعد الضرر
            player.invincible = true;
            player.invincibleTime = 2;
            player.velY = -8;
        }
    },
    
    checkGameConditions() {
        // الفوز بجمع كل العملات
        if (this.collectedCoins >= this.totalCoins && !this.castle.reached) {
            this.showNotification('🎊 جمعت كل العملات! تقدم نحو القصر!');
            return;
        }
        
        // الخسارة بانتهاء الوقت
        if (this.timeLeft <= 0) {
            this.endGame(false, '⏰ انتهى الوقت!');
            return;
        }
    },
    
    // ======================
    // نظام الجسيمات
    // ======================
    createJumpParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 6 - 2,
                life: 0.5 + Math.random() * 0.5,
                color: '#FFD700',
                size: 2 + Math.random() * 3
            });
        }
    },
    
    createCoinParticles(x, y, color) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 0.8 + Math.random() * 0.4,
                color: color,
                size: 3 + Math.random() * 4
            });
        }
    },
    
    createEnemyParticles(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 0.6 + Math.random() * 0.4,
                color: ['#EF476F', '#FF6B6B', '#E74C3C'][Math.floor(Math.random() * 3)],
                size: 2 + Math.random() * 5
            });
        }
    },
    
    createHitParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 0.4 + Math.random() * 0.3,
                color: '#E74C3C',
                size: 3 + Math.random() * 3
            });
        }
    },
    
    // ======================
    // نهاية اللعبة
    // ======================
    endGame(isWin, message) {
        console.log(isWin ? '🏆 فوز!' : '💔 خسارة!');
        
        this.state = 'gameOver';
        
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
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            try {
                localStorage.setItem('mario_best_score', this.bestScore.toString());
                document.getElementById('best-score').textContent = this.bestScore;
            } catch (e) {
                console.warn('⚠️ لا يمكن حفظ أفضل نتيجة');
            }
        }
        
        // تحديث شاشة النهاية
        this.updateEndScreen(isWin, message);
        
        // الانتقال لشاشة النهاية
        this.showScreen('end');
        
        // إشعار النهاية
        this.showNotification(isWin ? '🎉 انتصار رائع!' : '💪 حاول مرة أخرى!');
    },
    
    updateEndScreen(isWin, message) {
        // تحديث الأيقونة
        const icon = document.getElementById('result-icon');
        if (icon) {
            icon.innerHTML = isWin ? 
                '<i class="fas fa-trophy"></i>' : 
                '<i class="fas fa-skull-crossbones"></i>';
        }
        
        // تحديث النص
        const title = document.getElementById('end-title');
        const msg = document.getElementById('end-message');
        
        if (title) title.textContent = isWin ? '🎉 انتصار مذهل!' : '💔 انتهت اللعبة';
        if (msg) msg.textContent = message;
        
        // تحديث الإحصائيات
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-coins').textContent = `${this.collectedCoins}/${this.totalCoins}`;
        document.getElementById('final-time').textContent = this.formatTime(120 - this.timeLeft);
        document.getElementById('final-enemies').textContent = this.enemiesKilled;
        
        // حساب الكفاءة
        const efficiency = Math.round((this.score / 5000) * 100);
        document.getElementById('final-efficiency').textContent = `${Math.min(efficiency, 100)}%`;
    },
    
    // ======================
    // الرسم
    // ======================
    draw() {
        if (!this.canvas || !this.ctx || !this.player) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // مسح الشاشة
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // حفظ حالة الـ Canvas
        ctx.save();
        
        // تطبيق مقياس الرسم
        ctx.scale(1/window.devicePixelRatio, 1/window.devicePixelRatio);
        
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
        
        // رسم الجسيمات
        this.drawParticles();
        
        // رسم اللاعب
        this.drawPlayer();
        
        // استعادة حالة الـ Canvas
        ctx.restore();
        
        // رسم واجهة اللاعب (HUD)
        this.drawHUD();
    },
    
    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // السماء المتدرجة
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.worldWidth, canvas.height);
        
        // سحب بسيطة للأداء
        if (!this.performanceMode) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            for (let i = 0; i < 6; i++) {
                const x = (this.camera.x * 0.02 + i * 400) % (this.worldWidth + 600);
                const y = 40 + Math.sin(this.frameCount * 0.001 + i) * 20;
                const size = 15 + Math.sin(i * 0.5) * 3;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.arc(x + size * 1.2, y - size * 0.3, size * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // جبال في الخلفية
        ctx.fillStyle = 'rgba(44, 62, 80, 0.2)';
        for (let i = 0; i < 4; i++) {
            const x = (i * 700) % this.worldWidth;
            const height = 80 + Math.sin(i) * 30;
            
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 80);
            ctx.lineTo(x + 250, canvas.height - 80 - height);
            ctx.lineTo(x + 500, canvas.height - 80);
            ctx.closePath();
            ctx.fill();
        }
    },
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            // تدرج اللون للمنصة
            const gradient = ctx.createLinearGradient(
                platform.x, platform.y,
                platform.x, platform.y + platform.height
            );
            
            if (platform.type === 'ground') {
                gradient.addColorStop(0, '#8B4513');
                gradient.addColorStop(0.5, '#734322');
                gradient.addColorStop(1, '#654321');
            } else {
                gradient.addColorStop(0, platform.color);
                gradient.addColorStop(1, '#8B4513');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل المنصة
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            for (let i = 0; i < platform.width; i += 35) {
                ctx.fillRect(platform.x + i, platform.y, 30, 4);
            }
        });
    },
    
    drawCoins() {
        const ctx = this.ctx;
        
        this.coins.forEach(coin => {
            if (!coin.collected) {
                // حركة تمايل
                const bounceY = Math.sin(coin.animation) * 8;
                const y = coin.y + bounceY;
                
                // عملة ذهبية
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
                ctx.arc(coin.x - 3, y - 3, 4, 0, Math.PI * 2);
                ctx.fill();
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
            
            // جسم مستدير
            ctx.beginPath();
            this.roundRect(ctx, enemy.x, enemy.y, enemy.width, enemy.height, 5);
            ctx.fill();
            
            // عيون
            ctx.fillStyle = '#2C3E50';
            ctx.beginPath();
            ctx.arc(enemy.x + 12, enemy.y + 12, 5, 0, Math.PI * 2);
            ctx.arc(enemy.x + enemy.width - 12, enemy.y + 12, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // بؤبؤ العين
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(enemy.x + 12, enemy.y + 12, 2, 0, Math.PI * 2);
            ctx.arc(enemy.x + enemy.width - 12, enemy.y + 12, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // فم
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 15, enemy.y + 25, enemy.width - 30, 5);
        });
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
        gradient.addColorStop(1, '#654321');
        ctx.fillStyle = gradient;
        ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        // نسيج القصر
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < castle.width; i += 30) {
            for (let j = 0; j < castle.height; j += 25) {
                ctx.fillRect(castle.x + i + 2, castle.y + j + 2, 25, 20);
            }
        }
        
        // الأبراج
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(castle.x - 15, castle.y - 120, 50, 120);
        ctx.fillRect(castle.x + castle.width - 35, castle.y - 120, 50, 120);
        
        // النوافذ
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.fillRect(castle.x + 35 + i * 60, castle.y + 25 + j * 70, 20, 30);
            }
        }
        
        // البوابة
        ctx.fillStyle = '#654321';
        ctx.fillRect(castle.x + castle.width/2 - 30, castle.y + castle.height - 60, 60, 60);
        
        // العلم
        if (!castle.reached) {
            ctx.fillStyle = '#654321';
            ctx.fillRect(castle.x + castle.width/2 - 3, castle.y - 120, 6, 80);
            
            ctx.fillStyle = castle.flagColor;
            ctx.beginPath();
            ctx.moveTo(castle.x + castle.width/2, castle.y - 120);
            ctx.lineTo(castle.x + castle.width/2 + 35, castle.y - 105);
            ctx.lineTo(castle.x + castle.width/2, castle.y - 90);
            ctx.closePath();
            ctx.fill();
        }
    },
    
    drawParticles() {
        const ctx = this.ctx;
        
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    },
    
    drawPlayer() {
        if (!this.player) return;
        
        const ctx = this.ctx;
        const player = this.player;
        
        // لون اللاعب (يتغير إذا كان منيعاً)
        let playerColor = player.color;
        if (player.invincible) {
            const flash = Math.floor(Date.now() / 150) % 2 === 0;
            playerColor = flash ? '#9B59B6' : player.color;
        }
        
        // جسم اللاعب
        const gradient = ctx.createLinearGradient(
            player.x, player.y,
            player.x, player.y + player.height
        );
        gradient.addColorStop(0, playerColor);
        gradient.addColorStop(1, '#C0392B');
        ctx.fillStyle = gradient;
        
        // رسم جسم مستدير
        ctx.beginPath();
        this.roundRect(ctx, player.x, player.y, player.width, player.height, 8);
        ctx.fill();
        
        // الرأس
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        this.roundRect(ctx, player.x + 10, player.y + 10, 20, 20, 5);
        ctx.fill();
        
        // العيون (تتغير حسب الاتجاه)
        const eyeOffset = player.facingRight ? 0 : 4;
        ctx.fillStyle = '#FFF';
        ctx.fillRect(player.x + 13 + eyeOffset, player.y + 13, 5, 5);
        ctx.fillRect(player.x + 22 + eyeOffset, player.y + 13, 5, 5);
        
        // بؤبؤ العين
        ctx.fillStyle = '#000';
        ctx.fillRect(player.x + 15 + eyeOffset, player.y + 15, 2, 2);
        ctx.fillRect(player.x + 24 + eyeOffset, player.y + 15, 2, 2);
        
        // الفم
        ctx.fillStyle = '#FFF';
        ctx.fillRect(player.x + 15, player.y + 26, 8, 3);
        
        // ظل تحت اللاعب عند القفز
        if (!player.grounded) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(
                player.x + player.width/2,
                player.y + player.height + 6,
                player.width/4,
                6,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }
    },
    
    drawHUD() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // خلفية المعلومات
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 10, 180, 40);
        ctx.fillRect(canvas.width - 190, 10, 180, 35);
        
        // معلومات النقاط والأرواح
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Cairo';
        ctx.fillText(`🏆 ${this.score}`, 20, 35);
        
        ctx.fillStyle = '#E74C3C';
        ctx.font = '18px Cairo';
        ctx.fillText(`❤️ ${this.lives}`, 120, 35);
        
        // معلومات التقدم
        ctx.fillStyle = '#4ECDC4';
        ctx.font = '16px Cairo';
        ctx.fillText(`💰 ${this.collectedCoins}/${this.totalCoins}`, canvas.width - 180, 32);
        
        // تلميح متحرك
        if (this.frameCount % 180 < 90) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '14px Cairo';
            ctx.fillText('🎯 تقدم نحو القصر!', canvas.width/2 - 80, 35);
        }
    },
    
    roundRect(ctx, x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        
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
    // إدارة المؤقتات
    // ======================
    startTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            if (this.state === 'playing') {
                this.timeLeft--;
                this.updateUI();
                
                // تحديث رسالة المهمة
                this.updateMissionText();
                
                if (this.timeLeft <= 0) {
                    this.endGame(false, '⏰ انتهى الوقت!');
                }
                
                // تحذير الوقت المنخفض
                if (this.timeLeft === 30) {
                    this.showNotification('⏰ 30 ثانية متبقية! أسرع!');
                }
            }
        }, 1000);
    },
    
    updateUI() {
        // الوقت
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timer-display').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // النقاط
        document.getElementById('score-display').textContent = this.score;
        
        // الأرواح
        document.getElementById('lives-display').textContent = this.lives;
        
        // العملات
        document.getElementById('coins-display').textContent = `${this.collectedCoins}/${this.totalCoins}`;
    },
    
    updateMissionText() {
        const missionText = document.getElementById('mission-text');
        if (!missionText) return;
        
        const remainingCoins = this.totalCoins - this.collectedCoins;
        const remainingTime = this.timeLeft;
        
        if (remainingCoins > 15) {
            missionText.textContent = '🎯 اجمع العملات الذهبية!';
        } else if (remainingCoins > 8) {
            missionText.textContent = '💰 استمر! العملات تكاد تنتهي!';
        } else if (remainingCoins > 3) {
            missionText.textContent = '🔥 قريب من النهاية!';
        } else if (remainingCoins > 0) {
            missionText.textContent = '⚡ آخر عملات قليلة!';
        } else if (remainingTime > 30) {
            missionText.textContent = '🏃‍♂️ تقدم نحو القصر!';
        } else {
            missionText.textContent = '⏰ أسرع! الوقت ينفد!';
        }
    },
    
    // ======================
    // وظائف مساعدة
    // ======================
    showScreen(screenId) {
        // إخفاء كل الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });
        
        // إظهار الشاشة المطلوبة
        const screen = document.getElementById(screenId + '-screen');
        if (screen) {
            screen.classList.add('active');
            screen.style.display = 'flex';
            
            // تحديث حالة اللعبة
            if (screenId === 'game') {
                this.state = 'playing';
                setTimeout(() => {
                    if (this.state === 'playing') {
                        this.startGameLoop();
                    }
                }, 100);
            } else {
                this.state = screenId;
            }
        }
    },
    
    backToMenu() {
        // إيقاف المؤقتات
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.showScreen('start');
        this.showNotification('🏠 العودة للقائمة الرئيسية');
    },
    
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            if (this.gameTimer) clearInterval(this.gameTimer);
            if (this.animationId) cancelAnimationFrame(this.animationId);
            document.getElementById('pause-btn').innerHTML = '<i class="fas fa-play"></i>';
            document.getElementById('pause-btn').title = 'متابعة';
            this.showNotification('⏸️ اللعبة متوقفة');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.startTimer();
            this.startGameLoop();
            document.getElementById('pause-btn').innerHTML = '<i class="fas fa-pause"></i>';
            document.getElementById('pause-btn').title = 'إيقاف';
            this.showNotification('▶️ اللعبة مستمرة');
        }
    },
    
    toggleSound() {
        const btn = document.getElementById('sound-btn');
        if (this.soundEnabled) {
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
            try {
                sound.currentTime = 0;
                const playPromise = sound.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.log('🔇 فشل تشغيل الصوت:', e);
                    });
                }
            } catch (e) {
                console.log('🔇 خطأ في تشغيل الصوت:', e);
            }
        }
    },
    
    restartGame() {
        this.backToMenu();
        setTimeout(() => {
            this.startGame();
        }, 500);
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
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    showEmergencyMessage(message) {
        const emergencyHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #0a0a1a;
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 99999;
                padding: 20px;
                text-align: center;
            ">
                <div>
                    <h1 style="color: #E74C3C; margin-bottom: 20px;">⚠️ خطأ في النظام</h1>
                    <p style="margin-bottom: 30px; color: #aaa;">${message}</p>
                    <button onclick="location.reload()" style="
                        padding: 15px 30px;
                        background: #3498DB;
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 16px;
                        cursor: pointer;
                    ">
                        🔄 إعادة تحميل الصفحة
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', emergencyHTML);
    },
    
    recoverFromError(error) {
        console.warn('🔄 محاولة استعادة اللعبة من الخطأ:', error.message);
        
        // إعادة تهيئة العناصر المهمة
        if (!this.player) {
            this.createGameWorld();
        }
        
        // إعادة تشغيل الحلقة
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.state === 'playing') {
            setTimeout(() => {
                this.startGameLoop();
            }, 100);
        }
    }
};

// ============================================
// تهيئة اللعبة
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 الصفحة محملة - جاري تهيئة اللعبة...');
    
    // إخفاء شاشة التحميل بعد التهيئة
    setTimeout(() => {
        try {
            MarioGame.init();
            
            // جعل الدوال متاحة عالمياً
            window.startGame = () => MarioGame.startGame();
            window.restartGame = () => MarioGame.restartGame();
            window.togglePause = () => MarioGame.togglePause();
            window.toggleSound = () => MarioGame.toggleSound();
            window.backToMenu = () => MarioGame.backToMenu();
            window.showScreen = (screen) => MarioGame.showScreen(screen);
            
            console.log('✅ جميع الأنظمة جاهزة للعمل!');
            
            // إخفاء شاشة التحميل
            document.getElementById('loading-screen').style.display = 'none';
            
        } catch (error) {
            console.error('❌ فشل تهيئة اللعبة:', error);
            MarioGame.showEmergencyMessage('فشل تحميل اللعبة: ' + error.message);
        }
    }, 1000);
});

// ============================================
// تحسينات إضافية
// ============================================

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

// منع الإجراءات الافتراضية
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});

// إدارة رؤية الصفحة
document.addEventListener('visibilitychange', () => {
    if (document.hidden && MarioGame.state === 'playing') {
        MarioGame.togglePause();
    }
});

// منع التكبير باللمس المزدوج على الجوال
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

console.log('🎮 نظام اللعبة محمل وجاهز للعمل!');
