# 🎓 Teacher Ali Abdelkader Management System
> **نظام إدارة الأستاذ علي عبد القادر** — نظام شامل لإدارة المجموعات التعليمية والطلاب والغياب والمدفوعات والامتحانات.

---

## 🚀 Overview | نبذة عن النظام

نظام سحابي متكامل لبناء وتدبير المراكز والمجموعات التعليمية. يتيح للمدرس إدارة المجموعات والطلاب، متابعة الحضور والغياب اليومي، تسديد وافتقاد المدفوعات الشهرية بتواريخ محددة، ورصد درجات الامتحانات والتقييمات بكل سهولة وسرعة.

---

## 🛠️ Tech Stack | التقنيات المستخدمة

### **Front-End (الفرونت إند)**
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/) (مع Automatic Refresh Token Interceptors)
- **UI Architecture**: Arabic RTL (من اليمين لليسار) بتصميم عصري ومتجاوب (Responsive Design)

### **Back-End (الباك إند)**
- **Runtime**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose ORM](https://mongoosejs.com/)
- **Authentication**: JWT (Access Token & HttpOnly Refresh Token Cookies)
- **Validation**: [Express Validator](https://express-validator.github.io/)

---

## ✨ Main Features | المميزات الرئيسية

1. 🔐 **نظام الأمان والتوثيق (Authentication & Security)**:
   - تسجيل الدخول الآمن باستعمال كوكيز مؤمنة `HttpOnly`.
   - آلية التجديد التلقائي للسيشن (Automatic Refresh Token) عند انتهاء صلاحية الـ Access Token دون إزعاج المستخدم أو الخروج الفجائي.

2. 👥 **إدارة المجموعات (Groups Management)**:
   - إنشاء وتعديل وأرشفة المجموعات التعليمية.
   - فلترة وتصفية المجموعات حسب الصفوف الدراسية (المرحلة الثانوية).
   - عرض إحصائيات سريعة لعدد الطلاب في كل مجموعة.

3. 🎓 **إدارة الطلاب (Students Management)**:
   - إضافة الطلاب للمجموعات مع إمكانية جعل رقم الهاتف اختيارياً.
   - نقل الطلاب وترقيتهم بين المراحل الدراسية.
   - البحث الفوري بالاسم أو رقم الهاتف.

4. 📝 **نظام الحضور والغياب (Attendance Tracking)**:
   - تسجيل غياب وحضور المجموعات يومياً بنقرة واحدة.
   - عرض سجلات وتاريخ الغياب لكل طالب داخل المجموعة.

5. 💰 **إدارة المدفوعات الشهرية (Monthly Payments)**:
   - تسجيل وتحصيل المصروفات الشهرية لكل طالب.
   - **تحديد تاريخ الاستلام (`paidAt`)**: إمكانية تحديد وتعديل تاريخ الدفع الفعلي لكل طالب بحرية.
   - تتبع الطلاب المسددين والغير مسددين مع إحصائيات فورية لكل شهر.

6. 📊 **نظام الامتحانات والدرجات (Exams & Grades)**:
   - إنشاء الامتحانات وتحديد الدرجة العظمى لكل اختبار.
   - رصد وتعديل درجات الطلاب ومتابعة الأداء الأكاديمي.

---

## 📁 Project Structure | هيكل المشروع

```text
management-system/
├── management system-front-end/      # كود الفرونت إند (React + Vite + TS)
│   ├── src/
│   │   ├── components/               # العناصر المشتركة والهيكل (Sidebar, Layout)
│   │   ├── features/                 # الميزات الموديلية (Students, Payments, Attendance, Exams, Groups)
│   │   ├── pages/                    # صفحات التطبيق (Dashboard, Groups, Payments, Attendance, Exams)
│   │   ├── routes/                   # المسارات والـ Protected Routes
│   │   ├── services/                 # apiClient والـ Interceptors
│   │   └── types/                    # تعريفات TypeScript المشتركة
│   ├── vercel.json                   # إعدادات الـ SPA Rewrites للرفع على Vercel
│   └── package.json
│
└── management system-back-end/       # كود الباك إند (Express + TS + Mongoose)
    ├── src/
    │   ├── attendance/               # كنترولرات ومسارات الغياب
    │   ├── auth/                     # كنترولرات التسجيل والـ Refresh Token
    │   ├── exam/                     # كنترولرات ومسارات الامتحانات
    │   ├── group/                    # كنترولرات ومسارات المجموعات
    │   ├── payment/                  # كنترولرات ومسارات المدفوعات
    │   └── user/                     # كنترولرات المدرسين والطلاب
    ├── app.ts                        # ملف تشغيل سيرفر Express الرئيسي
    ├── vercel.json                   # إعدادات Serverless deployment على Vercel
    └── package.json
```

---

## ⚙️ Environment Variables | متغيرات البيئة

### **Back-End (`management system-back-end/.env`)**:
```env
PORT=3000
SECRET_KEY=str0ngS3cr3t
DB_URL=mongodb+srv://<username>:<password>@cluster0.7yxn39q.mongodb.net
DB_NAME=management_system
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### **Front-End (`management system-front-end/.env`)**:
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 🚦 Getting Started | كيفية التشغيل محلياً

### 1. تشغيل الباك إند (Back-End):
```bash
cd "management system-back-end"
npm install
npm run dev
```

### 2. تشغيل الفرونت إند (Front-End):
```bash
cd "management system-front-end"
npm install
npm run dev
```

افتح المتصفح على: `http://localhost:5173`

---

## ☁️ Deployment | الرفع والاستضافة

المشروع مُجهز بالكامل للرفع على منصات الاستضافة مثل **Vercel** أو **Render**:
- **Front-End**: مرفق ملف `vercel.json` لإدارة مسارات الـ SPA لمنع خطأ `404`.
- **Back-End**: تم إعداد `app.ts` و `vercel.json` بدعم كامل لـ **Serverless Functions** و **Connection Caching** لـ MongoDB Atlas.

---

## 📝 License

هذا المشروع خاص ومصمم للأستاذ علي عبد القادر © 2026. جميع الحقوق محفوظة.
