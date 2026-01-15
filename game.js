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
                const preview = document.getElementById('hero-image');
                if (preview) {
                    preview.src = 'assets/player.png';
                }
            }
        };
        
        this.playerImage.onerror = () => {
            console.log('⚠️ فشل تحميل صورة اللاعب، سيتم استخدام رسم بديل');
            this.imageLoaded = false;
            
            // إنشاء صورة SVG بديلة
            const svgString = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23E74C3C"/><circle cx="50" cy="30" r="15" fill="%232C3E50"/><rect x="35" y="45" width="30" height="40" fill="%23E74C3C"/><rect x="40" y="60" width="5" height="5" fill="white"/><rect x="55" y="60" width="5" height="5" fill="white"/><rect x="45" y="70" width="10" height="5" fill="white"/></svg>';
            
            this.playerImage.src = svgString;
            this.imageLoaded = true;
        };
        
        // محاولة تحميل الصورة من مسارات متعددة
        const imagePaths = [
            'assets/player.png',
            'player.png',
            './player.png',
            'https://via.placeholder.com/40x60/E74C3C/FFFFFF?text=M'
        ];
        
        let currentIndex = 0;
        const tryLoadImage = () => {
            if (currentIndex < imagePaths.length) {
                this.playerImage.src = imagePaths[currentIndex];
                currentIndex++;
            }
        };
        
        this.playerImage.onerror = tryLoadImage;
        tryLoadImage();
    }
    
    setupCanvasSize() {
        const updateSize = () => {
            const gameArea = document.querySelector('.game-world');
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
            
            // إعادة التشغيل
            if (key === 'r') {
                this.restartGame();
                e.preventDefault();
            }
            
            // العودة للقائمة
            if (key === 'escape') {
                this.backToMenu();
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // التحكم بالجوال
        this.setupMobileControls();
        
        // أزرار الواجهة
        this.setupUIButtons();
    }
    
    setupMobileControls() {
        // أزرار الحركة للجوال
        const setupMobileButton = (id, control) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            // للشاشات التي تدعم اللمس
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
            
            // للماوس على سطح المكتب
            btn.addEventListener('mousedown', () => {
                this.touchControls[control] = true;
            });
            
            btn.addEventListener('mouseup', () => {
                this.touchControls[control] = false;
            });
            
            btn.addEventListener('mouseleave', () => {
                this.touchControls[control] = false;
            });
        };
        
        setupMobileButton('mobile-left', 'left');
        setupMobileButton('mobile-right', 'right');
        setupMobileButton('mobile-jump', 'jump');
        
        // زر الإجراء الخاص
        const actionBtn = document.getElementById('mobile-action');
        if (actionBtn) {
            actionBtn.addEventListener('click', () => {
                this.showNotification('⚡ طاقة خاصة!');
            });
        }
        
        // زر الخاص
        const specialBtn = document.getElementById('mobile-special');
        if (specialBtn) {
            specialBtn.addEventListener('click', () => {
                this.showNotification('🌟 مهارة خاصة مفعلة!');
            });
        }
    }
    
    setupUIButtons() {
        // زر الإيقاف/المتابعة
        const pauseBtn = document.getElementById('pause-game');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }
        
        // زر الصوت
        const soundBtn = document.getElementById('sound-toggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                this.toggleSound();
            });
        }
        
        // زر القائمة
        const menuBtn = document.getElementById('game-menu');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.backToMenu();
            });
        }
    }
    
    loadHighScore() {
        try {
            const saved = localStorage.getItem('mario_high_score');
            this.highScore = saved ? parseInt(saved) : 0;
            const highScoreElement = document.getElementById('high-score');
            if (highScoreElement) {
                highScoreElement.textContent = this.highScore;
            }
        } catch (error) {
            console.log('⚠️ فشل تحميل أفضل نتيجة');
            this.highScore = 0;
        }
    }
    
    createEmergencyCanvas() {
        console.log('🆘 إنشاء Canvas طارئ...');
        const gameArea = document.querySelector('.game-world');
        if (!gameArea) return;
        
        const canvas = document.createElement('canvas');
        canvas.id = 'game-canvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        gameArea.appendChild(canvas);
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvasSize();
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
            
            // تحديث حجم Canvas عند إظهار شاشة اللعب
            if (screenName === 'game' && this.canvas) {
                this.setupCanvasSize();
                
                // بدء اللعبة بعد تأخير بسيط
                setTimeout(() => {
                    if (this.gameState === 'playing') {
                        this.startGame();
                    }
                }, 100);
            }
            
            // تحديث UI عند إظهار شاشة البداية
            if (screenName === 'start') {
                this.updateUI();
            }
        }
    }
    
    backToMenu() {
        // إيقاف المؤقتات
        this.stopGame();
        
        // إظهار شاشة البداية
        this.showScreen('start');
    }
    
    stopGame() {
        clearInterval(this.gameTimer);
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.gameState = 'menu';
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
            invincibleTime: 0,
            color: '#E74C3C'
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
                anim: Math.random() * Math.PI * 2,
                value: 100
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
                active: true,
                color: '#EF476F'
            });
        }
        
        // 🔥 القصر
        this.castle = {
            x: worldWidth - 300,
            y: groundY - 180,
            width: 200,
            height: 180,
            reached: false,
            color: '#8B4513'
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
        
        // إعادة تعيين الكاميرا
        this.camera = { x: 0, y: 0 };
        
        // إنشاء العالم
        this.createGameWorld();
        
        // تحديث الواجهة
        this.updateUI();
        
        // تحديث شريط التقدم
        this.updateProgressBar();
        
        // بدء المؤقت
        this.startTimer();
        
        // بدء حلقة اللعبة
        this.startGameLoop();
        
        // إظهار إشعار
        this.showNotification('🚀 ابدأ مغامرتك! اجمع العملات وتجنب الأعداء!');
        
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
                    this.endGame(false, '⏰ انتهى الوقت!');
                }
                
                // تحديث البوصلة
                this.updateCompass();
                
                // تحديث شريط التقدم
                this.updateProgressBar();
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
        
        // تحديث الشريط العلوي
        const ribbonScore = document.getElementById('ribbon-score');
        if (ribbonScore) {
            ribbonScore.textContent = this.score;
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
    
    updateProgressBar() {
        const progressFill = document.getElementById('level-progress');
        const currentProgress = document.getElementById('current-progress');
        
        if (progressFill && currentProgress) {
            // حساب التقدم بناءً على العملات والموقع
            const coinProgress = (this.coins / this.totalCoins) * 50;
            const positionProgress = (this.player ? (this.player.x / (this.canvas.width * 3)) * 50 : 0);
            const totalProgress = coinProgress + positionProgress;
            
            const progressPercent = Math.min(100, Math.max(0, totalProgress));
            progressFill.style.width = `${progressPercent}%`;
            currentProgress.textContent = `${Math.round(progressPercent)}%`;
        }
    }
    
    updateCompass() {
        if (!this.player || !this.castle) return;
        
        const compassArrow = document.getElementById('compass-arrow');
        const compassDistance = document.getElementById('compass-distance');
        
        if (!compassArrow || !compassDistance) return;
        
        const distanceToCastle = this.castle.x - this.player.x;
        const distanceMeters = Math.abs(Math.round(distanceToCastle / 10));
        
        // تحديث السهم
        if (distanceToCastle > 100) {
            compassArrow.textContent = '→';
            compassArrow.style.transform = 'rotate(0deg)';
        } else if (distanceToCastle < -100) {
            compassArrow.textContent = '←';
            compassArrow.style.transform = 'rotate(180deg)';
        } else {
            compassArrow.textContent = '↓';
            compassArrow.style.transform = 'rotate(0deg)';
        }
        
        // تحديث المسافة
        compassDistance.textContent = `${distanceMeters}m`;
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
        const pauseBtn = document.getElementById('pause-game');
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            pauseBtn.title = 'متابعة اللعبة';
        }
        
        this.showNotification('⏸️ اللعبة متوقفة');
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.startTimer();
        
        // تغيير زر الإيقاف
        const pauseBtn = document.getElementById('pause-game');
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            pauseBtn.title = 'إيقاف اللعبة';
        }
        
        this.startGameLoop();
        this.showNotification('▶️ اللعبة مستمرة');
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
            this.showNotification('⚠️ خطأ في اللعبة، جاري الإصلاح...');
            setTimeout(() => this.startGameLoop(), 100);
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
        
        // تحديث الرسوم المتحركة
        this.updateAnimations(deltaTime);
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
            this.showNotification('⬆️ قفزة قوية!');
        }
        
        // جاذبية
        player.velY += 0.8;
        player.velY = Math.min(player.velY, 16);
        
        // تحديث الموقع
        player.x += player.velX;
        player.y += player.velY;
        
        // حدود العالم
        const worldWidth = this.canvas ? this.canvas.width * 3 : 3000;
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
        if (player.y > (this.canvas ? this.canvas.height + 100 : 800)) {
            this.playerDamaged('💀 سقوط في الهاوية!');
            player.x = 200;
            player.y = this.canvas ? this.canvas.height - 200 : 600;
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
            
            enemy.x += enemy.speed * enemy.dir * deltaTime * 60;
            
            // تغيير الاتجاه عند الوصول للحافة
            const worldWidth = this.canvas ? this.canvas.width * 3 : 3000;
            if (enemy.x < 50 || enemy.x + enemy.width > worldWidth - 50) {
                enemy.dir *= -1;
            }
            
            // رسوم متحركة بسيطة للأعداء
            enemy.y += Math.sin(this.frameCount * 0.05) * 0.5;
        });
    }
    
    updateAnimations(deltaTime) {
        // تحريك العملات
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                coin.anim += deltaTime * 2;
            }
        });
    }
    
    updateCamera() {
        if (!this.player || !this.canvas) return;
        
        const player = this.player;
        const targetX = player.x - this.canvas.width / 2 + player.width / 2;
        
        this.camera.x += (targetX - this.camera.x) * 0.1;
        
        // حدود الكاميرا
        const worldWidth = this.canvas.width * 3;
        this.camera.x = Math.max(0, Math.min(worldWidth - this.canvas.width, this.camera.x));
    }
    
    checkCollisions() {
        const player = this.player;
        if (!player) return;
        
        // جمع العملات
        this.coinItems.forEach(coin => {
            if (!coin.collected) {
                const dx = player.x + player.width / 2 - coin.x;
                const dy = player.y + player.height / 2 - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30) {
                    coin.collected = true;
                    this.coins++;
                    this.score += coin.value;
                    this.updateUI();
                    this.updateProgressBar();
                    this.showNotification(`💰 +${coin.value} نقطة!`);
                    
                    // تأثير بصرعند جمع عملة
                    this.createCoinEffect(coin.x, coin.y);
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
                    this.showNotification(`👊 +200 نقطة! عدو مهزوم!`);
                    
                    // تأثير عند هزيمة العدو
                    this.createEnemyDefeatEffect(enemy.x, enemy.y);
                } else if (!player.invincible) {
                    // اصطدام بالعدو
                    this.playerDamaged('👾 اصطدمت بعدو!');
                }
            }
        });
    }
    
    createCoinEffect(x, y) {
        // يمكن إضافة تأثيرات بصرية هنا
        console.log(`✨ تأثير عملة في (${x}, ${y})`);
    }
    
    createEnemyDefeatEffect(x, y) {
        // يمكن إضافة تأثيرات بصرية هنا
        console.log(`💥 تأثير هزيمة عدو في (${x}, ${y})`);
    }
    
    playerDamaged(message) {
        if (this.player.invincible) return;
        
        this.lives--;
        this.updateUI();
        this.showNotification(`${message} ❤️ ${this.lives} أرواح متبقية`);
        
        if (this.lives <= 0) {
            this.endGame(false, '💔 نفدت الأرواح!');
        } else {
            this.player.invincible = true;
            this.player.invincibleTime = 3;
            this.player.velY = -10;
        }
    }
    
    checkEndConditions() {
        // الفوز بجمع كل العملات
        if (this.coins >= this.totalCoins) {
            this.endGame(true, '🎊 جمعت كل العملات!');
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
                this.endGame(true, '🏰 وصلت للقصر الملكي!');
                return;
            }
        }
        
        // الفوز بالوصول لنهاية العالم
        if (this.player && this.player.x >= (this.canvas ? this.canvas.width * 3 - 200 : 2800)) {
            this.endGame(true, '🚀 وصلت لنهاية العالم!');
            return;
        }
    }
    
    endGame(isWin, message) {
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
            try {
                localStorage.setItem('mario_high_score', this.highScore.toString());
            } catch (e) {
                console.log('⚠️ فشل حفظ أفضل نتيجة');
            }
            
            const highScoreElement = document.getElementById('high-score');
            if (highScoreElement) {
                highScoreElement.textContent = this.highScore;
            }
        }
        
        // تحديث شاشة النهاية
        const endIcon = document.getElementById('victory-badge');
        const endTitle = document.getElementById('end-title');
        const endMessage = document.getElementById('end-message');
        
        if (endIcon) {
            endIcon.innerHTML = isWin ? '<i class="fas fa-trophy"></i>' : '<i class="fas fa-skull-crossbones"></i>';
        }
        
        if (endTitle) {
            endTitle.textContent = isWin ? 'تهانينا! 🏆' : 'انتهت اللعبة 💀';
        }
        
        if (endMessage) {
            endMessage.textContent = message || (isWin ? 'لقد أكملت المغامرة بنجاح!' : 'حاول مرة أخرى!');
        }
        
        // تحديث الإحصائيات النهائية
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-coins').textContent = `${this.coins}/${this.totalCoins}`;
        document.getElementById('final-time').textContent = this.formatTime(120 - this.timeLeft);
        document.getElementById('final-kills').textContent = this.kills;
        
        // تحديث الإنجازات
        this.updateAchievements();
        
        // إظهار شاشة النهاية
        this.showScreen('end');
        
        // إظهار إشعار النهاية
        this.showNotification(isWin ? '🎉 انتصار رائع!' : '💪 حاول مرة أخرى!');
    }
    
    updateAchievements() {
        // سيد العملات
        const coinMaster = document.getElementById('coin-master');
        if (coinMaster && this.coins >= this.totalCoins) {
            coinMaster.classList.add('unlocked');
            coinMaster.innerHTML = '<i class="fas fa-check-circle"></i><span>سيد العملات</span>';
        }
        
        // عداء سريع
        const speedRunner = document.getElementById('speed-runner');
        if (speedRunner && this.timeLeft >= 60) {
            speedRunner.classList.add('unlocked');
            speedRunner.innerHTML = '<i class="fas fa-check-circle"></i><span>عداء سريع</span>';
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    restartGame() {
        this.stopGame();
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
        
        // رسم واجهة اللاعب
        this.drawHUD();
    }
    
    drawBackground() {
        const ctx = this.ctx;
        const worldWidth = this.canvas ? this.canvas.width * 3 : 3000;
        const canvasHeight = this.canvas ? this.canvas.height : 600;
        
        // السماء
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, worldWidth, canvasHeight);
        
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
        
        // جبال في الخلفية
        ctx.fillStyle = 'rgba(52, 73, 94, 0.3)';
        for (let i = 0; i < 5; i++) {
            const x = (i * 600) % worldWidth;
            const height = 150 + Math.sin(i) * 50;
            
            ctx.beginPath();
            ctx.moveTo(x, canvasHeight - 80);
            ctx.lineTo(x + 300, canvasHeight - 80 - height);
            ctx.lineTo(x + 600, canvasHeight - 80);
            ctx.closePath();
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
            
            // تفاصيل المنصة
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let i = 0; i < platform.width; i += 40) {
                ctx.fillRect(platform.x + i, platform.y, 20, 5);
            }
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
                
                // تأثير الوميض
                if (Math.sin(this.frameCount * 0.2) > 0.8) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(coin.x, y, 16, 0, Math.PI * 2);
                    ctx.stroke();
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
            
            // عيون العدو
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(enemy.x + 10, enemy.y + 10, 10, 10);
            ctx.fillRect(enemy.x + enemy.width - 20, enemy.y + 10, 10, 10);
            
            // فم العدو
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 15, enemy.y + 30, enemy.width - 30, 5);
            
            // أرجل العدو
            ctx.fillStyle = '#C0392B';
            ctx.fillRect(enemy.x + 5, enemy.y + enemy.height - 5, 10, 10);
            ctx.fillRect(enemy.x + enemy.width - 15, enemy.y + enemy.height - 5, 10, 10);
            
            // حركة الأرجل
            const legOffset = Math.sin(this.frameCount * 0.1) * 3;
            ctx.fillRect(enemy.x + 5, enemy.y + enemy.height - 5 + legOffset, 10, 10);
            ctx.fillRect(enemy.x + enemy.width - 15, enemy.y + enemy.height - 5 - legOffset, 10, 10);
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
        
        // نسيج القصر
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < castle.width; i += 30) {
            for (let j = 0; j < castle.height; j += 30) {
                ctx.fillRect(castle.x + i, castle.y + j, 20, 20);
            }
        }
        
        // أبراج القصر
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(castle.x - 10, castle.y - 100, 40, 100);
        ctx.fillRect(castle.x + castle.width - 30, castle.y - 100, 40, 100);
        
        // نوافذ القصر
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.fillRect(castle.x + 20 + i * 50, castle.y + 20 + j * 40, 15, 25);
            }
        }
        
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
        
        // تأثير وميض العلم
        if (Math.sin(this.frameCount * 0.05) > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.moveTo(castle.x + castle.width/2, castle.y - 120);
            ctx.lineTo(castle.x + castle.width/2 + 15, castle.y - 115);
            ctx.lineTo(castle.x + castle.width/2, castle.y - 110);
            ctx.closePath();
            ctx.fill();
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
            const playerColor = player.invincible ? '#9B59B6' : player.color || '#E74C3C';
            
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
            
            // تأثير الحركة
            if (!player.grounded) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.beginPath();
                ctx.ellipse(
                    player.x + player.width/2,
                    player.y + player.height,
                    player.width/3,
                    5,
                    0, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
    
    drawHUD() {
        const ctx = this.ctx;
        
        // معلومات النقاط السريعة
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 150, 60);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Cairo';
        ctx.fillText(`النقاط: ${this.score}`, 20, 40);
        
        ctx.fillStyle = '#E74C3C';
        ctx.font = '16px Cairo';
        ctx.fillText(`الأرواح: ${this.lives}`, 20, 65);
    }
    
    toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                this.showNotification('🖥️ وضع ملء الشاشة مفعل');
            } else {
                document.exitFullscreen();
                this.showNotification('📱 الخروج من ملء الشاشة');
            }
        } catch (error) {
            console.log('⚠️ خطأ في ملء الشاشة');
            this.showNotification('⚠️ لا يدعم المتصفح ملء الشاشة');
        }
    }
    
    toggleSound() {
        const soundBtn = document.getElementById('sound-toggle');
        if (!soundBtn) return;
        
        if (soundBtn.innerHTML.includes('volume-up')) {
            soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            soundBtn.title = 'تشغيل الصوت';
            this.showNotification('🔇 الصوت متوقف');
        } else {
            soundBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            soundBtn.title = 'إيقاف الصوت';
            this.showNotification('🔊 الصوت مفعل');
        }
    }
    
    showNotification(text) {
        const notification = document.querySelector('.notification');
        const notificationText = document.querySelector('.notification-text');
        
        if (!notification || !notificationText) return;
        
        notificationText.textContent = text;
        notification.style.display = 'flex';
        
        // إخفاء الإشعار بعد 3 ثواني
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
        
        // تسجيل في الكونسول
        console.log(`📢 إشعار: ${text}`);
    }
}

