// ============================================
// 🗺️ المرحلة الثانية - Desert Ruins
// ============================================

const Level2 = {
    name: 'أطلال الصحراء',
    description: 'تحديات في أطلال الصحراء القديمة',
    playerStart: { x: 100, y: 100 },
    timeLimit: 200, // 3:20 دقيقة
    totalCoins: 70,
    
    platforms: [
        // أرض الصحراء (ارتفاع متغير)
        { x: 300, y: 80, width: 200, height: 25, color: '#D4A76A' },
        { x: 550, y: 110, width: 180, height: 25, color: '#D4A76A' },
        { x: 800, y: 60, width: 160, height: 25, color: '#D4A76A' },
        { x: 1050, y: 95, width: 190, height: 25, color: '#D4A76A' },
        
        // أهرامات صغيرة
        { x: 1350, y: 140, width: 220, height: 25, color: '#B7956E' },
        { x: 1650, y: 120, width: 180, height: 25, color: '#B7956E' },
        { x: 1950, y: 160, width: 200, height: 25, color: '#B7956E' },
        
        // جسر فوق الرمال المتحركة
        { x: 2300, y: 130, width: 150, height: 25, color: '#8B7355' },
        { x: 2500, y: 110, width: 130, height: 25, color: '#8B7355' },
        { x: 2700, y: 150, width: 170, height: 25, color: '#8B7355' },
        
        // معبد قديم
        { x: 3100, y: 180, width: 240, height: 30, color: '#8B4513' },
        { x: 3400, y: 160, width: 200, height: 30, color: '#8B4513' },
        { x: 3700, y: 200, width: 220, height: 30, color: '#8B4513' },
        
        // أعمدة معبد
        { x: 4000, y: 140, width: 100, height: 25, color: '#A0522D' },
        { x: 4150, y: 120, width: 100, height: 25, color: '#A0522D' },
        { x: 4300, y: 160, width: 100, height: 25, color: '#A0522D' },
        
        // طريق النهاية
        { x: 4600, y: 130, width: 180, height: 25, color: '#D4A76A' },
        { x: 4850, y: 110, width: 160, height: 25, color: '#D4A76A' },
        { x: 5100, y: 150, width: 140, height: 25, color: '#D4A76A' },
        
        // منصات سرية في المعبد
        { x: 3200, y: 280, width: 70, height: 20, color: '#FFD700' },
        { x: 3800, y: 320, width: 70, height: 20, color: '#FFD700' },
        { x: 4400, y: 260, width: 70, height: 20, color: '#FFD700' }
    ],
    
    coins: [
        // رمال الذهب
        { x: 250, y: 50 }, { x: 350, y: 50 }, { x: 450, y: 50 },
        { x: 600, y: 80 }, { x: 700, y: 80 }, { x: 850, y: 30 },
        
        // حول الأهرامات
        { x: 1400, y: 110 }, { x: 1500, y: 110 }, { x: 1600, y: 110 },
        { x: 1700, y: 90 }, { x: 1800, y: 90 }, { x: 1900, y: 130 },
        
        // على الجسر
        { x: 2350, y: 100 }, { x: 2450, y: 100 }, { x: 2550, y: 80 },
        { x: 2650, y: 120 }, { x: 2750, y: 120 },
        
        // داخل المعبد
        { x: 3150, y: 150 }, { x: 3250, y: 150 }, { x: 3350, y: 150 },
        { x: 3450, y: 130 }, { x: 3550, y: 130 }, { x: 3650, y: 170 },
        { x: 3750, y: 170 }, { x: 3850, y: 170 },
        
        // بين الأعمدة
        { x: 4050, y: 110 }, { x: 4150, y: 90 }, { x: 4250, y: 130 },
        { x: 4350, y: 130 },
        
        // طريق النهاية
        { x: 4650, y: 100 }, { x: 4750, y: 100 }, { x: 4900, y: 80 },
        { x: 5000, y: 80 }, { x: 5150, y: 120 },
        
        // كنوز المعبد السرية
        { x: 3250, y: 250 }, { x: 3850, y: 290 }, { x: 4450, y: 230 }
    ],
    
    enemies: [
        // عقارب الصحراء
        { x: 500, y: 50, speed: 1.6, width: 35, height: 25, color: '#A0522D', moveRange: 60 },
        { x: 900, y: 50, speed: 1.4, width: 40, height: 30, color: '#8B4513', moveRange: 50 },
        
        // حراس الأهرامات
        { x: 1500, y: 50, speed: 1.8, width: 45, height: 45, color: '#D2691E', moveRange: 80 },
        { x: 1800, y: 50, speed: 2.0, width: 42, height: 42, color: '#CD853F', moveRange: 70 },
        
        // أرواح الرمال المتحركة
        { x: 2400, y: 50, speed: 2.2, width: 38, height: 38, color: '#DEB887', moveRange: 90 },
        { x: 2650, y: 50, speed: 1.9, width: 40, height: 40, color: '#F4A460', moveRange: 85 },
        
        // تماثيل المعبد المتحركة
        { x: 3200, y: 50, speed: 1.5, width: 50, height: 50, color: '#8B7355', moveRange: 60 },
        { x: 3500, y: 50, speed: 1.3, width: 55, height: 55, color: '#A0522D', moveRange: 55 },
        { x: 3800, y: 50, speed: 1.7, width: 48, height: 48, color: '#8B4513', moveRange: 65 },
        
        // حراس الأعمدة
        { x: 4100, y: 50, speed: 2.1, width: 44, height: 44, color: '#D2691E', moveRange: 75 },
        { x: 4400, y: 50, speed: 2.3, width: 41, height: 41, color: '#CD853F', moveRange: 80 },
        
        // حراس النهاية
        { x: 4700, y: 50, speed: 2.0, width: 46, height: 46, color: '#8B7355', moveRange: 70 },
        { x: 5000, y: 50, speed: 2.4, width: 39, height: 39, color: '#A0522D', moveRange: 85 }
    ],
    
    castle: {
        x: 5300,
        y: 180,
        width: 320,
        height: 280
    }
};

// تسجيل المرحلة في مدير المراحل
if (window.LevelManager) {
    window.LevelManager.setLevel(2, Level2);
    console.log('✅ تم تحميل المرحلة 2');
}
