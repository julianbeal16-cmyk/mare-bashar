// ============================================
// 🎨 نظام إدارة واجهة المستخدم
// ============================================

'use strict';

class UIManager {
    constructor() {
        console.log('🎨 إنشاء مدير واجهة المستخدم...');
        this.game = null;
        this.settings = this.loadSettings();
    }
    
    initialize() {
        console.log('🚀 تهيئة نظام الواجهة...');
        
        // معالجة صورة اللاعب
        this.setupPlayerImage();
        
        // إعداد أحداث التحكم
        this.setupControlEvents();
        
        // إعداد النوافذ المنبثقة
        this.setupModals();
        
        // تطبيق الإعدادات المحفوظة
        this.applySavedSettings();
        
        // إعداد أحداث الشاشة
        this.setupScreenEvents();
        
        console.log('✅ نظام الواجهة جاهز!');
    }
    
    setupPlayerImage() {
        const heroImage = document.getElementById('hero-image');
        if (!heroImage) return;
        
        heroImage.onerror = () => {
            console.log('⚠️ صورة اللاعب غير موجودة، سيتم استخدام بديل');
            const characterFrame = document.querySelector('.character-frame');
            if (characterFrame) {
                characterFrame.innerHTML = `
                    <div class="character-placeholder">
                        <div class="placeholder-icon">
                            <i class="fas fa-user-ninja"></i>
                        </div>
                        <div class="placeholder-text">البطل</div>
                    </div>
                `;
            }
        };
        
        // محاولة تحميل الصورة من مسارين
        heroImage.src = 'assets/player.png';
        
        // إذا فشل التحميل، جرب مساراً بديلاً
        setTimeout(() => {
            if (heroImage.complete && heroImage.naturalHeight === 0) {
                heroImage.src = 'player.png';
            }
        }, 1000);
    }
    
