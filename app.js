// ============================================
// 📱 تهيئة التطبيق والتحكم - النسخة النهائية
// ============================================

'use strict';

// كائن التطبيق
const App = {
    // تهيئة التطبيق
    init() {
        console.log('📱 تهيئة التطبيق...');
        
        this.setupEventListeners();
        this.setupMobileOptimizations();
        this.loadProgress();
        this.loadLevelsList();
        this.setupFocusHandling();
        
        console.log('✅ التطبيق جاهز تماماً!');
    },
    
    // إعداد الأحداث
    setupEventListeners() {
        // زر البدء - المرحلة 1
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚀 الضغط على زر البدء');
                
                // الحصول على آخر مرحلة لعب
                const lastLevel = localStorage.getItem('mario_last_level') || 1;
                
                if (typeof MarioGame !== 'undefined' && MarioGame.loadLevel) {
                    try {
                        MarioGame.loadLevel(parseInt(lastLevel));
                    } catch (error) {
                        console.error('❌ خطأ في بدء اللعبة:', error);
                        this.showNotification('⚠️ خطأ في بدء اللعبة، جاري المحاولة...');
                        setTimeout(() => {
                            if (MarioGame && MarioGame.loadLevel) {
                                MarioGame.loadLevel(1);
                            }
                        }, 1000);
                    }
                } else {
                    console.error('❌ MarioGame غير معرّف');
                    this.showNotification('🔄 جاري تحميل اللعبة...');
                    setTimeout(() => this.setupEventListeners(), 500);
                }
            });
            
            // دعم اللمس للزر
            startBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                startBtn.style.transform = 'scale(0.95)';
            }, { passive: false });
            
            startBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                startBtn.style.transform = '';
            }, { passive: false });
        }
        
        // زر قائمة المراحل
        const levelSelectBtn = document.getElementById('level-select-btn');
        if (levelSelectBtn) {
            levelSelectBtn.addEventListener('click', () => {
                document.getElementById('levels-modal').style.display = 'flex';
                this.updateLevelsList();
            });
        }
        
        // زر التعليمات
        const howToPlayBtn = document.getElementById('how-to-play-btn');
        if (howToPlayBtn) {
            howToPlayBtn.addEventListener('click', () => {
                document.getElementById('instructions-modal').style.display = 'flex';
            });
        }
        
        // زر إغلاق التعليمات
        const closeModalBtns = document.querySelectorAll('.close-modal');
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
        
        // زر الإيقاف
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (typeof MarioGame !== 'undefined' && MarioGame.togglePause) {
                    MarioGame.togglePause();
                }
            });
        }
        
        // زر الصوت
        const soundBtn = document.getElementById('sound-btn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                if (typeof MarioGame !== 'undefined' && MarioGame.toggleSound) {
                    MarioGame.toggleSound();
                }
            });
        }
        
        // زر ملء الشاشة
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // زر إعادة اللعب
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                if (typeof MarioGame !== 'undefined' && MarioGame.restartGame) {
                    MarioGame.restartGame();
                }
            });
        }
        
        // زر المرحلة التالية
        const nextLevelBtn = document.getElementById('next-level-btn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                if (typeof MarioGame !== 'undefined' && MarioGame.nextLevel) {
                    MarioGame.nextLevel();
                }
            });
        }
        
        // زر العودة للقائمة
        const backToMenuBtn = document.getElementById('back-to-menu-btn');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                if (typeof MarioGame !== 'undefined' && MarioGame.showScreen) {
                    MarioGame.showScreen('start');
                }
            });
        }
        
        // إغلاق النافذة عند النقر خارجها
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        // إغلاق النافذة بمفتاح ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
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
        
        // منع الإجراءات الافتراضية لأزرار التحكم
        document.addEventListener('keydown', (e) => {
            if (['Space', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                if (MarioGame && MarioGame.state === 'playing') {
                    e.preventDefault();
                }
            }
        });
        
        console.log('✅ جميع الأحداث جاهزة');
    },
    
    // تحسينات الجوال
    setupMobileOptimizations() {
        // الكشف عن جهاز الجوال
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            document.body.classList.add('mobile-device');
            console.log('📱 جهاز جوال مكتشف');
            
            // إضافة CSS إضافي للجوال
            const style = document.createElement('style');
            style.textContent = `
                .mobile-device .mobile-controls {
                    display: flex !important;
                }
                
                .mobile-device .btn-primary,
                .mobile-device .btn-secondary {
                    padding: 18px;
                    font-size: 1.1rem;
                }
                
                @media (max-width: 768px) {
                    .mobile-device .game-hud {
                        padding: 10px;
                    }
                    
                    .mobile-device .hud-item {
                        padding: 8px 15px;
                        min-width: 90px;
                        font-size: 0.9rem;
                    }
                    
                    .mobile-device .levels-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .mobile-device .levels-grid {
                        grid-template-columns: 1fr !important;
                    }
                    
                    .mobile-device .action-buttons {
                        flex-direction: column;
                    }
                    
                    .mobile-device .btn-primary,
                    .mobile-device .btn-secondary {
                        width: 100%;
                        margin-bottom: 10px;
                    }
                }
            `;
            document.head.appendChild(style);
        } else {
            console.log('💻 جهاز كمبيوتر مكتشف');
        }
        
        // منع التكبير باللمس المزدوج
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        // منع قائمة السياق على الجوال
        document.addEventListener('contextmenu', (e) => {
            if (isMobile) {
                e.preventDefault();
            }
        });
        
        // منع سحب الصور على الجوال
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });
    },
    
    // محاكاة تحميل التقدم
    loadProgress() {
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 5 + Math.random() * 10;
                if (progress > 100) progress = 100;
                progressFill.style.width = `${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                }
            }, 300);
        }
    },
    
    // تحميل قائمة المراحل
    loadLevelsList() {
        // إنشاء شبكة المراحل في الصفحة الرئيسية
        const levelsGrid = document.getElementById('levels-grid');
        if (levelsGrid) {
            const levelsHTML = `
                <div class="level-card" data-level="1">
                    <div class="level-icon" style="background: linear-gradient(135deg, #2ECC71, #27AE60);">
                        <i class="fas fa-mountain"></i>
                    </div>
                    <div class="level-info">
                        <h4>المرحلة 1: المنطقة الخضراء</h4>
                        <p>بداية سهلة في التلال الخضراء</p>
                        <div class="level-stats">
                            <span><i class="fas fa-coins"></i> 60 عملة</span>
                            <span><i class="fas fa-clock"></i> 3:00</span>
                        </div>
                    </div>
                    <button class="play-level-btn" data-level="1">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
                
                <div class="level-card" data-level="2">
                    <div class="level-icon" style="background: linear-gradient(135deg, #F39C12, #D35400);">
                        <i class="fas fa-sun"></i>
                    </div>
                    <div class="level-info">
                        <h4>المرحلة 2: أطلال الصحراء</h4>
                        <p>تحديات في رمال الصحراء</p>
                        <div class="level-stats">
                            <span><i class="fas fa-coins"></i> 70 عملة</span>
                            <span><i class="fas fa-clock"></i> 3:20</span>
                        </div>
                    </div>
                    <button class="play-level-btn" data-level="2">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
                
                <div class="level-card" data-level="3">
                    <div class="level-icon" style="background: linear-gradient(135deg, #3498DB, #2980B9);">
                        <i class="fas fa-snowflake"></i>
                    </div>
                    <div class="level-info">
                        <h4>المرحلة 3: جليد الجبل</h4>
                        <p>مغامرة جليدية على القمة</p>
                        <div class="level-stats">
                            <span><i class="fas fa-coins"></i> 80 عملة</span>
                            <span><i class="fas fa-clock"></i> 3:40</span>
                        </div>
                    </div>
                    <button class="play-level-btn" data-level="3">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            `;
            
            levelsGrid.innerHTML = levelsHTML;
            
            // إضافة أحداث لأزرار اللعب في المراحل
            document.querySelectorAll('.play-level-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const level = parseInt(e.target.closest('.play-level-btn').dataset.level);
                    this.startLevel(level);
                });
            });
        }
        
        // إنشاء قائمة المراحل في النافذة
        const levelsList = document.getElementById('levels-list');
        if (levelsList) {
            this.updateLevelsList();
        }
        
        console.log('✅ قائمة المراحل محملة');
    },
    
    // تحديث قائمة المراحل
    updateLevelsList() {
        const levelsList = document.getElementById('levels-list');
        if (!levelsList) return;
        
        // الحصول على تقدم اللاعب
        const savedLevel = localStorage.getItem('mario_last_level') || 1;
        const levelScores = JSON.parse(localStorage.getItem('mario_level_scores') || '{}');
        
        const levelsHTML = `
            <div class="level-item ${savedLevel >= 1 ? 'unlocked' : 'locked'}" data-level="1">
                <div class="level-item-icon">
                    <i class="fas fa-mountain"></i>
                </div>
                <div class="level-item-info">
                    <h4>المرحلة 1: المنطقة الخضراء</h4>
                    <p>${levelScores[1] ? `أفضل نتيجة: ${levelScores[1]}` : 'لم تلعب بعد'}</p>
                </div>
                <div class="level-item-status">
                    ${savedLevel >= 1 ? 
                        `<button class="btn-small play-level-list-btn" data-level="1">
                            <i class="fas fa-play"></i> لعب
                        </button>` : 
                        '<span class="locked-text"><i class="fas fa-lock"></i> مقفلة</span>'
                    }
                </div>
            </div>
            
            <div class="level-item ${savedLevel >= 2 ? 'unlocked' : 'locked'}" data-level="2">
                <div class="level-item-icon">
                    <i class="fas fa-sun"></i>
                </div>
                <div class="level-item-info">
                    <h4>المرحلة 2: أطلال الصحراء</h4>
                    <p>${levelScores[2] ? `أفضل نتيجة: ${levelScores[2]}` : 'لم تلعب بعد'}</p>
                </div>
                <div class="level-item-status">
                    ${savedLevel >= 2 ? 
                        `<button class="btn-small play-level-list-btn" data-level="2">
                            <i class="fas fa-play"></i> لعب
                        </button>` : 
                        '<span class="locked-text"><i class="fas fa-lock"></i> مقفلة</span>'
                    }
                </div>
            </div>
            
            <div class="level-item ${savedLevel >= 3 ? 'unlocked' : 'locked'}" data-level="3">
                <div class="level-item-icon">
                    <i class="fas fa-snowflake"></i>
                </div>
                <div class="level-item-info">
                    <h4>المرحلة 3: جليد الجبل</h4>
                    <p>${levelScores[3] ? `أفضل نتيجة: ${levelScores[3]}` : 'لم تلعب بعد'}</p>
                </div>
                <div class="level-item-status">
                    ${savedLevel >= 3 ? 
                        `<button class="btn-small play-level-list-btn" data-level="3">
                            <i class="fas fa-play"></i> لعب
                        </button>` : 
                        '<span class="locked-text"><i class="fas fa-lock"></i> مقفلة</span>'
                    }
                </div>
            </div>
        `;
        
        levelsList.innerHTML = levelsHTML;
        
        // إضافة أحداث لأزرار اللعب في القائمة
        document.querySelectorAll('.play-level-list-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = parseInt(e.target.closest('.play-level-list-btn').dataset.level);
                this.startLevel(level);
                document.getElementById('levels-modal').style.display = 'none';
            });
        });
    },
    
    // بدء مرحلة محددة
    startLevel(levelNumber) {
        console.log(`🚀 بدء المرحلة ${levelNumber}...`);
        
        if (typeof MarioGame !== 'undefined' && MarioGame.loadLevel) {
            try {
                // حفظ المرحلة الحالية
                localStorage.setItem('mario_last_level', levelNumber.toString());
                
                // تحديث زر البداية الرئيسي
                const startBtn = document.getElementById('start-game-btn');
                if (startBtn) {
                    startBtn.innerHTML = `<i class="fas fa-play-circle"></i><span>🎮 ابدأ اللعب (المرحلة ${levelNumber})</span>`;
                }
                
                // بدء المرحلة
                MarioGame.loadLevel(levelNumber);
                
            } catch (error) {
                console.error('❌ خطأ في بدء المرحلة:', error);
                this.showNotification('⚠️ خطأ في تحميل المرحلة، جاري المحاولة...');
                setTimeout(() => {
                    if (MarioGame && MarioGame.loadLevel) {
                        MarioGame.loadLevel(levelNumber);
                    }
                }, 1000);
            }
        } else {
            console.error('❌ MarioGame غير معرّف');
            this.showNotification('🔄 جاري تحميل اللعبة...');
            setTimeout(() => this.setupEventListeners(), 500);
        }
    },
    
    // ملء الشاشة
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
                
                this.showNotification('🖥️ وضع ملء الشاشة مفعل');
                
                // تدوير إلى الوضع الأفقي على الجوال
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
                
                this.showNotification('📱 الخروج من ملء الشاشة');
                
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
    
    // إعادة تعيين التحكم عند فقدان التركيز
    setupFocusHandling() {
        window.addEventListener('blur', () => {
            if (typeof MarioGame !== 'undefined' && MarioGame.state === 'playing') {
                MarioGame.togglePause();
                this.showNotification('⏸️ اللعبة متوقفة - النافذة غير نشطة');
            }
        });
        
        window.addEventListener('focus', () => {
            if (typeof MarioGame !== 'undefined' && MarioGame.state === 'paused') {
                this.showNotification('النافذة نشطة، اضغط متابعة للاستمرار');
            }
        });
    },
    
    // إظهار إشعار
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
    
    // حفظ تقدم اللاعب
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
            
        } catch (e) {
            console.warn('⚠️ لا يمكن حفظ التقدم:', e);
        }
    }
};

// ============================================
// بدء التطبيق
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 بدء تحميل التطبيق...');
    
    // إضافة CSS إضافي للواجهة
    const extraStyles = document.createElement('style');
    extraStyles.textContent = `
        /* أنماط قسم المراحل */
        .levels-section {
            margin-bottom: 40px;
        }
        
        .levels-section h2 {
            color: var(--accent);
            font-size: 1.8rem;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .levels-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .level-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 20px;
            border: 2px solid rgba(255, 215, 0, 0.2);
            transition: all 0.3s ease;
            position: relative;
        }
        
        .level-card:hover {
            transform: translateY(-5px);
            border-color: var(--accent);
            box-shadow: 0 10px 25px rgba(255, 215, 0, 0.1);
        }
        
        .level-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            color: white;
            flex-shrink: 0;
        }
        
        .level-info {
            flex: 1;
        }
        
        .level-info h4 {
            color: var(--accent);
            font-size: 1.2rem;
            margin-bottom: 8px;
        }
        
        .level-info p {
            color: var(--gray-light);
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        
        .level-stats {
            display: flex;
            gap: 15px;
        }
        
        .level-stats span {
            background: rgba(255, 255, 255, 0.1);
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .play-level-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--accent);
            border: none;
            color: #000;
            font-size: 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }
        
        .play-level-btn:hover {
            background: var(--primary);
            color: white;
            transform: scale(1.1);
        }
        
        /* قائمة المراحل في النافذة */
        .levels-list {
            max-height: 400px;
            overflow-y: auto;
            padding: 10px;
        }
        
        .level-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 15px;
            transition: all 0.3s ease;
        }
        
        .level-item.unlocked {
            border-left: 4px solid var(--accent);
        }
        
        .level-item.locked {
            opacity: 0.6;
            border-left: 4px solid var(--gray);
        }
        
        .level-item-icon {
            width: 50px;
            height: 50px;
            border-radius: 10px;
            background: var(--info);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
            flex-shrink: 0;
        }
        
        .level-item-info {
            flex: 1;
        }
        
        .level-item-info h4 {
            color: var(--light);
            font-size: 1.1rem;
            margin-bottom: 5px;
        }
        
        .level-item-info p {
            color: var(--gray);
            font-size: 0.9rem;
        }
        
        .level-item-status {
            flex-shrink: 0;
        }
        
        .btn-small {
            padding: 8px 15px;
            background: var(--accent);
            border: none;
            border-radius: 20px;
            color: #000;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
        }
        
        .locked-text {
            color: var(--gray);
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .levels-info {
            margin-top: 20px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            text-align: center;
            color: var(--gray-light);
            font-size: 0.9rem;
        }
        
        .levels-info i {
            color: var(--accent);
            margin-left: 8px;
        }
        
        /* تحديث HUD لإضافة المرحلة */
        #hud-level {
            font-weight: bold;
            color: var(--accent);
        }
        
        /* تحديث شاشة النهاية */
        #final-level {
            font-size: 2.5rem;
            color: var(--accent);
        }
        
        /* زر المرحلة التالية */
        #next-level-btn {
            background: linear-gradient(135deg, var(--success), var(--info));
        }
        
        /* استجابة للجوال */
        @media (max-width: 768px) {
            .levels-grid {
                grid-template-columns: 1fr;
            }
            
            .level-card {
                padding: 15px;
            }
            
            .level-icon {
                width: 50px;
                height: 50px;
                font-size: 1.5rem;
            }
            
            .play-level-btn {
                width: 45px;
                height: 45px;
            }
            
            .level-item {
                padding: 12px;
            }
            
            .level-item-icon {
                width: 45px;
                height: 45px;
                font-size: 1.3rem;
            }
        }
        
        /* منع التحديد */
        .no-select {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
    `;
    document.head.appendChild(extraStyles);
    
    // بدء التطبيق بعد تأخير قصير
    setTimeout(() => {
        App.init();
        console.log('🎮 نظام التطبيق محمل وجاهز!');
    }, 500);
    
    // منع الإجراءات الافتراضية
    document.addEventListener('touchmove', (e) => {
        if (e.target.classList.contains('mobile-btn') || 
            e.target.closest('.mobile-controls')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // منع سحب الصفحة على الجوال
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
});

// ============================================
// دعم ملء الشاشة
// ============================================

document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('fullscreen-btn');
    if (btn) {
        const icon = btn.querySelector('i');
        if (document.fullscreenElement) {
            icon.className = 'fas fa-compress';
            btn.title = 'تصغير الشاشة';
            document.body.classList.add('fullscreen');
        } else {
            icon.className = 'fas fa-expand';
            btn.title = 'ملء الشاشة';
            document.body.classList.remove('fullscreen');
        }
    }
});

// ============================================
// دعم تغيير التوجيه
// ============================================

window.addEventListener('orientationchange', () => {
    console.log('🔄 تغيير التوجيه:', screen.orientation.type);
    
    // إعادة ضبط الحجم بعد تغيير التوجيه
    setTimeout(() => {
        if (typeof MarioGame !== 'undefined' && MarioGame.canvas) {
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                MarioGame.canvas.width = gameContainer.clientWidth;
                MarioGame.canvas.height = gameContainer.clientHeight;
            }
        }
        
        App.showNotification('🔄 تم تعديل الشاشة للتوجيه الجديد');
    }, 300);
});

// ============================================
// منع إغلاق الصفحة أثناء اللعب
// ============================================

window.addEventListener('beforeunload', (e) => {
    if (typeof MarioGame !== 'undefined' && MarioGame.state === 'playing') {
        e.preventDefault();
        e.returnValue = 'هل تريد حقاً الخروج؟ تقدمك في اللعبة قد يضيع.';
        return e.returnValue;
    }
});

// ============================================
// دعم حفظ التقدم التلقائي
// ============================================

// دالة لحفظ تقدم اللاعب
window.saveLevelProgress = function(level, score) {
    App.savePlayerProgress(level, score);
};

// جعل App متاحة عالمياً للمراقبة
window.App = App;

console.log('✅ ملف app.js محمل بنجاح!');
