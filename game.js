// ============================================
// لعبة ماريو - الإصدار المبسط الشغال
// ============================================

'use strict';

console.log('🎮 بدء تحميل لعبة ماريو...');

class MarioGame {
    constructor() {
        console.log('🔧 إنشاء نسخة جديدة من اللعبة');
        
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu';
        
        this.keys = {};
        this.touchControls = {
            left: false,
            right: false,
            jump: false
        };
        
        this.score = 0;
        this.highScore = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coins = 0;
        this.totalCoins = 30;
        this.kills = 0;
        
        this.gameTimer = null;
        this.animationId = null;
        this.frameCount = 0;
        
        this.player = null;
        this.platforms = [];
        this.coinItems = [];
        this.enemies = [];
        this.mushrooms = [];
        this.pits = [];
        this.particles = [];
        this.camera = { x: 0, y: 0 };
        this.castle = null;
        
        this.assets = {
            player: null,
            loaded: true  // لا ننتظر صورة، نستخدم رسم مباشر
        };
        
        this.initialize();
    }
    
    initialize() {
        console.log('🚀 تهيئة اللعبة...');
        
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
        
        this.setupCanvas();
        this.setupEvents();
        this.loadHighScore();
        
        console.log('✅ اللعبة مهيأة وجاهزة');
    }
    
