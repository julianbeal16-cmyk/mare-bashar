// ============================================
// 🎮 محرك لعبة ماريو - النسخة النهائية الكاملة
// ============================================

'use strict';

const MarioGame = {
    // الإعدادات
    canvas: null,
    ctx: null,
    state: 'menu',
    currentLevel: 1,
    totalLevels: 3,
    
    // الإحصائيات
    score: 0,
    bestScore: 0,
    lives: 3,
    timeLeft: 180,
    coinsCollected: 0,
    totalCoins: 0,
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
    worldWidth: 4000,
    worldHeight: 600,
    
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
    
    // ======================
    // التهيئة الأساسية
    // ======================
    init() {
        console.log('🎮 بدء تهيئة اللعبة...');
        
        try {
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');
            
            if (!this.canvas || !this.ctx) {
                throw new Error('تعذر تحميل Canvas');
            }
            
            this.setupCanvas();
            this.loadPlayerImage();
            this.loadBestScore();
            this.setupControls();
            this.setupAudio();
            
            this.state = 'menu';
            console.log('✅ اللعبة مهيأة بنجاح!');
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showError('خطأ في التهيئة: ' + error.message);
        }
    },
    
    setupCanvas() {
        console.log('📏 ضبط حجم Canvas...');
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer && this.canvas) {
            this.canvas.width = gameContainer.clientWidth;
            this.canvas.height = gameContainer.clientHeight;
            this.worldHeight = this.canvas.height;
            console.log(`✅ Canvas: ${this.canvas.width}x${this.canvas.height}`);
            
            // رسم اختبار
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('🎮 Canvas جاهز!', 10, 30);
        }
        
        window.addEventListener('resize', () => {
            if (this.canvas) {
                const gameContainer = document.querySelector('.game-container');
                if (gameContainer) {
                    this.canvas.width = gameContainer.clientWidth;
                    this.canvas.height = gameContainer.clientHeight;
                    console.log(`🔄 Canvas جديد: ${this.canvas.width}x${this.canvas.height}`);
                }
            }
        });
    },
    
    loadPlayerImage() {
        console.log('🖼️ تحميل صورة اللاعب...');
        this.playerImage = new Image();
        
        this.playerImage.onload = () => {
            console.log('✅ تم تحميل صورة اللاعب بنجاح');
            this.imageLoaded = true;
        };
        
        this.playerImage.onerror = () => {
            console.warn('⚠️ فشل تحميل صورة اللاعب، إنشاء صورة بديلة');
            this.createFallbackImage();
        };
        
        // جرب مسارات مختلفة
        const imageSources = [
            'player.png',
            './player.png',
            'images/player.png',
            'https://via.placeholder.com/50x80/E74C3C/FFFFFF?text=ME'
        ];
        
        let currentIndex = 0;
        const tryNextSource = () => {
            if (currentIndex < imageSources.length) {
                console.log(`🔄 محاولة تحميل: ${imageSources[currentIndex]}`);
                this.playerImage.src = imageSources[currentIndex];
                currentIndex++;
            } else {
                this.createFallbackImage();
            }
        };
        
        this.playerImage.onerror = tryNextSource;
        tryNextSource();
    },
    
    createFallbackImage() {
        console.log('🎨 إنشاء صورة بديلة...');
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        
        // جسم أحمر
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(5, 30, 40, 50);
        
        // رأس
        ctx.fillStyle = '#C0392B';
        ctx.beginPath();
        ctx.arc(25, 20, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // عينان
        ctx.fillStyle = 'white';
        ctx.fillRect(18, 15, 6, 6);
        ctx.fillRect(32, 15, 6, 6);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(20, 17, 2, 2);
        ctx.fillRect(34, 17, 2, 2);
        
        // قبعة زرقاء
        ctx.fillStyle = '#2980B9';
        ctx.fillRect(15, 5, 20, 10);
        ctx.fillRect(20, 0, 10, 10);
        
        this.playerImage = canvas;
        this.imageLoaded = true;
        console.log('✅ صورة بديلة جاهزة');
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
        
        this.resetGame();
        this.currentLevel = levelNumber;
        
        // تحديث عرض المرحلة
        document.getElementById('hud-level').textContent = levelNumber;
        document.getElementById('final-level').textContent = levelNumber;
        
        // إنشاء المرحلة
        this.createLevel(levelNumber);
        
        this.updateUI();
        this.showScreen('game');
        this.startTimer();
        this.startGameLoop();
        
        this.showNotification(`🚀 المرحلة ${levelNumber} - ابدأ مغامرتك!`);
    },
    
    createLevel(levelNumber) {
        console.log(`🌍 إنشاء المرحلة ${levelNumber}...`);
        const canvas = this.canvas;
        const groundY = canvas.height - 100;
        
        // إعدادات المرحلة
        let levelSettings;
        switch(levelNumber) {
            case 1:
                levelSettings = this.getLevel1Settings(groundY);
                this.worldWidth = 3500;
                this.totalCoins = 40;
                break;
            case 2:
                levelSettings = this.getLevel2Settings(groundY);
                this.worldWidth = 4500;
                this.totalCoins = 50;
                break;
            case 3:
                levelSettings = this.getLevel3Settings(groundY);
                this.worldWidth = 5500;
                this.totalCoins = 60;
                break;
            default:
                levelSettings = this.getLevel1Settings(groundY);
                this.worldWidth = 3500;
                this.totalCoins = 40;
        }
        
        // اللاعب
        this.player = {
            x: 150,
            y: groundY - 150,
            width: 50,
            height: 80,
            speed: 6,
            velX: 0,
            velY: 0,
            jumpPower: -15,
            gravity: 0.8,
            grounded: false,
            facingRight: true,
            color: '#E74C3C',
            isSliding: false,
            slideTimer: 0
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
        
        // إضافة المنصات
        levelSettings.platforms.forEach(p => {
            this.platforms.push({
                x: p.x,
                y: p.y,
                width: p.width,
                height: p.height,
                type: 'platform',
                color: p.color || '#A0522D'
            });
        });
        
        // العملات
        this.coins = [];
        levelSettings.coins.forEach(c => {
            this.coins.push({
                x: c.x,
                y: c.y,
                collected: false,
                radius: 12,
                animation: Math.random() * Math.PI * 2
            });
        });
        
        // الأعداء
        this.enemies = [];
        levelSettings.enemies.forEach(e => {
            this.enemies.push({
                x: e.x,
                y: e.y,
                width: 45,
                height: 45,
                speed: e.speed || 2,
                direction: Math.random() > 0.5 ? 1 : -1,
                color: e.color || '#EF476F',
                active: true,
                originalX: e.x,
                moveRange: e.moveRange || 100
            });
        });
        
        // القصر
        this.castle = {
            x: this.worldWidth - 400,
            y: groundY - 250,
            width: 280,
            height: 200,
            color: '#8B4513',
            reached: false
        };
        
        console.log(`✅ المرحلة ${levelNumber} مخلوقة:
        - ${this.platforms.length} منصة
        - ${this.coins.length} عملة
        - ${this.enemies.length} عدو
        - العالم: ${this.worldWidth}px
        `);
    },
    
    getLevel1Settings(groundY) {
        return {
            platforms: [
                { x: 300, y: groundY - 120, width: 180, height: 25 },
                { x: 600, y: groundY - 100, width: 160, height: 25 },
                { x: 900, y: groundY - 140, width: 140, height: 25 },
                { x: 1200, y: groundY - 110, width: 170, height: 25 },
                { x: 1500, y: groundY - 160, width: 200, height: 25 },
                { x: 1800, y: groundY - 130, width: 180, height: 25 },
                { x: 2100, y: groundY - 150, width: 190, height: 25 },
                { x: 2400, y: groundY - 120, width: 160, height: 25 },
                { x: 2700, y: groundY - 170, width: 150, height: 25 },
                { x: 3000, y: groundY - 140, width: 180, height: 25 }
            ],
            coins: [
                { x: 200, y: groundY - 70 }, { x: 300, y: groundY - 70 }, { x: 400, y: groundY - 70 },
                { x: 350, y: groundY - 90 }, { x: 650, y: groundY - 80 }, { x: 950, y: groundY - 120 },
                { x: 1250, y: groundY - 90 }, { x: 1550, y: groundY - 140 }, { x: 1850, y: groundY - 110 },
                { x: 2150, y: groundY - 130 }, { x: 2450, y: groundY - 100 }, { x: 2750, y: groundY - 150 },
                { x: 3050, y: groundY - 120 }, { x: 800, y: groundY - 120 }, { x: 1100, y: groundY - 90 },
                { x: 1400, y: groundY - 140 }, { x: 1700, y: groundY - 110 }, { x: 2000, y: groundY - 130 },
                { x: 2300, y: groundY - 100 }, { x: 2600, y: groundY - 150 }, { x: 2900, y: groundY - 120 }
            ],
            enemies: [
                { x: 500, y: groundY - 50, speed: 1.5, color: '#EF476F', moveRange: 100 },
                { x: 800, y: groundY - 50, speed: 1.8, color: '#FF6B6B', moveRange: 90 },
                { x: 1100, y: groundY - 50, speed: 1.3, color: '#E74C3C', moveRange: 110 },
                { x: 1400, y: groundY - 50, speed: 2.0, color: '#FF9A8B', moveRange: 95 },
                { x: 1700, y: groundY - 50, speed: 1.7, color: '#EF476F', moveRange: 105 },
                { x: 2000, y: groundY - 50, speed: 2.2, color: '#FF6B6B', moveRange: 85 },
                { x: 2300, y: groundY - 50, speed: 1.9, color: '#E74C3C', moveRange: 115 },
                { x: 2600, y: groundY - 50, speed: 2.1, color: '#FF9A8B', moveRange: 100 }
            ]
        };
    },
    
    getLevel2Settings(groundY) {
        return {
            platforms: [
                { x: 300, y: groundY - 100, width: 200, height: 25, color: '#D4A76A' },
                { x: 600, y: groundY - 130, width: 180, height: 25, color: '#D4A76A' },
                { x: 950, y: groundY - 110, width: 160, height: 25, color: '#D4A76A' },
                { x: 1300, y: groundY - 150, width: 140, height: 25, color: '#B7956E' },
                { x: 1650, y: groundY - 120, width: 170, height: 25, color: '#B7956E' },
                { x: 2000, y: groundY - 160, width: 150, height: 25, color: '#8B7355' },
                { x: 2350, y: groundY - 140, width: 180, height: 25, color: '#8B7355' },
                { x: 2700, y: groundY - 180, width: 160, height: 25, color: '#8B4513' },
                { x: 3050, y: groundY - 150, width: 190, height: 25, color: '#8B4513' },
                { x: 3400, y: groundY - 130, width: 140, height: 25, color: '#A0522D' },
                { x: 3750, y: groundY - 170, width: 170, height: 25, color: '#A0522D' },
                { x: 4100, y: groundY - 140, width: 150, height: 25, color: '#D4A76A' }
            ],
            coins: [
                // مجموعة أولى
                { x: 250, y: groundY - 70 }, { x: 350, y: groundY - 70 }, { x: 450, y: groundY - 70 },
                { x: 650, y: groundY - 110 }, { x: 750, y: groundY - 110 }, { x: 1000, y: groundY - 90 },
                { x: 1100, y: groundY - 90 }, { x: 1350, y: groundY - 130 }, { x: 1450, y: groundY - 130 },
                { x: 1700, y: groundY - 100 }, { x: 1800, y: groundY - 100 }, { x: 2050, y: groundY - 140 },
                // مجموعة ثانية
                { x: 2200, y: groundY - 120 }, { x: 2400, y: groundY - 120 }, { x: 2800, y: groundY - 160 },
                { x: 2900, y: groundY - 160 }, { x: 3100, y: groundY - 130 }, { x: 3200, y: groundY - 130 },
                { x: 3500, y: groundY - 110 }, { x: 3600, y: groundY - 110 }, { x: 3800, y: groundY - 150 },
                { x: 3900, y: groundY - 150 }, { x: 4200, y: groundY - 120 }, { x: 4300, y: groundY - 120 },
                // عملات سرية
                { x: 500, y: groundY - 170 }, { x: 1500, y: groundY - 200 }, { x: 2500, y: groundY - 220 },
                { x: 3500, y: groundY - 190 }, { x: 4000, y: groundY - 210 }
            ],
            enemies: [
                { x: 550, y: groundY - 50, speed: 1.6, color: '#A0522D', moveRange: 80 },
                { x: 850, y: groundY - 50, speed: 1.4, color: '#8B4513', moveRange: 90 },
                { x: 1200, y: groundY - 50, speed: 1.9, color: '#D2691E', moveRange: 100 },
                { x: 1550, y: groundY - 50, speed: 2.1, color: '#CD853F', moveRange: 85 },
                { x: 1900, y: groundY - 50, speed: 1.7, color: '#8B7355', moveRange: 95 },
                { x: 2250, y: groundY - 50, speed: 2.3, color: '#A0522D', moveRange: 110 },
                { x: 2600, y: groundY - 50, speed: 1.8, color: '#D2691E', moveRange: 100 },
                { x: 2950, y: groundY - 50, speed: 2.0, color: '#CD853F', moveRange: 90 },
                { x: 3300, y: groundY - 50, speed: 2.2, color: '#8B7355', moveRange: 105 },
                { x: 3650, y: groundY - 50, speed: 1.5, color: '#A0522D', moveRange: 95 },
                { x: 4000, y: groundY - 50, speed: 2.4, color: '#8B4513', moveRange: 115 }
            ]
        };
    },
    
    getLevel3Settings(groundY) {
        return {
            platforms: [
                { x: 300, y: groundY - 110, width: 190, height: 25, color: '#708090' },
                { x: 600, y: groundY - 130, width: 170, height: 25, color: '#708090' },
                { x: 950, y: groundY - 90, width: 150, height: 25, color: '#87CEEB' },
                { x: 1300, y: groundY - 150, width: 140, height: 25, color: '#87CEEB' },
                { x: 1650, y: groundY - 120, width: 170, height: 25, color: '#B0E0E6' },
                { x: 2000, y: groundY - 170, width: 150, height: 25, color: '#B0E0E6' },
                { x: 2350, y: groundY - 140, width: 180, height: 25, color: '#ADD8E6' },
                { x: 2700, y: groundY - 190, width: 160, height: 25, color: '#ADD8E6' },
                { x: 3050, y: groundY - 160, width: 190, height: 25, color: '#FFFFFF' },
                { x: 3400, y: groundY - 210, width: 140, height: 25, color: '#FFFFFF' },
                { x: 3750, y: groundY - 180, width: 170, height: 25, color: '#E0FFFF' },
                { x: 4100, y: groundY - 150, width: 150, height: 25, color: '#E0FFFF' },
                { x: 4450, y: groundY - 200, width: 160, height: 25, color: '#00BFFF' },
                { x: 4800, y: groundY - 170, width: 140, height: 25, color: '#00BFFF' },
                { x: 5150, y: groundY - 130, width: 170, height: 25, color: '#708090' }
            ],
            coins: [
                // بداية الجبل
                { x: 250, y: groundY - 80 }, { x: 350, y: groundY - 80 }, { x: 450, y: groundY - 80 },
                { x: 650, y: groundY - 110 }, { x: 750, y: groundY - 110 }, { x: 1000, y: groundY - 70 },
                { x: 1100, y: groundY - 70 }, { x: 1350, y: groundY - 130 }, { x: 1450, y: groundY - 130 },
                // منتصف الجبل
                { x: 1700, y: groundY - 100 }, { x: 1800, y: groundY - 100 }, { x: 2050, y: groundY - 150 },
                { x: 2150, y: groundY - 150 }, { x: 2400, y: groundY - 120 }, { x: 2500, y: groundY - 120 },
                { x: 2750, y: groundY - 170 }, { x: 2850, y: groundY - 170 }, { x: 3100, y: groundY - 140 },
                { x: 3200, y: groundY - 140 }, { x: 3450, y: groundY - 190 }, { x: 3550, y: groundY - 190 },
                // قمة الجبل
                { x: 3800, y: groundY - 160 }, { x: 3900, y: groundY - 160 }, { x: 4150, y: groundY - 130 },
                { x: 4250, y: groundY - 130 }, { x: 4500, y: groundY - 180 }, { x: 4600, y: groundY - 180 },
                { x: 4850, y: groundY - 150 }, { x: 4950, y: groundY - 150 }, { x: 5200, y: groundY - 110 },
                { x: 5300, y: groundY - 110 },
                // كنوز سرية
                { x: 800, y: groundY - 180 }, { x: 1800, y: groundY - 220 }, { x: 2800, y: groundY - 240 },
                { x: 3800, y: groundY - 260 }, { x: 4800, y: groundY - 230 }
            ],
            enemies: [
                { x: 550, y: groundY - 50, speed: 1.5, color: '#FFFFFF', moveRange: 70 },
                { x: 850, y: groundY - 50, speed: 1.3, color: '#F0F8FF', moveRange: 80 },
                { x: 1200, y: groundY - 50, speed: 2.0, color: '#87CEEB', moveRange: 90 },
                { x: 1550, y: groundY - 50, speed: 2.2, color: '#ADD8E6', moveRange: 85 },
                { x: 1900, y: groundY - 50, speed: 1.8, color: '#B0E0E6', moveRange: 95 },
                { x: 2250, y: groundY - 50, speed: 1.6, color: '#AFEEEE', moveRange: 100 },
                { x: 2600, y: groundY - 50, speed: 2.1, color: '#E0FFFF', moveRange: 90 },
                { x: 2950, y: groundY - 50, speed: 1.4, color: '#FFFFFF', moveRange: 75 },
                { x: 3300, y: groundY - 50, speed: 1.9, color: '#87CEEB', moveRange: 95 },
                { x: 3650, y: groundY - 50, speed: 2.3, color: '#ADD8E6', moveRange: 105 },
                { x: 4000, y: groundY - 50, speed: 2.0, color: '#B0E0E6', moveRange: 100 },
                { x: 4350, y: groundY - 50, speed: 2.4, color: '#FFFFFF', moveRange: 110 },
                { x: 4700, y: groundY - 50, speed: 2.1, color: '#F0F8FF', moveRange: 95 },
                { x: 5050, y: groundY - 50, speed: 2.2, color: '#87CEEB', moveRange: 100 },
                { x: 5400, y: groundY - 50, speed: 2.5, color: '#ADD8E6', moveRange: 115 }
            ]
        };
    },
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 180;
        this.coinsCollected = 0;
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
        
        if (this.touchControls.slide || this.keys['arrowdown'] || this.keys['s']) {
            if (player.grounded && !player.isSliding) {
                player.isSliding = true;
                player.slideTimer = 0.5;
                player.height = 40;
                player.y += 40;
            }
        }
        
        if (player.isSliding) {
            player.slideTimer -= this.deltaTime;
            if (player.slideTimer <= 0) {
                player.isSliding = false;
                player.height = 80;
                player.y -= 40;
            }
        }
        
        const jumpPressed = this.keys[' '] || this.keys['arrowup'] || this.keys['w'] || this.touchControls.jump;
        
        if (jumpPressed && player.grounded && !player.isSliding) {
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
        
        this.camera.x = Math.max(0, this.camera.x);
        this.camera.x = Math.min(this.worldWidth - this.canvas.width, this.camera.x);
    },
    
    checkCollisions() {
        const player = this.player;
        
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
        
        // حفظ التقدم
        this.saveProgress();
        
        setTimeout(() => {
            if (isWin && this.currentLevel < this.totalLevels) {
                this.currentLevel++;
                this.loadLevel(this.currentLevel);
            } else {
                this.endGame(isWin, '🏁 انتهت المغامرة!');
            }
        }, 3000);
    },
    
    saveProgress() {
        try {
            // حفظ أفضل نتيجة
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('mario_best_score', this.bestScore.toString());
                document.getElementById('best-score').textContent = this.bestScore;
            }
            
            // حفظ تقدم المرحلة
            localStorage.setItem('mario_last_level', this.currentLevel.toString());
            
            // حفظ نتيجة المرحلة
            const levelScores = JSON.parse(localStorage.getItem('mario_level_scores') || '{}');
            if (!levelScores[this.currentLevel] || this.score > levelScores[this.currentLevel]) {
                levelScores[this.currentLevel] = this.score;
                localStorage.setItem('mario_level_scores', JSON.stringify(levelScores));
            }
            
            console.log(`💾 تم حفظ تقدم المرحلة ${this.currentLevel}`);
            
        } catch (e) {
            console.warn('⚠️ لا يمكن حفظ التقدم');
        }
    },
    
    endGame(isWin, message) {
        this.state = 'gameOver';
        this.stopTimer();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
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
        document.getElementById('final-level').textContent = this.currentLevel;
        
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
        this.drawDebugInfo();
    },
    
    drawDebugInfo() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        if (this.player) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, canvas.height - 120, 250, 110);
            
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            
            let y = canvas.height - 100;
            ctx.fillText(`👤 اللاعب: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, 20, y);
            y += 20;
            ctx.fillText(`📷 الكاميرا: ${Math.round(this.camera.x)}`, 20, y);
            y += 20;
            ctx.fillText(`💰 العملات: ${this.coinsCollected}/${this.totalCoins}`, 20, y);
            y += 20;
            ctx.fillText(`👾 الأعداء: ${this.enemiesKilled}/${this.enemies.length}`, 20, y);
            y += 20;
            ctx.fillText(`🏁 العالم: ${this.worldWidth}px`, 20, y);
        }
    },
    
    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const time = Date.now() / 1000;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#3498DB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.worldWidth, canvas.height);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 10; i++) {
            const x = (this.camera.x * 0.05 + i * 300 + time * 20) % (this.worldWidth + 500);
            const y = 40 + Math.sin(i + time) * 20;
            const size = 18 + Math.sin(i * 0.8) * 6;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.arc(x + size * 1.3, y - size * 0.3, size * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = 'rgba(44, 62, 80, 0.15)';
        for (let i = 0; i < 8; i++) {
            const x = i * 600;
            const height = 80 + Math.sin(i) * 40;
            
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 70);
            ctx.lineTo(x + 350, canvas.height - 70 - height);
            ctx.lineTo(x + 700, canvas.height - 70);
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
                gradient.addColorStop(0.3, '#734322');
                gradient.addColorStop(1, '#654321');
            } else {
                gradient.addColorStop(0, platform.color);
                gradient.addColorStop(1, '#8B4513');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let i = 0; i < platform.width; i += 32) {
                ctx.fillRect(platform.x + i, platform.y, 28, 5);
            }
        });
    },
    
    drawCoins() {
        const ctx = this.ctx;
        const time = Date.now() / 1000;
        
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.animation += 0.1;
                const floatY = Math.sin(coin.animation + time) * 6;
                
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
        const time = Date.now() / 1000;
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            const bounce = Math.sin(time * 3 + enemy.x * 0.01) * 2;
            
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y + bounce, enemy.width, enemy.height);
            
            ctx.fillStyle = 'black';
            ctx.fillRect(enemy.x + 10, enemy.y + 10 + bounce, 8, 8);
            ctx.fillRect(enemy.x + enemy.width - 18, enemy.y + 10 + bounce, 8, 8);
            
            ctx.fillStyle = 'white';
            ctx.fillRect(enemy.x + 12, enemy.y + 12 + bounce, 4, 4);
            ctx.fillRect(enemy.x + enemy.width - 16, enemy.y + 12 + bounce, 4, 4);
            
            ctx.fillStyle = 'black';
            ctx.fillRect(enemy.x + 15, enemy.y + 25 + bounce, enemy.width - 30, 6);
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
        
        const gradient = ctx.createLinearGradient(
            castle.x, castle.y,
            castle.x, castle.y + castle.height
        );
        gradient.addColorStop(0, castle.color);
        gradient.addColorStop(1, '#654321');
        ctx.fillStyle = gradient;
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
                console.warn('⚠️ خطأ في رسم الصورة، استخدام رسم بديل');
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
        ctx.fillRect(10, 10, 250, 45);
        ctx.fillRect(canvas.width - 260, 10, 250, 45);
        
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
        document.getElementById('hud-level').textContent = this.currentLevel;
        
        const missionText = document.getElementById('mission-text');
        if (missionText) {
            const remainingCoins = this.totalCoins - this.coinsCollected;
            missionText.textContent = remainingCoins > 0 ? 
                `🎯 اجمع ${remainingCoins} عملة أخرى!` : 
                '🏃‍♂️ تقدم نحو القصر!';
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
            
            console.log('✅ اللعبة جاهزة تماماً!');
            
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
            
            MarioGame.showNotification('🎮 لعبة ماريو جاهزة!');
            
        } catch (error) {
            console.error('❌ خطأ في التحميل:', error);
            alert('حدث خطأ: ' + error.message);
        }
    }, 2000);
});
