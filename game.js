// ============================================
// 🎮 لعبة ماريو - النسخة النهائية
// ============================================

'use strict';

class MarioGame {
    constructor() {
        console.log('🎮 إنشاء اللعبة...');
        
        // العناصر الأساسية
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu';
        
        // التحكم
        this.keys = {};
        this.touchControls = {
            left: false,
            right: false,
            jump: false
        };
        
        // الإحصائيات
        this.score = 0;
        this.highScore = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coins = 0;
        this.totalCoins = 30;
        this.kills = 0;
        
        // المؤقتات
        this.gameTimer = null;
        this.animationId = null;
        this.frameCount = 0;
        
        // عناصر اللعبة
        this.player = null;
        this.platforms = [];
        this.coinItems = [];
        this.enemies = [];
        this.castle = null;
        this.camera = { x: 0, y: 0 };
        
        // صورة اللاعب
        this.playerImage = null;
        this.imageLoaded = false;
        
        // بدء اللعبة
        this.init();
    }
    
    init() {
        console.log('🚀 تهيئة اللعبة...');
        
        // الحصول على Canvas
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('❌ Canvas غير موجود!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('❌ سياق Canvas غير مدعوم!');
            return;
        }
        
        // تحميل صورة اللاعب
        this.loadPlayerImage();
        
        // تهيئة الحجم
        this.setupCanvas();
        
        // تهيئة الأحداث
        this.setupEvents();
        
        // تحميل أفضل نتيجة
        this.loadHighScore();
        
        console.log('✅ اللعبة جاهزة!');
    }
    
    loadPlayerImage() {
        this.playerImage = new Image();
        this.playerImage.onload = () => {
            console.log('✅ صورة اللاعب محملة بنجاح');
            this.imageLoaded = true;
        };
        this.playerImage.onerror = () => {
            console.log('⚠️ فشل تحميل صورة اللاعب، سيتم استخدام رسم بديل');
            this.imageLoaded = false;
        };
        this.playerImage.src = 'player.png';
    }
    
