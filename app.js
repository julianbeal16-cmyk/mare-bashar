// ============================================
// 📱 تطبيق اللعبة - النسخة المعدلة 100%
// ============================================

'use strict';

const App = {
    // ======================
    // التهيئة
    // ======================
    init() {
        console.log('📱 تهيئة تطبيق اللعبة...');
        
        try {
            // تحميل الصورة
            this.loadPlayerImage();
            
            this.setupEventListeners();
            this.setupMobileOptimizations();
            this.loadProgress();
            this.loadLevelsList();
            this.setupFocusHandling();
            
            // تحديث معلومات المراحل
            this.updateTotalLevels();
            
            console.log('✅ تطبيق اللعبة جاهز تماماً!');
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة التطبيق:', error);
            this.showNotification('⚠️ خطأ في التهيئة، جاري المحاولة...');
            // لا نعيد التهيئة تلقائياً لمنع الحلقات اللا نهائية
        }
    },
    
    // ======================
    // تحميل صورة اللاعب
    // ======================
    loadPlayerImage() {
        console.log('🖼️ تحميل صورة اللاعب...');
        const playerImgContainer = document.getElementById('player-img-container');
        if (!playerImgContainer) return;
        
        const img = new Image();
        img.onload = function() {
            console.log('✅ صورة اللاعب محملة بنجاح!');
            playerImgContainer.innerHTML = '';
            playerImgContainer.style.background = 'none';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '10px';
            playerImgContainer.appendChild(img);
            playerImgContainer.id = 'player-img-loaded';
        };
        
        img.onerror = function() {
            console.log('⚠️ لم يتم تحميل صورة اللاعب، استخدام البديل');
            playerImgContainer.innerHTML = '<i class="fas fa-user-ninja"></i>';
            playerImgContainer.style.background = 'linear-gradient(135deg, #E74C3C, #C0392B)';
            playerImgContainer.style.display = 'flex';
            playerImgContainer.style.alignItems = 'center';
            playerImgContainer.style.justifyContent = 'center';
            playerImgContainer.style.fontSize = '3rem';
            playerImgContainer.style.color = 'white';
        };
        
        // محاولة تحميل الصورة
        img.src = 'player.png';
        
        // إذا لم تحمل خلال 2 ثانية، استخدام البديل
        setTimeout(() => {
            if (!img.complete) {
                img.onerror();
            }
        }, 2000);
    },
    
    // ======================
    // إعداد الأحداث
    // ======================
    setupEventListeners() {
        console.log('🎮 إعداد مستمعي الأحداث...');
        
        // زر البدء الرئيسي
        this.setupStartButton();
        
        // زر اختيار المرحلة
        this.setupLevelSelectButton();
        
        // زر التعليمات
        this.setupHowToPlayButton();
        
        // أزرار الإغلاق
        this.setupCloseButtons();
        
        // أزرار التحكم في اللعبة
        this.setupGameButtons();
        
        // النقر خارج النوافذ المنبثقة
        this.setupOutsideClick();
        
        // مفاتيح لوحة المفاتيح
        this.setupKeyboardEvents();
        
        // منع الإجراءات الافتراضية أثناء اللعب
        this.preventDefaultActions();
        
        // زر ملء الشاشة
        this.setupFullscreenButton();
        
        console.log('✅ جميع الأحداث جاهزة');
    },
    
    setupStartButton() {
        const startBtn = document.getElementById('start-game-btn');
        if (!startBtn) {
            console.warn('⚠️ زر البدء غير موجود');
            return;
        }
        
        // إزالة أي أحداث سابقة
        const newStartBtn = startBtn.cloneNode(true);
        startBtn.parentNode.replaceChild(newStartBtn, startBtn);
        const currentStartBtn = document.getElementById('start-game-btn');
        
        // النقر
        currentStartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚀 الضغط على زر البدء');
            this.startLastLevel();
        });
        
        // اللمس
        currentStartBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            currentStartBtn.style.transform = 'scale(0.95)';
            currentStartBtn.style.opacity = '0.9';
        }, { passive: false });
        
        currentStartBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            currentStartBtn.style.transform = '';
            currentStartBtn.style.opacity = '';
        }, { passive: false });
        
        console.log('✅ زر البدء جاهز');
    },
    
    setupLevelSelectButton() {
        const levelSelectBtn = document.getElementById('level-select-btn');
        if (!levelSelectBtn) return;
        
        levelSelectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const modal = document.getElementById('levels-modal');
            if (modal) {
                modal.style.display = 'flex';
                this.updateLevelsList();
            }
        });
    },
    
    setupHowToPlayButton() {
        const howToPlayBtn = document.getElementById('how-to-play-btn');
        if (howToPlayBtn) {
            howToPlayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const modal = document.getElementById('instructions-modal');
                if (modal) {
                    modal.style.display = 'flex';
                }
            });
        }
    },
    
    setupCloseButtons() {
        // أزرار إغلاق النوافذ المنبثقة
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // زر إغلاق بالإسكيب
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    if (modal.style.display === 'flex') {
                        modal.style.display = 'none';
                    }
                });
                
                // الخروج من وضع ملء الشاشة
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            }
        });
    },
    
    setupGameButtons() {
        // زر الإيقاف
        this.setupButton('pause-btn', () => {
            if (window.MarioGame && typeof MarioGame.togglePause === 'function') {
                MarioGame.togglePause();
            }
        });
        
        // زر الصوت
        this.setupButton('sound-btn', () => {
            if (window.MarioGame && typeof MarioGame.toggleSound === 'function') {
                MarioGame.toggleSound();
            }
        });
        
        // زر إعادة اللعب
        this.setupButton('play-again-btn', () => {
            if (window.MarioGame && typeof MarioGame.restartGame === 'function') {
                MarioGame.restartGame();
            }
        });
        
        // زر المرحلة التالية
        this.setupButton('next-level-btn', () => {
            if (window.MarioGame && typeof MarioGame.nextLevel === 'function') {
                MarioGame.nextLevel();
            }
        });
        
        // زر العودة للقائمة
        this.setupButton('back-to-menu-btn', () => {
            if (window.MarioGame && typeof MarioGame.showScreen === 'function') {
                MarioGame.showScreen('start');
            }
        });
        
        console.log('✅ أزرار اللعبة جاهزة');
    },
    
    setupButton(id, callback) {
        const btn = document.getElementById(id);
        if (btn) {
            // إزالة الأحداث السابقة
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            const currentBtn = document.getElementById(id);
            
            currentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                callback();
            });
        }
    },
    
    setupFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (!fullscreenBtn) return;
        
        fullscreenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleFullscreen();
        });
        
        // تحديث أيقونة زر ملء الشاشة عند التغيير
        document.addEventListener('fullscreenchange', () => {
            const icon = fullscreenBtn.querySelector('i');
            if (document.fullscreenElement) {
                if (icon) {
                    icon.className = 'fas fa-compress';
                }
                fullscreenBtn.title = 'تصغير الشاشة';
                this.showNotification('🖥️ وضع ملء الشاشة مفعل');
            } else {
                if (icon) {
                    icon.className = 'fas fa-expand';
                }
                fullscreenBtn.title = 'ملء الشاشة';
                this.showNotification('📱 الخروج من ملء الشاشة');
            }
        });
        
        console.log('✅ زر ملء الشاشة جاهز');
    },
    
    toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                const elem = document.documentElement;
                
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                }
                
                // قفل التوجيه على الجوال
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {
                        console.log('🔒 لا يمكن قفل التوجيه');
                    });
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                
                // إلغاء قفل التوجيه
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock();
                }
            }
        } catch (error) {
            console.log('⚠️ خطأ في ملء الشاشة:', error);
            this.showNotification('⚠️ لا يدعم المتصفح ملء الشاشة');
        }
    },
    
    setupOutsideClick() {
        // إغلاق النافذة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        // لمنع إغلاق النافذة عند النقر داخلها
        document.querySelectorAll('.modal-content').forEach(content => {
            content.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    },
    
    setupKeyboardEvents() {
        // منع الإجراءات الافتراضية لأزرار التحكم
        document.addEventListener('keydown', (e) => {
            const controlKeys = [
                ' ', 'Space', 'ArrowUp', 'ArrowDown', 
                'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'
            ];
            
            if (controlKeys.includes(e.key) && 
                window.MarioGame && 
                MarioGame.state === 'playing') {
                e.preventDefault();
            }
        });
    },
    
    preventDefaultActions() {
        // منع سحب الصور
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        });
        
        // منع قائمة السياق
        document.addEventListener('contextmenu', (e) => {
            if (window.MarioGame && MarioGame.state === 'playing') {
                e.preventDefault();
            }
        });
    },
    
    // ======================
    // تحسينات الجوال
    // ======================
    setupMobileOptimizations() {
        // الكشف عن جهاز الجوال
        const isMobile = this.isMobileDevice();
        
        if (isMobile) {
            document.body.classList.add('mobile-device');
            console.log('📱 جهاز جوال مكتشف، تطبيق تحسينات الجوال');
            
            // تطبيق أنماط الجوال الإضافية
            this.applyMobileStyles();
            
            // منع التكبير باللمس المزدوج
            this.preventDoubleTapZoom();
            
            // تحسين التحكم باللمس
            this.enhanceTouchControls();
        } else {
            console.log('💻 جهاز كمبيوتر مكتشف');
        }
        
        // إضافة مستمع لتغيير التوجيه
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 300);
        });
    },
    
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    },
    
    applyMobileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* إظهار أزرار التحكم على الجوال */
            .mobile-device #mobile-controls {
                display: flex !important;
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: auto !important;
            }
            
            .mobile-device .mobile-btn {
                pointer-events: auto !important;
                touch-action: manipulation !important;
            }
            
            /* رسالة المساعدة */
            .mobile-device .game-help {
                position: absolute;
                top: 20%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 10px;
                border: 2px solid var(--accent);
                z-index: 99;
                font-size: 0.9rem;
                text-align: center;
                animation: fadeOut 5s forwards;
            }
            
            @keyframes fadeOut {
                0%, 70% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    },
    
    preventDoubleTapZoom() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    },
    
    enhanceTouchControls() {
        // تحسين استجابة الأزرار اللمسية
        document.querySelectorAll('.mobile-btn, .hud-btn, .btn-primary, .btn-secondary').forEach(btn => {
            btn.style.touchAction = 'manipulation';
        });
        
        // عرض رسالة مساعدة عند بدء اللعبة
        setTimeout(() => {
            this.showGameHelp();
        }, 1000);
    },
    
    showGameHelp() {
        const helpDiv = document.createElement('div');
        helpDiv.className = 'game-help';
        helpDiv.innerHTML = `
            <div>👆 استخدم الأزرار أدناه للتحكم</div>
            <div style="font-size:0.8rem;margin-top:5px;color:#FFD700">
                <i class="fas fa-arrow-left"></i> يسار | 
                <i class="fas fa-arrow-right"></i> يمين | 
                <i class="fas fa-arrow-up"></i> قفز | 
                <i class="fas fa-arrow-down"></i> تزحلق
            </div>
        `;
        
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.appendChild(helpDiv);
            
            // إزالة الرسالة بعد 5 ثواني
            setTimeout(() => {
                if (helpDiv.parentNode) {
                    helpDiv.parentNode.removeChild(helpDiv);
                }
            }, 5000);
        }
    },
    
    handleOrientationChange() {
        console.log('🔄 تغيير التوجيه، إعادة ضبط الواجهة...');
        
        // التحقق من التوجيه
        const isPortrait = window.innerHeight > window.innerWidth;
        const gameScreen = document.getElementById('game-screen');
        
        if (isPortrait && gameScreen.classList.contains('active')) {
            gameScreen.classList.add('portrait-warning');
        } else {
            gameScreen.classList.remove('portrait-warning');
        }
        
        // إعادة ضبط حجم Canvas
        if (window.MarioGame && MarioGame.updateCanvasSize) {
            setTimeout(() => {
                MarioGame.updateCanvasSize();
            }, 100);
        }
        
        this.showNotification('🔄 تم تعديل الواجهة للتوجيه الجديد');
    },
    
    // ======================
    // تحميل التقدم
    // ======================
    loadProgress() {
        console.log('📊 تحميل تقدم اللاعب...');
        
        // تحديث أفضل نتيجة
        this.updateBestScore();
        
        // تحديث زر البدء بناءً على آخر مرحلة
        this.updateStartButton();
        
        console.log('✅ التقدم محمل بنجاح');
    },
    
    updateBestScore() {
        try {
            const saved = localStorage.getItem('mario_best_score');
            const bestScore = saved ? parseInt(saved) : 0;
            const bestScoreElement = document.getElementById('best-score');
            if (bestScoreElement) {
                bestScoreElement.textContent = bestScore;
            }
        } catch (e) {
            console.warn('⚠️ لا يمكن تحميل أفضل نتيجة');
        }
    },
    
    updateTotalLevels() {
        const totalLevelsElement = document.getElementById('total-levels');
        if (totalLevelsElement && window.LevelManager) {
            totalLevelsElement.textContent = LevelManager.getTotalLevels();
        }
    },
    
    updateStartButton() {
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            const lastLevel = localStorage.getItem('mario_last_level') || 1;
            
            // تحديث نص الزر
            const span = startBtn.querySelector('span');
            if (span) {
                span.textContent = `🎮 ابدأ اللعب (المرحلة ${lastLevel})`;
            }
            
            console.log(`✅ زر البدء محدث للمرحلة ${lastLevel}`);
        }
    },
    
    // ======================
    // قائمة المراحل
    // ======================
    loadLevelsList() {
        console.log('🗺️ تحميل قائمة المراحل...');
        
        // إنشاء شبكة المراحل في الصفحة الرئيسية
        this.createLevelsGrid();
        
        console.log('✅ قائمة المراحل محملة');
    },
    
    createLevelsGrid() {
        const levelsGrid = document.getElementById('levels-grid');
        if (!levelsGrid || !window.LevelManager) return;
        
        const totalLevels = LevelManager.getTotalLevels();
        let levelsHTML = '';
        
        for (let i = 1; i <= totalLevels; i++) {
            const levelInfo = LevelManager.getLevelInfo(i);
            if (!levelInfo) continue;
            
            // تحديد الألوان والرموز لكل مرحلة
            let icon, gradient, stats;
            switch(i) {
                case 1:
                    icon = 'fa-mountain';
                    gradient = 'linear-gradient(135deg, #2ECC71, #27AE60)';
                    stats = { coins: 60, time: '5:00' };
                    break;
                case 2:
                    icon = 'fa-sun';
                    gradient = 'linear-gradient(135deg, #F39C12, #D35400)';
                    stats = { coins: 70, time: '5:50' };
                    break;
                case 3:
                    icon = 'fa-snowflake';
                    gradient = 'linear-gradient(135deg, #3498DB, #2980B9)';
                    stats = { coins: 80, time: '6:40' };
                    break;
                default:
                    icon = 'fa-gamepad';
                    gradient = 'linear-gradient(135deg, #9B59B6, #8E44AD)';
                    stats = { coins: 50, time: '5:00' };
            }
            
            levelsHTML += `
                <div class="level-card" data-level="${i}">
                    <div class="level-icon" style="background: ${gradient};">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="level-info">
                        <h4>${levelInfo.name}</h4>
                        <p>${levelInfo.description}</p>
                        <div class="level-stats">
                            <span><i class="fas fa-coins"></i> ${stats.coins} عملة</span>
                            <span><i class="fas fa-clock"></i> ${stats.time}</span>
                        </div>
                    </div>
                    <button class="play-level-btn" data-level="${i}">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            `;
        }
        
        levelsGrid.innerHTML = levelsHTML;
        
        // إضافة أحداث لأزرار اللعب
        levelsGrid.querySelectorAll('.play-level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const level = parseInt(e.currentTarget.dataset.level);
                this.startLevel(level);
            });
        });
    },
    
    updateLevelsList() {
        const levelsList = document.getElementById('levels-list');
        if (!levelsList || !window.LevelManager) return;
        
        const totalLevels = LevelManager.getTotalLevels();
        const savedLevel = parseInt(localStorage.getItem('mario_last_level') || 1);
        
        let levelsHTML = '';
        
        for (let i = 1; i <= totalLevels; i++) {
            const levelInfo = LevelManager.getLevelInfo(i);
            if (!levelInfo) continue;
            
            const unlocked = i <= savedLevel;
            const bestScore = levelInfo.bestScore || 0;
            
            // تحديد الرمز لكل مرحلة
            let icon;
            switch(i) {
                case 1: icon = 'fa-mountain'; break;
                case 2: icon = 'fa-sun'; break;
                case 3: icon = 'fa-snowflake'; break;
                default: icon = 'fa-gamepad';
            }
            
            levelsHTML += `
                <div class="level-item ${unlocked ? 'unlocked' : 'locked'}" data-level="${i}">
                    <div class="level-item-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="level-item-info">
                        <h4>${levelInfo.name}</h4>
                        <p>${bestScore > 0 ? `أفضل نتيجة: ${bestScore}` : 'لم تلعب بعد'}</p>
                    </div>
                    <div class="level-item-status">
                        ${unlocked ? 
                            `<button class="btn-small play-level-list-btn" data-level="${i}">
                                <i class="fas fa-play"></i> لعب
                            </button>` : 
                            '<span class="locked-text"><i class="fas fa-lock"></i> مقفلة</span>'
                        }
                    </div>
                </div>
            `;
        }
        
        levelsList.innerHTML = levelsHTML;
        
        // إضافة أحداث لأزرار اللعب في القائمة
        levelsList.querySelectorAll('.play-level-list-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const level = parseInt(e.currentTarget.dataset.level);
                this.startLevel(level);
                
                // إغلاق النافذة المنبثقة
                const modal = document.getElementById('levels-modal');
                if (modal) modal.style.display = 'none';
            });
        });
    },
    
    // ======================
    // إدارة بدء المراحل
    // ======================
    startLastLevel() {
        const lastLevel = localStorage.getItem('mario_last_level') || 1;
        this.startLevel(parseInt(lastLevel));
    },
    
    startLevel(levelNumber) {
        console.log(`🚀 بدء المرحلة ${levelNumber}...`);
        
        // التحقق من وجود اللعبة
        if (!window.MarioGame) {
            console.error('❌ اللعبة غير محملة بعد');
            this.showNotification('🔄 جاري تحميل اللعبة...');
            
            // محاولة تحميل اللعبة بعد تأخير
            setTimeout(() => {
                if (window.MarioGame) {
                    this.startLevel(levelNumber);
                } else {
                    this.showNotification('❌ تعذر تحميل اللعبة، يرجى تحديث الصفحة');
                }
            }, 1000);
            return;
        }
        
        // التحقق من وجود الدالة loadLevel
        if (typeof MarioGame.loadLevel !== 'function') {
            console.error('❌ دالة loadLevel غير موجودة');
            this.showNotification('⚠️ خطأ في بدء اللعبة');
            return;
        }
        
        try {
            // حفظ المرحلة الحالية
            localStorage.setItem('mario_last_level', levelNumber.toString());
            
            // تحديث زر البداية الرئيسي
            this.updateStartButton();
            
            // التحقق من التوجيه على الجوال
            if (this.isMobileDevice()) {
                const isPortrait = window.innerHeight > window.innerWidth;
                if (isPortrait) {
                    this.showNotification('📱 الرجاء تدوير الهاتف للوضع الأفقي');
                    setTimeout(() => {
                        MarioGame.loadLevel(levelNumber);
                    }, 500);
                    return;
                }
            }
            
            // بدء المرحلة
            MarioGame.loadLevel(levelNumber);
            
            console.log(`✅ بدء المرحلة ${levelNumber} بنجاح`);
            
        } catch (error) {
            console.error('❌ خطأ في بدء المرحلة:', error);
            this.showNotification('⚠️ خطأ في تحميل المرحلة، جاري المحاولة...');
            
            // محاولة أخرى
            setTimeout(() => {
                if (window.MarioGame && typeof MarioGame.loadLevel === 'function') {
                    MarioGame.loadLevel(levelNumber);
                }
            }, 1000);
        }
    },
    
    // ======================
    // وظائف مساعدة
    // ======================
    setupFocusHandling() {
        // إيقاف اللعبة عند فقدان التركيز
        window.addEventListener('blur', () => {
            if (window.MarioGame && 
                MarioGame.state === 'playing' && 
                typeof MarioGame.togglePause === 'function') {
                
                MarioGame.togglePause();
                this.showNotification('⏸️ اللعبة متوقفة - النافذة غير نشطة');
            }
        });
        
        // عرض رسالة عند استعادة التركيز
        window.addEventListener('focus', () => {
            if (window.MarioGame && 
                MarioGame.state === 'paused') {
                
                this.showNotification('🔄 النافذة نشطة، اضغط متابعة للاستمرار');
            }
        });
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
    }
};

// ============================================
// بدء التطبيق
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 بدء تحميل تطبيق اللعبة...');
    
    // تأخير لضمان تحميل جميع المكونات
    setTimeout(() => {
        App.init();
        console.log('🎮 نظام التطبيق محمل وجاهز!');
        
        // إخفاء شاشة التحميل
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1500);
});

// ============================================
// دعم إضافي
// ============================================

// جعل App متاحة عالمياً
window.App = App;

// إضافة مستمع للصفحة عند الإغلاق
window.addEventListener('beforeunload', (e) => {
    if (window.MarioGame && MarioGame.state === 'playing' && MarioGame.score > 0) {
        e.preventDefault();
        e.returnValue = 'هل تريد حقاً الخروج؟ تقدمك في اللعبة قد يضيع.';
    }
});

console.log('✅ ملف app.js محمل بنجاح!');
