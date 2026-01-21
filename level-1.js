// ============================================
// 🗺️ المرحلة الأولى - Green Hills Zone
// ============================================

const Level1 = {
    name: 'المنطقة الخضراء',
    description: 'ابدأ رحلتك في التلال الخضراء الجميلة',
    playerStart: { x: 100, y: 100 },
    timeLimit: 180, // 3 دقائق
    totalCoins: 60,
    
    platforms: [
        // القسم الأول: بداية سهلة
        { x: 300, y: 100, width: 180, height: 25 },
        { x: 550, y: 120, width: 160, height: 25 },
        { x: 800, y: 90, width: 140, height: 25 },
        { x: 1050, y: 110, width: 170, height: 25 },
        
        // القسم الثاني: جسر عائم
        { x: 1300, y: 150, width: 120, height: 25 },
        { x: 1450, y: 130, width: 100, height: 25 },
        { x: 1600, y: 170, width: 150, height: 25 },
        { x: 1780, y: 140, width: 130, height: 25 },
        
        // القسم الثالث: منصات مرتفعة
        { x: 2000, y: 200, width: 140, height: 25 },
        { x: 2200, y: 170, width: 120, height: 25 },
        { x: 2400, y: 220, width: 160, height: 25 },
        { x: 2600, y: 190, width: 180, height: 25 },
        
        // القسم الرابع: متاهة
        { x: 2850, y: 150, width: 180, height: 25 },
        { x: 3050, y: 120, width: 160, height: 25 },
        { x: 3250, y: 180, width: 140, height: 25 },
        { x: 3450, y: 140, width: 120, height: 25 },
        
        // القسم الخامس: قبل النهاية
        { x: 3650, y: 160, width: 180, height: 25 },
        { x: 3850, y: 130, width: 160, height: 25 },
        { x: 4050, y: 190, width: 140, height: 25 },
        
        // منصات سرية للمتسلقين
        { x: 1200, y: 250, width: 80, height: 20, color: '#27AE60' },
        { x: 2100, y: 300, width: 80, height: 20, color: '#27AE60' },
        { x: 3000, y: 280, width: 80, height: 20, color: '#27AE60' },
        { x: 3900, y: 320, width: 80, height: 20, color: '#27AE60' }
    ],
    
    coins: [
        // مجموعة 1: البداية
        { x: 200, y: 70 }, { x: 300, y: 70 }, { x: 400, y: 70 },
        { x: 500, y: 70 }, { x: 600, y: 70 }, { x: 700, y: 70 },
        
        // مجموعة 2: على المنصات المنخفضة
        { x: 350, y: 70 }, { x: 600, y: 90 }, { x: 850, y: 60 },
        { x: 1100, y: 80 }, { x: 1350, y: 120 }, { x: 1500, y: 100 },
        
        // مجموعة 3: على المنصات المرتفعة
        { x: 2050, y: 170 }, { x: 2250, y: 140 }, { x: 2450, y: 190 },
        { x: 2650, y: 160 }, { x: 2900, y: 120 }, { x: 3100, y: 90 },
        
        // مجموعة 4: المتاهة
        { x: 3300, y: 150 }, { x: 3500, y: 110 }, { x: 3700, y: 130 },
        { x: 3900, y: 100 }, { x: 4100, y: 160 },
        
        // مجموعة 5: النهاية
        { x: 4300, y: 150 }, { x: 4500, y: 120 }, { x: 4700, y: 180 },
        
        // عملات سرية
        { x: 1250, y: 220 }, { x: 2150, y: 270 }, { x: 3050, y: 250 },
        { x: 3950, y: 290 }
    ],
    
    enemies: [
        // أعداء سهلة في البداية
        { x: 400, y: 50, speed: 1.5, width: 40, height: 40, color: '#EF476F', moveRange: 80 },
        { x: 700, y: 50, speed: 1.8, width: 35, height: 35, color: '#FF6B6B', moveRange: 70 },
        { x: 1000, y: 50, speed: 1.3, width: 45, height: 45, color: '#E74C3C', moveRange: 90 },
        
        // أعداء متوسطة في القسم الثاني
        { x: 1400, y: 50, speed: 2.0, width: 38, height: 38, color: '#FF9A8B', moveRange: 100 },
        { x: 1650, y: 50, speed: 1.7, width: 42, height: 42, color: '#EF476F', moveRange: 85 },
        { x: 1900, y: 50, speed: 2.2, width: 32, height: 32, color: '#FF6B6B', moveRange: 110 },
        
        // أعداء صعبة في القسم الثالث
        { x: 2300, y: 50, speed: 2.5, width: 30, height: 30, color: '#E74C3C', moveRange: 120 },
        { x: 2550, y: 50, speed: 1.9, width: 40, height: 40, color: '#FF9A8B', moveRange: 95 },
        { x: 2800, y: 50, speed: 2.3, width: 33, height: 33, color: '#EF476F', moveRange: 105 },
        
        // أعداء في المتاهة
        { x: 3200, y: 50, speed: 2.1, width: 36, height: 36, color: '#FF6B6B', moveRange: 100 },
        { x: 3500, y: 50, speed: 1.8, width: 41, height: 41, color: '#E74C3C', moveRange: 90 },
        { x: 3800, y: 50, speed: 2.4, width: 31, height: 31, color: '#FF9A8B', moveRange: 115 },
        
        // أعداء النهاية
        { x: 4200, y: 50, speed: 2.0, width: 39, height: 39, color: '#EF476F', moveRange: 100 },
        { x: 4500, y: 50, speed: 2.6, width: 28, height: 28, color: '#FF6B6B', moveRange: 125 }
    ],
    
    castle: {
        x: 4800,
        y: 200,
        width: 300,
        height: 250
    }
};

// تسجيل المرحلة في مدير المراحل
if (window.LevelManager) {
    window.LevelManager.setLevel(1, Level1);
    console.log('✅ تم تحميل المرحلة 1');
}