    setupCanvas() {
        const updateCanvasSize = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                const width = gameArea.clientWidth || 800;
                const height = gameArea.clientHeight || 500;
                
                this.canvas.width = width;
                this.canvas.height = height;
                
                console.log(`📐 حجم Canvas: ${width}x${height}`);
            }
        };
        
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
    }
    
    setupEvents() {
        // زر البداية
        document.getElementById('start-btn').addEventListener('click', () => {
            console.log('🎮 زر البداية مضغوط');
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
        
        // زر القائمة
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // زر العودة للقائمة
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // زر المساعدة
        document.getElementById('help-btn').addEventListener('click', () => {
            document.getElementById('help-modal').style.display = 'flex';
        });
        
        document.getElementById('close-help').addEventListener('click', () => {
            document.getElementById('help-modal').style.display = 'none';
        });
        
        // أحداث اللمس
        this.setupTouchControls();
        
        // أحداث لوحة المفاتيح
        this.setupKeyboardControls();
    }
    
    setupTouchControls() {
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');
        const jumpBtn = document.getElementById('jump-btn');
        
        const setupButton = (btn, control) => {
            if (!btn) return;
            
            const startEvent = (e) => {
                e.preventDefault();
                this.touchControls[control] = true;
            };
            
            const endEvent = (e) => {
                e.preventDefault();
                this.touchControls[control] = false;
            };
            
            btn.addEventListener('touchstart', startEvent);
            btn.addEventListener('mousedown', startEvent);
            btn.addEventListener('touchend', endEvent);
            btn.addEventListener('mouseup', endEvent);
        };
        
        setupButton(leftBtn, 'left');
        setupButton(rightBtn, 'right');
        setupButton(jumpBtn, 'jump');
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            if (key === 'p') {
                this.togglePause();
                e.preventDefault();
            }
            
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
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
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
        
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.style.display = 'flex';
            this.gameState = screenName;
            
            if (screenName === 'game') {
                setTimeout(() => {
                    this.startGame();
                }, 100);
            }
        }
    }
    
    createGameWorld() {
        console.log('🌍 إنشاء عالم اللعبة...');
        
        if (!this.canvas) return;
        
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
        
        // منصات
        const platformPositions = [
            { x: 350, y: groundY - 120 },
            { x: 650, y: groundY - 160 },
            { x: 950, y: groundY - 140 },
            { x: 1250, y: groundY - 180 },
            { x: 1550, y: groundY - 130 }
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
                x: 400 + i * 70,
                y: groundY - 180 + (i % 3) * 30,
                collected: false,
                anim: Math.random() * Math.PI * 2
            });
        }
        
        // الأعداء
        this.enemies = [
            { x: 500, y: groundY - 50, width: 45, height: 45, dir: 1, speed: 2, active: true },
            { x: 850, y: groundY - 50, width: 45, height: 45, dir: -1, speed: 2, active: true },
            { x: 1200, y: groundY - 50, width: 45, height: 45, dir: 1, speed: 2, active: true }
        ];
        
        // الفطر
        this.mushrooms = [
            { x: 600, y: groundY - 130, collected: false },
            { x: 1000, y: groundY - 130, collected: false }
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
        
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coins = 0;
        this.kills = 0;
        
        this.createGameWorld();
        this.showScreen('game');
        
        this.startTimer();
        this.updateUI();
        this.startGameLoop();
    }
    
    startTimer() {
        if (this.gameTimer) clearInterval(this.gameTimer);
        
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
            this.gameState = 'paused';
            document.getElementById('pause-btn').innerHTML = '<i class="fas fa-play"></i>';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pause-btn').innerHTML = '<i class="fas fa-pause"></i>';
            this.gameLoop();
        }
    }
    
    startGameLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.gameState = 'playing';
        this.gameLoop();
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (!this.player) return;
        
        this.updatePlayer();
        this.updateEnemies();
        this.updateCamera();
        this.checkCollisions();
        this.checkEndConditions();
    }
    
    updatePlayer() {
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
            player.invincibleTime -= 0.016;
            if (player.invincibleTime <= 0) {
                player.invincible = false;
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
        if (!this.player) return;
        
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
        
        // جمع الفطر
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.collected) {
                const dx = player.x + player.width / 2 - mushroom.x;
                const dy = player.y + player.height / 2 - mushroom.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 40) {
                    mushroom.collected = true;
                    this.score += 500;
                    player.invincible = true;
                    player.invincibleTime = 10;
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
                    this.kills++;
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
                `🎉 لقد فزت! جمعت ${this.coins} عملة` : 
                'حاول مرة أخرى في المرة القادمة!';
        }
        
        // تحديث الإحصائيات النهائية
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-coins').textContent = `${this.coins}/${this.totalCoins}`;
        document.getElementById('final-time').textContent = this.formatTime(120 - this.timeLeft);
        document.getElementById('final-kills').textContent = this.kills;
        
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
        
        // رسم الفطر
        this.drawMushrooms();
        
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
        gradient.addColorStop(1, '#5DADE2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, worldWidth, canvas.height);
        
        // سحب
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 8; i++) {
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
        });
    }
    
    drawCoins() {
        const ctx = this.ctx;
        
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.anim + this.frameCount * 0.1) * 10;
                const y = coin.y + bounce;
                
                // العملة
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(coin.x, y, 12, 0, Math.PI * 2);
                ctx.fill();
                
                // بريق
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(coin.x - 3, y - 3, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    drawMushrooms() {
        const ctx = this.ctx;
        
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.collected) {
                // ساق الفطر
                ctx.fillStyle = '#FFF';
                ctx.fillRect(mushroom.x - 6, mushroom.y + 10, 12, 15);
                
                // جسم الفطر
                const gradient = ctx.createRadialGradient(
                    mushroom.x, mushroom.y, 0,
                    mushroom.x, mushroom.y, 18
                );
                gradient.addColorStop(0, '#E74C3C');
                gradient.addColorStop(1, '#C0392B');
                ctx.fillStyle = gradient;
                
                ctx.beginPath();
                ctx.arc(mushroom.x, mushroom.y, 18, 0, Math.PI * 2);
                ctx.fill();
                
                // نقاط
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(mushroom.x - 5, mushroom.y - 5, 3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(mushroom.x + 5, mushroom.y - 5, 3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(mushroom.x, mushroom.y + 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    drawEnemies() {
        const ctx = this.ctx;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // جسم العدو
            ctx.fillStyle = '#EF476F';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // عيون
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(enemy.x + 10, enemy.y + 10, 10, 10);
            ctx.fillRect(enemy.x + enemy.width - 20, enemy.y + 10, 10, 10);
            
            // فم
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 15, enemy.y + 30, enemy.width - 30, 5);
        });
    }
    
    drawCastle() {
        if (!this.castle) return;
        
        const ctx = this.ctx;
        const castle = this.castle;
        
        // قاعدة القصر
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        // أبراج
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(castle.x - 10, castle.y - 100, 40, 100);
        ctx.fillRect(castle.x + castle.width - 30, castle.y - 100, 40, 100);
        
        // سارية العلم
        ctx.fillStyle = '#654321';
        ctx.fillRect(castle.x + castle.width / 2 - 2, castle.y - 120, 4, 60);
        
        // العلم
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.moveTo(castle.x + castle.width / 2, castle.y - 120);
        ctx.lineTo(castle.x + castle.width / 2 + 25, castle.y - 110);
        ctx.lineTo(castle.x + castle.width / 2, castle.y - 100);
        ctx.closePath();
        ctx.fill();
    }
    
    drawPlayer() {
        if (!this.player) return;
        
        const ctx = this.ctx;
        const player = this.player;
        
        // لون اللاعب
        const playerColor = player.invincible ? '#9B59B6' : '#E74C3C';
        
        // جسم اللاعب
        ctx.fillStyle = playerColor;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // رأس اللاعب
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(player.x + 8, player.y + 8, 24, 24);
        
        // عيون اللاعب
        ctx.fillStyle = '#FFF';
        ctx.fillRect(player.x + 12, player.y + 12, 6, 6);
        ctx.fillRect(player.x + 22, player.y + 12, 6, 6);
        
        // فم اللاعب
        ctx.fillStyle = '#FFF';
        ctx.fillRect(player.x + 14, player.y + 24, 12, 4);
        
        // تأثير المناعة
        if (player.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
        }
    }
    
    drawCloud(x, y, size) {
        const ctx = this.ctx;
        ctx.beginPath();
        
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.25, 0, Math.PI * 2);
        ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
        
        ctx.fill();
    }
    
    createEmergencyCanvas() {
        console.log('🆘 إنشاء Canvas طارئ...');
    }
}

// ============================================
// تهيئة اللعبة عند تحميل الصفحة
// ============================================

let gameInstance = null;

window.addEventListener('load', function() {
    console.log('📄 الصفحة محملة - بدء اللعبة...');
    
    setTimeout(function() {
        try {
            gameInstance = new MarioGame();
            console.log('✅ اللعبة جاهزة! اضغط "ابدأ اللعب"');
        } catch (error) {
            console.error('❌ خطأ في إنشاء اللعبة:', error);
            alert('🚨 خطأ في تحميل اللعبة!\n\n' + error.message);
        }
    }, 500);
});

// دالات الطوارئ
window.forceStartGame = function() {
    console.log('🚀 بدء قسري للعبة...');
    
    if (!gameInstance) {
        gameInstance = new MarioGame();
    }
    
    gameInstance.startGame();
};