// ============================================
// نظام إدارة الواجهة
// ============================================

class UIManager {
    constructor() {
        this.game = null;
    }
    
    initialize() {
        console.log('🎨 تهيئة نظام الواجهة...');
        
        // معالجة شاشة التحميل
        this.setupLoadingScreen();
        
        // إعداد الأزرار الرئيسية
        this.setupMainButtons();
        
        // إعداد النوافذ المنبثقة
        this.setupModals();
        
        // إعداد الإعدادات
        this.setupSettings();
        
        console.log('✅ نظام الواجهة جاهز');
    }
    
    setupLoadingScreen() {
        let progress = 0;
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.getElementById('progress-text');
        const loadingTips = [
            'جاري تحميل عالم المغامرة...',
            'تهيئة شخصية البطل...',
            'إعداد نظام النقاط...',
            'تحميل الأعداء والمخاطر...',
            'تهيئة القصر الملكي...',
            'جاري إعداد المؤثرات البصرية...',
            'تهيئة نظام الصوت والموسيقى...',
            'إعداد مركز التحكم...',
            'جاري تحميل آخر التحديثات...',
            'كل شيء جاهز! المغامرة تبدأ الآن...'
        ];
        
        const loadingInterval = setInterval(() => {
            progress += 10;
            const tipIndex = Math.floor(progress / 10) - 1;
            
            if (tipIndex >= 0 && tipIndex < loadingTips.length) {
                const tipElement = document.getElementById('loading-tip');
                if (tipElement) {
                    tipElement.textContent = loadingTips[tipIndex];
                }
            }
            
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
            
            if (progressText) {
                progressText.textContent = progress + '%';
            }
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    const loadingScreen = document.getElementById('loading-screen');
                    if (loadingScreen) {
                        loadingScreen.style.opacity = '0';
                        setTimeout(() => {
                            loadingScreen.style.display = 'none';
                            this.showStartScreen();
                        }, 500);
                    }
                }, 500);
            }
        }, 200);
    }
    
    showStartScreen() {
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.style.display = 'flex';
        }
        
        // تحديث أفضل نتيجة
        this.updateHighScore();
    }
    
    setupMainButtons() {
        // زر البدء
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.startGame();
                } else {
                    console.error('❌ اللعبة غير مهيأة!');
                    alert('⚠️ اللعبة غير مهيأة. جاري التحميل...');
                    location.reload();
                }
            });
        }
        
        // زر إعادة التشغيل
        const playAgainBtn = document.getElementById('play-again');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.restartGame();
                }
            });
        }
        
        // زر العودة للقائمة
        const backToMenuBtn = document.getElementById('back-to-menu');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.backToMenu();
                }
            });
        }
        
        // زر المشاركة
        const shareBtn = document.getElementById('share-victory');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareScore();
            });
        }
        
        // زر ملء الشاشة
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.toggleFullscreen();
                }
            });
        }
        
        // زر الموسيقى
        const musicBtn = document.getElementById('music-btn');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.toggleSound();
                }
            });
        }
    }
    
    setupModals() {
        // نافذة التعليمات
        const howToPlayBtn = document.getElementById('how-to-play');
        const helpModal = document.getElementById('help-modal');
        
        if (howToPlayBtn && helpModal) {
            howToPlayBtn.addEventListener('click', () => {
                helpModal.style.display = 'flex';
            });
        }
        
        // نافذة الإعدادات
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        
        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'flex';
            });
        }
        
        // أزرار الإغلاق
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
        
        // إغلاق بالنقر خارج النافذة
        window.addEventListener('click', (event) => {
            document.querySelectorAll('.modal').forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
    
    setupSettings() {
        const saveSettingsBtn = document.querySelector('.save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
    }
    
    saveSettings() {
        // حفظ الإعدادات في localStorage
        try {
            const soundEffects = document.getElementById('sound-effects').checked;
            const backgroundMusic = document.getElementById('background-music').checked;
            const vibration = document.getElementById('vibration').checked;
            const particles = document.getElementById('particles').checked;
            const sensitivity = document.getElementById('sensitivity').value;
            const buttonSize = document.getElementById('button-size').value;
            
            const settings = {
                soundEffects,
                backgroundMusic,
                vibration,
                particles,
                sensitivity,
                buttonSize,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('mario_game_settings', JSON.stringify(settings));
            
            // تطبيق حجم الأزرار
            this.applyButtonSize(buttonSize);
            
            this.showNotification('⚙️ تم حفظ الإعدادات بنجاح!');
            
            // إغلاق نافذة الإعدادات
            const settingsModal = document.getElementById('settings-modal');
            if (settingsModal) {
                settingsModal.style.display = 'none';
            }
        } catch (error) {
            console.error('❌ خطأ في حفظ الإعدادات:', error);
            this.showNotification('⚠️ فشل حفظ الإعدادات');
        }
    }
    
    applyButtonSize(size) {
        const buttons = document.querySelectorAll('.mobile-control-btn');
        buttons.forEach(btn => {
            btn.style.width = `${size}px`;
            btn.style.height = `${size}px`;
            btn.style.fontSize = `${size * 0.4}px`;
        });
    }
    
    updateHighScore() {
        try {
            const saved = localStorage.getItem('mario_high_score');
            const highScore = saved ? parseInt(saved) : 0;
            const highScoreElement = document.getElementById('high-score');
            if (highScoreElement) {
                highScoreElement.textContent = highScore;
            }
        } catch (error) {
            console.log('⚠️ فشل تحديث أفضل نتيجة');
        }
    }
    
    shareScore() {
        if (!window.game) return;
        
        const score = window.game.score;
        const coins = window.game.coins;
        const totalCoins = window.game.totalCoins;
        
        const shareText = `🎮 حققت ${score} نقطة في لعبة ماريو الخارقة! جمعت ${coins}/${totalCoins} عملة. جربها الآن! #لعبة_ماريو #ألعاب_عربية`;
        
        if (navigator.share) {
            navigator.share({
                title: 'نتيجتي في لعبة ماريو الخارقة',
                text: shareText,
                url: window.location.href
            }).then(() => {
                this.showNotification('📢 تم مشاركة النتيجة بنجاح!');
            }).catch(() => {
                this.copyToClipboard(shareText);
            });
        } else {
            this.copyToClipboard(shareText);
        }
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('📋 تم نسخ النتيجة للحافظة!');
        }).catch(() => {
            // طريقة بديلة
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('📋 تم نسخ النتيجة!');
        });
    }
    
    showNotification(text) {
        const notification = document.querySelector('.notification');
        const notificationText = document.querySelector('.notification-text');
        
        if (!notification || !notificationText) return;
        
        notificationText.textContent = text;
        notification.style.display = 'flex';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
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
            // إنشاء نظام الواجهة
            window.uiManager = new UIManager();
            window.uiManager.initialize();
            
            // إنشاء اللعبة
            window.game = new MarioGame();
            
            // حفظ مرجع للعبة في نظام الواجهة
            window.uiManager.game = window.game;
            
            console.log('✅ اللعبة جاهزة للعب!');
            
            // إظهار شاشة البداية بعد التحميل
            setTimeout(() => {
                const startScreen = document.getElementById('start-screen');
                if (startScreen) {
                    startScreen.style.display = 'flex';
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ فشل إنشاء اللعبة:', error);
            alert('🚨 خطأ في تحميل اللعبة!\n\n' + error.message + '\n\nجاري إعادة التحميل...');
            setTimeout(() => location.reload(), 3000);
        }
    }, 500);
});

// ============================================
// دالات الطوارئ
// ============================================

window.forceStartGame = function() {
    console.log('🆘 بدء طارئ للعبة...');
    if (window.game) {
        window.game.startGame();
        if (window.uiManager) {
            window.uiManager.showNotification('🚀 بدء طارئ للعبة!');
        }
    } else {
        alert('❌ اللعبة غير مهيأة! جاري التحميل...');
        location.reload();
    }
};

window.resetGame = function() {
    console.log('🔄 إعادة تعيين اللعبة...');
    if (window.game) {
        window.game.stopGame();
        window.game = new MarioGame();
        if (window.uiManager) {
            window.uiManager.game = window.game;
            window.uiManager.showNotification('🔄 تم إعادة تعيين اللعبة');
        }
    }
};

window.showDebugInfo = function() {
    console.log('🔍 معلومات التصحيح:', {
        game: window.game,
        uiManager: window.uiManager,
        screenSizes: {
            window: { width: window.innerWidth, height: window.innerHeight },
            canvas: window.game ? {
                width: window.game.canvas?.width,
                height: window.game.canvas?.height
            } : null
        },
        gameState: window.game?.gameState
    });
    
    if (window.uiManager) {
        window.uiManager.showNotification('🐛 معلومات التصحيح في الكونسول');
    }
};

// ============================================
// أحداث متصفح إضافية
// ============================================

// منع الإجراءات الافتراضية للتحكم في اللعبة
document.addEventListener('keydown', function(e) {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});

// إدارة وضع ملء الشاشة
document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('fullscreen-btn');
    if (btn) {
        if (document.fullscreenElement) {
            btn.innerHTML = '<i class="fas fa-compress"></i>';
            btn.title = 'تصغير الشاشة';
        } else {
            btn.innerHTML = '<i class="fas fa-expand"></i>';
            btn.title = 'ملء الشاشة';
        }
    }
});

// ============================================
// جعل الدوال متاحة عالمياً
// ============================================

window.startMarioGame = function() {
    if (window.game && window.game.startGame) {
        window.game.startGame();
    }
};

window.pauseMarioGame = function() {
    if (window.game && window.game.pauseGame) {
        window.game.pauseGame();
    }
};

window.restartMarioGame = function() {
    if (window.game && window.game.restartGame) {
        window.game.restartGame();
    }
};

console.log('🎮 كل الأنظمة جاهزة للعمل!');
