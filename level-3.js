// ============================================
// 🗺️ المرحلة الثالثة - جليد الجبل
// ============================================

const Level3 = {
    name: 'المرحلة 3: جليد الجبل',
    description: 'تحديات جليدية على قمة الجبل المتجمد',
    
    // إعدادات المرحلة
    playerStart: { x: 100, y: 300 },
    timeLimit: 220,
    totalCoins: 60,
    
    // المنصات
    platforms: [
        // أرض الجليد
        { x: 0, y: 400, width: 5500, height: 100, type: 'ground', color: '#87CEEB' },
        
        // سفوح الجبل
        { x: 300, y: 330, width: 180, height: 25, type: 'ice', color: '#B0E0E6' },
        { x: 600, y: 290, width: 160, height: 25, type: 'ice', color: '#ADD8E6' },
        { x: 900, y: 250, width: 140, height: 25, type: 'ice', color: '#87CEEB' },
        
        // منحدرات جليدية
        { x: 1200, y: 310, width: 170, height: 20, type: 'slope', color: '#AFEEEE' },
        { x: 1500, y: 270, width: 150, height: 20, type: 'slope', color: '#E0FFFF' },
        { x: 1800, y: 230, width: 130, height: 20, type: 'slope', color: '#B0E0E6' },
        
        // كهوف الجليد
        { x: 2100, y: 280, width: 200, height: 30, type: 'cave', color: '#FFFFFF' },
        { x: 2400, y: 240, width: 180, height: 30, type: 'cave', color: '#F0F8FF' },
        { x: 2700, y: 200, width: 160, height: 30, type: 'cave', color: '#87CEEB' },
        
        // جسور جليدية هشة
        { x: 3000, y: 260, width: 120, height: 15, type: 'bridge', color: '#ADD8E6' },
        { x: 3200, y: 230, width: 110, height: 15, type: 'bridge', color: '#AFEEEE' },
        { x: 3400, y: 290, width: 130, height: 15, type: 'bridge', color: '#E0FFFF' },
        
        // قمة الجبل
        { x: 3700, y: 220, width: 240, height: 25, type: 'summit', color: '#FFFFFF' },
        { x: 4000, y: 250, width: 220, height: 25, type: 'summit', color: '#F0F8FF' },
        { x: 4300, y: 210, width: 200, height: 25, type: 'summit', color: '#87CEEB' },
        
        // منصات متدلية
        { x: 4600, y: 270, width: 100, height: 15, type: 'ledge', color: '#B0E0E6' },
        { x: 4800, y: 240, width: 90, height: 15, type: 'ledge', color: '#ADD8E6' },
        { x: 5000, y: 300, width: 110, height: 15, type: 'ledge', color: '#AFEEEE' },
        
        // بلورات جليدية سرية
        { x: 2300, y: 150, width: 60, height: 15, type: 'secret', color: '#00BFFF' },
        { x: 3800, y: 180, width: 60, height: 15, type: 'secret', color: '#00BFFF' },
        { x: 4900, y: 200, width: 60, height: 15, type: 'secret', color: '#00BFFF' }
    ],
    
    // العملات
    coins: [
        // بداية الجبل
        { x: 200, y: 350 }, { x: 300, y: 350 }, { x: 400, y: 350 },
        { x: 500, y: 350 }, { x: 600, y: 350 }, { x: 700, y: 350 },
        
        // على السفوح
        { x: 350, y: 300 }, { x: 380, y: 300 }, { x: 650, y: 260 },
        { x: 680, y: 260 }, { x: 950, y: 220 }, { x: 980, y: 220 },
        
        // على المنحدرات
        { x: 1250, y: 280 }, { x: 1280, y: 280 }, { x: 1550, y: 240 },
        { x: 1580, y: 240 }, { x: 1850, y: 200 }, { x: 1880, y: 200 },
        
        // داخل الكهوف
        { x: 2150, y: 250 }, { x: 2180, y: 250 }, { x: 2450, y: 210 },
        { x: 2480, y: 210 }, { x: 2750, y: 170 }, { x: 2780, y: 170 },
        
        // على الجسور
        { x: 3050, y: 230 }, { x: 3080, y: 230 }, { x: 3250, y: 200 },
        { x: 3280, y: 200 }, { x: 3450, y: 260 }, { x: 3480, y: 260 },
        
        // على القمة
        { x: 3750, y: 190 }, { x: 3780, y: 190 }, { x: 4050, y: 220 },
        { x: 4080, y: 220 }, { x: 4350, y: 180 }, { x: 4380, y: 180 },
        
        // على المنصات المتدلية
        { x: 4650, y: 240 }, { x: 4850, y: 210 }, { x: 5050, y: 270 },
        
        // كنوز سرية
        { x: 2330, y: 120 }, { x: 3830, y: 150 }, { x: 4930, y: 170 }
    ],
    
    // الأعداء
    enemies: [
        { x: 500, y: 360, width: 50, height: 40, speed: 1.5, direction: 1, 
          moveRange: 70, color: '#FFFFFF', type: 'polar-bear' },
        { x: 850, y: 360, width: 45, height: 35, speed: 1.3, direction: -1, 
          moveRange: 80, color: '#F0F8FF', type: 'polar-bear' },
        { x: 1200, y: 360, width: 40, height: 30, speed: 2.0, direction: 1, 
          moveRange: 90, color: '#87CEEB', type: 'ice-bird' },
        { x: 1550, y: 360, width: 42, height: 32, speed: 2.2, direction: -1, 
          moveRange: 85, color: '#ADD8E6', type: 'ice-bird' },
        { x: 1900, y: 360, width: 48, height: 38, speed: 1.8, direction: 1, 
          moveRange: 95, color: '#B0E0E6', type: 'ice-creature' },
        { x: 2250, y: 360, width: 46, height: 36, speed: 1.6, direction: -1, 
          moveRange: 100, color: '#AFEEEE', type: 'ice-creature' },
        { x: 2600, y: 360, width: 44, height: 34, speed: 2.1, direction: 1, 
          moveRange: 90, color: '#E0FFFF', type: 'ice-creature' },
        { x: 2950, y: 360, width: 52, height: 40, speed: 1.4, direction: -1, 
          moveRange: 75, color: '#FFFFFF', type: 'cave-guard' },
        { x: 3300, y: 360, width: 50, height: 38, speed: 1.9, direction: 1, 
          moveRange: 95, color: '#87CEEB', type: 'cave-guard' },
        { x: 3650, y: 360, width: 48, height: 36, speed: 2.3, direction: -1, 
          moveRange: 105, color: '#ADD8E6', type: 'summit-guard' },
        { x: 4000, y: 360, width: 46, height: 34, speed: 2.0, direction: 1, 
          moveRange: 100, color: '#B0E0E6', type: 'summit-guard' },
        { x: 4350, y: 360, width: 44, height: 32, speed: 2.4, direction: -1, 
          moveRange: 110, color: '#FFFFFF', type: 'final-guard' }
    ],
    
    // القصر
    castle: {
        x: 5200,
        y: 240,
        width: 320,
        height: 240,
        color: '#87CEEB'
    },
    
    // خلفية خاصة
    background: {
        type: 'gradient',
        colors: ['#1E90FF', '#00BFFF']
    }
};

// تسجيل المرحلة في النافذة العامة
window.Level3 = Level3;
console.log('✅ تم تحميل المرحلة 3');
