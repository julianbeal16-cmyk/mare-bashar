// ============================================
// 🗺️ المرحلة الثالثة - Ice Mountain
// ============================================

const Level3 = {
    name: 'جليد الجبل',
    description: 'تحديات جليدية على قمة الجبل',
    playerStart: { x: 100, y: 100 },
    timeLimit: 220, // 3:40 دقيقة
    totalCoins: 80,
    
    platforms: [
        // سفوح الجبل
        { x: 300, y: 90, width: 190, height: 25, color: '#708090' },
        { x: 550, y: 115, width: 170, height: 25, color: '#708090' },
        { x: 800, y: 65, width: 150, height: 25, color: '#708090' },
        { x: 1050, y: 100, width: 185, height: 25, color: '#708090' },
        
        // منحدرات جليدية
        { x: 1350, y: 140, width: 160, height: 25, color: '#87CEEB' },
        { x: 1600, y: 120, width: 140, height: 25, color: '#87CEEB' },
        { x: 1850, y: 160, width: 180, height: 25, color: '#87CEEB' },
        { x: 2100, y: 130, width: 155, height: 25, color: '#87CEEB' },
        
        // كهوف الجليد
        { x: 2400, y: 180, width: 200, height: 30, color: '#B0E0E6' },
        { x: 2650, y: 160, width: 180, height: 30, color: '#B0E0E6' },
        { x: 2900, y: 200, width: 220, height: 30, color: '#B0E0E6' },
        { x: 3150, y: 170, width: 190, height: 30, color: '#B0E0E6' },
        
        // جسور جليدية هشة
        { x: 3500, y: 150, width: 130, height: 20, color: '#ADD8E6' },
        { x: 3700, y: 130, width: 120, height: 20, color: '#ADD8E6' },
        { x: 3900, y: 170, width: 140, height: 20, color: '#ADD8E6' },
        { x: 4100, y: 140, width: 125, height: 20, color: '#ADD8E6' },
        
        // قمة الجبل
        { x: 4400, y: 190, width: 240, height: 35, color: '#FFFFFF' },
        { x: 4700, y: 170, width: 210, height: 35, color: '#FFFFFF' },
        { x: 5000, y: 210, width: 230, height: 35, color: '#FFFFFF' },
        { x: 5300, y: 180, width: 200, height: 35, color: '#FFFFFF' },
        
        // منصات جليدية متدلية
        { x: 5600, y: 160, width: 110, height: 20, color: '#E0FFFF' },
        { x: 5800, y: 140, width: 105, height: 20, color: '#E0FFFF' },
        { x: 6000, y: 180, width: 115, height: 20, color: '#E0FFFF' },
        
        // بلورات جليدية سرية
        { x: 2600, y: 280, width: 60, height: 15, color: '#00BFFF' },
        { x: 3800, y: 320, width: 60, height: 15, color: '#00BFFF' },
        { x: 5200, y: 300, width: 60, height: 15, color: '#00BFFF' }
    ],
    
    coins: [
        // بداية الجبل
        { x: 250, y: 60 }, { x: 350, y: 60 }, { x: 450, y: 60 },
        { x: 600, y: 85 }, { x: 700, y: 85 }, { x: 850, y: 35 },
        { x: 1100, y: 70 }, { x: 1200, y: 70 },
        
        // على المنحدرات
        { x: 1400, y: 110 }, { x: 1500, y: 110 }, { x: 1650, y: 90 },
        { x: 1750, y: 90 }, { x: 1900, y: 130 }, { x: 2000, y: 130 },
        { x: 2150, y: 100 }, { x: 2250, y: 100 },
        
        // داخل الكهوف
        { x: 2450, y: 150 }, { x: 2550, y: 150 }, { x: 2700, y: 130 },
        { x: 2800, y: 130 }, { x: 2950, y: 170 }, { x: 3050, y: 170 },
        { x: 3200, y: 140 }, { x: 3300, y: 140 },
        
        // على الجسور
        { x: 3550, y: 120 }, { x: 3650, y: 120 }, { x: 3750, y: 100 },
        { x: 3850, y: 100 }, { x: 3950, y: 140 }, { x: 4050, y: 140 },
        { x: 4150, y: 110 }, { x: 4250, y: 110 },
        
        // قمة الجبل
        { x: 4450, y: 160 }, { x: 4550, y: 160 }, { x: 4750, y: 140 },
        { x: 4850, y: 140 }, { x: 5050, y: 180 }, { x: 5150, y: 180 },
        { x: 5350, y: 150 }, { x: 5450, y: 150 },
        
        // المنصات المتدلية
        { x: 5650, y: 130 }, { x: 5750, y: 130 }, { x: 5850, y: 110 },
        { x: 5950, y: 110 }, { x: 6050, y: 150 },
        
        // كنوز الجليد السرية
        { x: 2650, y: 250 }, { x: 3850, y: 290 }, { x: 5250, y: 270 }
    ],
    
    enemies: [
        // دببة قطبية صغيرة
        { x: 450, y: 50, speed: 1.5, width: 50, height: 40, color: '#FFFFFF', moveRange: 70 },
        { x: 850, y: 50, speed: 1.3, width: 55, height: 45, color: '#F0F8FF', moveRange: 65 },
        
        // طيور جليدية
        { x: 1400, y: 50, speed: 2.0, width: 40, height: 35, color: '#87CEEB', moveRange: 90 },
        { x: 1750, y: 50, speed: 2.2, width: 38, height: 33, color: '#ADD8E6', moveRange: 95 },
        
        // كائنات جليدية متحركة
        { x: 2200, y: 50, speed: 1.8, width: 45, height: 45, color: '#B0E0E6', moveRange: 80 },
        { x: 2550, y: 50, speed: 1.6, width: 48, height: 48, color: '#AFEEEE', moveRange: 75 },
        { x: 2900, y: 50, speed: 2.1, width: 42, height: 42, color: '#E0FFFF', moveRange: 85 },
        
        // حراس الكهوف
        { x: 3300, y: 50, speed: 1.4, width: 60, height: 55, color: '#FFFFFF', moveRange: 60 },
        { x: 3650, y: 50, speed: 1.2, width: 65, height: 60, color: '#F0F8FF', moveRange: 55 },
        
        // وحوش الجليد
        { x: 4000, y: 50, speed: 1.9, width: 52, height: 52, color: '#87CEEB', moveRange: 70 },
        { x: 4350, y: 50, speed: 2.3, width: 46, height: 46, color: '#ADD8E6', moveRange: 90 },
        { x: 4700, y: 50, speed: 2.0, width: 49, height: 49, color: '#B0E0E6', moveRange: 80 },
        
        // حراس القمة
        { x: 5050, y: 50, speed: 2.4, width: 44, height: 44, color: '#FFFFFF', moveRange: 95 },
        { x: 5400, y: 50, speed: 2.1, width: 47, height: 47, color: '#F0F8FF', moveRange: 85 },
        
        // حراس النهاية
        { x: 5750, y: 50, speed: 2.2, width: 45, height: 45, color: '#87CEEB', moveRange: 90 },
        { x: 6100, y: 50, speed: 2.5, width: 40, height: 40, color: '#ADD8E6', moveRange: 100 }
    ],
    
    castle: {
        x: 6200,
        y: 200,
        width: 350,
        height: 300
    }
};

// تسجيل المرحلة في مدير المراحل
if (window.LevelManager) {
    window.LevelManager.setLevel(3, Level3);
    console.log('✅ تم تحميل المرحلة 3');
}
