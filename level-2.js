// ============================================
// 🗺️ المرحلة الثانية - أطلال الصحراء
// ============================================

const Level2 = {
    name: 'المرحلة 2: أطلال الصحراء',
    description: 'تحديات في أطلال الصحراء القديمة',
    
    // إعدادات المرحلة
    playerStart: { x: 100, y: 300 },
    timeLimit: 200,
    totalCoins: 50,
    
    // المنصات
    platforms: [
        // الأرض الأساسية
        { x: 0, y: 400, width: 4500, height: 100, type: 'ground', color: '#D2691E' },
        
        // أهرامات صغيرة
        { x: 300, y: 320, width: 150, height: 25, type: 'pyramid', color: '#D4A76A' },
        { x: 600, y: 290, width: 130, height: 25, type: 'pyramid', color: '#CD853F' },
        { x: 900, y: 260, width: 110, height: 25, type: 'pyramid', color: '#A0522D' },
        
        // جسر فوق الرمال المتحركة
        { x: 1200, y: 280, width: 200, height: 20, type: 'bridge', color: '#8B7355' },
        { x: 1450, y: 310, width: 180, height: 20, type: 'bridge', color: '#B7956E' },
        
        // معبد قديم
        { x: 1800, y: 240, width: 240, height: 30, type: 'temple', color: '#8B4513' },
        { x: 2100, y: 270, width: 220, height: 30, type: 'temple', color: '#654321' },
        { x: 2400, y: 220, width: 200, height: 30, type: 'temple', color: '#A0522D' },
        
        // أعمدة معبد
        { x: 2800, y: 300, width: 80, height: 25, type: 'column', color: '#D4A76A' },
        { x: 2950, y: 280, width: 80, height: 25, type: 'column', color: '#CD853F' },
        { x: 3100, y: 320, width: 80, height: 25, type: 'column', color: '#A0522D' },
        
        // طريق النهاية
        { x: 3400, y: 290, width: 180, height: 25, type: 'platform', color: '#D2691E' },
        { x: 3650, y: 260, width: 160, height: 25, type: 'platform', color: '#CD853F' },
        { x: 3900, y: 230, width: 140, height: 25, type: 'platform', color: '#A0522D' },
        
        // منصات سرية
        { x: 1900, y: 150, width: 70, height: 20, type: 'secret', color: '#FFD700' },
        { x: 3000, y: 180, width: 70, height: 20, type: 'secret', color: '#FFD700' }
    ],
    
    // العملات
    coins: [
        // بداية الصحراء
        { x: 200, y: 350 }, { x: 300, y: 350 }, { x: 400, y: 350 },
        { x: 500, y: 350 }, { x: 600, y: 350 },
        
        // على الأهرامات
        { x: 350, y: 290 }, { x: 650, y: 260 }, { x: 950, y: 230 },
        
        // على الجسر
        { x: 1250, y: 250 }, { x: 1350, y: 250 }, { x: 1450, y: 280 },
        
        // داخل المعبد
        { x: 1850, y: 210 }, { x: 1950, y: 210 }, { x: 2050, y: 210 },
        { x: 2150, y: 240 }, { x: 2250, y: 240 }, { x: 2350, y: 190 },
        { x: 2450, y: 190 },
        
        // بين الأعمدة
        { x: 2840, y: 270 }, { x: 2990, y: 250 }, { x: 3140, y: 290 },
        
        // طريق النهاية
        { x: 3450, y: 260 }, { x: 3550, y: 260 }, { x: 3650, y: 230 },
        { x: 3750, y: 230 }, { x: 3850, y: 200 }, { x: 3950, y: 200 },
        
        // كنوز سرية
        { x: 1930, y: 120 }, { x: 3030, y: 150 }
    ],
    
    // الأعداء
    enemies: [
        { x: 500, y: 360, width: 40, height: 30, speed: 1.6, direction: 1, 
          moveRange: 80, color: '#A0522D', type: 'scorpion' },
        { x: 800, y: 360, width: 45, height: 35, speed: 1.4, direction: -1, 
          moveRange: 90, color: '#8B4513', type: 'scorpion' },
        { x: 1100, y: 360, width: 50, height: 40, speed: 1.9, direction: 1, 
          moveRange: 100, color: '#D2691E', type: 'guard' },
        { x: 1400, y: 360, width: 48, height: 38, speed: 2.1, direction: -1, 
          moveRange: 85, color: '#CD853F', type: 'guard' },
        { x: 1700, y: 360, width: 55, height: 45, speed: 1.7, direction: 1, 
          moveRange: 95, color: '#8B7355', type: 'statue' },
        { x: 2000, y: 360, width: 52, height: 42, speed: 2.3, direction: -1, 
          moveRange: 110, color: '#A0522D', type: 'statue' },
        { x: 2300, y: 360, width: 49, height: 39, speed: 1.8, direction: 1, 
          moveRange: 100, color: '#D2691E', type: 'statue' },
        { x: 2600, y: 360, width: 46, height: 36, speed: 2.0, direction: -1, 
          moveRange: 90, color: '#CD853F', type: 'guard' },
        { x: 2900, y: 360, width: 43, height: 33, speed: 2.2, direction: 1, 
          moveRange: 105, color: '#8B7355', type: 'scorpion' }
    ],
    
    // القصر
    castle: {
        x: 4100,
        y: 260,
        width: 300,
        height: 220,
        color: '#8B4513'
    },
    
    // خلفية خاصة
    background: {
        type: 'gradient',
        colors: ['#F7DC6F', '#F39C12']
    }
};

// تسجيل المرحلة في النافذة العامة
window.Level2 = Level2;
console.log('✅ تم تحميل المرحلة 2');
