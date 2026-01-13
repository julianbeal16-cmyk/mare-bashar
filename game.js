// ============================================
// 🎮 GAME ENGINE - الإصدار النهائي الموسع
// ============================================

console.log('🎮 بدء تحميل لعبة ماريو...');

class MarioGame {
    constructor() {
        console.log('🔧 إنشاء نسخة جديدة من اللعبة');
        
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
        this.highScore = parseInt(localStorage.getItem('mario_high_score')) || 0;
        this.lives = 3;
        this.timeLeft = 120; // 2 دقيقة
        this.coins = 0;
        this.totalCoins = 30; // 🔥 زدنا العملات
        this.kills = 0;
        
        // 🔥 المؤقتات
        this.gameTimer = null;
        this.lastTime = 0;
        this.frameCount = 0;
        
        // 🔥 عناصر اللعبة
        this.player = null;
        this.platforms = [];
        this.coinItems = [];
        this.enemies = [];
        this.mushrooms = [];
        this.pits = [];
        this.particles = [];
        this.camera = { x: 0, y: 0 };
        this.castle = null; // 🔥 القصر النهائي
        
        // 🔥 نظام تحميل الأصول المحسن
        this.assets = {
            player: null,
            loaded: false
        };
        
        this.loadAssets().then(() => {
            console.log('✅ جميع الأصول محملة بنجاح');
            this.assets.loaded = true;
        }).catch(() => {
            console.log('⚠️ استخدام الرسومات البديلة');
            this.assets.loaded = true;
        });
        
        // 🔥 تهيئة الأحداث
        this.setupEvents();
        
        // 🔥 إنشاء العالم الموسع
        this.createGameWorld();
        
        // 🔥 تحديث أفضل نتيجة
        this.updateHighScore();
        
        console.log('✅ اللعبة مهيأة وجاهزة للعب');
    }
    