    setupCanvas() {
        const updateSize = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                this.canvas.width = gameArea.clientWidth;
                this.canvas.height = gameArea.clientHeight;
                console.log(`📐 حجم Canvas: ${this.canvas.width}x${this.canvas.height}`);
            }
        };
        
        updateSize();
        window.addEventListener('resize', updateSize);
    }
    
    setupEvents() {
        // زر البداية
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // زر الإيقاف
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // زر إعادة اللعب
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // زر القائمة (من شاشة اللعب)
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // زر القائمة (من شاشة النهاية)
        document.getElementById('back-menu-btn').addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // أحداث اللمس
        this.setupTouchEvents();
        
        // أحداث لوحة المفاتيح
        this.setupKeyboardEvents();
    }
    
    setupTouchEvents() {
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');
        const jumpBtn = document.getElementById('jump-btn');
        
        const setupBtn = (btn, control) => {
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
            
            btn.addEventListener('mouseleave', () => {
                this.touchControls[control] = false;
            });
        };
        
        setupBtn(leftBtn, 'left');
        setupBtn(rightBtn, 'right');
        setupBtn(jumpBtn, 'jump');
    }
    
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // منع التمرير
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }
            
            // إيقاف اللعبة بـ P
            if (key === 'p') {
                this.togglePause();
                e.preventDefault();
            }
            
            // ملء الشاشة بـ F
            if (key === 'f') {
                this.toggleFullscreen();
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    loadHighScore() {
        try {
            const saved = localStorage.getItem('mario_high_score');
            this.highScore = saved ? parseInt(saved) : 0;
            document.getElementById('high-score').textContent = this.highScore;
        } catch (error) {
            console.log('⚠️ فشل تحميل أفضل نتيجة');
        }
    }
    
    showScreen(screenName) {
        // إخفاء كل الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });
        
        // إظهار الشاشة المطلوبة
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.style.display = 'flex';
            targetScreen.classList.add('active');
            this.gameState = screenName;
            
            if (screenName === 'game') {
                setTimeout(() => this.startGame(), 100);
            }
        }
    }
    
    createGameWorld() {
        const worldWidth = this.canvas.width * 3;
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
            invincibleTime: 0
        };
        
        // الأرض
        this.platforms = [
            { x: 0, y: groundY, width: worldWidth, height: 80, type: 'ground' }
        ];
        
        // منصات
        for (let i = 0; i < 8; i++) {
            this.platforms.push({
                x: 350 + i * 300,
                y: groundY - 120 - (i % 3) * 40,
                width: 200,
                height: 25,
                type: 'platform'
            });
        }
        
        // عملات
        this.coinItems = [];
        for (let i = 0; i < this.totalCoins; i++) {
            this.coinItems.push({
                x: 400 + i * 90,
                y: groundY - 160 + (i % 3) * 50,
                collected: false,
                anim: Math.random() * Math.PI * 2
            });
        }
        
        // أعداء
        this.enemies = [];
        for (let i = 0; i < 5; i++) {
            this.enemies.push({
                x: 500 + i * 350,
                y: groundY - 50,
                width: 45,
                height: 45,
                dir: i % 2 === 0 ? 1 : -1,
                speed: 2.5,
                active: true
            });
        }
        
        // القصر
        this.castle = {
            x: worldWidth - 300,
            y: groundY - 180,
            width: 200,
            height: 180,
            reached: false
        };
    }
    
    startGame() {
        // إعادة تعيين الإحصائيات
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coins = 0;
        this.kills = 0;
        
        // إنشاء العالم
        this.createGameWorld();
        
        // إظهار شاشة اللعب
        this.showScreen('game');
        
        // بدء المؤقت
        this.startTimer();
        
        // تحديث الواجهة
        this.updateUI();
        
        // بدء حلقة اللعبة
        this.startGameLoop();
    }
    
    startTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            if (this.gameState === 'playing') {
                this.timeLeft--;
                this.updateUI();
                
                if (this.timeLeft <= 0) {
                    this.endGame(false);
                }
            }
        }, 1000);
    }
    
    updateUI() {
        // الوقت
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // النتيجة
        document.getElementById('score').textContent = this.score;
        
        // الأرواح
        document.getElementById('lives').textContent = this.lives;
        
        // العملات
        document.getElementById('coins').textContent = `${this.coins}/${this.totalCoins}`;
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    pauseGame() {
        this.gameState = 'paused';
        clearInterval(this.gameTimer);
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        document.getElementById('pause-btn').innerHTML = '<i class="fas fa-play"></i>';
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.startTimer();
        
        document.getElementById('pause-btn').innerHTML = '<i class="fas fa-pause"></i>';
        this.startGameLoop();
    }
    
    startGameLoop() {
        if (this.gameState !== 'playing') return;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.gameLoop();
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.updatePlayer();
        this.updateEnemies();
        this.updateCamera();
        this.checkCollisions();
        this.checkEndConditions();
    }
    
    updatePlayer() {
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
        }
        
        // جاذبية
        p.velY += 0.8;
        p.velY = Math.min(p.velY, 16);
        
        // تحديث الموقع
        p.x += p.velX;
        p.y += p.velY;
        
        // حدود العالم
        const worldWidth = this.canvas.width * 3;
        p.x = Math.max(0, Math.min(worldWidth - p.width, p.x));
        
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
        
        // سقوط
        if (p.y > this.canvas.height + 100) {
            this.playerDamaged();
            p.x = 200;
            p.y = this.canvas.height - 200;
        }
        
        // مناعة
        if (p.invincible) {
            p.invincibleTime -= 0.016;
            if (p.invincibleTime <= 0) {
                p.invincible = false;
            }
        }
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            enemy.x += enemy.speed * enemy.dir;
            
            if (enemy.x < 50 || enemy.x + enemy.width > this.canvas.width * 3 - 50) {
                enemy.dir *= -1;
            }
        });
    }
    
    updateCamera() {
        const p = this.player;
        const targetX = p.x - this.canvas.width / 2 + p.width / 2;
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.x = Math.max(0, Math.min(this.canvas.width * 3 - this.canvas.width, this.camera.x));
    }
    
    checkCollisions() {
        const p = this.player;
        
        // جمع العملات
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const dx = p.x + p.width / 2 - coin.x;
                const dy = p.y + p.height / 2 - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30) {
                    coin.collected = true;
                    this.coins++;
                    this.score += 100;
                    this.updateUI();
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
                } else if (!p.invincible) {
                    // اصطدام بالعدو
                    this.playerDamaged();
                }
            }
        });
    }
    
    playerDamaged() {
        if (this.player.invincible) return;
        
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.endGame(false);
        } else {
            this.player.invincible = true;
            this.player.invincibleTime = 3;
            this.player.velY = -10;
        }
    }
    
    checkEndConditions() {
        // الفوز بجمع كل العملات
        if (this.coins >= this.totalCoins) {
            this.endGame(true);
            return;
        }
        
        // الفوز بالوصول للقصر
        if (this.castle && !this.castle.reached) {
            const p = this.player;
            const c = this.castle;
            
            const dx = p.x + p.width / 2 - (c.x + c.width / 2);
            const dy = p.y + p.height / 2 - (c.y + c.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                c.reached = true;
                this.score += 2000;
                this.endGame(true);
                return;
            }
        }
        
        // الفوز بالوصول لنهاية العالم
        if (this.player.x >= this.canvas.width * 3 - 200) {
            this.endGame(true);
            return;
        }
    }
    
    endGame(isWin) {
        this.gameState = 'ended';
        
        clearInterval(this.gameTimer);
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // حفظ أفضل نتيجة
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('mario_high_score', this.highScore.toString());
            document.getElementById('high-score').textContent = this.highScore;
        }
        
        // تحديث شاشة النهاية
        document.getElementById('end-icon').className = isWin ? 'fas fa-trophy' : 'fas fa-skull-crossbones';
        document.getElementById('end-title').textContent = isWin ? 'تهانينا!' : 'انتهت اللعبة';
        document.getElementById('end-message').textContent = isWin ? 
            `🎉 جمعت ${this.coins} عملة من ${this.totalCoins}` : 
            'حاول مرة أخرى!';
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-coins').textContent = `${this.coins}/${this.totalCoins}`;
        document.getElementById('final-time').textContent = this.formatTime(120 - this.timeLeft);
        
        // إظهار شاشة النهاية
        this.showScreen('end');
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    restartGame() {
        this.startGame();
    }
    
    draw() {
        if (!this.ctx || !this.player) return;
        
        // مسح الشاشة
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // حفظ حالة Canvas
        this.ctx.save();
        this.ctx.translate(-this.camera.x, 0);
        
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
        this.ctx.restore();
    }
    
    drawBackground() {
        const worldWidth = this.canvas.width * 3;
        
        // السماء
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#5DADE2');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, worldWidth, this.canvas.height);
        
        // سحب
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 10; i++) {
            const x = (this.camera.x * 0.05 + i * 300) % (worldWidth + 400);
            const y = 50 + Math.sin(this.frameCount * 0.003 + i) * 20;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.arc(x + 25, y - 10, 18, 0, Math.PI * 2);
            this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawPlatforms() {
        this.platforms.forEach(platform => {
            // جسم المنصة
            this.ctx.fillStyle = platform.type === 'ground' ? '#8B4513' : '#A0522D';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل
            this.ctx.fillStyle = platform.type === 'ground' ? '#A0522D' : '#8B4513';
            for (let i = 0; i < platform.width; i += 25) {
                for (let j = 0; j < platform.height; j += 8) {
                    if ((i/25 + j/8) % 2 === 0) {
                        this.ctx.fillRect(platform.x + i, platform.y + j, 12, 4);
                    }
                }
            }
        });
    }
    
    drawCoins() {
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.anim + this.frameCount * 0.1) * 10;
                const y = coin.y + bounce;
                
                // عملة
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(coin.x, y, 12, 0, Math.PI * 2);
                this.ctx.fill();
                
                // بريق
                this.ctx.fillStyle = '#FFF';
                this.ctx.beginPath();
                this.ctx.arc(coin.x - 3, y - 3, 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    drawEnemies() {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // جسم العدو
            this.ctx.fillStyle = '#EF476F';
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // عيون
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(enemy.x + 10, enemy.y + 10, 10, 10);
            this.ctx.fillRect(enemy.x + enemy.width - 20, enemy.y + 10, 10, 10);
            
            // فم
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(enemy.x + 15, enemy.y + 30, enemy.width - 30, 5);
        });
    }
    
    drawCastle() {
        if (!this.castle) return;
        const c = this.castle;
        
        // قاعدة
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(c.x, c.y, c.width, c.height);
        
        // أبراج
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(c.x - 10, c.y - 100, 40, 100);
        this.ctx.fillRect(c.x + c.width - 30, c.y - 100, 40, 100);
        
        // علم
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(c.x + c.width/2 - 2, c.y - 120, 4, 70);
        
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.beginPath();
        this.ctx.moveTo(c.x + c.width/2, c.y - 120);
        this.ctx.lineTo(c.x + c.width/2 + 25, c.y - 110);
        this.ctx.lineTo(c.x + c.width/2, c.y - 100);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawPlayer() {
        const p = this.player;
        
        if (this.imageLoaded && this.playerImage) {
            // رسم صورة اللاعب
            this.ctx.save();
            
            if (!p.facingRight) {
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(
                    this.playerImage,
                    -p.x - p.width,
                    p.y,
                    p.width,
                    p.height
                );
            } else {
                this.ctx.drawImage(
                    this.playerImage,
                    p.x,
                    p.y,
                    p.width,
                    p.height
                );
            }
            
            // تأثير المناعة
            if (p.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
                this.ctx.globalAlpha = 0.6;
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(
                    p.facingRight ? p.x : -p.x - p.width,
                    p.y,
                    p.width,
                    p.height
                );
                this.ctx.globalAlpha = 1;
            }
            
            this.ctx.restore();
        } else {
            // رسم بديل للاعب
            const playerColor = p.invincible ? '#9B59B6' : '#E74C3C';
            
            // جسم اللاعب
            this.ctx.fillStyle = playerColor;
            this.ctx.fillRect(p.x, p.y, p.width, p.height);
            
            // رأس اللاعب
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(p.x + 8, p.y + 8, 24, 24);
            
            // عيون اللاعب
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(p.x + 12, p.y + 12, 6, 6);
            this.ctx.fillRect(p.x + 22, p.y + 12, 6, 6);
            
            // فم اللاعب
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(p.x + 14, p.y + 25, 12, 4);
            
            // تأثير المناعة
            if (p.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(p.x - 2, p.y - 2, p.width + 4, p.height + 4);
            }
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}

// ============================================
// بدء اللعبة عند تحميل الصفحة
// ============================================

let game = null;

window.addEventListener('load', () => {
    console.log('📄 الصفحة محملة - بدء اللعبة...');
    
    setTimeout(() => {
        try {
            game = new MarioGame();
            window.game = game;
            console.log('✅ اللعبة جاهزة! اضغط "ابدأ اللعب"');
        } catch (error) {
            console.error('❌ خطأ في إنشاء اللعبة:', error);
            alert('🚨 خطأ في تحميل اللعبة!');
        }
    }, 500);
});

// جعل الدوال متاحة عالمياً
window.startGame = function() {
    if (game && game.startGame) {
        game.startGame();
    }
};