    setupControlEvents() {
        // زر البدء الرئيسي
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.startGame();
                } else {
                    this.showError('اللعبة غير مهيأة. جاري التحميل...');
                    setTimeout(() => location.reload(), 1000);
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
                this.shareGameResult();
            });
        }
        
        // زر ملء الشاشة
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // زر الموسيقى
        const musicBtn = document.getElementById('music-btn');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                this.toggleMusic();
            });
        }
        
        // زر الإعدادات
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }
        
        // زر التعليمات
        const howToPlayBtn = document.getElementById('how-to-play');
        if (howToPlayBtn) {
            howToPlayBtn.addEventListener('click', () => {
                this.showHelpModal();
            });
        }
    }
    
    setupModals() {
        // إعداد أزرار إغلاق النوافذ
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // إغلاق النوافذ بالنقر خارجها
        window.addEventListener('click', (event) => {
            document.querySelectorAll('.modal').forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // إعداد زر حفظ الإعدادات
        const saveSettingsBtn = document.querySelector('.save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
    }
    
    setupScreenEvents() {
        // إدارة أحداث تغيير الشاشة
        document.addEventListener('screenChange', (e) => {
            this.onScreenChange(e.detail.screen);
        });
        
        // تحديث أفضل نتيجة عند العودة للقائمة
        const observer = new MutationObserver(() => {
            const startScreen = document.getElementById('start-screen');
            if (startScreen && startScreen.style.display === 'flex') {
                this.updateHighScore();
            }
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style'],
            subtree: true
        });
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('mario_game_settings');
            return saved ? JSON.parse(saved) : {
                soundEffects: true,
                backgroundMusic: true,
                vibration: true,
                particles: true,
                sensitivity: 5,
                buttonSize: 80
            };
        } catch (error) {
            console.log('⚠️ فشل تحميل الإعدادات:', error);
            return {
                soundEffects: true,
                backgroundMusic: true,
                vibration: true,
                particles: true,
                sensitivity: 5,
                buttonSize: 80
            };
        }
    }
    
    applySavedSettings() {
        // تطبيق حجم أزرار الجوال
        const buttonSize = this.settings.buttonSize || 80;
        this.applyButtonSize(buttonSize);
        
        // تحديث عناصر الإعدادات في النافذة
        setTimeout(() => {
            const soundEffects = document.getElementById('sound-effects');
            const backgroundMusic = document.getElementById('background-music');
            const vibration = document.getElementById('vibration');
            const particles = document.getElementById('particles');
            const sensitivity = document.getElementById('sensitivity');
            const buttonSizeRange = document.getElementById('button-size');
            
            if (soundEffects) soundEffects.checked = this.settings.soundEffects;
            if (backgroundMusic) backgroundMusic.checked = this.settings.backgroundMusic;
            if (vibration) vibration.checked = this.settings.vibration;
            if (particles) particles.checked = this.settings.particles;
            if (sensitivity) sensitivity.value = this.settings.sensitivity;
            if (buttonSizeRange) buttonSizeRange.value = this.settings.buttonSize;
        }, 500);
    }
    
    applyButtonSize(size) {
        const buttons = document.querySelectorAll('.mobile-control-btn');
        buttons.forEach(btn => {
            btn.style.width = `${size}px`;
            btn.style.height = `${size}px`;
            
            const icon = btn.querySelector('i');
            if (icon) {
                icon.style.fontSize = `${size * 0.4}px`;
            }
            
            const text = btn.querySelector('span');
            if (text) {
                text.style.fontSize = `${size * 0.2}px`;
            }
        });
    }
    
    saveSettings() {
        try {
            const soundEffects = document.getElementById('sound-effects').checked;
            const backgroundMusic = document.getElementById('background-music').checked;
            const vibration = document.getElementById('vibration').checked;
            const particles = document.getElementById('particles').checked;
            const sensitivity = document.getElementById('sensitivity').value;
            const buttonSize = document.getElementById('button-size').value;
            
            this.settings = {
                soundEffects,
                backgroundMusic,
                vibration,
                particles,
                sensitivity: parseInt(sensitivity),
                buttonSize: parseInt(buttonSize),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('mario_game_settings', JSON.stringify(this.settings));
            
            // تطبيق التغييرات
            this.applyButtonSize(this.settings.buttonSize);
            
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
    
    toggleFullscreen() {
        const btn = document.getElementById('fullscreen-btn');
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                if (btn) {
                    btn.innerHTML = '<i class="fas fa-compress"></i>';
                    btn.title = 'تصغير الشاشة';
                }
                this.showNotification('🖥️ وضع ملء الشاشة مفعل');
            } else {
                document.exitFullscreen();
                if (btn) {
                    btn.innerHTML = '<i class="fas fa-expand"></i>';
                    btn.title = 'ملء الشاشة';
                }
                this.showNotification('📱 الخروج من ملء الشاشة');
            }
        } catch (error) {
            console.log('⚠️ خطأ في ملء الشاشة');
            this.showNotification('⚠️ لا يدعم المتصفح ملء الشاشة');
        }
    }
    
    toggleMusic() {
        const btn = document.getElementById('music-btn');
        if (!btn) return;
        
        if (btn.innerHTML.includes('volume-up')) {
            btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            btn.title = 'تشغيل الصوت';
            this.showNotification('🔇 الصوت متوقف');
        } else {
            btn.innerHTML = '<i class="fas fa-volume-up"></i>';
            btn.title = 'إيقاف الصوت';
            this.showNotification('🔊 الصوت مفعل');
        }
    }
    
    showSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    showHelpModal() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
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
    
    shareGameResult() {
        if (!window.game) {
            this.showNotification('⚠️ لم تلعب بعد!');
            return;
        }
        
        const score = window.game.score;
        const coins = window.game.coins;
        const totalCoins = window.game.totalCoins;
        const timeLeft = window.game.timeLeft;
        
        const shareText = `🎮 لعبة ماريو الخارقة\n🏆 النتيجة: ${score}\n💰 العملات: ${coins}/${totalCoins}\n⏱️ الوقت المتبقي: ${Math.floor(timeLeft/60)}:${timeLeft%60}\n\nجربها الآن!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'نتيجتي في لعبة ماريو الخارقة',
                text: shareText,
                url: window.location.href
            }).then(() => {
                this.showNotification('📢 تم المشاركة بنجاح!');
            }).catch((error) => {
                console.log('❌ فشل المشاركة:', error);
                this.copyToClipboard(shareText);
            });
        } else {
            this.copyToClipboard(shareText);
        }
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('📋 تم نسخ النتيجة للحافظة!');
        }).catch((error) => {
            console.log('❌ فشل النسخ:', error);
            
            // طريقة بديلة
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    this.showNotification('📋 تم نسخ النتيجة!');
                } else {
                    this.showNotification('⚠️ فشل نسخ النتيجة');
                }
            } catch (err) {
                console.log('❌ فشل النسخ بالطريقة البديلة:', err);
                this.showNotification('⚠️ فشل نسخ النتيجة');
            }
            
            document.body.removeChild(textArea);
        });
    }
    
    showNotification(text) {
        const notification = document.querySelector('.notification');
        const notificationText = document.querySelector('.notification-text');
        
        if (!notification || !notificationText) {
            console.log('📢', text);
            return;
        }
        
        notificationText.textContent = text;
        notification.style.display = 'flex';
        
        // إخفاء الإشعار بعد 3 ثواني
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
        
        // تسجيل في الكونسول
        console.log(`📢 إشعار: ${text}`);
    }
    
    showError(message) {
        this.showNotification(`❌ ${message}`);
        console.error(message);
    }
    
    onScreenChange(screenName) {
        console.log(`🔄 تغيير الشاشة إلى: ${screenName}`);
        
        switch (screenName) {
            case 'start':
                this.updateHighScore();
                break;
            case 'game':
                // تحديث عناصر واجهة اللعبة
                setTimeout(() => {
                    if (window.game) {
                        window.game.updateUI();
                    }
                }, 100);
                break;
            case 'end':
                // تحديث الإحصائيات النهائية
                setTimeout(() => {
                    this.updateEndScreen();
                }, 200);
                break;
        }
    }
    
    updateEndScreen() {
        if (!window.game) return;
        
        // تحديث الإنجازات
        const coinMaster = document.getElementById('coin-master');
        const speedRunner = document.getElementById('speed-runner');
        
        if (coinMaster && window.game.coins >= window.game.totalCoins) {
            coinMaster.classList.add('unlocked');
            coinMaster.innerHTML = '<i class="fas fa-check-circle"></i><span>سيد العملات</span>';
        }
        
        if (speedRunner && window.game.timeLeft >= 60) {
            speedRunner.classList.add('unlocked');
            speedRunner.innerHTML = '<i class="fas fa-check-circle"></i><span>عداء سريع</span>';
        }
    }
}

// ============================================
// تهيئة النظام عند تحميل الصفحة
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 تهيئة واجهة المستخدم...');
    
    // تأخير بسيط لضمان تحميل كل شيء
    setTimeout(() => {
        try {
            window.uiManager = new UIManager();
            window.uiManager.initialize();
            
            console.log('✅ نظام الواجهة جاهز للعمل!');
        } catch (error) {
            console.error('❌ فشل تهيئة نظام الواجهة:', error);
            alert('⚠️ خطأ في تحميل الواجهة!\n\n' + error.message);
        }
    }, 300);
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
        gameState: window.game?.gameState,
        settings: window.uiManager?.settings
    });
    
    if (window.uiManager) {
        window.uiManager.showNotification('🐛 معلومات التصحيح في الكونسول');
    }
};
