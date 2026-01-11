// ============================================
// SUPER MARIO 2D - GAME ENGINE
// ============================================

class MarioGame {
    constructor() {
        this.init();
    }

    // ===== INITIALIZATION =====
    init() {
        console.log('🎮 بدء تحميل لعبة ماريو...');
        
        // العناصر الأساسية
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // حالات اللعبة
        this.gameState = {
            current: 'loading',
            previous: null,
            isPaused: false,
            isGameOver: false,
            isMuted: false,
            isFullscreen: false
        };
        
        // إعدادات اللعبة
        this.settings = {
            volume: 70,
            difficulty: 'normal',
            controls: 'touch',
            graphics: 'high',
            language: 'ar'
        };
        
        // إحصائيات اللاعب
        this.stats = {
            score: 0,
            highScore: parseInt(localStorage.getItem('mario_highScore')) || 0,
            coins: 0,
            totalCoins: 20,
            lives: 3,
            time: 120, // ثواني
            level: 1,
            kills: 0,
            collectedItems: [],
            achievements: JSON.parse(localStorage.getItem('mario_achievements')) || []
        };
        
        // المتغيرات الزمنية
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameTime = 0;
        this.lastCoinTime = 0;
        this.lastEnemySpawn = 0;
        
        // العناصر المادية
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.items = [];
        this.particles = [];
        this.camera = { x: 0, y: 0 };
        
        // التحكم
        this.keys = {};
        this.touchControls = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false,
            action: false,
            run: false
        };
        
        // الصور
        this.images = {};
        this.sounds = {};
        
        // واجهة المستخدم
        this.UI = {
            screens: {},
            buttons: {},
            elements: {}
        };
        
