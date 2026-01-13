// ============================================
// 🎮 GAME ENGINE - النسخة المحسنة
// ============================================

console.log('🎮 بدء تحميل لعبة ماريو...');

class MarioGame {
    constructor() {
        console.log('🔧 إنشاء نسخة جديدة من اللعبة');
        
        // 🔥 1. تأخير التهيئة حتى يكتمل تحميل الصفحة
        this.initGame();
    }
    
    async initGame() {
        try {
            // 🔥 2. انتظار تحميل DOM
            await this.waitForDOM();
            
            // 🔥 3. تهيئة العناصر الأساسية
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');
            
            if (!this.canvas || !this.ctx) {
                throw new Error('❌ Canvas غير موجود!');
            }
            
            // 🔥 4. تهيئة أحجام Canvas
            this.setupCanvas();
            
            // 🔥 5. حالة اللعبة
            this.gameState = 'start'; // start, playing, paused, ended
            this.keys = {};
            this.touchControls = {
                left: false,
                right: false,
                jump: false
            };
            
            // 🔥 6. إحصائيات
            this.score = 0;
            this.highScore = parseInt(localStorage.getItem('mario_high_score')) || 0;
            this.lives = 3;
            this.timeLeft = 120;
            this.coins = 0;
            this.totalCoins = 30;
            this.kills = 0;
            
            // 🔥 7. المؤقتات
            this.gameTimer = null;
            this.lastTime = 0;
            this.frameCount = 0;
            
            // 🔥 8. عناصر اللعبة
            this.player = null;
            this.platforms = [];
            this.coinItems = [];
            this.enemies = [];
            this.mushrooms = [];
            this.pits = [];
            this.particles = [];
            this.camera = { x: 0, y: 0 };
            this.castle = null;
            
            // 🔥 9. نظام تحميل الأصول
            this.assets = {
                player: null,
                loaded: false
            };
            
            // 🔥 10. تحميل الصور
            await this.loadAssets();
            
            // 🔥 11. تهيئة الأحداث
            this.setupEvents();
            
            // 🔥 12. إنشاء العالم
            this.createGameWorld();
            
            // 🔥 13. تحديث الواجهة
            this.updateHighScore();
            this.updateUI();
            
            // 🔥 14. رسم شاشة البداية
            this.drawStartScreen();
            
            console.log('✅ اللعبة مهيأة وجاهزة للعب');
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة اللعبة:', error);
            alert('⚠️ حدث خطأ في تحميل اللعبة. حاول تحديث الصفحة.');
        }
    }
    
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                resolve();
            } else {
                document.addEventListener('DOMContentLoaded', resolve);
            }
        });
    }
    
    setupCanvas() {
        console.log('📏 تهيئة حجم Canvas...');
        
        const resize = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea && gameArea.clientWidth > 0 && gameArea.clientHeight > 0) {
                this.canvas.width = gameArea.clientWidth;
                this.canvas.height = gameArea.clientHeight;
            } else {
                // قيم افتراضية
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight - 100;
            }
            
            console.log(`✅ Canvas حجم: ${this.canvas.width}x${this.canvas.height}`);
            
            // إعادة رسم العناصر
            if (this.gameState === 'start') {
                this.drawStartScreen();
            } else if (this.gameState === 'playing') {
                this.draw();
            }
        };
        
        // استدعاء فوري
        resize();
        
        // أحداث إعادة الحجم
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => {
            setTimeout(resize, 100);
        });
    }
    
    async loadAssets() {
        console.log('🖼️ تحميل الأصول...');
        
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.assets.player = img;
                this.assets.loaded = true;
                console.log('✅ صورة اللاعب محملة بنجاح');
                resolve();
            };
            img.onerror = () => {
                console.log('⚠️ استخدام رسم بديل للاعب');
                this.assets.player = null;
                this.assets.loaded = true;
                resolve();
            };
            img.src = 'assets/player.png';
        });
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
            if (!btn) {
                console.log(`⚠️ زر ${id} غير موجود`);
                return;
            }
            
            const control = ['left', 'right', 'jump'][index];
            
            const startEvent = (e) => {
                e.preventDefault();
                this.touchControls[control] = true;
                btn.classList.add('active');
            };
            
            const endEvent = (e) => {
                e.preventDefault();
                this.touchControls[control] = false;
                btn.classList.remove('active');
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
            
            // منع التمرير
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // منع القائمة السياقية
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        
        console.log('✅ أحداث التحكم جاهزة');
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
        console.log(`🔄 تغيير الشاشة إلى: ${screenName}`);
        
        // إخفاء كل الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // إظهار الشاشة المطلوبة
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.classList.add('active');
            this.gameState = screenName;
            
            if (screenName === 'game') {
                // تأخير بسيط لضمان تحميل Canvas
                setTimeout(() => {
                    this.setupCanvas();
                    this.startGameLoop();
                }, 100);
            }
        }
    }
    
    createGameWorld() {
        console.log('🌍 إنشاء عالم اللعبة...');
        
        // تأكد من وجود Canvas
        if (!this.canvas) {
            console.error('❌ Canvas غير مهيأ!');
            return;
        }
        
        // اللاعب
        this.player = {
            x: 100,
            y: this.canvas.height - 150, // فوق الأرض مباشرة
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
        
        // حجم العالم (4 أضعاف عرض الشاشة)
        const worldWidth = Math.max(this.canvas.width * 4, 4000);
        const groundHeight = 50;
        const groundY = this.canvas.height - groundHeight;
        
        // الأرض الأساسية
        this.platforms = [
            { x: 0, y: groundY, width: worldWidth, height: groundHeight, type: 'ground' }
        ];
        
        // منصات إضافية
        const platformPositions = [
            { x: 300, y: groundY - 100 },
            { x: 600, y: groundY - 150 },
            { x: 900, y: groundY - 200 },
            { x: 1200, y: groundY - 100 },
            { x: 1500, y: groundY - 150 },
            { x: 1800, y: groundY - 200 },
            { x: 2100, y: groundY - 100 },
            { x: 2400, y: groundY - 150 },
            { x: 2700, y: groundY - 200 },
            { x: 3000, y: groundY - 100 },
            { x: 3300, y: groundY - 150 },
            { x: 3600, y: groundY - 200 }
        ];
        
        platformPositions.forEach(pos => {
            this.platforms.push({
                x: pos.x,
                y: pos.y,
                width: 150,
                height: 20,
                type: 'platform'
            });
        });
        
        // العملات (30 عملة)
        this.coinItems = [];
        for (let i = 0; i < this.totalCoins; i++) {
            const platformIndex = i % platformPositions.length;
            const platform = platformPositions[platformIndex];
            
            this.coinItems.push({
                x: platform.x + 50 + (i % 3) * 40,
                y: platform.y - 50,
                collected: false,
                anim: Math.random() * Math.PI * 2,
                size: 12
            });
        }
        
        // الأعداء
        this.enemies = [];
        for (let i = 0; i < 8; i++) {
            this.enemies.push({
                x: 400 + i * 350,
                y: groundY - 40,
                width: 40,
                height: 40,
                dir: i % 2 === 0 ? 1 : -1,
                speed: 1.5 + Math.random() * 1,
                active: true
            });
        }
        
        // الفطر
        this.mushrooms = [];
        for (let i = 0; i < 6; i++) {
            this.mushrooms.push({
                x: 500 + i * 450,
                y: groundY - 120,
                collected: false
            });
        }
        
        // الحفر
        this.pits = [
            { x: 1400, y: groundY, width: 80, height: 100 },
            { x: 2100, y: groundY, width: 100, height: 100 },
            { x: 2800, y: groundY, width: 120, height: 100 },
            { x: 3500, y: groundY, width: 150, height: 100 }
        ];
        
        // القصر النهائي
        this.castle = {
            x: worldWidth - 300,
            y: groundY - 200,
            width: 200,
            height: 200,
            reached: false
        };
        
        // جسيمات
        this.particles = [];
        
        // الكامرا
        this.camera.x = 0;
        this.camera.y = 0;
        
        console.log(`✅ العالم مخلوق: ${worldWidth}px`);
    }
    
    startGame() {
        console.log('🚀 بدء لعبة جديدة');
        
        // إعادة تعيين الإحصائيات
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 120;
        this.coins = 0;
        this.kills = 0;
        
        // إعادة إنشاء العالم
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
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // النتيجة
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        // الأرواح
        const livesElement = document.getElementById('lives');
        if (livesElement) {
            livesElement.textContent = this.lives;
        }
        
        // العملات
        const coinsElement = document.getElementById('coins');
        if (coinsElement) {
            coinsElement.textContent = `${this.coins}/${this.totalCoins}`;
        }
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
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.startTimer();
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        this.startGameLoop();
    }
    
    startGameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
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
        if (!this.player) return;
        
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateCoins(deltaTime);
        this.updateCamera();
        this.checkCollisions();
        this.checkEndConditions();
    }
    
    updatePlayer(deltaTime) {
        // حركة أفقية
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
        this.player.velY += 0.7 * deltaTime * 60;
        if (this.player.velY > 15) this.player.velY = 15;
        
        // تحديث الموقع
        this.player.x += this.player.velX * deltaTime * 60;
        this.player.y += this.player.velY * deltaTime * 60;
        
        // حدود العالم
        if (this.player.x < 0) this.player.x = 0;
        const worldWidth = this.canvas.width * 4;
        if (this.player.x > worldWidth - this.player.width) {
            this.player.x = worldWidth - this.player.width;
        }
        
        // اكتشاف الاصطدام مع المنصات
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
                this.player.y = this.canvas.height - 150;
                this.player.velX = 0;
                this.player.velY = 0;
                break;
            }
        }
        
        // سقوط عام
        if (this.player.y > this.canvas.height + 100) {
            this.playerDamaged();
            this.player.x = Math.max(100, this.camera.x + 100);
            this.player.y = this.canvas.height - 150;
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
            
            // تغيير الاتجاه عند الحدود
            if (enemy.x < 0 || enemy.x + enemy.width > this.canvas.width * 4) {
                enemy.dir *= -1;
                enemy.x = Math.max(0, Math.min(this.canvas.width * 4 - enemy.width, enemy.x));
            }
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
        if (!this.player) return;
        
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
                
                // إذا قفز على العدو
                if (this.player.velY > 0 && this.player.y + this.player.height < enemy.y + enemy.height/2) {
                    enemy.active = false;
                    this.score += 200;
                    this.kills++;
                    this.player.velY = -10;
                    this.updateUI();
                    this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 10, '#EF476F');
                } else if (!this.player.invincible) {
                    // إذا اصطدم بالعدو
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
        
        // الفوز بالوصول للقصر
        if (this.castle && !this.castle.reached) {
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            const castleCenterX = this.castle.x + this.castle.width / 2;
            const castleCenterY = this.castle.y + this.castle.height / 2;
            
            const distanceToCastle = Math.sqrt(
                Math.pow(playerCenterX - castleCenterX, 2) + 
                Math.pow(playerCenterY - castleCenterY, 2)
            );
            
            if (distanceToCastle < 150) {
                this.castle.reached = true;
                this.score += 2000;
                this.endGame(true);
                return;
            }
        }
        
        // الفوز بالوصول لنهاية العالم
        if (this.player.x >= this.canvas.width * 4 - 200) {
            this.endGame(true);
            return;
        }
    }
    
    endGame(isWin) {
        this.gameState = 'ended';
        clearInterval(this.gameTimer);
        
        // تحديث أفضل نتيجة
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('mario_high_score', this.highScore);
            this.updateHighScore();
        }
        
        // تحديث عناصر شاشة النهاية
        const endIcon = document.getElementById('end-icon');
        const endTitle = document.getElementById('end-title');
        const endMessage = document.getElementById('end-message');
        
        if (endIcon) endIcon.className = isWin ? 'fas fa-trophy' : 'fas fa-skull-crossbones';
        if (endTitle) endTitle.textContent = isWin ? 'تهانينا! 🏆' : 'انتهت اللعبة';
        
        let message = isWin 
            ? `لقد فزت! جمعت ${this.coins} عملة من ${this.totalCoins}`
            : 'حاول مرة أخرى في المرة القادمة!';
        
        if (this.castle && this.castle.reached) {
            message += ' 🏰 وصلت للقصر النهائي!';
        }
        
        if (endMessage) endMessage.textContent = message;
        
        // تحديث الإحصائيات النهائية
        const finalScore = document.getElementById('final-score');
        const finalCoins = document.getElementById('final-coins');
        const finalTime = document.getElementById('final-time');
        const finalKills = document.getElementById('final-kills');
        
        if (finalScore) finalScore.textContent = this.score;
        if (finalCoins) finalCoins.textContent = `${this.coins}/${this.totalCoins}`;
        if (finalTime) finalTime.textContent = this.formatTime(120 - this.timeLeft);
        if (finalKills) finalKills.textContent = this.kills;
        
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
    
    drawStartScreen() {
        if (!this.canvas || !this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // خلفية
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // رسالة
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 30px Cairo';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🎮 لعبة ماريو', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.font = '20px Cairo';
        this.ctx.fillText('اضغط على "ابدأ اللعب" للبدء', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.font = '16px Cairo';
        this.ctx.fillText('مشروع مبرمج بلغة JavaScript', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    draw() {
        if (!this.canvas || !this.ctx || !this.player) {
            console.log('⚠️ لا يمكن الرسم - عناصر مفقودة');
            return;
        }
        
        // مسح الشاشة
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // حفظ حالة Canvas
        this.ctx.save();
        
        // تطبيق حركة الكاميرا
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // 🔥 1. رسم الخلفية
        this.drawBackground();
        
        // 🔥 2. رسم الأرض والمنصات
        this.drawPlatforms();
        
        // 🔥 3. رسم الحفر
        this.drawPits();
        
        // 🔥 4. رسم العملات
        this.drawCoins();
        
        // 🔥 5. رسم الفطر
        this.drawMushrooms();
        
        // 🔥 6. رسم الأعداء
        this.drawEnemies();
        
        // 🔥 7. رسم القصر
        this.drawCastle();
        
        // 🔥 8. رسم الجسيمات
        this.drawParticles();
        
        // 🔥 9. رسم اللاعب
        this.drawPlayer();
        
        // استعادة حالة Canvas
        this.ctx.restore();
        
        // 🔥 10. رسم معلومات التصحيح (اختياري)
        this.drawDebugInfo();
    }
    
    drawBackground() {
        // السماء
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width * 4, this.canvas.height);
        
        // سحب
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 10; i++) {
            const x = (this.camera.x * 0.1 + i * 300) % (this.canvas.width * 4 + 400);
            const y = 50 + Math.sin(this.frameCount * 0.005 + i) * 20;
            this.drawCloud(x, y, 60);
        }
        
        // جبال
        this.ctx.fillStyle = '#2C3E50';
        for (let i = 0; i < 8; i++) {
            const x = i * 500;
            const height = 100 + Math.sin(i) * 30;
            this.drawMountain(x, this.canvas.height - height - 50, 200, height);
        }
    }
    
    drawPlatforms() {
        this.platforms.forEach(platform => {
            // جسم المنصة
            this.ctx.fillStyle = platform.type === 'ground' ? '#8B4513' : '#A0522D';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // تفاصيل المنصة
            this.ctx.fillStyle = platform.type === 'ground' ? '#A0522D' : '#8B4513';
            for (let i = 0; i < platform.width; i += 20) {
                this.ctx.fillRect(platform.x + i, platform.y, 10, 5);
            }
            
            // ظل المنصة
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 5);
        });
    }
    
    drawPits() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.pits.forEach(pit => {
            this.ctx.fillRect(pit.x, pit.y, pit.width, pit.height);
            
            // رسم حواف الحفرة
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(pit.x - 5, pit.y, 5, 20);
            this.ctx.fillRect(pit.x + pit.width, pit.y, 5, 20);
        });
    }
    
    drawCoins() {
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.anim) * 10;
                const y = coin.y + bounce;
                
                // هالة العملة
                this.ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
                this.ctx.beginPath();
                this.ctx.arc(coin.x, y, coin.size + 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // العملة الذهبية
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(coin.x, y, coin.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // بريق العملة
                this.ctx.fillStyle = '#FFA500';
                this.ctx.beginPath();
                this.ctx.arc(coin.x - 3, y - 3, coin.size * 0.3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    drawMushrooms() {
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.collected) {
                // جسم الفطر
                this.ctx.fillStyle = '#E74C3C';
                this.ctx.beginPath();
                this.ctx.arc(mushroom.x, mushroom.y, 15, 0, Math.PI * 2);
                this.ctx.fill();
                
                // نقاط بيضاء
                this.ctx.fillStyle = '#FFF';
                this.ctx.beginPath();
                this.ctx.arc(mushroom.x - 5, mushroom.y - 5, 3, 0, Math.PI * 2);
                this.ctx.arc(mushroom.x + 5, mushroom.y - 5, 3, 0, Math.PI * 2);
                this.ctx.arc(mushroom.x, mushroom.y, 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // ساق الفطر
                this.ctx.fillStyle = '#FFF';
                this.ctx.fillRect(mushroom.x - 4, mushroom.y, 8, 10);
            }
        });
    }
    
    drawEnemies() {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // جسم العدو
            this.ctx.fillStyle = '#EF476F';
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // عيون العدو
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(enemy.x + 8, enemy.y + 8, 8, 8);
            this.ctx.fillRect(enemy.x + 24, enemy.y + 8, 8, 8);
            
            // فم العدو
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(enemy.x + 10, enemy.y + 25, 20, 3);
            
            // أرجل العدو
            this.ctx.fillStyle = '#C0392B';
            this.ctx.fillRect(enemy.x + 5, enemy.y + enemy.height, 10, 5);
            this.ctx.fillRect(enemy.x + 25, enemy.y + enemy.height, 10, 5);
        });
    }
    
    drawCastle() {
        if (!this.castle) return;
        
        const castle = this.castle;
        
        // قاعدة القصر
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        // أبراج القصر
        const towerWidth = castle.width * 0.25;
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(castle.x - 10, castle.y - 100, towerWidth, 100);
        this.ctx.fillRect(castle.x + castle.width - towerWidth + 10, castle.y - 100, towerWidth, 100);
        
        // أسطح الأبراج
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(castle.x - 15, castle.y - 110, towerWidth + 10, 10);
        this.ctx.fillRect(castle.x + castle.width - towerWidth + 5, castle.y - 110, towerWidth + 10, 10);
        
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
                
                // تفاصيل النوافذ
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.fillRect(
                    castle.x + 30 + i * 50,
                    castle.y + 30 + j * 60,
                    25, 2
                );
                this.ctx.fillRect(
                    castle.x + 42 + i * 50,
                    castle.y + 30 + j * 60,
                    2, 40
                );
                this.ctx.fillStyle = '#FFD700';
            }
        }
        
        // الباب
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(castle.x + castle.width/2 - 30, castle.y + castle.height - 80, 60, 80);
        
        // مقبض الباب
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(castle.x + castle.width/2 + 20, castle.y + castle.height - 40, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // كتابة فوق القصر
        if (!castle.reached) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 20px Cairo';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🏆 القصر النهائي', castle.x + castle.width/2, castle.y - 200);
        }
    }
    
    drawParticles() {
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
    }
    
    drawPlayer() {
        if (!this.player) return;
        
        const player = this.player;
        
        if (this.assets.player && this.assets.loaded && this.assets.player.complete) {
            // رسم صورة اللاعب
            this.ctx.save();
            if (!player.facingRight) {
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(
                    this.assets.player, 
                    -player.x - player.width, 
                    player.y, 
                    player.width, 
                    player.height
                );
            } else {
                this.ctx.drawImage(
                    this.assets.player, 
                    player.x, 
                    player.y, 
                    player.width, 
                    player.height
                );
            }
            this.ctx.restore();
        } else {
            // رسم بديل للاعب
            const playerColor = player.invincible ? '#9B59B6' : '#E74C3C';
            
            // جسم اللاعب
            this.ctx.fillStyle = playerColor;
            this.ctx.fillRect(player.x, player.y, player.width, player.height);
            
            // رأس اللاعب
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(player.x + 10, player.y + 10, 20, 20);
            
            // عيون اللاعب
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(player.x + 15, player.y + 15, 5, 5);
            this.ctx.fillRect(player.x + 25, player.y + 15, 5, 5);
            
            // فم اللاعب
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(player.x + 18, player.y + 25, 10, 3);
            
            // تأثير المناعة
            if (player.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
            }
        }
        
        // ظل اللاعب
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(
            player.x + 5, 
            player.y + player.height, 
            player.width - 10, 
            10
        );
    }
    
    drawDebugInfo() {
        if (window.location.hash === '#debug') {
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'top';
            
            const debugInfo = [
                `اللاعب: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
                `الكاميرا: (${Math.round(this.camera.x)}, ${Math.round(this.camera.y)})`,
                `الحالة: ${this.gameState}`,
                `العملات: ${this.coins}/${this.totalCoins}`,
                `الأعداء: ${this.enemies.filter(e => e.active).length}/${this.enemies.length}`
            ];
            
            debugInfo.forEach((text, i) => {
                this.ctx.fillText(text, 10, 10 + i * 20);
            });
        }
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.25, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.4, y + size * 0.1, size * 0.2, 0, Math.PI * 2);
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
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.moveTo(x + width * 0.3, y + height * 0.3);
        this.ctx.lineTo(x + width * 0.7, y + height * 0.3);
        this.ctx.lineTo(x + width * 0.5, y + height * 0.1);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

// ============================================
// بدء اللعبة عند تحميل الصفحة
// ============================================

let game;

window.addEventListener('load', () => {
    console.log('📄 الصفحة محملة - تهيئة اللعبة...');
    
    // إنشاء اللعبة بعد تأخير بسيط لضمان تحميل DOM
    setTimeout(() => {
        try {
            game = new MarioGame();
            console.log('✅ اللعبة جاهزة للعب!');
        } catch (error) {
            console.error('❌ فشل في إنشاء اللعبة:', error);
            alert('⚠️ حدث خطأ في تحميل اللعبة. حاول تحديث الصفحة.');
        }
    }, 100);
});

// استمرار إعادة الحجم
window.addEventListener('resize', () => {
    if (game && game.gameState === 'playing') {
        game.setupCanvas();
    }
});
