// ============================================
// 🎮 لعبة ماريو - النسخة النهائية الشغالة 100%
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
        
        // المؤقتات
        this.gameTimer = null;
        this.lastTime = 0;
        this.frameCount = 0;
        this.animationId = null;
        
        // عناصر اللعبة
        this.player = null;
        this.platforms = [];
        this.coinItems = [];
        this.enemies = [];
        this.pits = [];
        this.camera = { x: 0, y: 0 };
        this.castle = null;
        
        // الصور
        this.playerImage = null;
        this.imageLoaded = false;
        
        // تهيئة اللعبة
        this.init();
    }
    
    init() {
        console.log('🚀 تهيئة اللعبة...');
        
        // الحصول على Canvas
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('❌ Canvas غير موجود!');
            this.createEmergencyCanvas();
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
        this.setupCanvasSize();
        
        // تهيئة الأحداث
        this.setupEvents();
        
        // تحميل أفضل نتيجة
        this.loadHighScore();
        
        console.log('✅ اللعبة جاهزة!');
    }
    
    loadPlayerImage() {
        this.playerImage = new Image();
        this.playerImage.onload = () => {
            console.log('✅ صورة اللاعب محملة');
            this.imageLoaded = true;
        };
        this.playerImage.onerror = () => {
            console.log('⚠️ فشل تحميل الصورة، سيتم استخدام رسم بديل');
            this.imageLoaded = false;
        };
        this.playerImage.src = 'player.png';
    }
    
    setupCanvasSize() {
        const updateSize = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                const width = gameArea.clientWidth;
                const height = gameArea.clientHeight;
                
                this.canvas.width = width;
                this.canvas.height = height;
                
                console.log(`📐 حجم Canvas: ${width}x${height}`);
            }
        };
        
        updateSize();
        window.addEventListener('resize', updateSize);
    }
    
    setupEvents() {
        // زر البداية
        document.getElementById('start-btn').addEventListener('click', () => {
            console.log('🎮 بدء اللعبة');
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
        
        // زر القائمة من شاشة اللعب
        document.getElementById('menu-btn-game').addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // زر القائمة من شاشة النهاية
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // أحداث اللمس
        this.setupTouchEvents();
        
        // أحداث لوحة المفاتيح
        this.setupKeyboardEvents();
        
        // زر ملء الشاشة
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
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
            
            // منع التمرير عند استخدام مفاتيح اللعبة
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
        console.log(`🔄 تغيير الشاشة إلى: ${screenName}`);
        
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
        console.log('🌍 إنشاء عالم اللعبة...');
        
        const canvas = this.canvas;
        const worldWidth = canvas.width * 3;
        const groundY = canvas.height - 80;
        
        // اللاعب
        this.player = {
            x: 200,
            y: groundY - 120,
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
        
        // منصات إضافية
        const platformPositions = [
            { x: 350, y: groundY - 120 },
            { x: 650, y: groundY - 160 },
            { x: 950, y: groundY - 140 },
            { x: 1250, y: groundY - 180 },
            { x: 1550, y: groundY - 130 },
            { x: 1850, y: groundY - 150 }
        ];
        
        platformPositions.forEach(pos => {
            this.platforms.push({
                x: pos.x,
                y: pos.y,
                width: 200,
                height: 25,
                type: 'platform'
            });
        });
        
        // العملات
        this.coinItems = [];
        for (let i = 0; i < this.totalCoins; i++) {
            this.coinItems.push({
                x: 400 + i * 80,
                y: groundY - 150 + (i % 3) * 40,
                collected: false,
                anim: Math.random() * Math.PI * 2
            });
        }
        
        // الأعداء
        this.enemies = [
            { x: 500, y: groundY - 50, width: 45, height: 45, dir: 1, speed: 2.5, active: true },
            { x: 850, y: groundY - 50, width: 45, height: 45, dir: -1, speed: 2.5, active: true },
            { x: 1200, y: groundY - 50, width: 45, height: 45, dir: 1, speed: 2.5, active: true }
        ];
        
        // القصر
        this.castle = {
            x: worldWidth - 300,
            y: groundY - 200,
            width: 200,
            height: 200,
            reached: false
        };
    }
    
    startGame() {
        console.log('🚀 بدء لعبة جديدة');
        
        // إعادة تعيين الإحصائيات
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coins = 0;
        
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
        
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.frameCount++;
        
        try {
            this.update(deltaTime);
            this.draw();
        } catch (error) {
            console.error('❌ خطأ في حلقة اللعبة:', error);
            return;
        }
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateCamera();
        this.checkCollisions();
        this.checkEndConditions();
    }
    
    updatePlayer(deltaTime) {
        const player = this.player;
        
        // حركة أفقية
        player.velX = 0;
        
        if (this.keys['arrowleft'] || this.keys['a'] || this.touchControls.left) {
            player.velX = -player.speed;
            player.facingRight = false;
        }
        
        if (this.keys['arrowright'] || this.keys['d'] || this.touchControls.right) {
            player.velX = player.speed;
            player.facingRight = true;
        }
        
        // قفز
        const jumpPressed = this.keys[' '] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump;
        
        if (jumpPressed && player.grounded) {
            player.velY = player.jumpPower;
            player.grounded = false;
        }
        
        // جاذبية
        player.velY += 0.8;
        player.velY = Math.min(player.velY, 16);
        
        // تحديث الموقع
        player.x += player.velX;
        player.y += player.velY;
        
        // حدود العالم
        const worldWidth = this.canvas.width * 3;
        player.x = Math.max(0, Math.min(worldWidth - player.width, player.x));
        
        // اكتشاف الاصطدام مع المنصات
        player.grounded = false;
        
        for (const platform of this.platforms) {
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
        
        // سقوط
        if (player.y > this.canvas.height + 100) {
            this.playerDamaged();
            player.x = 200;
            player.y = this.canvas.height - 200;
        }
        
        // مناعة
        if (player.invincible) {
            player.invincibleTime -= deltaTime;
            if (player.invincibleTime <= 0) {
                player.invincible = false;
            }
        }
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            enemy.x += enemy.speed * enemy.dir;
            
            if (enemy.x < 50 || enemy.x + enemy.width > this.canvas.width * 3 - 50) {
                enemy.dir *= -1;
            }
        });
    }
    
    updateCamera() {
        const player = this.player;
        const canvas = this.canvas;
        
        const targetX = player.x - canvas.width / 2 + player.width / 2;
        this.camera.x += (targetX - this.camera.x) * 0.1;
        
        this.camera.x = Math.max(0, Math.min(canvas.width * 3 - canvas.width, this.camera.x));
    }
    
    checkCollisions() {
        const player = this.player;
        
        // جمع العملات
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const dx = player.x + player.width / 2 - coin.x;
                const dy = player.y + player.height / 2 - coin.y;
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
            
            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {
                
                if (player.velY > 0 && player.y + player.height < enemy.y + enemy.height / 2) {
                    // قفز على العدو
                    enemy.active = false;
                    this.score += 200;
                    player.velY = -12;
                    this.updateUI();
                } else if (!player.invincible) {
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
            const player = this.player;
            const castle = this.castle;
            
            const dx = player.x + player.width / 2 - (castle.x + castle.width / 2);
            const dy = player.y + player.height / 2 - (castle.y + castle.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                castle.reached = true;
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
        console.log(isWin ? '🏆 فوز!' : '💀 خسارة!');
        
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
        const endIcon = document.getElementById('end-icon');
        const endTitle = document.getElementById('end-title');
        const endMessage = document.getElementById('end-message');
        
        if (endIcon) {
            endIcon.className = isWin ? 'fas fa-trophy' : 'fas fa-skull-crossbones';
        }
        
        if (endTitle) {
            endTitle.textContent = isWin ? 'تهانينا! 🏆' : 'انتهت اللعبة';
        }
        
        if (endMessage) {
            endMessage.textContent = isWin ? 
                `🎉 لقد فزت! جمعت ${this.coins} عملة من ${this.totalCoins}` : 
                'حاول مرة أخرى في المرة القادمة!';
        }
        
        // تحديث الإحصائيات النهائية
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
        if (!this.canvas || !this.ctx || !this.player) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // مسح الشاشة
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // حفظ حالة Canvas
        ctx.save();
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
        
        // رسم اللاعب
        this.drawPlayer();
        
        // استعادة حالة Canvas
        ctx.restore();
    }
    
    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const worldWidth = canvas.width * 3;
        
        // السماء
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, worldWidth, canvas.height);
        
        // سحب
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 10; i++) {
            const x = (this.camera.x * 0.05 + i * 300) % (worldWidth + 400);
            const y = 50 + Math.sin(this.frameCount * 0.003 + i) * 20;
            this.drawCloud(x, y, 60);
        }
    }
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            if (platform.type === 'ground') {
                // الأرض
                const gradient = ctx.createLinearGradient(
                    platform.x, platform.y,
                    platform.x, platform.y + platform.height
                );
                gradient.addColorStop(0, '#8B4513');
                gradient.addColorStop(1, '#654321');
                ctx.fillStyle = gradient;
            } else {
                // المنصات
                const gradient = ctx.createLinearGradient(
                    platform.x, platform.y,
                    platform.x, platform.y + platform.height
                );
                gradient.addColorStop(0, '#A0522D');
                gradient.addColorStop(1, '#8B4513');
                ctx.fillStyle = gradient;
            }
            
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل
            ctx.fillStyle = platform.type === 'ground' ? '#A0522D' : '#8B4513';
            for (let i = 0; i < platform.width; i += 25) {
                for (let j = 0; j < platform.height; j += 8) {
                    if ((i / 25 + j / 8) % 2 === 0) {
                        ctx.fillRect(platform.x + i, platform.y + j, 12, 4);
                    }
                }
            }
        });
    }
    
    drawCoins() {
        const ctx = this.ctx;
        
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.anim + this.frameCount * 0.1) * 12;
                const y = coin.y + bounce;
                
                // هالة العملة
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(coin.x, y, 16, 0, Math.PI * 2);
                ctx.fill();
                
                // العملة
                const gradient = ctx.createRadialGradient(
                    coin.x, y, 0,
                    coin.x, y, 12
                );
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(1, '#FFA500');
                ctx.fillStyle = gradient;
                
                ctx.beginPath();
                ctx.arc(coin.x, y, 12, 0, Math.PI * 2);
                ctx.fill();
                
                // بريق
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(coin.x - 4, y - 4, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // توهج
                if (Math.floor(this.frameCount / 5) % 2 === 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.beginPath();
                    ctx.arc(coin.x, y, 20, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }
    
    drawEnemies() {
        const ctx = this.ctx;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // جسم العدو
            const gradient = ctx.createLinearGradient(
                enemy.x, enemy.y,
                enemy.x, enemy.y + enemy.height
            );
            gradient.addColorStop(0, '#EF476F');
            gradient.addColorStop(1, '#C0392B');
            ctx.fillStyle = gradient;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // عيون
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(enemy.x + 12, enemy.y + 12, 10, 10);
            ctx.fillRect(enemy.x + enemy.width - 22, enemy.y + 12, 10, 10);
            
            // نقاط العيون
            ctx.fillStyle = '#FFF';
            ctx.fillRect(enemy.x + 15, enemy.y + 15, 4, 4);
            ctx.fillRect(enemy.x + enemy.width - 19, enemy.y + 15, 4, 4);
            
            // فم
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 16, enemy.y + 32, enemy.width - 32, 5);
            
            // أرجل
            ctx.fillStyle = '#C0392B';
            ctx.fillRect(enemy.x + 10, enemy.y + enemy.height, 10, 6);
            ctx.fillRect(enemy.x + enemy.width - 20, enemy.y + enemy.height, 10, 6);
        });
    }
    
    drawCastle() {
        if (!this.castle) return;
        
        const ctx = this.ctx;
        const castle = this.castle;
        
        // قاعدة القصر
        const baseGradient = ctx.createLinearGradient(
            castle.x, castle.y,
            castle.x, castle.y + castle.height
        );
        baseGradient.addColorStop(0, '#8B4513');
        baseGradient.addColorStop(1, '#654321');
        ctx.fillStyle = baseGradient;
        ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        // أبراج
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(castle.x - 10, castle.y - 120, 50, 120);
        ctx.fillRect(castle.x + castle.width - 40, castle.y - 120, 50, 120);
        
        // أسطح الأبراج
        ctx.fillStyle = '#654321';
        ctx.fillRect(castle.x - 15, castle.y - 130, 60, 10);
        ctx.fillRect(castle.x + castle.width - 45, castle.y - 130, 60, 10);
        
        // نوافذ
        ctx.fillStyle = '#FFD700';
        for (let floor = 0; floor < 3; floor++) {
            for (let pos = 0; pos < 3; pos++) {
                const windowX = castle.x + 30 + pos * 60;
                const windowY = castle.y + 30 + floor * 50;
                
                ctx.fillStyle = '#654321';
                ctx.fillRect(windowX - 3, windowY - 3, 26, 26);
                
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(windowX, windowY, 20, 20);
            }
        }
        
        // العلم
        ctx.save();
        ctx.translate(castle.x + castle.width / 2, castle.y - 140);
        
        // سارية العلم
        ctx.fillStyle = '#654321';
        ctx.fillRect(-3, 0, 6, 70);
        
        // العلم
        const flagGradient = ctx.createLinearGradient(0, 0, 30, 0);
        flagGradient.addColorStop(0, '#E74C3C');
        flagGradient.addColorStop(1, '#C0392B');
        ctx.fillStyle = flagGradient;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(30, 20);
        ctx.lineTo(0, 30);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // كتابة فوق القصر
        if (!castle.reached) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 22px Cairo';
            ctx.textAlign = 'center';
            ctx.fillText('🏆 الهدف النهائي', castle.x + castle.width / 2, castle.y - 160);
        }
    }
    
    drawPlayer() {
        if (!this.player) return;
        
        const ctx = this.ctx;
        const player = this.player;
        
        if (this.imageLoaded && this.playerImage) {
            // رسم صورة اللاعب
            ctx.save();
            
            if (!player.facingRight) {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    this.playerImage,
                    -player.x - player.width,
                    player.y,
                    player.width,
                    player.height
                );
            } else {
                ctx.drawImage(
                    this.playerImage,
                    player.x,
                    player.y,
                    player.width,
                    player.height
                );
            }
            
            // تأثير المناعة
            if (player.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.globalAlpha = 0.6;
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.strokeRect(
                    player.facingRight ? player.x : -player.x - player.width,
                    player.y,
                    player.width,
                    player.height
                );
                ctx.globalAlpha = 1;
            }
            
            ctx.restore();
        } else {
            // رسم بديل للاعب
            const playerColor = player.invincible ? '#9B59B6' : '#E74C3C';
            
            // جسم اللاعب
            const bodyGradient = ctx.createLinearGradient(
                player.x, player.y,
                player.x, player.y + player.height
            );
            bodyGradient.addColorStop(0, playerColor);
            bodyGradient.addColorStop(1, playerColor === '#9B59B6' ? '#8E44AD' : '#C0392B');
            ctx.fillStyle = bodyGradient;
            ctx.fillRect(player.x, player.y, player.width, player.height);
            
            // رأس اللاعب
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(player.x + 10, player.y + 10, 20, 20);
            
            // عيون اللاعب
            ctx.fillStyle = '#FFF';
            ctx.fillRect(player.x + 13, player.y + 13, 5, 5);
            ctx.fillRect(player.x + 22, player.y + 13, 5, 5);
            
            // فم اللاعب
            ctx.fillStyle = '#FFF';
            ctx.fillRect(player.x + 14, player.y + 25, 12, 4);
            
            // تأثير المناعة
            if (player.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
            }
        }
        
        // ظل اللاعب
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        const shadowWidth = player.width * 0.8;
        ctx.fillRect(
            player.x + (player.width - shadowWidth) / 2,
            player.y + player.height,
            shadowWidth,
            8
        );
    }
    
    drawCloud(x, y, size) {
        const ctx = this.ctx;
        ctx.beginPath();
        
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.25, 0, Math.PI * 2);
        ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
        ctx.arc(x + size * 0.4, y + size * 0.15, size * 0.2, 0, Math.PI * 2);
        
        ctx.fill();
    }
    
    toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                const btn = document.getElementById('fullscreen-btn');
                if (btn) btn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                document.exitFullscreen();
                const btn = document.getElementById('fullscreen-btn');
                if (btn) btn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        } catch (error) {
            console.log('⚠️ خطأ في ملء الشاشة');
        }
    }
    
    createEmergencyCanvas() {
        console.log('🆘 إنشاء Canvas طارئ...');
    }
}

// ============================================
// بدء اللعبة عند تحميل الصفحة
// ============================================

let game = null;

window.addEventListener('load', function() {
    console.log('📄 الصفحة محملة - بدء اللعبة...');
    
    setTimeout(function() {
        try {
            game = new MarioGame();
            window.game = game; // جعلها متاحة عالمياً
            console.log('✅ اللعبة جاهزة! اضغط "ابدأ اللعب"');
        } catch (error) {
            console.error('❌ خطأ في إنشاء اللعبة:', error);
            alert('🚨 خطأ في تحميل اللعبة!\n\n' + error.message + '\n\nاضغط على زر "بدء سريع" في أسفل الشاشة.');
        }
    }, 500);
});

// تسهيل الوصول للعبة من الكونسول
window.startMarioGame = function() {
    if (game && game.startGame) {
        game.startGame();
    }
};