        this.loadUI();
        this.setupEventListeners();
        this.setupCanvas();
        this.preloadAssets();
    }

    // ===== UI MANAGEMENT =====
    loadUI() {
        // جمع جميع الشاشات
        this.UI.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            pause: document.getElementById('pause-screen'),
            end: document.getElementById('end-screen'),
            help: document.getElementById('help-modal'),
            credits: document.getElementById('credits-modal'),
            loading: document.getElementById('loading')
        };
        
        // جمع جميع الأزرار
        const buttonIds = [
            'start-btn', 'howto-btn', 'credits-btn', 'pause-btn',
            'resume-btn', 'restart-btn', 'settings-btn', 'quit-btn',
            'next-level-btn', 'play-again-btn', 'main-menu-btn',
            'close-help', 'close-credits', 'sound-toggle', 'fullscreen-btn',
            'left-btn', 'right-btn', 'up-btn', 'down-btn',
            'jump-btn', 'action-btn', 'run-btn'
        ];
        
        buttonIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) this.UI.buttons[id] = btn;
        });
        
        // جمع العناصر الأخرى
        this.UI.elements = {
            timer: document.getElementById('timer'),
            score: document.getElementById('score'),
            lives: document.getElementById('lives'),
            level: document.getElementById('level'),
            progress: document.getElementById('level-progress'),
            loadingProgress: document.getElementById('loading-progress'),
            playerPreview: document.getElementById('player-preview'),
            bestTime: document.getElementById('best-time'),
            highScore: document.getElementById('high-score')
        };
        
        // تحديث الإحصائيات في الواجهة
        this.updateUIStats();
    }

    updateUIStats() {
        if (this.UI.elements.highScore) {
            this.UI.elements.highScore.textContent = this.stats.highScore.toLocaleString();
        }
        
        if (this.UI.elements.bestTime) {
            const bestTime = localStorage.getItem('mario_bestTime') || '00:00';
            this.UI.elements.bestTime.textContent = bestTime;
        }
    }

    // ===== CANVAS SETUP =====
    setupCanvas() {
        // تعيين حجم اللوحة
        this.resizeCanvas();
        
        // إعادة الحجم عند تغيير حجم النافذة
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resizeCanvas(), 100);
        });
    }

    resizeCanvas() {
        const container = document.querySelector('.game-area');
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // ضبط DPI للشاشات عالية الدقة
        const dpi = window.devicePixelRatio || 1;
        
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        this.canvas.width = width * dpi;
        this.canvas.height = height * dpi;
        
        this.ctx.scale(dpi, dpi);
        
        console.log(`📐 حجم اللوحة: ${width}x${height} (DPI: ${dpi})`);
    }

    // ===== ASSET LOADING =====
    preloadAssets() {
        console.log('🔄 جاري تحميل الأصول...');
        
        const assets = {
            images: [
                { id: 'player', url: 'assets/player.png' },
                { id: 'ground', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiM4QjQ1MTMiLz48cmVjdCB5PSI0MCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNUIzNTExIi8+PHJlY3QgeD0iOCIgeT0iNDgiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNBMDVGM0QiLz48cmVjdCB4PSIyNCIgeT0iNDgiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNBMDVGM0QiLz48cmVjdCB4PSI0MCIgeT0iNDgiIHdpZHRoPSI4IiBoZWlnaWd0PSI4IiBmaWxsPSIjQTA1RjNEIi8+PC9zdmc+' },
                { id: 'brick', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiNCRDcxMzEiLz48cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIGZpbGw9IiNERThCMzIiLz48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMjQiIGhlaWdodD0iOCIgZmlsbD0iI0ZGN0YyMyIvPjxyZWN0IHg9IjQiIHk9IjIwIiB3aWR0aD0iMjQiIGhlaWdodD0iOCIgZmlsbD0iI0ZGN0YyMyIvPjwvc3ZnPg==' },
                { id: 'coin', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0idXJsKCNjb2luX2dyYWRpZW50KSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjEwIiBmaWxsPSIjRkZBNTAwIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMyIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjgpIi8+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJjb2luX2dyYWRpZW50IiBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkZERDcwIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZCODQwIi8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PC9zdmc+' },
                { id: 'enemy', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyMCIgZmlsbD0iI0VGNEE3RiIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTgiIHI9IjQiIGZpbGw9IiMyQzNFNTAiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjE4IiByPSI0IiBmaWxsPSIjMkMzRTUwIi8+PHBhdGggZD0iTTE2IDM0IHE0IDQgOCA0IHQ4IC00IiBzdHJva2U9IiMyQzNFNTAiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0xMiAxMiBxNCAtNCA4IC00IHQ4IDQgNCA0IiBzdHJva2U9IiMyQzNFNTAiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==' }
            ],
            sounds: []
        };
        
        let loaded = 0;
        const total = assets.images.length + assets.sounds.length;
        
        // تحميل الصور
        assets.images.forEach(asset => {
            this.images[asset.id] = new Image();
            this.images[asset.id].src = asset.url;
            this.images[asset.id].onload = () => {
                loaded++;
                const percent = Math.floor((loaded / total) * 100);
                this.UI.elements.loadingProgress.textContent = `${percent}%`;
                
                if (loaded === total) {
                    this.onAssetsLoaded();
                }
            };
            this.images[asset.id].onerror = () => {
                console.warn(`⚠️ فشل تحميل الصورة: ${asset.id}`);
                loaded++;
                const percent = Math.floor((loaded / total) * 100);
                this.UI.elements.loadingProgress.textContent = `${percent}%`;
                
                if (loaded === total) {
                    this.onAssetsLoaded();
                }
            };
        });
        
        // تحميل الأصوات (يمكن إضافتها لاحقاً)
        setTimeout(() => {
            if (loaded < total) {
                loaded = total;
                this.onAssetsLoaded();
            }
        }, 2000);
    }

    onAssetsLoaded() {
        console.log('✅ تم تحميل جميع الأصول');
        
        // إخفاء شاشة التحميل
        setTimeout(() => {
            this.UI.screens.loading.style.opacity = '0';
            setTimeout(() => {
                this.UI.screens.loading.style.display = 'none';
                this.showScreen('start');
                this.initGameWorld();
            }, 500);
        }, 500);
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // أحداث لوحة المفاتيح
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // أحداث الشاشة
        window.addEventListener('blur', () => {
            if (this.gameState.current === 'game' && !this.gameState.isPaused) {
                this.pauseGame();
            }
        });
        
        // أحداث الهاتف
        this.setupTouchControls();
        
        // أحداث الأزرار
        this.setupButtonEvents();
        
        // أحداث التمرير
        document.addEventListener('touchmove', (e) => {
            if (this.gameState.current === 'game') {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupTouchControls() {
        // أزرار الحركة
        ['left', 'right', 'up', 'down', 'jump', 'action', 'run'].forEach(action => {
            const btn = this.UI.buttons[`${action}-btn`];
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.touchControls[action] = true;
                    btn.classList.add('active');
                });
                
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.touchControls[action] = false;
                    btn.classList.remove('active');
                });
                
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.touchControls[action] = true;
                    btn.classList.add('active');
                });
                
                btn.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    this.touchControls[action] = false;
                    btn.classList.remove('active');
                });
                
                btn.addEventListener('mouseleave', () => {
                    this.touchControls[action] = false;
                    btn.classList.remove('active');
                });
            }
        });
    }

    setupButtonEvents() {
        // زر البدء
        this.UI.buttons['start-btn']?.addEventListener('click', () => {
            this.startGame();
        });
        
        // زر المساعدة
        this.UI.buttons['howto-btn']?.addEventListener('click', () => {
            this.showModal('help');
        });
        
        // زر الإنجازات
        this.UI.buttons['credits-btn']?.addEventListener('click', () => {
            this.showModal('credits');
        });
        
        // زر الإيقاف المؤقت
        this.UI.buttons['pause-btn']?.addEventListener('click', () => {
            this.pauseGame();
        });
        
        // زر الاستئناف
        this.UI.buttons['resume-btn']?.addEventListener('click', () => {
            this.resumeGame();
        });
        
        // زر إعادة التشغيل
        this.UI.buttons['restart-btn']?.addEventListener('click', () => {
            this.restartGame();
        });
        
        // زر الخروج
        this.UI.buttons['quit-btn']?.addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // زر المستوى التالي
        this.UI.buttons['next-level-btn']?.addEventListener('click', () => {
            this.nextLevel();
        });
        
        // زر اللعب مجدداً
        this.UI.buttons['play-again-btn']?.addEventListener('click', () => {
            this.restartGame();
        });
        
        // زر القائمة الرئيسية
        this.UI.buttons['main-menu-btn']?.addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // زر إغلاق المساعدة
        this.UI.buttons['close-help']?.addEventListener('click', () => {
            this.hideModal('help');
        });
        
        // زر إغلاق الإنجازات
        this.UI.buttons['close-credits']?.addEventListener('click', () => {
            this.hideModal('credits');
        });
        
        // زر الصوت
        this.UI.buttons['sound-toggle']?.addEventListener('click', () => {
            this.toggleSound();
        });
        
        // زر الشاشة الكاملة
        this.UI.buttons['fullscreen-btn']?.addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        this.keys[e.code] = true;
        
        // إيقاف مؤقت بمسطرة المسافة أو زر P
        if ((e.key === ' ' || e.key === 'p' || e.key === 'P') && this.gameState.current === 'game') {
            e.preventDefault();
            this.pauseGame();
        }
        
        // الهروب للعودة للقائمة
        if (e.key === 'Escape') {
            if (this.gameState.current === 'pause') {
                this.resumeGame();
            } else if (this.gameState.current === 'game') {
                this.pauseGame();
            }
        }
    }

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
        this.keys[e.code] = false;
    }

    // ===== GAME WORLD =====
    initGameWorld() {
        // إنشاء اللاعب
        this.player = {
            x: 100,
            y: 300,
            width: 40,
            height: 60,
            velocityX: 0,
            velocityY: 0,
            speed: 8,
            jumpForce: -18,
            isJumping: false,
            isOnGround: true,
            facingRight: true,
            invincible: false,
            invincibleTime: 0,
            powerUps: []
        };
        
        // إنشاء الأرض
        const groundHeight = 50;
        this.platforms = [
            // الأرض الرئيسية
            { x: 0, y: this.canvas.height / window.devicePixelRatio - groundHeight, width: 2000, height: groundHeight },
            
            // منصات عائمة
            { x: 300, y: 350, width: 200, height: 20 },
            { x: 600, y: 300, width: 150, height: 20 },
            { x: 850, y: 250, width: 200, height: 20 },
            { x: 1200, y: 350, width: 150, height: 20 },
            { x: 1500, y: 280, width: 200, height: 20 },
            { x: 1800, y: 320, width: 180, height: 20 }
        ];
        
        // إنشاء العملات
        this.coins = [];
        for (let i = 0; i < this.stats.totalCoins; i++) {
            this.coins.push({
                x: 200 + i * 80 + Math.random() * 40,
                y: 200 + Math.sin(i * 0.5) * 100,
                collected: false,
                animation: 0,
                value: 100
            });
        }
        
        // إنشاء الأعداء
        this.enemies = [];
        for (let i = 0; i < 5; i++) {
            this.enemies.push({
                x: 400 + i * 300,
                y: this.platforms[0].y - 40,
                width: 40,
                height: 40,
                velocityX: 2 + Math.random() * 2,
                direction: Math.random() > 0.5 ? 1 : -1,
                type: 'goomba',
                health: 1,
                animation: 0
            });
        }
        
        // إنشاء العناصر الخاصة
        this.items = [
            { x: 500, y: 200, type: 'mushroom', collected: false },
            { x: 900, y: 180, type: 'flower', collected: false },
            { x: 1400, y: 220, type: 'star', collected: false }
        ];
        
        // إعادة تعيين الكاميرا
        this.camera.x = 0;
        this.camera.y = 0;
        
        // إعادة تعيين الجسيمات
        this.particles = [];
        
        console.log('🌍 تم إنشاء عالم اللعبة');
    }

    // ===== GAME FLOW =====
    showScreen(screenName) {
        // إخفاء جميع الشاشات
        Object.values(this.UI.screens).forEach(screen => {
            if (screen && screen.classList) {
                screen.classList.remove('active');
            }
        });
        
        // إخفاء جميع النوافذ المنبثقة
        this.hideModal('help');
        this.hideModal('credits');
        
        // إظهار الشاشة المطلوبة
        if (this.UI.screens[screenName]) {
            this.UI.screens[screenName].classList.add('active');
            this.gameState.current = screenName;
            
            if (screenName === 'game') {
                this.gameState.isPaused = false;
                this.startGameLoop();
            }
        }
    }

    showModal(modalName) {
        const modal = this.UI.screens[modalName];
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideModal(modalName) {
        const modal = this.UI.screens[modalName];
        if (modal) {
            modal.classList.remove('active');
        }
    }

    startGame() {
        console.log('🚀 بدء اللعبة');
        
        // إعادة تعيين الإحصائيات
        this.stats.score = 0;
        this.stats.coins = 0;
        this.stats.lives = 3;
        this.stats.time = 120;
        this.stats.level = 1;
        this.stats.kills = 0;
        this.stats.collectedItems = [];
        
        // إعادة تعيين العالم
        this.initGameWorld();
        
        // إظهار شاشة اللعب
        this.showScreen('game');
        
        // بدء المؤقت
        this.startGameTimer();
        
        // تحديث الواجهة
        this.updateGameUI();
    }

    pauseGame() {
        if (this.gameState.current !== 'game' || this.gameState.isGameOver) return;
        
        this.gameState.isPaused = true;
        this.showScreen('pause');
        
        // تحديث الإحصائيات في شاشة الإيقاف
        this.updatePauseUI();
        
        console.log('⏸ اللعبة متوقفة');
    }

    resumeGame() {
        if (this.gameState.current !== 'pause') return;
        
        this.gameState.isPaused = false;
        this.showScreen('game');
        
        console.log('▶ استئناف اللعبة');
    }

    restartGame() {
        console.log('🔄 إعادة تشغيل اللعبة');
        
        this.startGame();
    }

    nextLevel() {
        this.stats.level++;
        this.stats.time += 30; // إضافة 30 ثانية للمستوى الجديد
        
        // زيادة الصعوبة
        if (this.settings.difficulty === 'normal') {
            this.stats.totalCoins += 5;
        } else if (this.settings.difficulty === 'hard') {
            this.stats.totalCoins += 10;
            this.enemies.forEach(enemy => {
                enemy.velocityX *= 1.2;
            });
        }
        
        // إعادة تعيين العالم مع زيادة الصعوبة
        this.initGameWorld();
        this.showScreen('game');
        this.updateGameUI();
        
        console.log(`📈 المستوى ${this.stats.level}`);
    }

    gameOver(isWin = false) {
        this.gameState.isGameOver = true;
        this.gameState.isPaused = true;
        
        // تحديث أفضل النتائج
        if (this.stats.score > this.stats.highScore) {
            this.stats.highScore = this.stats.score;
            localStorage.setItem('mario_highScore', this.stats.highScore.toString());
        }
        
        // تحديث أفضل وقت
        const timeLeft = this.formatTime(this.stats.time);
        localStorage.setItem('mario_bestTime', timeLeft);
        
        // فحص الإنجازات
        this.checkAchievements();
        
        // تحديث شاشة النهاية
        this.updateEndUI(isWin);
        this.showScreen('end');
        
        console.log(isWin ? '🏆 فوز!' : '💀 هزيمة!');
    }

    // ===== GAME LOOP =====
    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop();
    }

    gameLoop(currentTime = 0) {
        // حساب الوقت المنقضي
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.gameTime += this.deltaTime;
        
        // تحديث اللعبة إذا لم تكن متوقفة
        if (!this.gameState.isPaused && this.gameState.current === 'game') {
            this.update(this.deltaTime);
        }
        
        // الرسم
        this.draw();
        
        // الاستمرار في الحلقة
        if (this.gameState.current === 'game' && !this.gameState.isGameOver) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    update(deltaTime) {
        // تحديث اللاعب
        this.updatePlayer(deltaTime);
        
        // تحديث الأعداء
        this.updateEnemies(deltaTime);
        
        // تحديث العملات
        this.updateCoins(deltaTime);
        
        // تحديث العناصر
        this.updateItems(deltaTime);
        
        // تحديث الجسيمات
        this.updateParticles(deltaTime);
        
        // تحديث الكاميرا
        this.updateCamera();
        
        // فحص الاصطدامات
        this.checkCollisions();
        
        // فحص شروط النهاية
        this.checkEndConditions();
    }

    updatePlayer(deltaTime) {
        if (!this.player) return;
        
        // تطبيق الجاذبية
        this.player.velocityY += 0.8;
        if (this.player.velocityY > 20) this.player.velocityY = 20;
        
        // التحكم بالحركة
        let moveDirection = 0;
        
        // لوحة المفاتيح
        if (this.keys['arrowleft'] || this.keys['a'] || this.keys['keya']) moveDirection -= 1;
        if (this.keys['arrowright'] || this.keys['d'] || this.keys['keyd']) moveDirection += 1;
        
        // التحكم باللمس
        if (this.touchControls.left) moveDirection -= 1;
        if (this.touchControls.right) moveDirection += 1;
        
        // تطبيق الحركة
        this.player.velocityX = moveDirection * this.player.speed;
        
        // القفز
        if ((this.keys[' '] || this.keys['space'] || this.keys['arrowup'] || this.keys['w'] || this.keys['keyw'] || this.touchControls.jump) && this.player.isOnGround) {
            this.player.velocityY = this.player.jumpForce;
            this.player.isJumping = true;
            this.player.isOnGround = false;
            this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height, 5, '#FFD700');
        }
        
        // تحديث الموضع
        this.player.x += this.player.velocityX * deltaTime * 60;
        this.player.y += this.player.velocityY * deltaTime * 60;
        
        // تحديث الاتجاه
        if (moveDirection > 0) this.player.facingRight = true;
        if (moveDirection < 0) this.player.facingRight = false;
        
        // تحديث المناعة
        if (this.player.invincible) {
            this.player.invincibleTime -= deltaTime;
            if (this.player.invincibleTime <= 0) {
                this.player.invincible = false;
            }
        }
        
        // منع الخروج عن حدود العالم
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > 2000 - this.player.width) this.player.x = 2000 - this.player.width;
        
        // فحص الاصطدام مع الأرض
        this.player.isOnGround = false;
        const playerBottom = this.player.y + this.player.height;
        
        for (const platform of this.platforms) {
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                playerBottom > platform.y &&
                this.player.y < platform.y &&
                this.player.velocityY > 0) {
                
                this.player.y = platform.y - this.player.height;
                this.player.velocityY = 0;
                this.player.isOnGround = true;
                this.player.isJumping = false;
                
                // جسيمات الهبوط
                if (this.player.velocityY > 10) {
                    this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height, 8, '#8B4513');
                }
            }
        }
        
        // السقوط من العالم
        if (this.player.y > this.canvas.height / window.devicePixelRatio + 100) {
            this.playerDie();
        }
    }

    updateEnemies(deltaTime) {
        this.enemies.forEach((enemy, index) => {
            // الحركة
            enemy.x += enemy.velocityX * enemy.direction * deltaTime * 60;
            enemy.animation += deltaTime * 10;
            
            // تغيير الاتجاه عند الاصطدام
            let hitWall = false;
            
            // الاصطدام بالحواف
            if (enemy.x <= 0 || enemy.x + enemy.width >= 2000) {
                enemy.direction *= -1;
                enemy.x = Math.max(0, Math.min(2000 - enemy.width, enemy.x));
                hitWall = true;
            }
            
            // الاصطدام بالمنصات
            for (const platform of this.platforms) {
                if (enemy.x <= platform.x + platform.width &&
                    enemy.x + enemy.width >= platform.x &&
                    enemy.y + enemy.height >= platform.y &&
                    enemy.y <= platform.y) {
                    
                    if (enemy.velocityY >= 0) {
                        enemy.y = platform.y - enemy.height;
                        enemy.velocityY = 0;
                    }
                }
                
                // الاصطدام الجانبي
                if ((enemy.velocityX > 0 && enemy.x + enemy.width >= platform.x && enemy.x <= platform.x && 
                     enemy.y + enemy.height > platform.y && enemy.y < platform.y + platform.height) ||
                    (enemy.velocityX < 0 && enemy.x <= platform.x + platform.width && enemy.x + enemy.width >= platform.x + platform.width &&
                     enemy.y + enemy.height > platform.y && enemy.y < platform.y + platform.height)) {
                    
                    enemy.direction *= -1;
                    hitWall = true;
                }
            }
            
            // الجاذبية للأعداء
            enemy.velocityY += 0.5;
            enemy.y += enemy.velocityY * deltaTime * 60;
            
            // جسيمات الاصطدام
            if (hitWall) {
                this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 3, '#EF476F');
            }
            
            // إزالة الأعداء الساقطين
            if (enemy.y > this.canvas.height / window.devicePixelRatio + 200) {
                this.enemies.splice(index, 1);
            }
        });
    }

    updateCoins(deltaTime) {
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.animation += deltaTime * 5;
            }
        });
    }

    updateItems(deltaTime) {
        this.items.forEach(item => {
            if (!item.collected) {
                // حركة طفيفة للعناصر
                item.y += Math.sin(this.gameTime * 2) * 0.5;
            }
        });
    }

    updateParticles(deltaTime) {
        this.particles.forEach((particle, index) => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.2; // جاذبية للجسيمات
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }

    updateCamera() {
        if (!this.player) return;
        
        // متابعة اللاعب مع هامش
        const targetX = this.player.x - (this.canvas.width / window.devicePixelRatio) / 2 + this.player.width / 2;
        const targetY = this.player.y - (this.canvas.height / window.devicePixelRatio) / 2 + this.player.height / 2;
        
        // تطبيق بسلاسة
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
        
        // الحدود
        this.camera.x = Math.max(0, Math.min(2000 - this.canvas.width / window.devicePixelRatio, this.camera.x));
        this.camera.y = Math.max(0, Math.min(600 - this.canvas.height / window.devicePixelRatio, this.camera.y));
    }

    // ===== COLLISIONS =====
    checkCollisions() {
        // جمع العملات
        this.coins.forEach((coin, index) => {
            if (!coin.collected) {
                const distance = Math.sqrt(
                    Math.pow(this.player.x + this.player.width/2 - coin.x, 2) +
                    Math.pow(this.player.y + this.player.height/2 - coin.y, 2)
                );
                
                if (distance < 30) {
                    coin.collected = true;
                    this.stats.coins++;
                    this.stats.score += coin.value;
                    
                    // جسيمات الجمع
                    this.createParticles(coin.x, coin.y, 15, '#FFD700');
                    
                    // تحديث الواجهة
                    this.updateGameUI();
                    
                    // تحديث شريط التقدم
                    this.updateProgressBar();
                    
                    console.log(`💰 جمع عملة! الإجمالي: ${this.stats.coins}/${this.stats.totalCoins}`);
                }
            }
        });
        
        // جمع العناصر
        this.items.forEach((item, index) => {
            if (!item.collected) {
                const distance = Math.sqrt(
                    Math.pow(this.player.x + this.player.width/2 - item.x, 2) +
                    Math.pow(this.player.y + this.player.height/2 - item.y, 2)
                );
                
                if (distance < 40) {
                    item.collected = true;
                    this.stats.collectedItems.push(item.type);
                    
                    // تأثير العنصر
                    switch (item.type) {
                        case 'mushroom':
                            this.player.width *= 1.2;
                            this.player.height *= 1.2;
                            this.player.invincible = true;
                            this.player.invincibleTime = 10;
                            this.stats.score += 500;
                            break;
                        case 'flower':
                            this.player.speed *= 1.5;
                            this.player.invincible = true;
                            this.player.invincibleTime = 15;
                            this.stats.score += 1000;
                            break;
                        case 'star':
                            this.player.invincible = true;
                            this.player.invincibleTime = 20;
                            this.stats.score += 2000;
                            break;
                    }
                    
                    // جسيمات العنصر
                    this.createParticles(item.x, item.y, 20, this.getItemColor(item.type));
                    
                    // تحديث الواجهة
                    this.updateGameUI();
                    
                    console.log(`🎁 جمع عنصر: ${item.type}`);
                }
            }
        });
        
        // الاصطدام بالأعداء
        this.enemies.forEach((enemy, index) => {
            const distance = Math.sqrt(
                Math.pow(this.player.x + this.player.width/2 - (enemy.x + enemy.width/2), 2) +
                Math.pow(this.player.y + this.player.height/2 - (enemy.y + enemy.height/2), 2)
            );
            
            if (distance < 50) {
                if (this.player.velocityY > 0 && this.player.y + this.player.height < enemy.y + enemy.height/2) {
                    // القفز على العدو
                    this.enemies.splice(index, 1);
                    this.stats.kills++;
                    this.stats.score += 200;
                    
                    // جسيمات التدمير
                    this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 10, '#EF476F');
                    
                    // قوة القفز
                    this.player.velocityY = -12;
                    
                    // تحديث الواجهة
                    this.updateGameUI();
                    
                    console.log(`👾 هزمت عدواً! الإجمالي: ${this.stats.kills}`);
                } else if (!this.player.invincible) {
                    // تضرر اللاعب
                    this.playerDamaged();
                }
            }
        });
    }

    // ===== DRAWING =====
    draw() {
        if (!this.ctx) return;
        
        // مسح الشاشة
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // تطبيق تحويلات الكاميرا
        this.ctx.save();
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // رسم الخلفية
        this.drawBackground();
        
        // رسم الأرض والمنصات
        this.drawPlatforms();
        
        // رسم العملات
        this.drawCoins();
        
        // رسم العناصر
        this.drawItems();
        
        // رسم الأعداء
        this.drawEnemies();
        
        // رسم الجسيمات
        this.drawParticles();
        
        // رسم اللاعب
        this.drawPlayer();
        
        // استعادة تحويلات الكاميرا
        this.ctx.restore();
        
        // رسم واجهة اللعبة
        this.drawHUD();
    }

    drawBackground() {
        // السماء المتدرجة
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height / window.devicePixelRatio);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#5DADE2');
        gradient.addColorStop(1, '#3498DB');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 2000, this.canvas.height / window.devicePixelRatio);
        
        // السحب
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 10; i++) {
            const x = (this.camera.x * 0.3 + i * 200) % 2200;
            const y = 50 + Math.sin(this.gameTime + i) * 20;
            this.drawCloud(x, y, 60);
        }
        
        // الجبال البعيدة
        this.ctx.fillStyle = '#2C3E50';
        this.drawMountain(300, 200, 200, 150);
        this.drawMountain(600, 180, 180, 130);
        this.drawMountain(900, 220, 220, 170);
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
        
        // الثلج
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.beginPath();
        this.ctx.moveTo(x + width * 0.4, y + height * 0.3);
        this.ctx.lineTo(x + width * 0.6, y + height * 0.3);
        this.ctx.lineTo(x + width * 0.5, y + height * 0.1);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.fillStyle = '#2C3E50';
    }

    drawPlatforms() {
        this.platforms.forEach(platform => {
            // استخدام صورة الأرض إذا كانت متوفرة
            if (this.images.ground && this.images.ground.complete) {
                const pattern = this.ctx.createPattern(this.images.ground, 'repeat');
                this.ctx.fillStyle = pattern;
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            } else {
                // رسم بديل
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                
                // تفاصيل الأرض
                this.ctx.fillStyle = '#A0522D';
                for (let i = 0; i < platform.width; i += 20) {
                    this.ctx.fillRect(platform.x + i, platform.y, 10, 5);
                }
            }
            
            // ظل المنصة
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 5);
        });
    }

    drawCoins() {
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const bounce = Math.sin(coin.animation) * 10;
                
                // استخدام صورة العملة إذا كانت متوفرة
                if (this.images.coin && this.images.coin.complete) {
                    this.ctx.drawImage(this.images.coin, coin.x - 16, coin.y - 16 + bounce, 32, 32);
                } else {
                    // رسم بديل للعملة
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.beginPath();
                    this.ctx.arc(coin.x, coin.y + bounce, 12, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.fillStyle = '#FFA500';
                    this.ctx.beginPath();
                    this.ctx.arc(coin.x, coin.y + bounce, 8, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // بريق
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    this.ctx.beginPath();
                    this.ctx.arc(coin.x - 3, coin.y - 3 + bounce, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // تأثير الدوران
                this.ctx.save();
                this.ctx.translate(coin.x, coin.y + bounce);
                this.ctx.rotate(coin.animation * 0.5);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.fillRect(-2, -8, 4, 16);
                this.ctx.restore();
            }
        });
    }

    drawItems() {
        this.items.forEach(item => {
            if (!item.collected) {
                const color = this.getItemColor(item.type);
                const size = 20;
                
                // رسم العنصر
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                
                switch (item.type) {
                    case 'mushroom':
                        // عيش الغراب
                        this.ctx.arc(item.x, item.y, size, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        this.ctx.fillStyle = '#FFF';
                        this.ctx.beginPath();
                        this.ctx.arc(item.x - 5, item.y - 5, size * 0.3, 0, Math.PI * 2);
                        this.ctx.arc(item.x + 5, item.y - 5, size * 0.3, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                        
                    case 'flower':
                        // زهرة
                        for (let i = 0; i < 8; i++) {
                            const angle = (i * Math.PI) / 4 + this.gameTime;
                            this.ctx.save();
                            this.ctx.translate(item.x, item.y);
                            this.ctx.rotate(angle);
                            this.ctx.fillRect(0, -size/2, size, size/2);
                            this.ctx.restore();
                        }
                        break;
                        
                    case 'star':
                        // نجمة
                        this.ctx.save();
                        this.ctx.translate(item.x, item.y);
                        this.ctx.rotate(this.gameTime * 2);
                        this.drawStar(0, 0, 5, size, size/2);
                        this.ctx.restore();
                        break;
                }
                
                // توهج
                this.ctx.shadowColor = color;
                this.ctx.shadowBlur = 15;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
    }

    drawEnemies() {
        this.enemies.forEach(enemy => {
            // استخدام صورة العدو إذا كانت متوفرة
            if (this.images.enemy && this.images.enemy.complete) {
                this.ctx.save();
                if (enemy.direction < 0) {
                    this.ctx.scale(-1, 1);
                    this.ctx.drawImage(this.images.enemy, -enemy.x - enemy.width, enemy.y, enemy.width, enemy.height);
                } else {
                    this.ctx.drawImage(this.images.enemy, enemy.x, enemy.y, enemy.width, enemy.height);
                }
                this.ctx.restore();
            } else {
                // رسم بديل للعدو
                this.ctx.fillStyle = '#EF476F';
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                
                // العيون
                this.ctx.fillStyle = '#2C3E50';
                this.ctx.fillRect(enemy.x + 10, enemy.y + 10, 8, 8);
                this.ctx.fillRect(enemy.x + enemy.width - 18, enemy.y + 10, 8, 8);
                
                // القدم
                const footOffset = Math.sin(enemy.animation) * 5;
                this.ctx.fillRect(enemy.x + 5, enemy.y + enemy.height - 5, 10, 5 + footOffset);
                this.ctx.fillRect(enemy.x + enemy.width - 15, enemy.y + enemy.height - 5, 10, 5 - footOffset);
            }
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
    }

    drawPlayer() {
        if (!this.player) return;
        
        // تأثير المناعة (وميض)
        if (this.player.invincible && Math.floor(this.player.invincibleTime * 10) % 2 === 0) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // استخدام صورة اللاعب إذا كانت متوفرة
        if (this.images.player && this.images.player.complete) {
            this.ctx.save();
            if (!this.player.facingRight) {
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(this.images.player, -this.player.x - this.player.width, this.player.y, this.player.width, this.player.height);
            } else {
                this.ctx.drawImage(this.images.player, this.player.x, this.player.y, this.player.width, this.player.height);
            }
            this.ctx.restore();
        } else {
            // رسم بديل للاعب
            this.ctx.fillStyle = this.player.invincible ? '#9B59B6' : '#E74C3C';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            
            // الوجه
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(this.player.x + 10, this.player.y + 10, 20, 20);
            
            // العيون
            this.ctx.fillStyle = '#FFF';
            const eyeOffset = this.player.isJumping ? 2 : 0;
            this.ctx.fillRect(this.player.x + 15, this.player.y + 15 + eyeOffset, 5, 5);
            this.ctx.fillRect(this.player.x + 25, this.player.y + 15 + eyeOffset, 5, 5);
        }
        
        this.ctx.globalAlpha = 1;
        
        // تأثير القفز
        if (this.player.isJumping) {
            this.ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width/2,
                this.player.y + this.player.height,
                15 + Math.sin(this.gameTime * 10) * 5,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
    }

    drawHUD() {
        // تطبيق DPI للواجهة
        this.ctx.save();
        this.ctx.scale(1/window.devicePixelRatio, 1/window.devicePixelRatio);
        
        // لا شيء هنا لأن الواجهة مرسومة بـ HTML/CSS
        
        this.ctx.restore();
    }

    // ===== UTILITY FUNCTIONS =====
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 10,
                velocityY: (Math.random() - 0.5) * 10 - 5,
                size: Math.random() * 5 + 2,
                color: color,
                life: 1
            });
        }
    }

    getItemColor(type) {
        switch (type) {
            case 'mushroom': return '#E74C3C';
            case 'flower': return '#9B59B6';
            case 'star': return '#F1C40F';
            default: return '#FFF';
        }
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;
        
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
    }

    // ===== GAME LOGIC =====
    playerDamaged() {
        if (this.player.invincible) return;
        
        this.stats.lives--;
        this.updateGameUI();
        
        if (this.stats.lives <= 0) {
            this.gameOver(false);
        } else {
            // مناعة مؤقتة بعد الضرر
            this.player.invincible = true;
            this.player.invincibleTime = 2;
            
            // تأثير ارتداد
            this.player.velocityY = -10;
            this.player.velocityX = this.player.facingRight ? -10 : 10;
            
            // جسيمات الضرر
            this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 10, '#EF476F');
            
            console.log(`💔 تضررت! الأرواح المتبقية: ${this.stats.lives}`);
        }
    }

    playerDie() {
        this.stats.lives--;
        this.updateGameUI();
        
        if (this.stats.lives <= 0) {
            this.gameOver(false);
        } else {
            // إعادة تعيين اللاعب
            this.player.x = Math.max(0, this.camera.x + 50);
            this.player.y = 300;
            this.player.velocityX = 0;
            this.player.velocityY = 0;
            this.player.invincible = true;
            this.player.invincibleTime = 3;
            
            console.log(`💀 سقوط! الأرواح المتبقية: ${this.stats.lives}`);
        }
    }

    checkEndConditions() {
        // الوقت انتهى
        if (this.stats.time <= 0) {
            this.gameOver(false);
            return;
        }
        
        // جمع كل العملات
        if (this.stats.coins >= this.stats.totalCoins) {
            this.gameOver(true);
            return;
        }
        
        // وصل لنهاية العالم
        if (this.player.x >= 1900) {
            this.gameOver(true);
            return;
        }
    }

    // ===== TIMER =====
    startGameTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.gameState.isPaused && this.gameState.current === 'game') {
                this.stats.time--;
                this.updateGameUI();
                
                if (this.stats.time <= 0) {
                    clearInterval(this.timerInterval);
                    this.gameOver(false);
                }
            }
        }, 1000);
    }

    // ===== UI UPDATES =====
    updateGameUI() {
        // الوقت
        if (this.UI.elements.timer) {
            this.UI.elements.timer.textContent = this.formatTime(this.stats.time);
        }
        
        // النقاط
        if (this.UI.elements.score) {
            this.UI.elements.score.textContent = this.stats.score.toLocaleString();
        }
        
        // الأرواح
        if (this.UI.elements.lives) {
            this.UI.elements.lives.textContent = this.stats.lives;
        }
        
        // المستوى
        if (this.UI.elements.level) {
            this.UI.elements.level.textContent = this.stats.level;
        }
    }

    updatePauseUI() {
        document.getElementById('pause-time').textContent = this.formatTime(this.stats.time);
        document.getElementById('pause-score').textContent = this.stats.score.toLocaleString();
        document.getElementById('pause-level').textContent = this.stats.level;
    }

    updateEndUI(isWin) {
        const icon = document.getElementById('end-icon');
        const title = document.getElementById('end-title');
        const message = document.getElementById('end-message');
        
        if (isWin) {
            icon.textContent = '🏆';
            title.textContent = 'تهانينا!';
            message.textContent = `لقد أكملت المستوى ${this.stats.level}!`;
        } else {
            icon.textContent = '💀';
            title.textContent = 'انتهت اللعبة';
            message.textContent = 'حاول مرة أخرى!';
        }
        
        document.getElementById('end-time').textContent = this.formatTime(120 - this.stats.time);
        document.getElementById('end-score').textContent = this.stats.score.toLocaleString();
        document.getElementById('end-coins').textContent = `${this.stats.coins}/${this.stats.totalCoins}`;
        document.getElementById('end-enemies').textContent = this.stats.kills;
        
        // إظهار زر المستوى التالي فقط عند الفوز
        document.getElementById('next-level-btn').style.display = isWin ? 'block' : 'none';
    }

    updateProgressBar() {
        const progress = (this.stats.coins / this.stats.totalCoins) * 100;
        if (this.UI.elements.progress) {
            this.UI.elements.progress.style.width = `${progress}%`;
        }
    }

    // ===== ACHIEVEMENTS =====
    checkAchievements() {
        const achievements = [
            { id: 1, condition: () => this.stats.level >= 1, icon: '🥇', title: 'الفوز لأول مرة', desc: 'اكمل المستوى الأول' },
            { id: 2, condition: () => this.stats.coins >= 100, icon: '💰', title: 'جامع الكنوز', desc: 'اجمع 100 عملة' },
            { id: 3, condition: () => (120 - this.stats.time) < 60, icon: '⚡', title: 'الصاعقة', desc: 'انهِ مستوى في أقل من دقيقة' },
            { id: 4, condition: () => this.stats.kills >= 20, icon: '👻', title: 'صائد الوحوش', desc: 'اهزم 20 وحشاً' }
        ];
        
        achievements.forEach(ach => {
            if (ach.condition() && !this.stats.achievements.includes(ach.id)) {
                this.stats.achievements.push(ach.id);
                this.showAchievement(ach);
            }
        });
        
        // حفظ الإنجازات
        localStorage.setItem('mario_achievements', JSON.stringify(this.stats.achievements));
    }

    showAchievement(achievement) {
        console.log(`🏅 إنجاز مفتوح: ${achievement.title}`);
        
        // تحديث واجهة الإنجازات
        const element = document.getElementById(`ach-${achievement.id}`);
        if (element) {
            element.textContent = '✅';
            element.title = `${achievement.title}: ${achievement.desc}`;
        }
    }

    // ===== SETTINGS =====
    toggleSound() {
        this.gameState.isMuted = !this.gameState.isMuted;
        const btn = this.UI.buttons['sound-toggle'];
        if (btn) {
            btn.textContent = this.gameState.isMuted ? '🔇' : '🔊';
        }
        console.log(this.gameState.isMuted ? '🔇 صوت معطل' : '🔊 صوت مفعل');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`❌ خطأ في الشاشة الكاملة: ${err.message}`);
            });
            this.gameState.isFullscreen = true;
        } else {
            document.exitFullscreen();
            this.gameState.isFullscreen = false;
        }
    }

    // ===== HELPER FUNCTIONS =====
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // ===== CLEANUP =====
    cleanup() {
        clearInterval(this.timerInterval);
        this.particles = [];
        this.enemies = [];
        this.coins = [];
        this.items = [];
    }
}

