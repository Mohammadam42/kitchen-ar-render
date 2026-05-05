# Render Web Service

استخدم هذه الإعدادات إذا بدك ترفعه على Render كـ Web Service وليس Static Site.

## إعدادات Render اليدوية

- Service type: `Web Service`
- Runtime: `Node`
- Root Directory: `web-ar`
- Build Command: `npm install --omit=dev`
- Start Command: `npm start`
- Health Check Path: `/healthz`

Render سيعطيك رابط HTTPS مثل:

`https://your-service-name.onrender.com`

افتح الرابط على الهاتف. إذا ظهر التصميم ثلاثي الأبعاد، جرّب زر `عرض بالمطبخ`.

## ملاحظات مهمة

- أول فتح على Render قد يأخذ وقتاً إذا كان السيرفر نائماً.
- السيرفر يرسل ملف `kitchen_design.glb` مع `Content-Type: model/gltf-binary`.
- إذا كان الهاتف ماسك نسخة قديمة، افتح الرابط في نافذة خاصة أو امسح بيانات الموقع.
- iPhone يحتاج Safari، وAndroid يحتاج Chrome.

