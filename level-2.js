const Level2 = {
    name: 'المرحلة 2: أطلال الصحراء',
    description: 'تحديات في أطلال الصحراء القديمة',
    
    // إعدادات المرحلة
    playerStart: { x: 100, y: 300 },
    timeLimit: 350, // زدنا الوقت
    totalCoins: 70, // زدنا العملات
    
    // المنصات (أضفنا المزيد)
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
        
        // طريق النهاية - المزيد
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
    
    // القصر (ابعد)
    castle: {
        x: 5600,
        y: 260,
        width: 300,
        height: 220,
        color: '#8B4513'
    },
    
    // العملات والأعداء راح تتعدل تلقائياً لأن worldWidth صار أكبر
};