    setupCanvas() {
        const resize = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                this.canvas.width = gameArea.clientWidth;
                this.canvas.height = gameArea.clientHeight;
            } else {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight - 100;
            }
            console.log(`📏 حجم الكنفاس: ${this.canvas.width}x${this.canvas.height}`);
        };
        
        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => setTimeout(resize, 100));
    }
    
    setupEvents() {
        console.log('🎮 تهيئة أحداث التحكم...');
        
        // أزرار الشاشات
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.showScreen('start'));
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        
        // أزرار التحكم باللمس
        ['left-btn', 'right-btn', 'jump-btn'].forEach((id, index) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            const control = ['left', 'right', 'jump'][index];
            
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
            btn.addEventListener('mouseleave', endEvent);
        });
        
        // لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            if (key === 'p') this.togglePause();
            if (key === 'f') this.toggleFullscreen();
            if (key === 'escape' && this.gameState === 'paused') this.resumeGame();
            
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // منع السلوك الافتراضي
        document.addEventListener('contextmenu', e => e.preventDefault());
    }
    
    async loadAssets() {
        const assetsToLoad = [
            { name: 'player', src: 'assets/player.png' }
        ];
        
        for (const asset of assetsToLoad) {
            await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.assets[asset.name] = img;
                    console.log(`✅ تم تحميل: ${asset.src}`);
                    resolve();
                };
                img.onerror = () => {
                    console.log(`⚠️ فشل تحميل: ${asset.src}`);
                    this.assets[asset.name] = null;
                    resolve(); // نكمل حتى لو فشل تحميل الصورة
                };
                img.src = asset.src;
            });
        }
    }
    
    updateHighScore() {
        const highScoreElement = document.getElementById('high-score');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.log);
            document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-expand"></i>';
        }
    }
    
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.classList.add('active');
            this.gameState = screenName;
            
            if (screenName === 'game') {
                this.startGameLoop();
            }
        }
    }
    
    createGameWorld() {
        console.log('🌍 إنشاء عالم اللعبة الموسع...');
        
        // اللاعب
        this.player = {
            x: 100,
            y: 300,
            width: 40,
            height: 60,
            speed: 5,
            velX: 0,
            velY: 0,
            jumpPower: -13,
            grounded: false,
            facingRight: true,
            invincible: false,
            invincibleTime: 0
        };
        
        // 🔥 توسيع العالم إلى 4 أضعاف
        const worldWidth = this.canvas.width * 4;
        
        // 🔥 الأرض الطويلة
        this.platforms = [
            { x: 0, y: this.canvas.height - 50, width: worldWidth, height: 50, type: 'ground' }
        ];
        
        // 🔥 منصات إضافية طويلة (15 منصة)
        const platformCount = 15;
        for (let i = 0; i < platformCount; i++) {
            this.platforms.push({
                x: 300 + (i * 250),
                y: 350 - (i % 3) * 70,
                width: 150 + Math.sin(i) * 50,
                height: 20,
                type: 'platform'
            });
        }
        
        // 🔥 30 عملة قابلة للجمع
        this.coinItems = [];
        for (let i = 0; i < this.totalCoins; i++) {
            this.coinItems.push({
                x: 100 + (i * 120),
                y: 180 + Math.sin(i * 0.5) * 100,
                collected: false,
                anim: Math.random() * Math.PI * 2,
                size: 12
            });
        }
        
        // 🔥 أعداء أكثر (8 أعداء)
        this.enemies = [];
        for (let i = 0; i < 8; i++) {
            this.enemies.push({
                x: 400 + (i * 300),
                y: this.platforms[0].y - 40,
                width: 40,
                height: 40,
                dir: i % 2 === 0 ? 1 : -1,
                speed: 1.5 + Math.random() * 1,
                active: true
            });
        }
        
        // 🔥 فطر أكثر (6 فطر)
        this.mushrooms = [];
        for (let i = 0; i < 6; i++) {
            this.mushrooms.push({
                x: 500 + (i * 400),
                y: 180 + Math.cos(i) * 80,
                collected: false
            });
        }
        
        // 🔥 حفر أكثر
        this.pits = [
            { x: 1200, y: this.platforms[0].y, width: 80, height: 100 },
            { x: 1800, y: this.platforms[0].y, width: 100, height: 100 },
            { x: 2400, y: this.platforms[0].y, width: 120, height: 100 },
            { x: 3000, y: this.platforms[0].y, width: 150, height: 100 }
        ];
        
        // 🔥 القصر النهائي في نهاية العالم
        this.castle = {
            x: worldWidth - 300,
            y: this.platforms[0].y - 200,
            width: 200,
            height: 200,
            reached: false
        };
        
        // جسيمات
        this.particles = [];
        
        console.log(`🌍 العالم الموسع جاهز: ${worldWidth}px`);
    }
    
    startGame() {
        console.log('🚀 بدء لعبة جديدة');
        
        // إعادة تعيين
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coins = 0;
        this.kills = 0;
        
        // إنشاء العالم الموسع
        this.createGameWorld();
        
        // إظهار شاشة اللعب
        this.showScreen('game');
        
        // بدء المؤقت
        this.startTimer();
        
        // تحديث الواجهة
        this.updateUI();
        
        // بدء الحلقة
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
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    pauseGame() {
        this.gameState = 'paused';
        clearInterval(this.gameTimer);
        document.getElementById('pause-btn').innerHTML = '<i class="fas fa-play"></i>';
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.startTimer();
        document.getElementById('pause-btn').innerHTML = '<i class="fas fa-pause"></i>';
        this.startGameLoop();
    }
    
    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.frameCount++;
        
        // تحديث
        this.update(deltaTime);
        
        // رسم
        this.draw();
        
        // الاستمرار
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateCoins(deltaTime);
        this.updateCamera();
        this.checkCollisions();
        this.checkEndConditions();
    }
    
    updatePlayer(deltaTime) {
        // حركة
        this.player.velX = 0;
        
        if (this.keys['arrowleft'] || this.keys['a'] || this.touchControls.left) {
            this.player.velX = -this.player.speed;
            this.player.facingRight = false;
        }
        
        if (this.keys['arrowright'] || this.keys['d'] || this.touchControls.right) {
            this.player.velX = this.player.speed;
            this.player.facingRight = true;
        }
        
        // قفز
        if ((this.keys[' '] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump) && 
            this.player.grounded) {
            this.player.velY = this.player.jumpPower;
            this.player.grounded = false;
            this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height, 5, '#FFD700');
        }
        
        // جاذبية
        this.player.velY += 0.7;
        if (this.player.velY > 15) this.player.velY = 15;
        
        // حركة
        this.player.x += this.player.velX * deltaTime * 60;
        this.player.y += this.player.velY * deltaTime * 60;
        
        // حدود
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.canvas.width * 4 - this.player.width) {
            this.player.x = this.canvas.width * 4 - this.player.width;
        }
        
        // اصطدام مع المنصات
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
        
        // سقوط في حفرة
        for (const pit of this.pits) {
            if (this.player.x + this.player.width > pit.x &&
                this.player.x < pit.x + pit.width &&
                this.player.y + this.player.height > pit.y) {
                
                this.playerDamaged();
                this.player.x = Math.max(100, this.camera.x + 100);
                this.player.y = 300;
                this.player.velX = 0;
                this.player.velY = 0;
                break;
            }
        }
        
        // سقوط عام
        if (this.player.y > this.canvas.height + 100) {
            this.playerDamaged();
            this.player.x = Math.max(100, this.camera.x + 100);
            this.player.y = 300;
            this.player.velX = 0;
            this.player.velY = 0;
        }
        
        // مناعة
        if (this.player.invincible) {
            this.player.invincibleTime -= deltaTime;
            if (this.player.invincibleTime <= 0) {
                this.player.invincible = false;
            }
        }
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            enemy.x += enemy.speed * enemy.dir * deltaTime * 60;
            
            if (enemy.x < 0 || enemy.x + enemy.width > this.canvas.width * 4) {
                enemy.dir *= -1;
                enemy.x = Math.max(0, Math.min(this.canvas.width * 4 - enemy.width, enemy.x));
            }
            
            enemy.y = this.platforms[0].y - enemy.height;
        });
    }
    
    updateCoins(deltaTime) {
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                coin.anim += deltaTime * 4;
            }
        });
    }
    
    updateCamera() {
        const targetX = this.player.x - this.canvas.width / 2 + this.player.width / 2;
        const targetY = this.player.y - this.canvas.height / 2 + this.player.height / 2;
        
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
        
        this.camera.x = Math.max(0, Math.min(this.canvas.width * 4 - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.canvas.height - this.canvas.height, this.camera.y));
    }
    
    checkCollisions() {
        // جمع العملات
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const dx = this.player.x + this.player.width/2 - coin.x;
                const dy = this.player.y + this.player.height/2 - coin.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 25) {
                    coin.collected = true;
                    this.coins++;
                    this.score += 100;
                    this.updateUI();
                    this.createParticles(coin.x, coin.y, 8, '#FFD700');
                }
            }
        });
        
        // جمع الفطر
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.collected) {
                const dx = this.player.x + this.player.width/2 - mushroom.x;
                const dy = this.player.y + this.player.height/2 - mushroom.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 35) {
                    mushroom.collected = true;
                    this.score += 500;
                    this.player.invincible = true;
                    this.player.invincibleTime = 8;
                    this.updateUI();
                    this.createParticles(mushroom.x, mushroom.y, 12, '#E74C3C');
                }
            }
        });
        
        // الاصطدام بالأعداء
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            if (this.player.x < enemy.x + enemy.width &&
                this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height &&
                this.player.y + this.player.height > enemy.y) {
                
                if (this.player.velY > 0 && this.player.y + this.player.height < enemy.y + enemy.height/2) {
                    enemy.active = false;
                    this.score += 200;
                    this.kills++;
                    this.player.velY = -10;
                    this.updateUI();
                    this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 10, '#EF476F');
                } else if (!this.player.invincible) {
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
            this.player.invincibleTime = 2;
            this.player.velY = -8;
            this.player.velX = this.player.facingRight ? -8 : 8;
            this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 6, '#EF476F');
        }
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                velX: (Math.random() - 0.5) * 6,
                velY: (Math.random() - 0.5) * 6 - 3,
                size: Math.random() * 3 + 2,
                color,
                life: 1
            });
        }
    }
    
    checkEndConditions() {
        // الفوز بجمع كل العملات
        if (this.coins >= this.totalCoins) {
            this.endGame(true);
            return;
        }
        
        // 🔥 الفوز بالوصول للقصر
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const castleCenterX = this.castle.x + this.castle.width / 2;
        const castleCenterY = this.castle.y + this.castle.height / 2;
        
        const distanceToCastle = Math.sqrt(
            Math.pow(playerCenterX - castleCenterX, 2) + 
            Math.pow(playerCenterY - castleCenterY, 2)
        );
        
        if (distanceToCastle < 150 && !this.castle.reached) {
            this.castle.reached = true;
            this.score += 2000; // مكافأة إضافية للوصول للقصر
            this.endGame(true);
            return;
        }
        
        // 🔥 فحص إذا وصل لنهاية العالم
        if (this.player.x >= this.canvas.width * 4 - 200) {
            this.endGame(true);
            return;
        }
    }
    
    endGame(isWin) {
        this.gameState = 'ended';
        clearInterval(this.gameTimer);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('mario_high_score', this.highScore);
            this.updateHighScore();
        }
        
        // 🔥 تحديد نوع الفوز
        let winType = '';
        if (this.castle.reached) {
            winType = 'القصر';
        } else if (this.coins >= this.totalCoins) {
            winType = 'العملات';
        } else if (this.player.x >= this.canvas.width * 4 - 200) {
            winType = 'نهاية العالم';
        }
        
        document.getElementById('end-icon').className = isWin ? 'fas fa-trophy' : 'fas fa-skull-crossbones';
        document.getElementById('end-title').textContent = isWin ? 'تهانينا! 🏆' : 'انتهت اللعبة';
        
        document.getElementById('end-message').textContent = isWin 
            ? `فوز ${winType}! جمعت ${this.coins} عملة من ${this.totalCoins}`
            : 'حاول مرة أخرى في المرة القادمة!';
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-coins').textContent = `${this.coins}/${this.totalCoins}`;
        document.getElementById('final-time').textContent = this.formatTime(120 - this.timeLeft);
        document.getElementById('final-kills').textContent = this.kills;
        
        // 🔥 إضافة رسالة إضافية إذا وصل للقصر
        if (this.castle.reached) {
            const message = document.getElementById('end-message');
            message.innerHTML += '<br><span style="color:#FFD700">🎉 وصلت للقصر النهائي! 🏰</span>';
        }
        
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // خلفية
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width * 4, this.canvas.height);
        
        // سحب
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 10; i++) {
            const x = (this.camera.x * 0.2 + i * 250) % (this.canvas.width * 4 + 300);
            this.drawCloud(x, 60 + Math.sin(this.frameCount * 0.01 + i) * 10, 50);
        }
        
        // جبال
        this.ctx.fillStyle = '#2C3E50';
        this.drawMountain(200, 200, 150, 100);
        this.drawMountain(500, 180, 130, 90);
        this.drawMountain(900, 220, 170, 120);
        this.drawMountain(1400, 190, 140, 95);
        this.drawMountain(2000, 210, 160, 110);
        this.drawMountain(2800, 180, 140, 100);
        this.drawMountain(3500, 220, 180, 130);
        
        // منصات
        this.platforms.forEach(platform => {
            this.ctx.fillStyle = platform.type === 'ground' ? '#8B4513' : '#A0522D';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            this.ctx.fillStyle = platform.type === 'ground' ? '#A0522D' : '#8B4513';
            for (let i = 0; i < platform.width; i += 20) {
                this.ctx.fillRect(platform.x + i, platform.y, 10, 5);
            }
        });
        
        // حفر
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.pits.forEach(pit => {
            this.ctx.fillRect(pit.x, pit.y, pit.width, pit.height);
        });
        
        // عملات
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.anim) * 10;
                
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
        
        // فطر
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.collected) {
                this.ctx.fillStyle = '#E74C3C';
                this.ctx.beginPath();
                this.ctx.arc(mushroom.x, mushroom.y, 15, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#FFF';
                this.ctx.beginPath();
                this.ctx.arc(mushroom.x - 4, mushroom.y - 4, 4, 0, Math.PI * 2);
                this.ctx.arc(mushroom.x + 4, mushroom.y - 4, 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // أعداء
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            this.ctx.fillStyle = '#EF476F';
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(enemy.x + 8, enemy.y + 8, 8, 8);
            this.ctx.fillRect(enemy.x + 24, enemy.y + 8, 8, 8);
        });
        
        // 🔥 رسم القصر
        this.drawCastle();
        
        // جسيمات
        this.particles.forEach((particle, i) => {
            particle.x += particle.velX;
            particle.y += particle.velY;
            particle.velY += 0.2;
            particle.life -= 0.02;
            
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        });
        this.ctx.globalAlpha = 1;
        
        // اللاعب
        this.drawPlayer();
        
        this.ctx.restore();
    }
    
    drawPlayer() {
        const player = this.player;
        
        if (this.assets.player && this.assets.loaded) {
            this.ctx.save();
            if (!player.facingRight) {
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(this.assets.player, -player.x - player.width, player.y, player.width, player.height);
            } else {
                this.ctx.drawImage(this.assets.player, player.x, player.y, player.width, player.height);
            }
            this.ctx.restore();
        } else {
            // الرسم البديل
            this.ctx.fillStyle = player.invincible ? '#9B59B6' : '#E74C3C';
            this.ctx.fillRect(player.x, player.y, player.width, player.height);
            
            // رسم تفاصيل الوجه
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(player.x + 10, player.y + 10, 20, 20);
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(player.x + 15, player.y + 15, 5, 5);
            this.ctx.fillRect(player.x + 25, player.y + 15, 5, 5);
        }
    }
    
    drawCastle() {
        const castle = this.castle;
        
        // قاعدة القصر
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        // أبراج القصر
        const towerWidth = castle.width * 0.25;
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(castle.x - 10, castle.y - 100, towerWidth, 100);
        this.ctx.fillRect(castle.x + castle.width - towerWidth + 10, castle.y - 100, towerWidth, 100);
        
        // العلم
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.beginPath();
        this.ctx.moveTo(castle.x + castle.width/2, castle.y - 150);
        this.ctx.lineTo(castle.x + castle.width/2, castle.y - 180);
        this.ctx.lineTo(castle.x + castle.width/2 + 20, castle.y - 165);
        this.ctx.closePath();
        this.ctx.fill();
        
        // نوافذ
        this.ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                this.ctx.fillRect(
                    castle.x + 30 + i * 50,
                    castle.y + 30 + j * 60,
                    25, 40
                );
            }
        }
        
        // الباب
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(castle.x + castle.width/2 - 30, castle.y + castle.height - 80, 60, 80);
        
        // كتابة "الفوز"
        if (!castle.reached) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 20px Cairo';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🏆 القصر النهائي', castle.x + castle.width/2, castle.y - 200);
        }
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.25, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawMountain(x, y, width, height) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height);
        this.ctx.lineTo(x + width / 2, y);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

// ============================================
// بدء اللعبة
// ============================================

let game;

window.addEventListener('load', () => {
    console.log('📄 الصفحة محملة - إنشاء اللعبة...');
    game = new MarioGame();
    console.log('✅ اللعبة جاهزة للعب!');
    
    // تحديث حجم الشاشة
    window.addEventListener('resize', () => {
        if (game && game.gameState === 'playing') {
            game.createGameWorld();
        }
    });
});
