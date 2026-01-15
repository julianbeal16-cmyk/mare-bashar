// ============================================
// 🎮 لعبة ماريو - المحرك الرئيسي
// ============================================

'use strict';

class MarioGame {
    constructor() {
        console.log('🎮 إنشاء نسخة جديدة من اللعبة...');
        
        // متغيرات النظام
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu'; // menu, playing, paused, ended
        
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
        this.lastTime = 0;
        
        // عناصر اللعبة
        this.player = null;
        this.platforms = [];
        this.coinItems = [];
        this.enemies = [];
        this.mushrooms = [];
        this.pits = [];
        this.camera = { x: 0, y: 0 };
        this.castle = null;
        
        // الصور
        this.playerImage = null;
        this.imageLoaded = false;
        
        // بدء التهيئة
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
        
        // ضبط حجم Canvas
        this.setupCanvasSize();
        
        // تهيئة أحداث التحكم
        this.setupControls();
        
        // تحميل أفضل نتيجة
        this.loadHighScore();
        
        console.log('✅ اللعبة مهيأة وجاهزة للعب');
    }
    
    loadPlayerImage() {
        console.log('🖼️ جاري تحميل صورة اللاعب...');
        
        this.playerImage = new Image();
        
        this.playerImage.onload = () => {
            console.log('✅ صورة اللاعب محملة بنجاح');
            this.imageLoaded = true;
            
            // تحديث المعاينة إذا كنا في شاشة البداية
            if (this.gameState === 'menu') {
                const preview = document.getElementById('player-image');
                if (preview) {
                    preview.src = 'player.png';
                }
            }
        };
        
        this.playerImage.onerror = () => {
            console.log('⚠️ فشل تحميل صورة اللاعب، سيتم استخدام رسم بديل');
            this.imageLoaded = false;
            
            // إظهار البديل في المعاينة
            const placeholder = document.getElementById('player-placeholder');
            if (placeholder) {
                placeholder.style.display = 'flex';
            }
        };
        
        // محاولة تحميل الصورة
        this.playerImage.src = 'player.png';
        
        // Timeout احتياطي
        setTimeout(() => {
            if (!this.imageLoaded) {
                console.log('⏰ انتهى وقت تحميل الصورة');
                this.imageLoaded = false;
            }
        }, 2000);
    }
    
    setupCanvasSize() {
        const updateSize = () => {
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                this.canvas.width = gameArea.clientWidth;
                this.canvas.height = gameArea.clientHeight;
                console.log(`📐 حجم Canvas: ${this.canvas.width}x${this.canvas.height}`);
            }
        };
        
        // التهيئة الفورية
        updateSize();
        
        // تحديث عند تغيير حجم النافذة
        window.addEventListener('resize', updateSize);
        
