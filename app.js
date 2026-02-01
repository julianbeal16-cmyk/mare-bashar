// ============================================
// 📱 تطبيق اللعبة - النسخة النهائية 100%
// ============================================

'use strict';

const App = {
    // ======================
    // التهيئة
    // ======================
    init() {
        console.log('📱 تهيئة تطبيق اللعبة...');
        
        try {
            // تحميل الصورة مباشرة
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
            setTimeout(() => this.init(), 1000);
        }
    },
    
    // ======================
    // تحميل صورة اللاعب
    // ======================
    loadPlayerImage() {
        console.log('🖼️ تحميل صورة اللاعب...');
        const playerImg = document.getElementById('player-img');
        if (!playerImg) return;
        
        const img = new Image();
        img.onload = function() {
            console.log('✅ صورة اللاعب محملة بنجاح!');
            playerImg.innerHTML = '';
            playerImg.style.background = 'none';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '10px';
            playerImg.appendChild(img);
        };
        
        img.onerror = function() {
            console.log('⚠️ لم يتم تحميل صورة اللاعب، استخدام البديل');
            playerImg.innerHTML = '<i class="fas fa-user-ninja"></i>';
            playerImg.style.background = 'linear-gradient(135deg, #E74C3C, #C0392B)';
            playerImg.style.display = 'flex';
            playerImg.style.alignItems = 'center';
            playerImg.style.justifyContent = 'center';
            playerImg.style.fontSize = '3rem';
            playerImg.style.color = 'white';
        };
        
        // محاولة جميع المسارات الممكنة
        const paths = ['player.png', './player.png', 'assets/player.png', 'images/player.png'];
        let currentIndex = 0;
        
        const tryNextPath = () => {
            if (currentIndex >= paths.length) {
                img.onerror();
                return;
            }
            
            console.log(`🔍 محاولة تحميل من: ${paths[currentIndex]}`);
            img.src = paths[currentIndex];
            currentIndex++;
            
            // إذا لم تحمل خلال 2 ثانية، جرب المسار التالي
            setTimeout(() => {
                if (!img.complete) {
                    tryNextPath();
                }
            }, 2000);
        };
        
        tryNextPath();
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
        startBtn.replaceWith(startBtn.cloneNode(true));
        const newStartBtn = document.getElementById('start-game-btn');
        
        // النقر
        newStartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚀 الضغط على زر البدء');
            this.startLastLevel();
        });
        
        // اللمس
        newStartBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            newStartBtn.style.transform = 'scale(0.95)';
            newStartBtn.style.opacity = '0.9';
        }, { passive: false });
        
        newStartBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            newStartBtn.style.transform = '';
            newStartBtn.style.opacity = '';
        }, { passive: false });
        
        newStartBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            newStartBtn.style.transform = '';
            newStartBtn.style.opacity = '';
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
            btn.replaceWith(btn.cloneNode(true));
            const newBtn = document.getElementById(id);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                callback();
            });
            
            // تحسين اللمس
            newBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                newBtn.classList.add('active');
            }, { passive: false });
            
            newBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                newBtn.classList.remove('active');
            }, { passive: false });
        }
    },
    
    setupFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (!fullscreenBtn) return;
        
        // إزالة الأحداث السابقة
        fullscreenBtn.replaceWith(fullscreenBtn.cloneNode(true));
        const newBtn = document.getElementById('fullscreen-btn');
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleFullscreen();
        });
        
        // تحديث أيقونة زر ملء الشاشة عند التغيير
        document.addEventListener('fullscreenchange', () => {
            const icon = newBtn.querySelector('i');
            if (document.fullscreenElement) {
                if (icon) {
                    icon.className = 'fas fa-compress';
                    icon.style.transform = 'rotate(0deg)';
                }
                newBtn.title = 'تصغير الشاشة';
                this.showNotification('🖥️ وضع ملء الشاشة مفعل');
            } else {
                if (icon) {
                    icon.className = 'fas fa-expand';
                    icon.style.transform = 'rotate(0deg)';
                }
                newBtn.title = 'ملء الشاشة';
                this.showNotification('📱 الخروج من ملء الشاشة');
            }
        });
        
        // تحديث حالات الشاشة عند التحميل
        setTimeout(() => {
            const icon = newBtn.querySelector('i');
            if (document.fullscreenElement) {
                if (icon) icon.className = 'fas fa-compress';
                newBtn.title = 'تصغير الشاشة';
            } else {
                if (icon) icon.className = 'fas fa-expand';
                newBtn.title = 'ملء الشاشة';
            }
        }, 100);
        
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
            /* تحسينات الجوال */
            .mobile-device .mobile-controls {
                display: flex !important;
                opacity: 0.95;
            }
            
            .mobile-device .btn-primary,
            .mobile-device .btn-secondary {
                padding: 16px 24px;
                font-size: 1rem;
                min-height: 55px;
            }
            
            .mobile-device .game-hud {
                padding: 10px 15px;
            }
            
            .mobile-device .hud-item {
                padding: 8px 15px;
                min-width: 85px;
                font-size: 0.9rem;
            }
            
            .mobile-device .mobile-btn {
                width: 65px !important;
                height: 65px !important;
                font-size: 1.4rem !important;
            }
            
            .mobile-device .jump-btn,
            .mobile-device .slide-btn {
                width: 70px !important;
                height: 70px !important;
            }
            
            /* إظهار رسالة الوضع العمودي */
            .mobile-device #game-screen.portrait-warning::before {
                content: "🔄 الرجاء تدوير الهاتف إلى الوضع الأفقي للعب";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(10, 10, 26, 0.95);
                color: white;
                display: flex !important;
                justify-content: center;
                align-items: center;
                font-size: 1.3rem;
                text-align: center;
                padding: 20px;
                z-index: 10000;
                backdrop-filter: blur(10px);
            }
            
            /* تحسينات للشاشات الصغيرة */
            @media (max-width: 768px) {
                .levels-grid {
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
                }
                
                .character-card {
                    flex-direction: column !important;
                    text-align: center !important;
                }
                
                .character-stats {
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
                
                .controls-guide {
                    grid-template-columns: 1fr !important;
                }
                
                .action-buttons {
                    flex-direction: column !important;
                    gap: 12px !important;
                }
                
                .btn-primary, 
                .btn-secondary {
                    width: 100% !important;
                    margin-bottom: 5px !important;
                }
                
                .mobile-controls {
                    bottom: 15px !important;
                    padding: 10px 15px !important;
                }
                
                .controls-left,
                .controls-right {
                    min-width: 150px !important;
                    padding: 10px 15px !important;
                    gap: 15px !important;
                }
                
                .modal-content {
                    max-width: 95% !important;
                }
            }
            
            @media (max-width: 480px) {
                .game-header h1 {
                    font-size: 1.8rem !important;
                }
                
                .tagline {
                    font-size: 1rem !important;
                }
                
                .levels-grid {
                    grid-template-columns: 1fr !important;
                }
                
                .level-card {
                    padding: 15px !important;
                }
                
                .level-icon {
                    width: 50px !important;
                    height: 50px !important;
                    font-size: 1.5rem !important;
                }
                
                .play-level-btn {
                    width: 45px !important;
                    height: 45px !important;
                }
                
                .mobile-controls {
                    bottom: 10px !important;
                    padding: 8px 10px !important;
                }
                
                .controls-left,
                .controls-right {
                    min-width: 140px !important;
                    padding: 8px 12px !important;
                    gap: 12px !important;
                }
                
                .mobile-btn {
                    width: 60px !important;
                    height: 60px !important;
                    font-size: 1.3rem !important;
                }
                
                .jump-btn,
                .slide-btn {
                    width: 65px !important;
                    height: 65px !important;
                }
                
                .jump-btn span,
                .slide-btn span {
                    font-size: 0.7rem !important;
                }
                
                .character-image {
                    width: 120px !important;
                    height: 160px !important;
                }
                
                .character-info h3 {
                    font-size: 1.4rem !important;
                }
                
                .modal-header h2 {
                    font-size: 1.5rem !important;
                }
            }
            
            @media (max-height: 600px) {
                .mobile-controls {
                    bottom: 5px !important;
                }
                
                .mobile-btn {
                    width: 55px !important;
                    height: 55px !important;
                    font-size: 1.2rem !important;
                }
                
                .jump-btn,
                .slide-btn {
                    width: 60px !important;
                    height: 60px !important;
                }
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
            btn.style.cursor = 'pointer';
            btn.style.userSelect = 'none';
            btn.style.WebkitUserSelect = 'none';
            btn.style.MozUserSelect = 'none';
            btn.style.msUserSelect = 'none';
            btn.style.touchAction = 'manipulation';
        });
        
        // منع التمرير عند اللمس على أزرار التحكم
        document.addEventListener('touchmove', (e) => {
            if (e.target.classList.contains('mobile-btn') || 
                e.target.closest('.mobile-controls')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        console.log('✅ تحسينات اللمس مفعلة');
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
        
        // تحديث قائمة المراحل إذا كانت مفتوحة
        const levelsModal = document.getElementById('levels-modal');
        if (levelsModal && levelsModal.style.display === 'flex') {
            this.updateLevelsList();
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
            } else {
                startBtn.innerHTML = `<i class="fas fa-play-circle"></i><span>🎮 ابدأ اللعب (المرحلة ${lastLevel})</span>`;
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
        
        // إنشاء قائمة المراحل في النافذة المنبثقة
        this.updateLevelsList();
        
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
    },
    
    savePlayerProgress(level, score) {
        try {
            // حفظ آخر مرحلة لعب
            localStorage.setItem('mario_last_level', level.toString());
            
            // حفظ أفضل نتيجة للمرحلة
            const levelScores = JSON.parse(localStorage.getItem('mario_level_scores') || '{}');
            if (!levelScores[level] || score > levelScores[level]) {
                levelScores[level] = score;
                localStorage.setItem('mario_level_scores', JSON.stringify(levelScores));
            }
            
            console.log(`💾 تم حفظ تقدم المرحلة ${level}: ${score} نقطة`);
            return true;
            
        } catch (e) {
            console.warn('⚠️ لا يمكن حفظ التقدم:', e);
            return false;
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
