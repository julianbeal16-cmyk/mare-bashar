// ============================================
// 📱 تهيئة التطبيق - النسخة المحسنة
// ============================================

'use strict';

// متغيرات التطبيق
const App = {
    loadingProgress: 0,
    totalAssets: 3,
    loadedAssets: 0,
    
    init() {
        console.log('📱 تهيئة التطبيق...');
        
        // إعداد الأزرار والمستمعين
        this.setupEventListeners();
        
        // تحميل الأصول
        this.loadAssets();
        
        // إعداد شاشة التحميل
        this.setupLoadingScreen();
        
        // منع السلوك الافتراضي
        this.preventDefaultActions();
    },
    
    setupEventListeners() {
        // زر البدء
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (typeof startGame === 'function') {
                    startGame();
                } else {
                    console.error('❌ دالة startGame غير موجودة');
                    showNotification('⚠️ اللعبة غير جاهزة بعد، يرجى الانتظار...');
                }
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
        const closeBtn = document.querySelector('#instructions-modal .close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('instructions-modal').style.display = 'none';
            });
        }
        
        // زر إعادة اللعب
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                if (typeof restartGame === 'function') {
                    restartGame();
                }
            });
        }
        
        // زر العودة للقائمة
        const backToMenuBtn = document.getElementById('back-to-menu-btn');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                if (typeof backToMenu === 'function') {
                    backToMenu();
                } else if (typeof showScreen === 'function') {
                    showScreen('start');
                }
            });
        }
        
        // زر الإيقاف
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (typeof togglePause === 'function') {
                    togglePause();
                }
            });
        }
        
        // زر الصوت
        const soundBtn = document.getElementById('sound-btn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                if (typeof toggleSound === 'function') {
                    toggleSound();
                }
            });
        }
        
        // زر ملء الشاشة
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                toggleFullscreen();
            });
        }
        
        // إغلاق النافذة عند النقر خارجها
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('instructions-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
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
    
    setupLoadingScreen() {
        const loadingProgress = document.getElementById('loading-progress');
        if (loadingProgress) {
            const interval = setInterval(() => {
                if (this.loadingProgress < 100) {
                    this.loadingProgress = Math.min(this.loadingProgress + 5, (this.loadedAssets / this.totalAssets) * 100);
                    loadingProgress.textContent = `${Math.round(this.loadingProgress)}%`;
                } else {
                    clearInterval(interval);
                }
            }, 50);
        }
    },
    
    loadAssets() {
        console.log('📦 جاري تحميل الأصول...');
        
        // محاكاة تحميل الأصول
        const assets = ['game.js', 'style.css', 'sounds'];
        
        assets.forEach((asset, index) => {
            setTimeout(() => {
                this.loadedAssets++;
                this.loadingProgress = (this.loadedAssets / this.totalAssets) * 100;
                console.log(`✅ تم تحميل: ${asset}`);
                
                if (this.loadedAssets === this.totalAssets) {
                    console.log('🎉 تم تحميل جميع الأصول!');
                    this.onAssetsLoaded();
                }
            }, (index + 1) * 500);
        });
    },
    
    onAssetsLoaded() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    
                    // تأكد من أن اللعبة جاهزة
                    if (typeof MarioGame !== 'undefined' && MarioGame.state === 'menu') {
                        showNotification('🎮 اللعبة جاهزة! اضغط ابدأ للبدء');
                    }
                }, 500);
            }
        }, 500);
    },
    
    preventDefaultActions() {
        // منع القائمة السياقية
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // منع سحب الصور
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });
        
        // منع تكبير الصفحة على iOS
        document.addEventListener('touchmove', (e) => {
            if (e.scale !== 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }
};

// ============================================
// دالات مساعدة عامة
// ============================================

// دالة عرض الشاشات
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    const screen = document.getElementById(screenId + '-screen');
    if (screen) {
        screen.classList.add('active');
        screen.style.display = 'flex';
    }
}

// دالة ملء الشاشة
function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`خطأ في ملء الشاشة: ${err.message}`);
                showNotification('⚠️ لا يدعم المتصفح ملء الشاشة');
            });
        } else {
            document.exitFullscreen();
        }
    } catch (error) {
        console.log('⚠️ المتصفح لا يدعم ملء الشاشة');
        showNotification('⚠️ المتصفح لا يدعم ملء الشاشة');
    }
}