        // تحديثات إضافية للتأكد
        setTimeout(updateSize, 100);
        setTimeout(updateSize, 500);
    }
    
    setupControls() {
        // لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // منع التمرير عند استخدام مفاتيح اللعبة
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }
            
            // إيقاف/متابعة اللعبة
            if (key === 'p') {
                this.togglePause();
                e.preventDefault();
            }
            
            // ملء الشاشة
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
            this.highScore = 0;
        }
    }
    
    createEmergencyCanvas() {
        console.log('🆘 إنشاء Canvas طارئ...');
        // يمكن إضافة كود لإنشاء Canvas طارئ إذا لزم الأمر
    }
    
    showScreen(screenName) {
        // إخفاء كل الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
        
        // إظهار الشاشة المطلوبة
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.style.display = 'flex';
            this.gameState = screenName === 'game' ? 'playing' : screenName;
            
            // إذا كانت شاشة اللعب، نبدأ اللعبة بعد تأخير بسيط
            if (screenName === 'game') {
                setTimeout(() => {
                    if (this.gameState === 'playing') {
                        this.startGame();
                    }
                }, 100);
            }
        }
    }
    
    backToMenu() {
        // إيقاف المؤقتات
        clearInterval(this.gameTimer);
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // إظهار شاشة البداية
        this.showScreen('start');
    }
    
    createGameWorld() {
        console.log('🌍 إنشاء عالم اللعبة...');
        
        if (!this.canvas) return;
        
        const worldWidth = this.canvas.width * 3;
        const groundY = this.canvas.height - 80;
        
        // 🔥 اللاعب
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
        
        // 🔥 الأرض
        this.platforms = [
            { x: 0, y: groundY, width: worldWidth, height: 80, type: 'ground' }
        ];
        
        // 🔥 منصات
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
        
        // 🔥 العملات
        this.coinItems = [];
        for (let i = 0; i < this.totalCoins; i++) {
            this.coinItems.push({
                x: 400 + i * 85,
                y: groundY - 150 + (i % 3) * 45,
                collected: false,
                anim: Math.random() * Math.PI * 2
            });
        }
        
        // 🔥 الأعداء
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
        
        // 🔥 القصر
        this.castle = {
            x: worldWidth - 300,
            y: groundY - 180,
            width: 200,
            height: 180,
            reached: false
        };
        
        console.log(`✅ العالم مخلوق - العرض: ${worldWidth}px`);
    }
    
    startGame() {
        console.log('🚀 بدء لعبة جديدة');
        
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
        
        console.log('🎮 اللعبة بدأت!');
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
        
        // تغيير زر الإيقاف
        const pauseBtn = document.querySelector('.game-btn[title="إيقاف"]');
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.startTimer();
        
        // تغيير زر الإيقاف
        const pauseBtn = document.querySelector('.game-btn[title="إيقاف"]');
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
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
            // التحديث
            this.update(deltaTime);
            
            // الرسم
            this.draw();
            
        } catch (error) {
            console.error('❌ خطأ في حلقة اللعبة:', error);
            return;
        }
        
        // الاستمرار في الحلقة
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (!this.player) return;
        
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
        if (!this.player) return;
        
        const player = this.player;
        const targetX = player.x - this.canvas.width / 2 + player.width / 2;
        
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.x = Math.max(0, Math.min(this.canvas.width * 3 - this.canvas.width, this.camera.x));
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
        
        // إيقاف المؤقتات
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
            if (isWin) {
                if (this.castle && this.castle.reached) {
                    endMessage.textContent = `🎉 وصلت للقصر النهائي! جمعت ${this.coins} عملة`;
                } else if (this.coins >= this.totalCoins) {
                    endMessage.textContent = `🎊 جمعت كل العملات! ${this.coins}/${this.totalCoins}`;
                } else {
                    endMessage.textContent = `🚀 وصلت لنهاية العالم! النتيجة: ${this.score}`;
                }
            } else {
                endMessage.textContent = 'حاول مرة أخرى في المرة القادمة!';
            }
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
        
        // مسح الشاشة
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // حفظ حالة Canvas
        ctx.save();
        
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
        
        // رسم اللاعب
        this.drawPlayer();
        
        // استعادة حالة Canvas
        ctx.restore();
    }
    
    drawBackground() {
        const ctx = this.ctx;
        const worldWidth = this.canvas.width * 3;
        
        // السماء
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, worldWidth, this.canvas.height);
        
        // سحب
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 10; i++) {
            const x = (this.camera.x * 0.05 + i * 300) % (worldWidth + 400);
            const y = 50 + Math.sin(this.frameCount * 0.003 + i) * 20;
            
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.arc(x + 25, y - 10, 18, 0, Math.PI * 2);
            ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawPlatforms() {
        const ctx = this.ctx;
        
        this.platforms.forEach(platform => {
            // جسم المنصة
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
                // المنصات العائمة
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
            
            // عيون العدو
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(enemy.x + 10, enemy.y + 10, 10, 10);
            ctx.fillRect(enemy.x + enemy.width - 20, enemy.y + 10, 10, 10);
            
            // فم العدو
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 15, enemy.y + 30, enemy.width - 30, 5);
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
        
        // أبراج القصر
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(castle.x - 10, castle.y - 100, 40, 100);
        ctx.fillRect(castle.x + castle.width - 30, castle.y - 100, 40, 100);
        
        // علم القصر
        ctx.fillStyle = '#654321';
        ctx.fillRect(castle.x + castle.width/2 - 2, castle.y - 120, 4, 70);
        
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.moveTo(castle.x + castle.width/2, castle.y - 120);
        ctx.lineTo(castle.x + castle.width/2 + 25, castle.y - 110);
        ctx.lineTo(castle.x + castle.width/2, castle.y - 100);
        ctx.closePath();
        ctx.fill();
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
            ctx.fillRect(player.x + 14, player.y + 25, 12, 4);
            
            // تأثير المناعة
            if (player.invincible && Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
            }
        }
    }
    
    toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        } catch (error) {
            console.log('⚠️ خطأ في ملء الشاشة');
        }
    }
}

// ============================================
// تهيئة اللعبة عند تحميل الصفحة
// ============================================

window.addEventListener('load', function() {
    console.log('📄 الصفحة محملة - جاري تهيئة اللعبة...');
    
    // تأخير بسيط لضمان تحميل كل شيء
    setTimeout(function() {
        try {
            window.game = new MarioGame();
            console.log('✅ اللعبة جاهزة للعب!');
        } catch (error) {
            console.error('❌ فشل إنشاء اللعبة:', error);
            alert('🚨 خطأ في تحميل اللعبة!\n\n' + error.message);
        }
    }, 300);
});

// جعل الدوال متاحة عالمياً
window.startMarioGame = function() {
    if (window.game && window.game.startGame) {
        window.game.startGame();
    }
};
