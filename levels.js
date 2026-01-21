// ============================================
// 🗺️ مدير المراحل - Level Manager
// ============================================

const LevelManager = {
    levels: {},
    
    init() {
        console.log('🗺️ تحميل مدير المراحل...');
        this.loadLevels();
    },
    
    loadLevels() {
        // سنقوم بتحميل المراحل من ملفات مستقلة
        // لكن أولاً نضع بيانات أساسية
        this.levels = {
            1: null, // سيتم تحميله من level-1.js
            2: null, // سيتم تحميله من level-2.js
            3: null  // سيتم تحميله من level-3.js
        };
        
        console.log('✅ مدير المراحل جاهز');
    },
    
    getLevel(levelNumber) {
        return this.levels[levelNumber];
    },
    
    setLevel(levelNumber, data) {
        this.levels[levelNumber] = data;
        console.log(`✅ تم تعيين بيانات المرحلة ${levelNumber}`);
    },
    
    createLevelTemplate() {
        return {
            name: 'مرحلة جديدة',
            playerStart: { x: 100, y: 100 },
            platforms: [],
            coins: [],
            enemies: [],
            castle: { x: 3800, y: 200, width: 280, height: 200 },
            timeLimit: 180,
            totalCoins: 50
        };
    }
};

// جعل LevelManager متاحاً عالمياً
window.LevelManager = LevelManager;

// تحميل مدير المراحل عند بدء الصفحة
window.addEventListener('DOMContentLoaded', () => {
    LevelManager.init();
});
