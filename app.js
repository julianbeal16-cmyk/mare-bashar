// ============================================
// 📱 تهيئة التطبيق والتحكم - الإصدار النهائي
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
        
        console.log('✅ التطبيق جاهز تماماً!');
    },
    
    // إعداد الأحداث
    setupEventListeners() {
        // زر البدء - مع معالجة الأخطاء
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚀 الضغط على زر البدء');
                
                if (typeof MarioGame !== 'undefined' && MarioGame.startGame) {
                    try {
                        MarioGame.startGame();
                    } catch (error) {
                        console.error('❌ خطأ في بدء اللعبة:', error);
                        this.showNotification('⚠️ خطأ في بدء اللعبة، جاري المحاولة...');
                        setTimeout(() => {
                            if (MarioGame && MarioGame.startGame) {
                                MarioGame.startGame();
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
        
        // زر التعليمات
        const howToPlayBtn = document.getElementById('how-to-play-btn');
        if (howToPlayBtn) {
            howToPlayBtn.addEventListener('click', () => {
                document.getElementById('instructions-modal').style.display = 'flex';
            });
        }
        
        // زر إغلاق التعليمات
        const closeModalBtn = document.querySelector('.close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                document.getElementById('instructions-modal').style.display = 'none';
            });
        }
        
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
            if (e.target.id === 'instructions-modal') {
                document.getElementById('instructions-modal').style.display = 'none';
            }
        });
        
        // إغلاق النافذة بمفتاح ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('instructions-modal');
                if (modal && modal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
                
                // الخروج من وضع ملء الشاشة
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            }
        });
        
        // منع الإجراءات الافتراضية لأزرار التحكم
        document.addEventListener('keydown', (e) => {
            if (['Space', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                if (MarioGame.state === 'playing') {
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
                    padding: 20px;
                    font-size: 1.1rem;
                }
                
                @media (max-width: 768px) {
                    .mobile-device .game-hud {
                        padding: 10px;
                    }
                    
                    .mobile-device .hud-item {
                        padding: 8px 15px;
                        min-width: 90px;
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
    }
};

// ============================================
// بدء التطبيق
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 بدء تحميل التطبيق...');
    
    // إضافة فئات CSS للتحكم
    document.body.classList.add('no-select');
    
    // بدء التطبيق بعد تأخير قصير
    setTimeout(() => {
        App.init();
        App.setupFocusHandling();
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

console.log('🎮 نظام التطبيق محمل وجاهز!');

// جعل App متاحة عالمياً للمراقبة
window.App = App;