// ============================================
// START THE GAME WHEN PAGE LOADS
// ============================================

let game;

window.addEventListener('load', () => {
    console.log('📄 الصفحة محملة، بدء اللعبة...');
    
    // تهيئة اللعبة
    game = new MarioGame();
    
    // إخفاء رسالة التحميل بعد تأخير قصير
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
        }
    }, 1000);
    
    // منع التمرير على الهاتف
    document.addEventListener('touchmove', (e) => {
        if (game && game.gameState.current === 'game') {
            e.preventDefault();
        }
    }, { passive: false });
    
    // إدارة الشاشة الكاملة
    document.addEventListener('fullscreenchange', () => {
        game.gameState.isFullscreen = !!document.fullscreenElement;
    });
});

// منع قائمة السياق
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// ============================================
// FORCE LANDSCAPE ORIENTATION
// ============================================

function lockOrientation() {
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(error => {
            console.log('⚠️ لا يمكن تثبيت الدوران:', error);
        });
    } else if (screen.lockOrientation) {
        screen.lockOrientation('landscape');
    } else if (screen.mozLockOrientation) {
        screen.mozLockOrientation('landscape');
    } else if (screen.msLockOrientation) {
        screen.msLockOrientation('landscape');
    }
}

// محاولة تثبيت الدوران عند تحميل الصفحة
if (window.innerHeight > window.innerWidth) {
    lockOrientation();
}

// محاولة تثبيت الدوران عند تغيير الحجم
window.addEventListener('resize', () => {
    if (window.innerHeight > window.innerWidth) {
        lockOrientation();
    }
});
