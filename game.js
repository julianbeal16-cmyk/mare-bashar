// ============================================
// 🎮 MARIO GAME - الإصدار الكامل البسيط
// كلشي شغال 100%
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
        this.totalCoins = 10;
        this.kills = 0;
        this.level = 1;
        
        // 🔥 المؤقتات
        this.gameTimer = null;
        this.lastTime = 0;
        this.frameCount = 0;
        
        // 🔥 عناصر اللعبة
        this.player = null;
        this.platforms = [];
        this.coinItems = [];
        this.enemies = [];
        this.items = [];
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
        
        // إنشاء العالم
        this.createGameWorld();
        
        console.log('✅ اللعبة مهيأة وجاهزة للعب');
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
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.left = true;
        });
        
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.left = false;
        });
        
        leftBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.touchControls.left = true;
        });
        
        leftBtn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.touchControls.left = false;
        });
        
        // زر اليمين
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.right = true;
        });
        
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.right = false;
        });
        
        rightBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.touchControls.right = true;
        });
        
        rightBtn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.touchControls.right = false;
        });
        
        // زر القفز
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.jump = true;
        });
        
        jumpBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.jump = false;
        });
        
        jumpBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.touchControls.jump = true;
        });
        
        jumpBtn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.touchControls.jump = false;
        });
        
        // ===== لوحة المفاتيح =====
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // الإيقاف المؤقت
            if (key === 'p' && this.gameState === 'playing') {
                this.pauseGame();
            }
            
            // الخروج بالإسكيب
            if (key === 'escape' && this.gameState === 'paused') {
                this.resumeGame();
            }
            
            // ملء الشاشة
            if (key === 'f') {
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
            invincibleTime: 0
        };
        
        // 🔥 الأرض والمنصات - أحمال مناسبة
        const groundHeight = Math.max(50, this.canvas.height * 0.08);
        const worldWidth = this.canvas.width * 2.5;
        
        this.platforms = [
            // الأرض الرئيسية
            { 
                x: 0, 
                y: this.canvas.height - groundHeight, 
                width: worldWidth, 
                height: groundHeight, 
                type: 'ground' 
            },
            
            // منصات عائمة
            { x: 300, y: 350, width: 200, height: 20, type: 'platform' },
            { x: 600, y: 300, width: 150, height: 20, type: 'platform' },
            { x: 900, y: 250, width: 200, height: 20, type: 'platform' },
            { x: 1200, y: 350, width: 150, height: 20, type: 'platform' },
            { x: 1500, y: 280, width: 200, height: 20, type: 'platform' }
        ];
        
        // 🔥 العملات
        this.coinItems = [];
        for (let i = 0; i < this.totalCoins; i++) {
            this.coinItems.push({
                x: 150 + i * 180,
                y: 200 + Math.sin(i * 0.7) * 100,
                collected: false,
                anim: 0,
                id: i,
                size: 12
            });
        }
        
        // 🔥 الأعداء
        this.enemies = [
            { 
                x: 400, 
                y: this.platforms[0].y - 40, 
                width: 40, 
                height: 40, 
                dir: 1, 
                speed: 2, 
                active: true 
            },
            { 
                x: 800, 
                y: this.platforms[0].y - 40, 
                width: 40, 
                height: 40, 
                dir: -1, 
                speed: 2.5, 
                active: true 
            },
            { 
                x: 1200, 
                y: this.platforms[0].y - 40, 
                width: 40, 
                height: 40, 
                dir: 1, 
                speed: 3, 
                active: true 
            }
        ];
        
        // 🔥 العناصر
        this.items = [
            { 
                x: 500, 
                y: 200, 
                type: 'mushroom', 
                collected: false,
                size: 20
            },
            { 
                x: 1000, 
                y: 180, 
                type: 'flower', 
                collected: false,
                size: 20
            }
        ];
        
        // 🔥 الجسيمات
        this.particles = [];
        
        // 🔥 الكاميرا
        this.camera.x = 0;
        this.camera.y = 0;
        
        console.log(`🎯 العالم الجديد: ${this.platforms.length} منصة، ${this.coinItems.length} عملة، ${this.enemies.length} عدو`);
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
        const maxX = this.canvas.width * 2.5 - this.player.width;
        if (this.player.x > maxX) {
            this.player.x = maxX;
            
            // فوز إذا وصل للنهاية
            if (this.player.x >= maxX - 10 && this.coins >= this.totalCoins) {
                this.endGame(true);
            }
        }
        
        // 🔥 فحص الاصطدام مع المنصات
        this.player.grounded = false;
        
        for (const platform of this.platforms) {
            const collision = 
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > platform.y &&
                this.player.y + this.player.height < platform.y + platform.height + this.player.velY &&
                this.player.velY > 0;
            
            if (collision) {
                this.player.y = platform.y - this.player.height;
                this.player.velY = 0;
                this.player.grounded = true;
                break;
            }
        }
        
        // 🔥 فحص السقوط
        if (this.player.y > this.canvas.height + 100) {
            console.log('💀 سقوط!');
            this.playerDamaged();
        }
    }
    
    updateEnemies(deltaTime) {
        for (let enemy of this.enemies) {
            if (!enemy.active) continue;
            
            // حركة الأعداء
            enemy.x += enemy.speed * enemy.dir * deltaTime * 60;
            
            // تغيير الاتجاه عند الحواف
            if (enemy.x < 0 || enemy.x + enemy.width > this.canvas.width * 2.5) {
                enemy.dir *= -1;
            }
            
            // وضع الأعداء على الأرض
            enemy.y = this.platforms[0].y - enemy.height;
        }
    }
    
    updateCoins(deltaTime) {
        for (let coin of this.coinItems) {
            if (!coin.collected) {
                // حركة طفيفة للعملات
                coin.anim += deltaTime * 5;
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
        this.camera.x = Math.max(0, Math.min(this.canvas.width * 2.5 - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.canvas.height - this.canvas.height, this.camera.y));
    }
    
    checkCollisions() {
        // 🔥 جمع العملات
        for (let coin of this.coinItems) {
            if (!coin.collected) {
                const dx = this.player.x + this.player.width/2 - coin.x;
                const dy = this.player.y + this.player.height/2 - coin.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 30) {
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
                        // سيتم الفوز عند الوصول للنهاية
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
                
                if (distance < 40) {
                    console.log(`🎁 جمع عنصر: ${item.type}`);
                    item.collected = true;
                    
                    if (item.type === 'mushroom') {
                        this.score += 500;
                        this.player.invincible = true;
                        this.player.invincibleTime = 10;
                    } else if (item.type === 'flower') {
                        this.score += 1000;
                        this.player.speed *= 1.5;
                        this.player.invincible = true;
                        this.player.invincibleTime = 15;
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
                } else if (!this.player.invincible) {
                    // تضرر اللاعب
                    console.log('💥 تضرر من عدو!');
                    this.playerDamaged();
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
        
        // 🔥 سحب بسيطة
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 5; i++) {
            const x = (this.camera.x * 0.3 + i * 200) % (this.canvas.width * 3 + 200);
            this.ctx.beginPath();
            this.ctx.arc(x, 60, 30, 0, Math.PI * 2);
            this.ctx.arc(x + 40, 50, 35, 0, Math.PI * 2);
            this.ctx.arc(x + 80, 60, 30, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
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
        });
        
        // 🔥 العملات
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.anim) * 10;
                
                // العملة الذهبية
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(coin.x, coin.y + bounce, coin.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#FFA500';
                this.ctx.beginPath();
                this.ctx.arc(coin.x, coin.y + bounce, coin.size * 0.6, 0, Math.PI * 2);
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
                } else if (item.type === 'flower') {
                    // زهرة
                    this.ctx.fillStyle = '#9B59B6';
                    this.ctx.save();
                    this.ctx.translate(item.x, item.y);
                    for (let i = 0; i < 8; i++) {
                        this.ctx.rotate(Math.PI / 4);
                        this.ctx.fillRect(0, -item.size/2, item.size, item.size/2);
                    }
                    this.ctx.restore();
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
        });
        
        // 🔥 اللاعب
        // تأثير المناعة (وميض)
        if (this.player.invincible && Math.floor(this.frameCount * 0.2) % 2 === 0) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // جسم اللاعب
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // وجه اللاعب
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.fillRect(
            this.player.x + this.player.width * 0.25, 
            this.player.y + this.player.height * 0.17, 
            this.player.width * 0.5, 
            this.player.height * 0.33
        );
        
        // عيون اللاعب
        this.ctx.fillStyle = '#FFF';
        const eyeOffset = this.player.grounded ? 0 : 2;
        const eyeSize = this.player.width * 0.125;
        this.ctx.fillRect(
            this.player.x + this.player.width * 0.375, 
            this.player.y + this.player.height * 0.25 + eyeOffset, 
            eyeSize, 
            eyeSize
        );
        this.ctx.fillRect(
            this.player.x + this.player.width * 0.625 - eyeSize, 
            this.player.y + this.player.height * 0.25 + eyeOffset, 
            eyeSize, 
            eyeSize
        );
        
        this.ctx.globalAlpha = 1;
        
        // استعادة تحويلات الكاميرا
        this.ctx.restore();
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
        document.getElementById('end-icon').className = isWin ? 'fas fa-trophy' : 'fas fa-skull-crossbones';
        document.getElementById('end-title').textContent = isWin ? 'تهانينا!' : 'انتهت اللعبة';
        
        let message = '';
        if (isWin) {
            message = `جمعت ${this.coins} عملة في ${this.formatTime(120 - this.timeLeft)}!`;
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
        
        // 🔥 إظهار شاشة النهاية
        this.showScreen('end');
        
        console.log(`📊 النتيجة النهائية: ${this.score} نقطة، ${this.coins}/${this.totalCoins} عملة`);
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
    
    // تحديث إشعار الدوران عند تغيير الحجم
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