// دالة الإشعارات
function showNotification(message) {
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

// دالة تحميل أفضل نتيجة
function loadBestScore() {
    try {
        const saved = localStorage.getItem('mario_best_score');
        if (saved) {
            document.getElementById('best-score').textContent = saved;
            return parseInt(saved);
        }
    } catch(e) {
        console.log('⚠️ لا يمكن تحميل أفضل نتيجة');
    }
    return 0;
}

// ============================================
// تهيئة التطبيق عند تحميل الصفحة
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM محمل - جاري تهيئة التطبيق...');
    
    // إخفاء شاشة التحميل بعد فترة
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.log('⚠️ تحميل طويل، تجاوز شاشة التحميل...');
            loadingScreen.style.display = 'none';
            showScreen('start');
            showNotification('🎮 جاهز للعب! قد تكون بعض الميزات غير متاحة');
        }
    }, 5000);
    
    // تهيئة التطبيق
    App.init();
    
    // تحميل أفضل نتيجة
    loadBestScore();
    
    // جعل الدوال متاحة عالمياً
    window.showScreen = showScreen;
    window.showNotification = showNotification;
    window.toggleFullscreen = toggleFullscreen;
    
    console.log('✅ التطبيق جاهز!');
});

// ============================================
// تحسينات للأداء
// ============================================

// إدارة استهلاك البطارية
if ('wakeLock' in navigator) {
    let wakeLock = null;
    
    const requestWakeLock = async () => {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('🔋 Wake Lock مفعل');
        } catch (err) {
            console.log('🔋 Wake Lock فشل:', err.message);
        }
    };
    
    requestWakeLock();
    
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && wakeLock === null) {
            requestWakeLock();
        }
    });
}

// إدارة الذاكرة
if ('memory' in performance) {
    setInterval(() => {
        const memory = performance.memory;
        console.log(`🧠 استخدام الذاكرة: ${Math.round(memory.usedJSHeapSize / 1048576)}MB / ${Math.round(memory.totalJSHeapSize / 1048576)}MB`);
    }, 30000);
}

// ============================================
// تحسينات للأجهزة المنخفضة الأداء
// ============================================

const isLowEndDevice = () => {
    return (
        navigator.hardwareConcurrency < 4 ||
        (navigator.deviceMemory && navigator.deviceMemory < 4) ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
};

if (isLowEndDevice()) {
    console.log('📱 جهاز منخفض الأداء - تطبيق تحسينات');
    
    // تقليل دقة الرسوم
    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.style.imageRendering = 'pixelated';
        }
    });
}

// ============================================
// دعم وضع عدم الاتصال
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('✅ ServiceWorker مسجل:', registration.scope);
        }).catch(error => {
            console.log('❌ فشل تسجيل ServiceWorker:', error);
        });
    });
}

// ============================================
// إضافة دعم لوضع اللعبة
// ============================================

if ('gamepad' in navigator) {
    window.addEventListener('gamepadconnected', (e) => {
        console.log('🎮 جهاز تحكم متصل:', e.gamepad.id);
        showNotification('🎮 تم التعرف على جهاز تحكم الألعاب!');
    });
}

// ============================================
// شاشة الخطأ الودية
// ============================================

window.addEventListener('error', (e) => {
    console.error('❌ خطأ غير معالج:', e.error);
    
    // عدم عرض شاشة الخطأ أثناء التطوير
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return;
    }
    
    const errorMessage = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 10, 26, 0.95);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            padding: 20px;
            text-align: center;
        ">
            <div>
                <h1 style="color: #E74C3C; margin-bottom: 20px;">😢 عذراً، حدث خطأ</h1>
                <p style="margin-bottom: 30px; color: #aaa;">
                    واجهت اللعبة مشكلة غير متوقعة.<br>
                    يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.
                </p>
                <button onclick="location.reload()" style="
                    padding: 15px 30px;
                    background: #3498DB;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    cursor: pointer;
                    margin: 10px;
                ">
                    🔄 إعادة تحميل الصفحة
                </button>
                <button onclick="showScreen('start')" style="
                    padding: 15px 30px;
                    background: #2ECC71;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    cursor: pointer;
                    margin: 10px;
                ">
                    🏠 العودة للقائمة
                </button>
            </div>
        </div>
    `;
    
    if (!document.querySelector('.error-screen')) {
        document.body.insertAdjacentHTML('beforeend', errorMessage);
    }
});
