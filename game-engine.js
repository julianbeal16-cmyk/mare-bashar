// ============================================
// 🎮 محرك لعبة ماريو - النسخة المعدلة للمراحل المستقلة
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
    currentLevel: 1,
    totalLevels: 3,
    
    // الإحصائيات
    score: 0,
    bestScore: 0,
    lives: 3,
    timeLeft: 180, // 3 دقائق
    coinsCollected: 0,
    totalCoins: 50,
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
    obstacles: [],
    powerUps: [],
    castle: null,
    particles: [],
    camera: { x: 0, y: 0 },
    worldWidth: 4000,
    worldHeight: 700,
    
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
    
    // نظام المراحل
    levelData: null,
    
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
        window.addEventListener('resize', resizeCanvas);
    },
    
    loadPlayerImage() {
        this.playerImage = new Image();
        this.playerImage.onload = () => {
            console.log('✅ تم تحميل صورة اللاعب بنجاح');
            this.imageLoaded = true;
        };
        
        this.playerImage.onerror = () => {
            console.warn('⚠️ فشل تحميل صورة اللاعب، إنشاء صورة بديلة');
            this.createFallbackImage();
        };
        
        this.playerImage.src = 'player.png';
    },
    
    createFallbackImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(5, 30, 40, 50);
        
        ctx.fillStyle = '#C0392B';
        ctx.beginPath();
        ctx.arc(25, 20, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.fillRect(18, 15, 6, 6);
        ctx.fillRect(32, 15, 6, 6);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(20, 17, 2, 2);
        ctx.fillRect(34, 17, 2, 2);
        
        ctx.fillStyle = '#2980B9';
        ctx.fillRect(15, 5, 20, 10);
        ctx.fillRect(20, 0, 10, 10);
        
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
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            if ([' ', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }
            
            this.keys[key] = true;
            
            if (key === 'p') this.togglePause();
            if (key === 'escape' && (this.state === 'playing' || this.state === 'paused')) {
                this.showScreen('start');
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
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
                
                btn.addEventListener('mousedown', () => {
                    this.touchControls[control] = true;
                    btn.classList.add('active');
                });
                
                btn.addEventListener('mouseup', () => {
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
        
        Object.values(this.sounds).forEach(sound => {
            if (sound) sound.volume = 0.4;
        });
    },
    
    // ======================
    // إدارة المراحل
    // ======================
    loadLevel(levelNumber) {
        console.log(`🗺️ تحميل المرحلة ${levelNumber}...`);
        
        // إعادة تعيين اللعبة
        this.resetGame();
        this.currentLevel = levelNumber;
        
        // تحميل بيانات المرحلة
        this.loadLevelData(levelNumber);
        
        // تحديث الواجهة
        this.updateUI();
        
        // الانتقال لشاشة اللعب
        this.showScreen('game');
        
        // بدء المؤقتات
        this.startTimer();
        this.startGameLoop();
        
        this.showNotification(`🚀 المرحلة ${levelNumber} - ابدأ مغامرتك!`);
    },
    
    loadLevelData(levelNumber) {
        // تحميل بيانات المرحلة من ملف level-manager.js
        if (window.LevelManager && window.LevelManager.levels[levelNumber]) {
            this.levelData = window.LevelManager.levels[levelNumber];
            this.createLevelFromData(this.levelData);
        } else {
            // استخدام مرحلة افتراضية
            console.warn(`⚠️ المرحلة ${levelNumber} غير موجودة، استخدام مرحلة افتراضية`);
            this.createDefaultLevel();
        }
    },
    
    createLevelFromData(data) {
        const canvas = this.canvas;
        const groundY = canvas.height - 100;
        
        // اللاعب
        this.player = {
            x: data.playerStart.x,
            y: groundY - data.playerStart.y,
            width: 50,
            height: 80,
            speed: 6,
            velX: 0,
            velY: 0,
            jumpPower: -15,
            gravity: 0.8,
            grounded: false,
            facingRight: true,
            color: '#E74C3C'
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
        
        // المنصات الإضافية
        data.platforms.forEach(p => {
            this.platforms.push({
                x: p.x,
                y: groundY - p.y,
                width: p.width,
                height: p.height || 25,
                type: 'platform',
                color: p.color || '#A0522D'
            });
        });
        
        // العملات
        this.coins = [];
        data.coins.forEach(c => {
            this.coins.push({
                x: c.x,
                y: groundY - c.y,
                collected: false,
                radius: 12,
                animation: Math.random() * Math.PI * 2
            });
        });
        
        // الأعداء
        this.enemies = [];
        data.enemies.forEach(e => {
            this.enemies.push({
                x: e.x,
                y: groundY - e.y,
                width: e.width || 45,
                height: e.height || 45,
                speed: e.speed || 2,
                direction: Math.random() > 0.5 ? 1 : -1,
                color: e.color || '#EF476F',
                active: true,
                originalX: e.x,
                moveRange: e.moveRange || 100
            });
        });
        
        // القصر
        if (data.castle) {
            this.castle = {
                x: data.castle.x,
                y: groundY - data.castle.y,
                width: data.castle.width,
                height: data.castle.height,
                color: '#8B4513',
                reached: false
            };
        }
        
        console.log(`✅ المرحلة ${this.currentLevel} مخلوقة:
        - ${this.platforms.length} منصة
        - ${this.coins.length} عملة
        - ${this.enemies.length} عدو
        `);
    },
    
    createDefaultLevel() {
        // مرحلة افتراضية إذا لم توجد بيانات
        const canvas = this.canvas;
        const groundY = canvas.height - 100;
        
        this.player = {
            x: 100,
            y: groundY - 100,
            width: 50,
            height: 80,
            speed: 6,
            velX: 0,
            velY: 0,
            jumpPower: -15,
            gravity: 0.8,
            grounded: false,
            facingRight: true,
            color: '#E74C3C'
        };
        
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
        
        for (let i = 0; i < 20; i++) {
            this.platforms.push({
                x: 300 + i * 200,
                y: groundY - 100 - (i % 3) * 50,
                width: 180,
                height: 25,
                type: 'platform',
                color: '#A0522D'
            });
        }
        
        this.coins = [];
        for (let i = 0; i < 50; i++) {
            this.coins.push({
                x: 200 + i * 80,
                y: groundY - 70,
                collected: false,
                radius: 12,
                animation: Math.random() * Math.PI * 2
            });
        }
        
        this.enemies = [];
        for (let i = 0; i < 15; i++) {
            this.enemies.push({
                x: 400 + i * 250,
                y: groundY - 50,
                width: 45,
                height: 45,
                speed: 1.5 + Math.random(),
                direction: Math.random() > 0.5 ? 1 : -1,
                color: '#EF476F',
                active: true,
                originalX: 400 + i * 250,
                moveRange: 100
            });
        }
        
        this.castle = {
            x: this.worldWidth - 400,
            y: groundY - 200,
            width: 280,
            height: 200,
            color: '#8B4513',
            reached: false
        };
    },
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 180;
        this.coinsCollected = 0;
        this.totalCoins = 50;
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
        
        player.velX = 0;
        
        if (this.keys['arrowleft'] || this.keys['a'] || this.touchControls.left) {
            player.velX = -player.speed;
            player.facingRight = false;
        }
        
        if (this.keys['arrowright'] || this.keys['d'] || this.touchControls.right) {
            player.velX = player.speed;
            player.facingRight = true;
        }
        
        const jumpPressed = this.keys[' '] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump;
        
        if (jumpPressed && player.grounded) {
            player.velY = player.jumpPower;
            player.grounded = false;
            this.playSound('jump');
        }
        
        player.velY += player.gravity;
        player.velY = Math.min(player.velY, 20);
        
        player.x += player.velX;
        player.y += player.velY;
        
        player.x = Math.max(0, Math.min(this.worldWidth - player.width, player.x));
        
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
            
            if (Math.abs(enemy.x - enemy.originalX) > enemy.moveRange) {
                enemy.direction *= -1;
            }
            
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
        
        const targetX = this.player.x - this.canvas.width / 3;
        this.camera.x += (targetX - this.camera.x) * 0.08;
        this.camera.x = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.camera.x));
    },
    
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
            
            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {
                
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
                this.endLevel(true);
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
    
    endLevel(isWin) {
        this.state = 'levelComplete';
        
        const timeBonus = this.timeLeft * 10;
        const coinBonus = this.coinsCollected * 50;
        const enemyBonus = this.enemiesKilled * 100;
        const totalBonus = timeBonus + coinBonus + enemyBonus;
        
        this.score += totalBonus;
        
        this.showNotification(`🎉 أكملت المرحلة ${this.currentLevel}!`);
        this.showNotification(`💰 المكافأة: ${totalBonus} نقطة`);
        
        setTimeout(() => {
            if (isWin && this.currentLevel < this.totalLevels) {
                this.currentLevel++;
                this.loadLevel(this.currentLevel);
            } else {
                this.endGame(isWin, '🏁 انتهت المغامرة!');
            }
        }, 3000);
    },
    
    endGame(isWin, message) {
        this.state = 'gameOver';
        this.stopTimer();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
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
    // الرسم
    // ======================
    draw() {
        if (!this.canvas || !this.ctx) return;
        
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
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.worldWidth, canvas.height);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 8; i++) {
            const x = (this.camera.x * 0.1 + i * 300) % (this.worldWidth + 400);
            const y = 40 + Math.sin(i) * 20;
            const size = 20;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.arc(x + size * 1.2, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = 'rgba(44, 62, 80, 0.2)';
        for (let i = 0; i < 6; i++) {
            const x = i * 700;
            const height = 100;
            
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 100);
            ctx.lineTo(x + 350, canvas.height - 100 - height);
            ctx.lineTo(x + 700, canvas.height - 100);
            ctx.closePath();
            ctx.fill();
        }
    },
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let i = 0; i < platform.width; i += 30) {
                ctx.fillRect(platform.x + i, platform.y, 25, 5);
            }
        });
    },
    
    drawCoins() {
        const ctx = this.ctx;
        const time = Date.now() / 1000;
        
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.animation += 0.1;
                const floatY = Math.sin(coin.animation + time) * 5;
                
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
            
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            ctx.fillStyle = 'black';
            ctx.fillRect(enemy.x + 10, enemy.y + 10, 8, 8);
            ctx.fillRect(enemy.x + enemy.width - 18, enemy.y + 10, 8, 8);
            
            ctx.fillStyle = 'white';
            ctx.fillRect(enemy.x + 12, enemy.y + 12, 4, 4);
            ctx.fillRect(enemy.x + enemy.width - 16, enemy.y + 12, 4, 4);
            
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
        
        ctx.fillStyle = castle.color;
        ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.fillRect(castle.x + 30 + i * 70, castle.y + 20 + j * 60, 20, 30);
            }
        }
        
        ctx.fillStyle = '#654321';
        ctx.fillRect(castle.x + castle.width/2 - 25, castle.y + castle.height - 50, 50, 50);
    },
    
    drawPlayer() {
        if (!this.player) return;
        
        const ctx = this.ctx;
        const player = this.player;
        
        ctx.save();
        
        if (this.imageLoaded && this.playerImage) {
            try {
                let drawX = player.x;
                let drawY = player.y;
                
                if (!player.facingRight) {
                    ctx.scale(-1, 1);
                    drawX = -drawX - player.width;
                }
                
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
        
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        ctx.fillStyle = '#C0392B';
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y - 10, 15, 0, Math.PI * 2);
        ctx.fill();
        
        const eyeOffset = player.facingRight ? 0 : 5;
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x + 15 + eyeOffset, player.y - 5, 6, 6);
        ctx.fillRect(player.x + 29 + eyeOffset, player.y - 5, 6, 6);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(player.x + 17 + eyeOffset, player.y - 3, 2, 2);
        ctx.fillRect(player.x + 31 + eyeOffset, player.y - 3, 2, 2);
        
        ctx.fillStyle = '#2980B9';
        ctx.fillRect(player.x + 10, player.y - 25, 30, 10);
        ctx.fillRect(player.x + 15, player.y - 30, 20, 10);
    },
    
    drawHUD() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 45);
        ctx.fillRect(canvas.width - 210, 10, 200, 45);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Cairo';
        ctx.textAlign = 'left';
        ctx.fillText(`🏆 ${this.score}`, 20, 40);
        
        ctx.fillStyle = '#E74C3C';
        ctx.fillText(`❤️ ${this.lives}`, 120, 40);
        
        ctx.fillStyle = '#4ECDC4';
        ctx.textAlign = 'right';
        ctx.fillText(`💰 ${this.coinsCollected}/${this.totalCoins}`, canvas.width - 20, 40);
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
        
        document.getElementById('hud-timer').textContent = timeString;
        document.getElementById('hud-score').textContent = this.score;
        document.getElementById('hud-lives').textContent = this.lives;
        document.getElementById('hud-coins').textContent = `${this.coinsCollected}/${this.totalCoins}`;
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
            screen.style.display = screenId === 'game' ? 'block' : 'flex';
            
            if (screenId === 'game') {
                this.state = 'playing';
            } else if (screenId === 'start') {
                this.state = 'menu';
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
            sound.currentTime = 0;
            sound.play().catch(() => {});
        } catch (e) {}
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
    },
    
    nextLevel() {
        if (this.currentLevel < this.totalLevels) {
            this.currentLevel++;
            this.loadLevel(this.currentLevel);
        } else {
            this.endGame(true, '🏆 أكملت جميع المراحل!');
        }
    }
};

// ============================================
// تهيئة اللعبة
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 بدء تحميل اللعبة...');
    
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            progressFill.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 200);
    }
    
    setTimeout(() => {
        try {
            MarioGame.init();
            
            window.MarioGame = MarioGame;
            window.startGame = () => MarioGame.startGame();
            window.nextLevel = () => MarioGame.nextLevel();
            
            console.log('✅ اللعبة جاهزة!');
            
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
            
            MarioGame.showNotification('🎮 لعبة ماريو جاهزة!');
            
        } catch (error) {
            console.error('❌ خطأ:', error);
            alert('حدث خطأ: ' + error.message);
        }
    }, 2000);
});
