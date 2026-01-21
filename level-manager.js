// ============================================
// 🗺️ مدير المراحل - Level Manager
// ============================================

const LevelManager = {
    levels: {},
    currentLevel: null,
    
    init() {
        console.log('🗺️ تحميل مدير المراحل...');
        this.levels = {};
        
        // سجل جميع المراحل المحملة
        if (window.Level1) this.setLevel(1, Level1);
        if (window.Level2) this.setLevel(2, Level2);
        if (window.Level3) this.setLevel(3, Level3);
        
        console.log(`✅ مدير المراحل جاهز - ${Object.keys(this.levels).length} مراحل`);
    },
    
    setLevel(levelNumber, data) {
        this.levels[levelNumber] = {
            ...this.createLevelTemplate(),
            ...data
        };
        console.log(`✅ تم تحميل المرحلة ${levelNumber}: ${data.name}`);
    },
    
    getLevel(levelNumber) {
        return this.levels[levelNumber];
    },
    
    createLevelTemplate() {
        return {
            name: 'مرحلة غير معروفة',
            description: 'بدون وصف',
            playerStart: { x: 100, y: 100 },
            timeLimit: 180,
            totalCoins: 50,
            platforms: [],
            coins: [],
            enemies: [],
            castle: { x: 3800, y: 200, width: 280, height: 200 }
        };
    },
    
    loadLevel(levelNumber) {
        const level = this.getLevel(levelNumber);
        if (!level) {
            console.error(`❌ المرحلة ${levelNumber} غير موجودة`);
            return null;
        }
        
        this.currentLevel = level;
        console.log(`🎮 تحميل المرحلة ${levelNumber}: ${level.name}`);
        console.log(`📊 الإحصائيات: ${level.totalCoins} عملة، ${level.timeLimit} ثانية`);
        
        return level;
    },
    
    getTotalLevels() {
        return Object.keys(this.levels).length;
    },
    
    getLevelInfo(levelNumber) {
        const level = this.getLevel(levelNumber);
        if (!level) return null;
        
        return {
            number: levelNumber,
            name: level.name,
            description: level.description,
            unlocked: true,
            bestScore: this.getLevelScore(levelNumber)
        };
    },
    
    getLevelScore(levelNumber) {
        try {
            const levelScores = JSON.parse(localStorage.getItem('mario_level_scores') || '{}');
            return levelScores[levelNumber] || 0;
        } catch (e) {
            return 0;
        }
    },
    
    saveLevelScore(levelNumber, score) {
        try {
            const levelScores = JSON.parse(localStorage.getItem('mario_level_scores') || '{}');
            if (!levelScores[levelNumber] || score > levelScores[levelNumber]) {
                levelScores[levelNumber] = score;
                localStorage.setItem('mario_level_scores', JSON.stringify(levelScores));
                console.log(`💾 تم حفظ نتيجة المرحلة ${levelNumber}: ${score}`);
                return true;
            }
        } catch (e) {
            console.warn('⚠️ لا يمكن حفظ نتيجة المرحلة');
        }
        return false;
    }
};

// تحميل مدير المراحل عند بدء الصفحة
document.addEventListener('DOMContentLoaded', () => {
    LevelManager.init();
});

// جعل LevelManager متاحاً عالمياً
window.LevelManager = LevelManager;
