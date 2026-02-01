// ============================================
// 🏜️ المرحلة الثانية - أطلال الصحراء
// ============================================

const Level2 = {
    name: 'المرحلة 2: أطلال الصحراء',
    description: 'تحديات في أطلال الصحراء القديمة',
    
    // إعدادات المرحلة
    playerStart: { x: 100, y: 300 },
    timeLimit: 350,
    totalCoins: 70,
    
    // المنصات
    platforms: [
        // الأرض الأساسية
        { x: 0, y: 400, width: 6000, height: 100, type: 'ground', color: '#D2691E' },
        
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
        { x: 4150, y: 270, width: 150, height: 25, type: 'platform', color: '#D2691E' },
        { x: 4400, y: 240, width: 130, height: 25, type: 'platform', color: '#CD853F' },
        { x: 4650, y: 290, width: 170, height: 25, type: 'platform', color: '#A0522D' },
        { x: 4900, y: 260, width: 140, height: 25, type: 'platform', color: '#D2691E' },
        { x: 5150, y: 230, width: 160, height: 25, type: 'platform', color: '#CD853F' },
        { x: 5400, y: 270, width: 150, height: 25, type: 'platform', color: '#A0522D' },
        
        // منصات سرية
        { x: 1900, y: 150, width: 70, height: 20, type: 'secret', color: '#FFD700' },
        { x: 3000, y: 180, width: 70, height: 20, type: 'secret', color: '#FFD700' },
        { x: 4500, y: 200, width: 70, height: 20, type: 'secret', color: '#FFD700' }
    ],
    
    // العملات (أضفناها)
    coins: [
        // بداية الصحراء
        { x: 200, y: 350 }, { x: 300, y: 350 }, { x: 400, y: 350 },
        { x: 500, y: 350 }, { x: 600, y: 350 }, { x: 700, y: 350 },
        
        // على الأهرامات
        { x: 350, y: 290 }, { x: 380, y: 290 }, { x: 650, y: 250 },
        { x: 680, y: 250 }, { x: 950, y: 230 }, { x: 980, y: 230 },
        
        // على الجسور
        { x: 1250, y: 250 }, { x: 1280, y: 250 }, { x: 1500, y: 280 },
        { x: 1530, y: 280 },
        
        // في المعابد
        { x: 1850, y: 210 }, { x: 1880, y: 210 }, { x: 2150, y: 240 },
        { x: 2180, y: 240 }, { x: 2450, y: 190 }, { x: 2480, y: 190 },
        
        // على الأعمدة
        { x: 2840, y: 270 }, { x: 2990, y: 250 }, { x: 3140, y: 290 },
        
        // طريق النهاية
        { x: 3450, y: 260 }, { x: 3480, y: 260 }, { x: 3700, y: 230 },
        { x: 3730, y: 230 }, { x: 3950, y: 200 }, { x: 3980, y: 200 },
        { x: 4200, y: 240 }, { x: 4230, y: 240 }, { x: 4450, y: 210 },
        { x: 4480, y: 210 }, { x: 4700, y: 260 }, { x: 4730, y: 260 },
        { x: 4950, y: 230 }, { x: 4980, y: 230 }, { x: 5200, y: 200 },
        { x: 5230, y: 200 }, { x: 5450, y: 240 }, { x: 5480, y: 240 },
        
        // كنوز سرية
        { x: 1930, y: 120 }, { x: 3030, y: 150 }, { x: 4530, y: 170 }
    ],
    
    // الأعداء (أضفناها)
    enemies: [
        { x: 500, y: 360, width: 50, height: 45, speed: 1.8, direction: 1, 
          moveRange: 80, color: '#FF8C00', type: 'scorpion' },
        { x: 850, y: 360, width: 45, height: 40, speed: 2.0, direction: -1, 
          moveRange: 90, color: '#FFA500', type: 'scorpion' },
        { x: 1200, y: 360, width: 48, height: 42, speed: 1.5, direction: 1, 
          moveRange: 100, color: '#FF7F50', type: 'snake' },
        { x: 1550, y: 360, width: 52, height: 45, speed: 2.2, direction: -1, 
          moveRange: 85, color: '#FF6347', type: 'snake' },
        { x: 1900, y: 360, width: 46, height: 41, speed: 1.9, direction: 1, 
          moveRange: 95, color: '#D2691E', type: 'mummy' },
        { x: 2250, y: 360, width: 50, height: 44, speed: 1.6, direction: -1, 
          moveRange: 105, color: '#CD853F', type: 'mummy' },
        { x: 2600, y: 360, width: 47, height: 43, speed: 2.1, direction: 1, 
          moveRange: 90, color: '#A0522D', type: 'pharaoh' },
        { x: 2950, y: 360, width: 55, height: 48, speed: 1.4, direction: -1, 
          moveRange: 75, color: '#8B4513', type: 'pharaoh' },
        { x: 3300, y: 360, width: 53, height: 46, speed: 1.9, direction: 1, 
          moveRange: 95, color: '#654321', type: 'guardian' },
        { x: 3650, y: 360, width: 51, height: 45, speed: 2.3, direction: -1, 
          moveRange: 105, color: '#D2691E', type: 'guardian' },
        { x: 4000, y: 360, width: 49, height: 43, speed: 2.0, direction: 1, 
          moveRange: 100, color: '#CD853F', type: 'final-boss' },
        { x: 4350, y: 360, width: 47, height: 41, speed: 2.4, direction: -1, 
          moveRange: 110, color: '#A0522D', type: 'final-boss' }
    ],
    
    // القصر
    castle: {
        x: 5600,
        y: 260,
        width: 300,
        height: 220,
        color: '#8B4513'
    },
    
    // خلفية خاصة
    background: {
        type: 'gradient',
        colors: ['#FFD700', '#FF8C00']
    }
};

// تسجيل المرحلة في النافذة العامة
window.Level2 = Level2;
console.log('✅ تم تحميل المرحلة 2 - أطلال الصحراء');
