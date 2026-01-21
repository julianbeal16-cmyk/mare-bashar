// ============================================
// 🎮 محرك لعبة ماريو الخارقة - النسخة النهائية
// ============================================

'use strict';

// الكائن الرئيسي للعبة
const MarioGame = {
    // ======================
    // الإعدادات الأساسية
    // ======================
    canvas: null,
    ctx: null,
    state: 'menu', // menu, playing, paused, gameOver
    
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
        jump: false
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
            
            // ضبط حجم Canvas
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
            this.showError(error.message);
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
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 300);
        });
    },
    
    loadPlayerImage() {
        this.playerImage = new Image();
        this.playerImage.onload = () => {
            console.log('✅ تم تحميل صورة اللاعب بنجاح');
            this.imageLoaded = true;
        };
        
        this.playerImage.onerror = () => {
            console.warn('⚠️ فشل تحميل صورة اللاعب، سيتم استخدام رسومات بديلة');
            this.imageLoaded = false;
            this.createFallbackImage();
        };
        
        this.playerImage.src = 'player.png';
    },
    
    createFallbackImage() {
        // إنشاء صورة بديلة باستخدام Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        
        // رسم شخصية بديلة
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(10, 30, 40, 60);
        
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(15, 15, 30, 30);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(20, 20, 10, 10);
        ctx.fillRect(35, 20, 10, 10);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(23, 23, 4, 4);
        ctx.fillRect(38, 23, 4, 4);
        
        this.playerImage = canvas;
        this.imageLoaded = true;
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
            this.keys[key] = true;
            
            // منع السلوك الافتراضي
            if ([' ', 'arrowleft', 'arrowright', 'arrowup', 'w', 'a', 'd'].includes(key)) {
                e.preventDefault();
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
                });
                
                btn.addEventListener('touchend', (e) => {
                    this.touchControls[control] = false;
                    e.preventDefault();
                });
                
                btn.addEventListener('touchcancel', (e) => {
                    this.touchControls[control] = false;
                    e.preventDefault();
                });
            }
        };
        
        setupButton('btn-left', 'left');
        setupButton('btn-right', 'right');
        setupButton('btn-jump', 'jump');
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
        
        // التأكد من تحميل الصورة
        if (!this.imageLoaded) {
            this.showNotification('⏳ جاري تحميل الصورة...');
            setTimeout(() => this.startGame(), 500);
            return;
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
    },
    
    createWorld() {
        const canvas = this.canvas;
        const groundY = canvas.height - 100;
        
        // اللاعب
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
            color: '#E74C3C'
        };
        
        // الأرض
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
        
        // منصات إضافية
        const platformData = [
            { x: 300, y: groundY - 120, width: 180 },
            { x: 600, y: groundY - 140, width: 160 },
            { x: 900, y: groundY - 110, width: 190 },
            { x: 1200, y: groundY - 130, width: 170 },
            { x: 1500, y: groundY - 150, width: 200 },
            { x: 1800, y: groundY - 120, width: 180 },
            { x: 2100, y: groundY - 140, width: 190 }
        ];
        
        platformData.forEach(p => {
            this.platforms.push({
                x: p.x,
                y: p.y,
                width: p.width,
                height: 25,
                type: 'platform',
                color: '#A0522D'
            });
        });
        
        // العملات
        this.coins = [];
        for (let i = 0; i < this.totalCoins; i++) {
            const platformIndex = Math.floor(Math.random() * (this.platforms.length - 1)) + 1;
            const platform = this.platforms[platformIndex];
            
            this.coins.push({
                x: platform.x + Math.random() * (platform.width - 40) + 20,
                y: platform.y - 35,
                collected: false,
                radius: 12,
                animation: Math.random() * Math.PI * 2
            });
        }
        
        // الأعداء
        this.enemies = [];
        const enemyCount = 7;
        
        for (let i = 0; i < enemyCount; i++) {
            this.enemies.push({
                x: 400 + i * 300,
                y: groundY - 50,
                width: 45,
                height: 45,
                speed: 1.5 + Math.random() * 1,
                direction: Math.random() > 0.5 ? 1 : -1,
                color: ['#EF476F', '#FF6B6B', '#E74C3C'][i % 3],
                active: true
            });
        }
        
        // القصر
        this.castle = {
            x: this.worldWidth - 400,
            y: groundY - 220,
            width: 280,
            height: 200,
            color: '#8B4513',
            flagColor: '#E74C3C',
            reached: false
        };
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
        
        try {
            this.update();
            this.draw();
        } catch (error) {
            console.error('❌ خطأ في حلقة اللعبة:', error);
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
            
            enemy.x += enemy.speed * enemy.direction * this.deltaTime * 60;
            
            if (enemy.x < 50 || enemy.x > this.worldWidth - enemy.width - 50) {
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
                    this.showNotification('👊 +200 نقطة!');
                } else {
                    // اصطدام بالعدو
                    this.playerHit('👾 اصطدمت بعدو!');
                }
            }
        });
        
        // القصر
        if (this.castle && !this.castle.reached && this.coinsCollected >= this.totalCoins) {
            const dx = player.x + player.width/2 - (this.castle.x + this.castle.width/2);
            const dy = player.y + player.height/2 - (this.castle.y + this.castle.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
                this.castle.reached = true;
                this.endGame(true, '🏰 وصلت للقصر الملكي!');
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
            this.endGame(false, '💔 نفدت الأرواح!');
        } else {
            this.player.velY = -10;
            this.player.x -= 40 * (this.player.facingRight ? 1 : -1);
        }
    },
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
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
            this.endGame(false, '⏰ انتهى الوقت!');
        }
    },
    
    endGame(isWin, message) {
        console.log(isWin ? '🏆 فوز!' : '💔 خسارة!');
        
        this.state = 'gameOver';
        
        this.stopTimer();
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('mario_best_score', this.bestScore.toString());
            document.getElementById('best-score').textContent = this.bestScore;
        }
        
        this.updateEndScreen(isWin, message);
        this.showScreen('end');
    },
    
    updateEndScreen(isWin, message) {
        const icon = document.getElementById('result-icon');
        const title = document.getElementById('end-title');
        const msg = document.getElementById('end-message');
        
        if (icon) {
            icon.innerHTML = isWin ? '<i class="fas fa-trophy"></i>' : '<i class="fas fa-skull-crossbones"></i>';
        }
        
        if (title) title.textContent = isWin ? '🎉 انتصار رائع!' : '💔 انتهت اللعبة';
        if (msg) msg.textContent = message;
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-coins').textContent = `${this.coinsCollected}/${this.totalCoins}`;
        document.getElementById('final-enemies').textContent = this.enemiesKilled;
        
        const efficiency = Math.min(Math.round((this.score / 5000) * 100), 100);
        document.getElementById('final-efficiency').textContent = `${efficiency}%`;
    },
    
    // ======================
    // الرسم
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
        
        // السماء
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.worldWidth, canvas.height);
        
        // سحب
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 6; i++) {
            const x = (this.camera.x * 0.03 + i * 400) % (this.worldWidth + 500);
            const y = 50 + Math.sin(i) * 30;
            const size = 18 + Math.sin(i * 0.7) * 4;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.arc(x + size * 1.3, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // جبال
        ctx.fillStyle = 'rgba(44, 62, 80, 0.2)';
        for (let i = 0; i < 5; i++) {
            const x = (i * 600) % this.worldWidth;
            const height = 90 + Math.sin(i) * 40;
            
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 80);
            ctx.lineTo(x + 300, canvas.height - 80 - height);
            ctx.lineTo(x + 600, canvas.height - 80);
            ctx.closePath();
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
                gradient.addColorStop(0.5, '#734322');
                gradient.addColorStop(1, '#654321');
            } else {
                gradient.addColorStop(0, platform.color);
                gradient.addColorStop(1, '#8B4513');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let i = 0; i < platform.width; i += 35) {
                ctx.fillRect(platform.x + i, platform.y, 30, 5);
            }
        });
    },
    
    drawCoins() {
        const ctx = this.ctx;
        
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.animation += 0.1;
                const y = coin.y + Math.sin(coin.animation) * 8;
                
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
                
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(coin.x - 4, y - 4, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    },
    
    drawEnemies() {
        const ctx = this.ctx;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            const gradient = ctx.createLinearGradient(
                enemy.x, enemy.y,
                enemy.x, enemy.y + enemy.height
            );
            gradient.addColorStop(0, enemy.color);
            gradient.addColorStop(1, '#C0392B');
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            this.roundRect(ctx, enemy.x, enemy.y, enemy.width, enemy.height, 6);
            ctx.fill();
            
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 12, enemy.y + 12, 7, 7);
            ctx.fillRect(enemy.x + enemy.width - 19, enemy.y + 12, 7, 7);
            
            ctx.fillStyle = '#FFF';
            ctx.fillRect(enemy.x + 14, enemy.y + 14, 3, 3);
            ctx.fillRect(enemy.x + enemy.width - 17, enemy.y + 14, 3, 3);
            
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 15, enemy.y + 28, enemy.width - 30, 6);
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
            ctx.globalAlpha = 1;
        });
    },
    
    drawCastle() {
        if (!this.castle) return;
        
        const ctx = this.ctx;
        const castle = this.castle;
        
        const gradient = ctx.createLinearGradient(
            castle.x, castle.y,
            castle.x, castle.y + castle.height
        );
        gradient.addColorStop(0, castle.color);
        gradient.addColorStop(1, '#654321');
        ctx.fillStyle = gradient;
        ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < castle.width; i += 30) {
            for (let j = 0; j < castle.height; j += 25) {
                ctx.fillRect(castle.x + i + 2, castle.y + j + 2, 25, 20);
            }
        }
        
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(castle.x - 15, castle.y - 120, 50, 120);
        ctx.fillRect(castle.x + castle.width - 35, castle.y - 120, 50, 120);
        
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.fillRect(castle.x + 35 + i * 70, castle.y + 25 + j * 75, 25, 35);
            }
        }
        
        ctx.fillStyle = '#654321';
        ctx.fillRect(castle.x + castle.width/2 - 35, castle.y + castle.height - 60, 70, 60);
        
        if (!castle.reached) {
            ctx.fillStyle = '#654321';
            ctx.fillRect(castle.x + castle.width/2 - 4, castle.y - 120, 8, 80);
            
            ctx.fillStyle = castle.flagColor;
            ctx.beginPath();
            ctx.moveTo(castle.x + castle.width/2, castle.y - 120);
            ctx.lineTo(castle.x + castle.width/2 + 40, castle.y - 100);
            ctx.lineTo(castle.x + castle.width/2, castle.y - 80);
            ctx.closePath();
            ctx.fill();
        }
    },
    
    drawPlayer() {
        const ctx = this.ctx;
        const player = this.player;
        
        if (this.imageLoaded && this.playerImage) {
            // استخدام الصورة المحملة
            const scaleX = player.width / this.playerImage.width;
            const scaleY = player.height / this.playerImage.height;
            const scale = Math.min(scaleX, scaleY);
            
            const drawWidth = this.playerImage.width * scale;
            const drawHeight = this.playerImage.height * scale;
            const offsetX = (player.width - drawWidth) / 2;
            const offsetY = (player.height - drawHeight) / 2;
            
            ctx.save();
            
            if (!player.facingRight) {
                ctx.scale(-1, 1);
                ctx.translate(-player.x - player.width, 0);
            }
            
            ctx.drawImage(
                this.playerImage,
                player.facingRight ? player.x + offsetX : -player.x - player.width + offsetX,
                player.y + offsetY,
                drawWidth,
                drawHeight
            );
            
            ctx.restore();
        } else {
            // رسومات بديلة
            const gradient = ctx.createLinearGradient(
                player.x, player.y,
                player.x, player.y + player.height
            );
            gradient.addColorStop(0, player.color);
            gradient.addColorStop(1, '#C0392B');
            ctx.fillStyle = gradient;
            
            ctx.fillRect(player.x, player.y, player.width, player.height);
            
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(player.x + 10, player.y + 10, 30, 30);
            
            const eyeOffset = player.facingRight ? 0 : 5;
            ctx.fillStyle = '#FFF';
            ctx.fillRect(player.x + 15 + eyeOffset, player.y + 15, 8, 8);
            ctx.fillRect(player.x + 30 + eyeOffset, player.y + 15, 8, 8);
            
            ctx.fillStyle = '#000';
            ctx.fillRect(player.x + 17 + eyeOffset, player.y + 17, 4, 4);
            ctx.fillRect(player.x + 32 + eyeOffset, player.y + 17, 4, 4);
            
            ctx.fillStyle = '#FFF';
            ctx.fillRect(player.x + 18, player.y + 30, 15, 5);
        }
    },
    
    drawHUD() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, 10, 200, 45);
        ctx.fillRect(canvas.width - 210, 10, 200, 45);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Cairo';
        ctx.fillText(`🏆 ${this.score}`, 20, 40);
        
        ctx.fillStyle = '#E74C3C';
        ctx.font = '18px Cairo';
        ctx.fillText(`❤️ ${this.lives}`, 120, 40);
        
        ctx.fillStyle = '#4ECDC4';
        ctx.fillText(`💰 ${this.coinsCollected}/${this.totalCoins}`, canvas.width - 200, 40);
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
        
        document.getElementById('hud-timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('hud-score').textContent = this.score;
        document.getElementById('hud-lives').textContent = this.lives;
        document.getElementById('hud-coins').textContent = `${this.coinsCollected}/${this.totalCoins}`;
        
        const missionText = document.getElementById('mission-text');
        if (missionText) {
            const remainingCoins = this.totalCoins - this.coinsCollected;
            if (remainingCoins > 0) {
                missionText.textContent = `🎯 اجمع ${remainingCoins} عملة أخرى!`;
            } else {
                missionText.textContent = '🏃‍♂️ تقدم نحو القصر!';
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
            this.state = screenId === 'game' ? 'playing' : screenId;
        }
    },
    
    playSound(soundName) {
        if (!this.soundEnabled || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName];
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.log('🔇 فشل تشغيل الصوت');
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
        
        if (this.state === 'playing') {
            this.state = 'paused';
            this.stopTimer();
            cancelAnimationFrame(this.animationId);
            btn.innerHTML = '<i class="fas fa-play"></i>';
            this.showNotification('⏸️ اللعبة متوقفة');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.startTimer();
            this.startGameLoop();
            btn.innerHTML = '<i class="fas fa-pause"></i>';
            this.showNotification('▶️ اللعبة مستمرة');
        }
    },
    
    toggleSound() {
        const btn = document.getElementById('sound-btn');
        this.soundEnabled = !this.soundEnabled;
        
        if (this.soundEnabled) {
            btn.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.showNotification('🔊 الصوت مفعل');
        } else {
            btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.showNotification('🔇 الصوت متوقف');
        }
    },
    
    restartGame() {
        this.showScreen('start');
        setTimeout(() => this.startGame(), 500);
    }
};

// ============================================
// تهيئة اللعبة
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 تحميل اللعبة...');
    
    setTimeout(() => {
        try {
            MarioGame.init();
            
            window.MarioGame = MarioGame;
            window.startGame = () => MarioGame.startGame();
            window.restartGame = () => MarioGame.restartGame();
            window.showScreen = (screen) => MarioGame.showScreen(screen);
            
            console.log('✅ اللعبة جاهزة!');
            
            document.getElementById('loading-screen').style.display = 'none';
            MarioGame.showNotification('🎮 اللعبة جاهزة! اضغط ابدأ');
            
        } catch (error) {
            console.error('❌ فشل التهيئة:', error);
            alert('خطأ في تحميل اللعبة: ' + error.message);
        }
    }, 2000);
});
