
import { put } from '@vercel/blob';

export default async function handler(req, res) {
    // إعدادات CORS للسماح بالوصول من أي مصدر
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // معالجة طلب OPTIONS (ما قبل الطلب)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // التأكد من أن الطلب من نوع POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed. Use POST' 
        });
    }
    
    try {
        const data = req.body;
        console.log('📥 استلمت بيانات جديدة:', data);
        
        // إنشاء معرف فريد
        const id = Date.now().toString();
        const fileName = `payments/${id}.json`;
        
        // حفظ البيانات في Vercel Blob
        const blob = await put(fileName, JSON.stringify(data, null, 2), {
            access: 'public',
            addRandomSuffix: false,
        });
        
        console.log('✅ تم حفظ البيانات بنجاح');
        console.log('📁 المسار:', blob.url);
        
        // إرجاع استجابة نجاح
        return res.status(200).json({ 
            success: true, 
            id: id,
            url: blob.url,
            message: 'تم حفظ البيانات بنجاح'
        });
        
    } catch(error) {
        console.error('❌ خطأ في الخادم:', error);
        
        // إرجاع استجابة خطأ
        return res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
