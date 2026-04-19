import { put } from '@vercel/blob';

export default async function handler(req, res) {
    // السماح بالوصول من أي مكان
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // معالجة طلب preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // التأكد من أن الطلب POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const data = req.body;
        const id = Date.now().toString();
        const fileName = `submissions/${id}.json`;
        
        // تخزين البيانات في Vercel Blob
        const blob = await put(fileName, JSON.stringify({
            id: id,
            ...data,
            time: new Date().toISOString()
        }), {
            access: 'public',
            addRandomSuffix: false,
        });
        
        console.log('✅ تم حفظ البيانات:', id);
        return res.status(200).json({ success: true, id: id, url: blob.url });
        
    } catch(error) {
        console.error('❌ خطأ:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}