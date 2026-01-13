// ============================================
// 🎮 MARIO GAME - الإصدار الكامل المصلح
// كل المشاكل تم إصلاحها
// ============================================

console.log('🎮 بدء تحميل لعبة ماريو...');

class MarioGame {
    constructor() {
        console.log('🔧 إنشاء اللعبة الجديدة');
        
        // 🔥 العناصر الأساسية
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 🔥 تهيئة أحجام
        this.setupCanvas();
        
        // 🔥 حالة اللعبة
        this.gameState = 'start'; // start, playing, paused, ended
        this.keys = {};
        this.touchControls = {
            left: false,
            right: false,
            jump: false
        };
        
        // 🔥 إحصائيات
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120; // 2 دقيقة
        this.coins = 0;
        this.totalCoins = 15; // زودنا العملات
        this.kills = 0;
        this.level = 1;
        
        // 🔥 المؤقتات
        this.gameTimer = null;
        this.lastTime = 0;
        this.frameCount = 0;
        this.gameStartTime = 0;
        
        // 🔥 عناصر اللعبة
        this.player = null;
        this.platforms = [];
        this.coinItems = [];
        this.enemies = [];
        this.items = [];
        this.traps = []; // فخاخ جديدة
        this.particles = [];
        this.camera = { x: 0, y: 0 };
        
        // 🔥 أفضل نتيجة
        this.highScore = parseInt(localStorage.getItem('mario_highScore')) || 0;
        
        // 🔥 تهيئة اللعبة
        this.initialize();
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
    
    initialize() {
        console.log('⚙️ تهيئة اللعبة...');
        
        // تحديث أفضل نتيجة
        this.updateHighScore();
        
        // إعداد الأحداث
        this.setupEventListeners();
        
        // رسم شخصية ماريو في المعاينة
        this.drawMarioPreview();
        
        console.log('✅ اللعبة مهيأة وجاهزة للعب');
    }
    
    drawMarioPreview() {
        const preview = document.getElementById('player-preview');
        if (!preview) return;
        
        // نرسم ماريو يدوياً في div المعاينة
        preview.innerHTML = `
            <div class="mario-face">
                <div class="mario-hat"></div>
                <div class="mario-face-base"></div>
                <div class="mario-mustache"></div>
                <div class="mario-eyes">
                    <div class="mario-eye"></div>
                    <div class="mario-eye"></div>
                </div>
                <div class="mario-nose"></div>
            </div>
        `;
    }
    
    updateHighScore() {
        document.getElementById('high-score').textContent = this.highScore.toLocaleString();
    }
    
    setupEventListeners() {
        console.log('🎮 تهيئة أحداث التحكم...');
        
        // ===== أزرار الشاشات =====
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('howto-btn').addEventListener('click', () => this.showModal('help'));
        document.getElementById('close-help').addEventListener('click', () => this.hideModal('help'));
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.showScreen('start'));
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('main-menu-btn').addEventListener('click', () => this.showScreen('start'));
        
        // ===== زر ملء الشاشة =====
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        
        // ===== أزرار التحكم باللمس =====
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');
        const jumpBtn = document.getElementById('jump-btn');
        
        // زر اليسار
        const addTouchEvents = (btn, control) => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touchControls[control] = true;
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touchControls[control] = false;
            });
            
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.touchControls[control] = true;
            });
            
            btn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.touchControls[control] = false;
            });
            
            // للكمبيوتر
            btn.addEventListener('mouseleave', (e) => {
                this.touchControls[control] = false;
            });
        };
        
        addTouchEvents(leftBtn, 'left');
        addTouchEvents(rightBtn, 'right');
        addTouchEvents(jumpBtn, 'jump');
        
        // ===== لوحة المفاتيح =====
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // الإيقاف المؤقت
            if (key === 'p' && this.gameState === 'playing') {
                e.preventDefault();
                this.pauseGame();
            }
            
            // الخروج بالإسكيب
            if (key === 'escape' && this.gameState === 'paused') {
                e.preventDefault();
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
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // ===== منع السلوك الافتراضي =====
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        console.log('✅ أحداث التحكم جاهزة');
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('خطأ في ملء الشاشة:', err);
            });
            document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-expand"></i>';
        }
    }
    
    showScreen(screenName) {
        console.log(`📺 إظهار شاشة: ${screenName}`);
        
        // إخفاء جميع الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // إخفاء النوافذ المنبثقة
        this.hideModal('help');
        
        // إظهار الشاشة المطلوبة
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.classList.add('active');
            this.gameState = screenName;
            
            if (screenName === 'game') {
                this.gameState = 'playing';
                this.startGameLoop();
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
    
    startGame() {
        console.log('🎯 ===== بدء لعبة جديدة =====');
        
        // 🔥 إعادة تعيين كل شيء
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coins = 0;
        this.kills = 0;
        this.level = 1;
        this.gameStartTime = Date.now();
        
        // 🔥 إنشاء العالم
        this.createGameWorld();
        
        // 🔥 تحديث الواجهة
        this.updateUI();
        
        // 🔥 إظهار شاشة اللعب
        this.showScreen('game');
        
        // 🔥 بدء المؤقت
        this.startTimer();
        
        // 🔥 بدء الحلقة الرئيسية
        this.lastTime = performance.now();
        this.gameLoop();
        
        console.log(`✅ اللعبة بدأت - الوقت: ${this.timeLeft}ث، الأرواح: ${this.lives}`);
    }
    
    createGameWorld() {
        console.log('🌍 إنشاء عالم اللعبة...');
        
        // 🔥 اللاعب - أحجام مناسبة للهاتف
        const playerWidth = Math.max(40, this.canvas.width * 0.1);
        const playerHeight = Math.max(60, playerWidth * 1.5);
        
        this.player = {
            x: this.canvas.width * 0.1,
            y: this.canvas.height * 0.6,
            width: playerWidth,
            height: playerHeight,
            speed: 6,
            velX: 0,
            velY: 0,
            jumpPower: -15,
            grounded: false,
            canJump: true,
            facingRight: true,
            invincible: false,
            invincibleTime: 0,
            color: '#E74C3C'
        };
        
        // 🔥 الأرض والمنصات - أطوال أكبر
        const groundHeight = Math.max(50, this.canvas.height * 0.08);
        const worldWidth = this.canvas.width * 3; // زودنا طول العالم
        
        this.platforms = [
            // الأرض الرئيسية
            { 
                x: 0, 
                y: this.canvas.height - groundHeight, 
                width: worldWidth, 
                height: groundHeight, 
                type: 'ground' 
            },
            
            // منصات عائمة - مرحلة طويلة
            { x: 300, y: 350, width: 200, height: 20, type: 'platform' },
            { x: 600, y: 300, width: 150, height: 20, type: 'platform' },
            { x: 900, y: 250, width: 200, height: 20, type: 'platform' },
            { x: 1200, y: 350, width: 150, height: 20, type: 'platform' },
            { x: 1500, y: 280, width: 200, height: 20, type: 'platform' },
            { x: 1800, y: 200, width: 180, height: 20, type: 'platform' },
            { x: 2100, y: 320, width: 200, height: 20, type: 'platform' },
            { x: 2400, y: 270, width: 150, height: 20, type: 'platform' },
            { x: 2700, y: 180, width: 200, height: 20, type: 'platform' },
            { x: 3000, y: 350, width: 250, height: 20, type: 'platform' }
        ];
        
        // 🔥 العملات - موزعة بطول المرحلة
        this.coinItems = [];
        const coinPositions = [
            {x: 200, y: 150}, {x: 350, y: 300}, {x: 500, y: 200},
            {x: 650, y: 250}, {x: 800, y: 150}, {x: 950, y: 180},
            {x: 1100, y: 220}, {x: 1250, y: 300}, {x: 1400, y: 180},
            {x: 1550, y: 240}, {x: 1700, y: 160}, {x: 1850, y: 220},
            {x: 2000, y: 280}, {x: 2150, y: 170}, {x: 2300, y: 250},
            {x: 2450, y: 190}, {x: 2600, y: 320}, {x: 2750, y: 140},
            {x: 2900, y: 200}, {x: 3050, y: 280}
        ];
        
        for (let i = 0; i < Math.min(this.totalCoins, coinPositions.length); i++) {
            const pos = coinPositions[i];
            this.coinItems.push({
                x: pos.x,
                y: pos.y,
                collected: false,
                anim: Math.random() * Math.PI * 2,
                id: i,
                size: 12,
                bounceSpeed: 0.05 + Math.random() * 0.03
            });
        }
        
        // 🔥 الأعداء - موزعين بطول المرحلة
        this.enemies = [
            { 
                x: 400, 
                y: this.platforms[0].y - 40, 
                width: 40, 
                height: 40, 
                dir: 1, 
                speed: 1.5, 
                active: true,
                moveRange: 150,
                startX: 400
            },
            { 
                x: 800, 
                y: this.platforms[0].y - 40, 
                width: 40, 
                height: 40, 
                dir: -1, 
                speed: 2, 
                active: true,
                moveRange: 120,
                startX: 800
            },
            { 
                x: 1300, 
                y: this.platforms[0].y - 40, 
                width: 40, 
                height: 40, 
                dir: 1, 
                speed: 2.5, 
                active: true,
                moveRange: 180,
                startX: 1300
            },
            { 
                x: 1900, 
                y: 160, 
                width: 40, 
                height: 40, 
                dir: 1, 
                speed: 1.8, 
                active: true,
                moveRange: 100,
                startX: 1900
            },
            { 
                x: 2500, 
                y: 230, 
                width: 40, 
                height: 40, 
                dir: -1, 
                speed: 2.2, 
                active: true,
                moveRange: 140,
                startX: 2500
            },
            { 
                x: 3100, 
                y: 310, 
                width: 40, 
                height: 40, 
                dir: 1, 
                speed: 1.7, 
                active: true,
                moveRange: 160,
                startX: 3100
            }
        ];
        
        // 🔥 العناصر (فطر)
        this.items = [
            { 
                x: 700, 
                y: 180, 
                type: 'mushroom', 
                collected: false,
                size: 20
            },
            { 
                x: 1600, 
                y: 150, 
                type: 'mushroom', 
                collected: false,
                size: 20
            },
            { 
                x: 2800, 
                y: 130, 
                type: 'mushroom', 
                collected: false,
                size: 20
            }
        ];
        
        // 🔥 الفخاخ الجديدة
        this.traps = [
            { x: 1100, y: this.platforms[0].y - 20, width: 60, height: 20, type: 'fire', active: true, anim: 0 },
            { x: 1700, y: this.platforms[0].y - 20, width: 60, height: 20, type: 'fire', active: true, anim: 0 },
            { x: 2300, y: this.platforms[0].y - 20, width: 60, height: 20, type: 'spike', active: true },
            { x: 2900, y: 330, width: 60, height: 20, type: 'fire', active: true, anim: 0 },
            
            // حفر
            { x: 1400, y: this.platforms[0].y, width: 100, height: 100, type: 'pit' },
            { x: 2200, y: this.platforms[0].y, width: 80, height: 100, type: 'pit' },
            { x: 3200, y: this.platforms[0].y, width: 120, height: 100, type: 'pit' }
        ];
        
        // 🔥 الجسيمات
        this.particles = [];
        
        // 🔥 الكاميرا
        this.camera.x = 0;
        this.camera.y = 0;
        
        console.log(`🎯 العالم الجديد: ${this.platforms.length} منصة، ${this.coinItems.length} عملة، ${this.enemies.length} عدو، ${this.traps.length} فخ`);
    }
    
    startTimer() {
        console.log('⏱️ بدء المؤقت');
        
        // إيقاف أي مؤقت سابق
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        // بدء مؤقت جديد
        this.gameTimer = setInterval(() => {
            if (this.gameState === 'playing') {
                this.timeLeft--;
                this.updateUI();
                
                if (this.timeLeft <= 0) {
                    console.log('⏰ الوقت انتهى!');
                    this.endGame(false);
                }
            }
        }, 1000);
    }
    
    updateUI() {
        // 🔥 تحديث الوقت
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = timeString;
        
        // 🔥 تحديث النتيجة
        document.getElementById('score').textContent = this.score;
        
        // 🔥 تحديث الأرواح
        document.getElementById('lives').textContent = this.lives;
        
        // 🔥 تحديث العملات
        document.getElementById('coins').textContent = `${this.coins}/${this.totalCoins}`;
    }
    
    updatePlayer(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // 🔥 المناعة
        if (this.player.invincible) {
            this.player.invincibleTime -= deltaTime;
            if (this.player.invincibleTime <= 0) {
                this.player.invincible = false;
            }
        }
        
        // 🔥 الحركة
        this.player.velX = 0;
        
        if (this.keys['arrowleft'] || this.keys['a'] || this.touchControls.left) {
            this.player.velX = -this.player.speed;
            this.player.facingRight = false;
        }
        
        if (this.keys['arrowright'] || this.keys['d'] || this.touchControls.right) {
            this.player.velX = this.player.speed;
            this.player.facingRight = true;
        }
        
        // 🔥 القفز
        if ((this.keys[' '] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump) && 
            this.player.grounded && this.player.canJump) {
            this.player.velY = this.player.jumpPower;
            this.player.grounded = false;
            this.player.canJump = false;
            
            // جسيمات القفز
            this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height, 5, '#FFD700');
            
            setTimeout(() => {
                this.player.canJump = true;
            }, 300);
        }
        
        // 🔥 الجاذبية
        this.player.velY += 0.8;
        if (this.player.velY > 20) this.player.velY = 20;
        
        // 🔥 الحركة
        this.player.x += this.player.velX * deltaTime * 60;
        this.player.y += this.player.velY * deltaTime * 60;
        
        // 🔥 حدود الشاشة (يسار)
        if (this.player.x < 0) {
            this.player.x = 0;
        }
        
        // 🔥 حدود الشاشة (يمين)
        const maxX = this.canvas.width * 3 - this.player.width;
        if (this.player.x > maxX) {
            this.player.x = maxX;
            
            // فوز إذا وصل للنهاية وجمع العملات
            if (this.player.x >= maxX - 10 && this.coins >= this.totalCoins) {
                this.endGame(true);
            }
        }
        
        // 🔥 فحص الاصطدام مع المنصات
        this.player.grounded = false;
        
        for (const platform of this.platforms) {
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > platform.y &&
                this.player.y + this.player.height < platform.y + platform.height + this.player.velY &&
                this.player.velY > 0) {
                
                this.player.y = platform.y - this.player.height;
                this.player.velY = 0;
                this.player.grounded = true;
                break;
            }
        }
        
        // 🔥 فحص السقوط في الحفر
        for (const trap of this.traps) {
            if (trap.type === 'pit') {
                if (this.player.x + this.player.width > trap.x &&
                    this.player.x < trap.x + trap.width &&
                    this.player.y + this.player.height > trap.y) {
                    
                    console.log('🕳️ سقوط في حفرة!');
                    this.playerDamaged();
                    // إعادة تعيين اللاعب
                    this.player.x = Math.max(0, this.camera.x + 50);
                    this.player.y = 300;
                    this.player.velX = 0;
                    this.player.velY = 0;
                    break;
                }
            }
        }
        
        // 🔥 فحص السقوط العام
        if (this.player.y > this.canvas.height + 100) {
            console.log('💀 سقوط!');
            this.playerDamaged();
            // إعادة تعيين اللاعب
            this.player.x = Math.max(0, this.camera.x + 50);
            this.player.y = 300;
            this.player.velX = 0;
            this.player.velY = 0;
        }
    }
    
    updateEnemies(deltaTime) {
        for (let enemy of this.enemies) {
            if (!enemy.active) continue;
            
            // حركة الأعداء ضمن نطاق محدد
            enemy.x += enemy.speed * enemy.dir * deltaTime * 60;
            
            // تغيير الاتجاه عند حدود النطاق
            if (enemy.x < enemy.startX - enemy.moveRange || 
                enemy.x > enemy.startX + enemy.moveRange) {
                enemy.dir *= -1;
                enemy.x = Math.max(enemy.startX - enemy.moveRange, 
                                  Math.min(enemy.startX + enemy.moveRange, enemy.x));
            }
            
            // وضع الأعداء على الأرض أو المنصة
            let onPlatform = false;
            for (const platform of this.platforms) {
                if (platform.type === 'ground' || 
                    (enemy.x + enemy.width > platform.x && 
                     enemy.x < platform.x + platform.width &&
                     Math.abs(enemy.y + enemy.height - platform.y) < 5)) {
                    
                    enemy.y = platform.y - enemy.height;
                    onPlatform = true;
                    break;
                }
            }
            
            // إذا لم يكن على منصة، نسقيه
            if (!onPlatform && enemy.y < this.platforms[0].y - enemy.height) {
                enemy.y += 5;
            }
        }
    }
    
    updateCoins(deltaTime) {
        for (let coin of this.coinItems) {
            if (!coin.collected) {
                // حركة طفيفة للعملات (ارتداد)
                coin.anim += coin.bounceSpeed;
            }
        }
    }
    
    updateItems(deltaTime) {
        for (let item of this.items) {
            if (!item.collected) {
                // حركة طفيفة للعناصر
                item.y += Math.sin(Date.now() * 0.002 + item.x) * 0.5;
            }
        }
    }
    
    updateTraps(deltaTime) {
        for (let trap of this.traps) {
            if (trap.type === 'fire') {
                trap.anim += deltaTime * 5;
            }
        }
    }
    
    updateParticles(deltaTime) {
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
        this.camera.x = Math.max(0, Math.min(this.canvas.width * 3 - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.canvas.height - this.canvas.height, this.camera.y));
    }
    
    checkCollisions() {
        // 🔥 جمع العملات
        for (let coin of this.coinItems) {
            if (!coin.collected) {
                const dx = this.player.x + this.player.width/2 - coin.x;
                const dy = this.player.y + this.player.height/2 - coin.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 25) { // زودنا مسافة الجمع
                    console.log(`💰 جمع عملة ${coin.id + 1}!`);
                    coin.collected = true;
                    this.coins++;
                    this.score += 100;
                    this.updateUI();
                    
                    // جسيمات العملة
                    this.createParticles(coin.x, coin.y, 8, '#FFD700');
                    
                    // 🔥 فحص إذا جمع كل العملات
                    if (this.coins >= this.totalCoins) {
                        console.log('🏆 جمعت كل العملات!');
                        // يمكن إضافة مكافأة
                    }
                }
            }
        }
        
        // 🔥 جمع العناصر
        for (let item of this.items) {
            if (!item.collected) {
                const dx = this.player.x + this.player.width/2 - item.x;
                const dy = this.player.y + this.player.height/2 - item.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 35) { // زودنا مسافة الجمع
                    console.log(`🎁 جمع عنصر: ${item.type}`);
                    item.collected = true;
                    
                    if (item.type === 'mushroom') {
                        this.score += 500;
                        this.player.invincible = true;
                        this.player.invincibleTime = 10;
                        this.createParticles(item.x, item.y, 12, '#E74C3C');
                    }
                    
                    this.updateUI();
                }
            }
        }
        
        // 🔥 الاصطدام بالأعداء
        for (let enemy of this.enemies) {
            if (!enemy.active) continue;
            
            if (this.player.x < enemy.x + enemy.width &&
                this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height &&
                this.player.y + this.player.height > enemy.y) {
                
                // إذا وطأ على العدو من الأعلى
                if (this.player.velY > 0 && this.player.y + this.player.height < enemy.y + enemy.height/2) {
                    console.log('👾 هزمت عدواً!');
                    enemy.active = false;
                    this.score += 200;
                    this.kills++;
                    this.player.velY = -12; // قفز عند هزيمة العدو
                    this.updateUI();
                    
                    // جسيمات تدمير العدو
                    this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 10, '#EF476F');
                } else if (!this.player.invincible) {
                    // تضرر اللاعب
                    console.log('💥 تضرر من عدو!');
                    this.playerDamaged();
                }
            }
        }
        
        // 🔥 الاصطدام بالفخاخ
        for (let trap of this.traps) {
            if (!trap.active) continue;
            
            if (trap.type === 'fire' || trap.type === 'spike') {
                if (this.player.x < trap.x + trap.width &&
                    this.player.x + this.player.width > trap.x &&
                    this.player.y < trap.y + trap.height &&
                    this.player.y + this.player.height > trap.y) {
                    
                    if (!this.player.invincible) {
                        console.log(`🔥 تضرر من ${trap.type === 'fire' ? 'نار' : 'أشواك'}!`);
                        this.playerDamaged();
                    }
                }
            }
        }
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 8,
                velocityY: (Math.random() - 0.5) * 8 - 4,
                size: Math.random() * 3 + 2,
                color: color,
                life: 1
            });
        }
    }
    
    playerDamaged() {
        if (this.player.invincible) return;
        
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.endGame(false);
        } else {
            // مناعة مؤقتة بعد الضرر
            this.player.invincible = true;
            this.player.invincibleTime = 2;
            
            // تأثير ارتداد
            this.player.velY = -10;
            this.player.velX = this.player.facingRight ? -10 : 10;
            
            // جسيمات الضرر
            this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 6, '#EF476F');
            
            console.log(`💔 تضررت! الأرواح المتبقية: ${this.lives}`);
        }
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') {
            return;
        }
        
        // 🔥 حساب الوقت المنقضي
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.frameCount++;
        
        // 🔥 تحديث العناصر
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateCoins(deltaTime);
        this.updateItems(deltaTime);
        this.updateTraps(deltaTime);
        this.updateParticles(deltaTime);
        this.updateCamera();
        this.checkCollisions();
        
        // 🔥 الرسم
        this.draw();
        
        // 🔥 الاستمرار في الحلقة
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    draw() {
        // 🔥 مسح الشاشة
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // تطبيق تحويلات الكاميرا
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // 🔥 الخلفية - أحجام مناسبة
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width * 3, this.canvas.height);
        
        // 🔥 سحب
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 8; i++) {
            const x = (this.camera.x * 0.3 + i * 250) % (this.canvas.width * 3 + 300);
            const y = 60 + Math.sin(this.frameCount * 0.01 + i) * 10;
            this.drawCloud(x, y, 40);
        }
        
        // 🔥 جبال في الخلفية
        this.ctx.fillStyle = '#2C3E50';
        this.drawMountain(200, 200, 150, 100);
        this.drawMountain(500, 180, 130, 90);
        this.drawMountain(900, 220, 170, 120);
        this.drawMountain(1400, 190, 140, 95);
        this.drawMountain(2000, 210, 160, 110);
        this.drawMountain(2600, 180, 120, 85);
        
        // 🔥 الأرض والمنصات
        this.platforms.forEach(platform => {
            // الأرض الرئيسية
            this.ctx.fillStyle = platform.type === 'ground' ? '#8B4513' : '#A0522D';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل الأرض
            this.ctx.fillStyle = platform.type === 'ground' ? '#A0522D' : '#8B4513';
            const detailWidth = 15;
            for (let i = 0; i < platform.width; i += detailWidth * 2) {
                this.ctx.fillRect(platform.x + i, platform.y, detailWidth, platform.height * 0.2);
            }
            
            // ظل للمنصة
            if (platform.type !== 'ground') {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                this.ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 5);
            }
        });
        
        // 🔥 العملات
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.anim) * 12;
                
                // العملة الذهبية
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(coin.x, coin.y + bounce, coin.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#FFA500';
                this.ctx.beginPath();
                this.ctx.arc(coin.x, coin.y + bounce, coin.size * 0.6, 0, Math.PI * 2);
                this.ctx.fill();
                
                // بريق
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.beginPath();
                this.ctx.arc(coin.x - coin.size * 0.3, coin.y - coin.size * 0.3 + bounce, coin.size * 0.3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // 🔥 العناصر
        this.items.forEach(item => {
            if (!item.collected) {
                if (item.type === 'mushroom') {
                    // فطر
                    this.ctx.fillStyle = '#E74C3C';
                    this.ctx.beginPath();
                    this.ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.fillStyle = '#FFF';
                    this.ctx.beginPath();
                    this.ctx.arc(item.x - item.size * 0.3, item.y - item.size * 0.3, item.size * 0.3, 0, Math.PI * 2);
                    this.ctx.arc(item.x + item.size * 0.3, item.y - item.size * 0.3, item.size * 0.3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        });
        
        // 🔥 الفخاخ
        this.traps.forEach(trap => {
            if (trap.active) {
                if (trap.type === 'fire') {
                    // نار متحركة
                    const fireHeight = 30 + Math.sin(trap.anim) * 10;
                    const gradient = this.ctx.createLinearGradient(trap.x, trap.y, trap.x, trap.y - fireHeight);
                    gradient.addColorStop(0, '#FF6B00');
                    gradient.addColorStop(0.5, '#FF9500');
                    gradient.addColorStop(1, '#FFD166');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.moveTo(trap.x, trap.y);
                    this.ctx.lineTo(trap.x + trap.width, trap.y);
                    this.ctx.lineTo(trap.x + trap.width * 0.7, trap.y - fireHeight);
                    this.ctx.lineTo(trap.x + trap.width * 0.3, trap.y - fireHeight);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                } else if (trap.type === 'spike') {
                    // أشواك
                    this.ctx.fillStyle = '#95A5A6';
                    this.ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
                    
                    this.ctx.fillStyle = '#7F8C8D';
                    for (let i = 0; i < 5; i++) {
                        const spikeX = trap.x + i * (trap.width / 5) + 5;
                        this.ctx.beginPath();
                        this.ctx.moveTo(spikeX, trap.y);
                        this.ctx.lineTo(spikeX + 8, trap.y - 15);
                        this.ctx.lineTo(spikeX + 16, trap.y);
                        this.ctx.closePath();
                        this.ctx.fill();
                    }
                } else if (trap.type === 'pit') {
                    // حفرة
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
                    
                    // تفاصيل الحفرة
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
                    this.ctx.beginPath();
                    this.ctx.arc(trap.x + trap.width/2, trap.y + trap.height, trap.width * 0.3, 0, Math.PI);
                    this.ctx.fill();
                }
            }
        });
        
        // 🔥 الأعداء
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // جسم العدو
            this.ctx.fillStyle = '#EF476F';
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // عيون
            this.ctx.fillStyle = '#2C3E50';
            const eyeSize = enemy.width * 0.2;
            this.ctx.fillRect(enemy.x + enemy.width * 0.25, enemy.y + enemy.height * 0.25, eyeSize, eyeSize);
            this.ctx.fillRect(enemy.x + enemy.width * 0.6, enemy.y + enemy.height * 0.25, eyeSize, eyeSize);
            
            // فم
            this.ctx.fillRect(enemy.x + enemy.width * 0.3, enemy.y + enemy.height * 0.7, enemy.width * 0.4, enemy.height * 0.1);
            
            // قدمان متحركتان
            const footOffset = Math.sin(this.frameCount * 0.1 + enemy.x) * 3;
            this.ctx.fillRect(enemy.x + enemy.width * 0.1, enemy.y + enemy.height - 5, enemy.width * 0.25, 5 + footOffset);
            this.ctx.fillRect(enemy.x + enemy.width * 0.65, enemy.y + enemy.height - 5, enemy.width * 0.25, 5 - footOffset);
        });
        
        // 🔥 الجسيمات
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        
        // 🔥 اللاعب
        // تأثير المناعة (وميض)
        if (this.player.invincible && Math.floor(this.frameCount * 0.2) % 2 === 0) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // رسم ماريو بشكل أفضل
        this.drawMario(this.player.x, this.player.y, this.player.width, this.player.height, this.player.facingRight);
        
        this.ctx.globalAlpha = 1;
        
        // تأثير القفز
        if (!this.player.grounded) {
            this.ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width/2,
                this.player.y + this.player.height,
                15 + Math.sin(this.frameCount * 0.1) * 3,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
        
        // استعادة تحويلات الكاميرا
        this.ctx.restore();
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size, y - size * 0.2, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.8, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawMountain(x, y, width, height) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height);
        this.ctx.lineTo(x + width / 2, y);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // ثلج على القمة
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.beginPath();
        this.ctx.moveTo(x + width * 0.4, y + height * 0.3);
        this.ctx.lineTo(x + width * 0.6, y + height * 0.3);
        this.ctx.lineTo(x + width * 0.5, y + height * 0.1);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawMario(x, y, width, height, facingRight) {
        // قبعة ماريو
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.fillRect(x, y, width, height * 0.2);
        
        // زر قبعة
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(x + width * 0.5, y + height * 0.1, width * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // وجه ماريو
        this.ctx.fillStyle = '#F5CBA7';
        this.ctx.fillRect(x, y + height * 0.2, width, height * 0.4);
        
        // شارب
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + width * 0.2, y + height * 0.35, width * 0.6, height * 0.05);
        
        // عيون
        this.ctx.fillStyle = '#000';
        const eyeY = y + height * 0.28;
        const eyeSize = width * 0.08;
        
        // العين اليسرى
        this.ctx.beginPath();
        this.ctx.arc(x + width * 0.35, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // العين اليمنى
        this.ctx.beginPath();
        this.ctx.arc(x + width * 0.65, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // جسم ماريو
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.fillRect(x, y + height * 0.6, width, height * 0.4);
        
        // أزرار
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(x + width * 0.5, y + height * 0.7, width * 0.08, 0, Math.PI * 2);
        this.ctx.fill();
        
        // سروال
        this.ctx.fillStyle = '#2E86C1';
        this.ctx.fillRect(x, y + height * 0.8, width, height * 0.2);
        
        // حزام
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x, y + height * 0.8, width, height * 0.05);
        
        // أحذية
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x, y + height * 0.95, width * 0.4, height * 0.05);
        this.ctx.fillRect(x + width * 0.6, y + height * 0.95, width * 0.4, height * 0.05);
        
        // تأثير المناعة
        if (this.player.invincible) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
        }
    }
    
    pauseGame() {
        console.log('⏸️ إيقاف اللعبة');
        this.gameState = 'paused';
        clearInterval(this.gameTimer);
        
        // تحديث شاشة الإيقاف
        document.getElementById('pause-time').textContent = this.formatTime(this.timeLeft);
        document.getElementById('pause-score').textContent = this.score;
        document.getElementById('pause-coins').textContent = `${this.coins}/${this.totalCoins}`;
        
        // إظهار شاشة الإيقاف
        this.showScreen('pause');
    }
    
    resumeGame() {
        console.log('▶️ استئناف اللعبة');
        this.gameState = 'playing';
        this.showScreen('game');
        this.startTimer();
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    restartGame() {
        console.log('🔄 إعادة تشغيل اللعبة');
        this.startGame();
    }
    
    endGame(isWin) {
        console.log(`🎮 نهاية اللعبة - فوز: ${isWin}`);
        
        // 🔥 إيقاف المؤقت والحلقة
        this.gameState = 'ended';
        clearInterval(this.gameTimer);
        
        // 🔥 تحديث أفضل نتيجة
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('mario_highScore', this.highScore.toString());
            this.updateHighScore();
        }
        
        // 🔥 تحديث شاشة النهاية
        const endIcon = document.getElementById('end-icon');
        endIcon.className = isWin ? 'fas fa-trophy' : 'fas fa-skull-crossbones';
        
        document.getElementById('end-title').textContent = isWin ? 'تهانينا!' : 'انتهت اللعبة';
        
        let message = '';
        if (isWin) {
            const timeUsed = 120 - this.timeLeft;
            message = `جمعت ${this.coins} عملة في ${this.formatTime(timeUsed)}!`;
        } else {
            if (this.timeLeft <= 0) {
                message = 'انتهى الوقت!';
            } else if (this.lives <= 0) {
                message = 'نفذت الأرواح!';
            } else {
                message = 'حاول مرة أخرى!';
            }
        }
        document.getElementById('end-message').textContent = message;
        
        document.getElementById('end-score').textContent = this.score;
        document.getElementById('end-coins').textContent = `${this.coins}/${this.totalCoins}`;
        document.getElementById('end-time').textContent = this.formatTime(120 - this.timeLeft);
        document.getElementById('end-kills').textContent = this.kills;
        
        // 🔥 إظهار شاشة النهاية
        this.showScreen('end');
        
        console.log(`📊 النتيجة النهائية: ${this.score} نقطة، ${this.coins}/${this.totalCoins} عملة، ${this.kills} عدو مقهور`);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// ============================================
// 🔥 بدء اللعبة عند تحميل الصفحة
// ============================================

let game;

window.addEventListener('load', () => {
    console.log('📄 الصفحة محملة - إنشاء اللعبة...');
    
    // إنشاء اللعبة مباشرة
    game = new MarioGame();
    console.log('✅ اللعبة جاهزة! اضغط زر "🚀 ابدأ اللعب"');
    
    // تحديث حجم الكنفاس عند التغيير
    window.addEventListener('resize', () => {
        if (game && game.canvas) {
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                game.canvas.width = gameArea.clientWidth;
                game.canvas.height = gameArea.clientHeight;
            }
            
            if (game.gameState === 'playing') {
                game.createGameWorld();
            }
        }
    });
    
    // تتبع حالة ملء الشاشة
    document.addEventListener('fullscreenchange', () => {
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (document.fullscreenElement) {
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
        
        // تحديث حجم الكنفاس
        setTimeout(() => {
            if (game && game.canvas) {
                const gameArea = document.querySelector('.game-area');
                if (gameArea) {
                    game.canvas.width = gameArea.clientWidth;
                    game.canvas.height = gameArea.clientHeight;
                }
                
                if (game.gameState === 'playing') {
                    game.createGameWorld();
                }
            }
        }, 100);
    });
});

console.log('🎮 كود اللعبة محمل بنجاح!');
