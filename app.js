// ============================================
// 📱 تهيئة التطبيق والتحكم
// ============================================

'use strict';

// كائن التطبيق
const App = {
    // تهيئة التطبيق
    init() {
        console.log('📱 تهيئة التطبيق...');
        
        this.setupEventListeners();
        this.hideLoadingScreen();
        this.loadProgress();
        
        console.log('✅ التطبيق جاهز!');
    },
    
    // إعداد الأحداث
    setupEventListeners() {
        // زر البدء
        document.getElementById('start-game-btn').addEventListener('click', () => {
            console.log('🚀 الضغط على زر البدء');
            if (typeof MarioGame !== 'undefined' && MarioGame.startGame) {
                MarioGame.startGame();
            } else {
                console.error('❌ MarioGame غير معرّف');
                this.showNotification('⚠️ جاري تحميل اللعبة...');
                setTimeout(() => this.setupEventListeners(), 500);
            }
        });
        
        // زر التعليمات
        document.getElementById('how-to-play-btn').addEventListener('click', () => {
            document.getElementById('instructions-modal').style.display = 'flex';
        });
        
        // زر إغلاق التعليمات
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('instructions-modal').style.display = 'none';
        });
        
        // زر الإيقاف
        document.getElementById('pause-btn').addEventListener('click', () => {
            if (typeof MarioGame !== 'undefined' && MarioGame.togglePause) {
                MarioGame.togglePause();
            }
        });
        
        // زر الصوت
        document.getElementById('sound-btn').addEventListener('click', () => {
            if (typeof MarioGame !== 'undefined' && MarioGame.toggleSound) {
                MarioGame.toggleSound();
            }
        });
        
        // زر ملء الشاشة
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // زر إعادة اللعب
        document.getElementById('play-again-btn').addEventListener('click', () => {
            if (typeof MarioGame !== 'undefined' && MarioGame.restartGame) {
                MarioGame.restartGame();
            }
        });
        
        // زر العودة للقائمة
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            if (typeof MarioGame !== 'undefined' && MarioGame.showScreen) {
                MarioGame.showScreen('start');
            }
        });
        
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
            }
        });
    },
    
    // إخفاء شاشة التحميل
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 2000);
        }
    },
    
    // محاكاة تحميل التقدم
    loadProgress() {
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
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
                document.documentElement.requestFullscreen();
                this.showNotification('🖥️ وضع ملء الشاشة مفعل');
            } else {
                document.exitFullscreen();
                this.showNotification('📱 الخروج من ملء الشاشة');
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
    }
};

// ============================================
// بدء التطبيق
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 بدء تحميل التطبيق...');
    
    // بدء التطبيق بعد تحميل الصفحة
    setTimeout(() => {
        App.init();
    }, 1000);
    
    // دعم للجوال
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    // منع السلوك الافتراضي
    document.addEventListener('keydown', (e) => {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
    });
});

// ============================================
// دعم ملء الشاشة
// ============================================

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
// منع التكبير على الجوال
// ============================================

document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

console.log('🎮 نظام التطبيق محمل!');
