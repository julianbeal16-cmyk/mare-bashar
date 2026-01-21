// ============================================
// 🗺️ المرحلة الأولى - المنطقة الخضراء
// ============================================

const Level1 = {
    name: 'المرحلة 1: المنطقة الخضراء',
    description: 'بداية سهلة في التلال الخضراء الجميلة',
    
    // إعدادات المرحلة
    playerStart: { x: 100, y: 300 },
    timeLimit: 180,
    totalCoins: 40,
    
    // المنصات
    platforms: [
        // الأرض الأساسية (أكبر لحمل كل المرحلة)
        { x: 0, y: 400, width: 3800, height: 100, type: 'ground', color: '#8B4513' },
        
        // منصة أولى
        { x: 300, y: 320, width: 200, height: 25, type: 'platform', color: '#2ECC71' },
        { x: 600, y: 280, width: 180, height: 25, type: 'platform', color: '#27AE60' },
        { x: 900, y: 240, width: 160, height: 25, type: 'platform', color: '#229954' },
        
        // منصات متوسطة
        { x: 1200, y: 320, width: 170, height: 25, type: 'platform', color: '#2ECC71' },
        { x: 1500, y: 280, width: 200, height: 25, type: 'platform', color: '#27AE60' },
        { x: 1800, y: 240, width: 180, height: 25, type: 'platform', color: '#229954' },
        
        // منصات مرتفعة
        { x: 2100, y: 200, width: 190, height: 25, type: 'platform', color: '#2ECC71' },
        { x: 2400, y: 240, width: 160, height: 25, type: 'platform', color: '#27AE60' },
        { x: 2700, y: 180, width: 150, height: 25, type: 'platform', color: '#229954' },
        
        // منصات النهاية
        { x: 3000, y: 220, width: 180, height: 25, type: 'platform', color: '#2ECC71' },
        { x: 3300, y: 260, width: 140, height: 25, type: 'platform', color: '#27AE60' },
        
        // منصة سرية
        { x: 2500, y: 100, width: 80, height: 20, type: 'secret', color: '#FFD700' }
    ],
    
    // العملات
    coins: [
        // مجموعة البداية
        { x: 150, y: 350 }, { x: 250, y: 350 }, { x: 350, y: 350 },
        { x: 450, y: 350 }, { x: 550, y: 350 },
        
        // على المنصة الأولى
        { x: 350, y: 290 }, { x: 400, y: 290 },
        
        // على المنصة الثانية
        { x: 650, y: 250 }, { x: 700, y: 250 },
        
        // على المنصة الثالثة
        { x: 950, y: 210 }, { x: 1000, y: 210 },
        
        // على الأرض
        { x: 1250, y: 350 }, { x: 1350, y: 350 }, { x: 1450, y: 350 },
        
        // على المنصات المتوسطة
        { x: 1250, y: 290 }, { x: 1550, y: 250 }, { x: 1850, y: 210 },
        
        // على المنصات المرتفعة
        { x: 2150, y: 170 }, { x: 2450, y: 210 }, { x: 2750, y: 150 },
        
        // طريق النهاية
        { x: 3050, y: 190 }, { x: 3150, y: 190 }, { x: 3250, y: 190 },
        { x: 3350, y: 230 },
        
        // عملات سرية
        { x: 2540, y: 70 }, { x: 2580, y: 70 }
    ],
    
    // الأعداء
    enemies: [
        { x: 500, y: 360, width: 45, height: 45, speed: 1.5, direction: 1, 
          moveRange: 100, color: '#E74C3C', type: 'easy' },
        { x: 800, y: 360, width: 45, height: 45, speed: 1.8, direction: -1, 
          moveRange: 90, color: '#EF476F', type: 'easy' },
        { x: 1100, y: 360, width: 45, height: 45, speed: 1.3, direction: 1, 
          moveRange: 110, color: '#FF6B6B', type: 'easy' },
        { x: 1400, y: 360, width: 45, height: 45, speed: 2.0, direction: -1, 
          moveRange: 95, color: '#FF9A8B', type: 'medium' },
        { x: 1700, y: 360, width: 45, height: 45, speed: 1.7, direction: 1, 
          moveRange: 105, color: '#E74C3C', type: 'medium' },
        { x: 2000, y: 360, width: 45, height: 45, speed: 2.2, direction: -1, 
          moveRange: 85, color: '#EF476F', type: 'hard' }
    ],
    
    // القصر
    castle: {
        x: 3500,
        y: 250,
        width: 280,
        height: 200,
        color: '#8B4513'
    },
    
    // خلفية خاصة
    background: {
        type: 'gradient',
        colors: ['#87CEEB', '#3498DB']
    }
};

// تسجيل المرحلة في النافذة العامة
window.Level1 = Level1;
console.log('✅ تم تحميل المرحلة 1');
