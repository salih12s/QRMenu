# Uğur'um Cafe — QR Dijital Menü

Mobil-uyumlu, koyu temalı QR dijital menü uygulaması. Public menü sayfası
ve JWT korumalı admin paneli içerir.

```
QRMenu/
├─ client/                # React + Vite + TS + Tailwind (frontend)
├─ server/                # Express + TS + Prisma + PostgreSQL (backend)
├─ set-local-env.bat      # Local .env dosyalarını aktive eder
└─ set-production-env.bat # Production .env dosyalarını aktive eder
```

## Teknoloji

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, React
  Query, Axios, Framer Motion, React Hot Toast, Lucide ikonları.
- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT
  (jsonwebtoken), bcryptjs, Multer, Zod.
- **DB:** PostgreSQL 14+

## Hızlı başlangıç (Local)

### 1. Postgres veritabanını hazırlayın

`QRMenu` adında boş bir veritabanı oluşturun:

```sql
CREATE DATABASE "QRMenu";
```

Default bağlantı bilgileri (`set-local-env.bat` içinde):

```
Host:     localhost
Port:     5432
DB:       QRMenu
User:     postgres
Password: 12345
```

Farklı bir kullanıcı / parola kullanıyorsanız `server/env/local.env`
dosyasındaki `DATABASE_URL` değerini güncelleyin.

### 2. Local environment'ı aktifleştirin

Repo kökünde:

```powershell
.\set-local-env.bat
```

Bu komut `server/.env` ve `client/.env` dosyalarını oluşturur.

### 3. Bağımlılıkları kurun

```powershell
npm --prefix server install
npm --prefix client install
```

### 4. Veritabanı migration + seed

```powershell
npm --prefix server run prisma:migrate    # ilk kez: migrate dev (init)
npm --prefix server run seed
```

Seed işlemi şunları oluşturur:

- Default admin kullanıcısı
- 4 kategori (Atıştırmalıklar, Soğuk İçecekler, Bitki Çayları, Tatlılar)
- Tüm örnek ürünler
- Default ayarlar (Uğur'um Cafe siyah-altın teması)

### 5. Geliştirme ortamını başlatın

İki ayrı terminalde:

```powershell
# Backend (port 5000)
npm --prefix server run dev

# Frontend (port 5173)
npm --prefix client run dev
```

- Public menü: <http://localhost:5173>
- Admin panel: <http://localhost:5173/admin/login>

## Default admin girişi

```
E-posta: admin@ugurumcafe.com
Şifre:   123456
```

> **Production'da bu şifreyi mutlaka değiştirin.** Yeni hash üretmek için
> Node.js REPL'da:
>
> ```js
> require('bcryptjs').hashSync('YENI-SIFRE', 10);
> ```
>
> ve `users` tablosundaki ilgili kaydın `password_hash` alanını güncelleyin.

## API kısa özeti

### Public

| Method | Endpoint                | Açıklama                                       |
|-------:|-------------------------|------------------------------------------------|
| GET    | `/api/menu`             | Settings + aktif kategoriler + ürünleri tek istekte |
| GET    | `/api/categories`       | Aktif kategoriler                              |
| GET    | `/api/products`         | Aktif ürünler                                  |
| GET    | `/api/products/:slug`   | Tek ürün detayı                                |
| GET    | `/api/settings`         | Cafe ayarları (renkler dahil)                  |

### Auth

| Method | Endpoint           | Açıklama          |
|-------:|--------------------|-------------------|
| POST   | `/api/auth/login`  | JWT token döner   |

### Admin (JWT zorunlu)

| Method | Endpoint                        | Açıklama                  |
|-------:|---------------------------------|---------------------------|
| GET    | `/api/admin/dashboard`          | Sayım kartları            |
| GET    | `/api/admin/categories`         | Tüm kategoriler           |
| POST   | `/api/admin/categories`         | Kategori ekle             |
| PUT    | `/api/admin/categories/:id`     | Kategori güncelle         |
| DELETE | `/api/admin/categories/:id`     | Kategori sil              |
| GET    | `/api/admin/products`           | Tüm ürünler               |
| POST   | `/api/admin/products`           | Ürün ekle                 |
| PUT    | `/api/admin/products/:id`       | Ürün güncelle             |
| DELETE | `/api/admin/products/:id`       | Ürün sil                  |
| GET    | `/api/admin/settings`           | Ayarları getir            |
| PUT    | `/api/admin/settings`           | Ayarları güncelle         |
| POST   | `/api/admin/upload`             | Görsel yükle → `{ url }`  |

### Görsel yükleme

- `multipart/form-data`, alan adı: `file`
- Maksimum boyut: **5 MB**
- Kabul edilen formatlar: **jpg, jpeg, png, webp**
- Hatalı tip → 400 JSON error
- Yanıt: `{ "url": "http://host/uploads/<uuid>.png" }`
- Lokal sağlayıcı dosyayı `server/uploads/` altına yazar; Express
  `/uploads` yolunu static olarak servis eder.

## Tema sistemi

`settings` tablosundaki tema renkleri (`themePrimaryColor`,
`themeBackgroundColor`, `themeCardColor`, `themeTextColor`,
`themeMutedColor`) frontend'de **CSS variable** olarak inject edilir
(`client/src/theme/applyTheme.ts`). Tailwind `brand.*` renkleri bu
değişkenlere bağlıdır, dolayısıyla admin **Ayarlar** sayfasında renk
değiştirildiğinde public menü anında güncellenir.

## Production'a alma

### 1. Production env dosyalarını doldurun

`server/env/production.env` ve `client/env/production.env` içindeki
değerleri gerçek production bilgileriyle güncelleyin (DATABASE_URL,
JWT_SECRET, CORS_ORIGIN, PUBLIC_BASE_URL, VITE_API_URL).

### 2. Production env'ı aktifleştirin

```powershell
.\set-production-env.bat
```

### 3. Build

```powershell
npm --prefix server run build
npm --prefix client run build
```

### 4. Migrate

```powershell
npm --prefix server run prisma:deploy
```

### 5. Çalıştır

```powershell
node server/dist/index.js
```

Frontend `client/dist/` çıktısını herhangi bir static host
(Nginx / Cloudflare Pages / Netlify) üzerinden servis edebilirsiniz.

---

## 🚂 Railway (Backend) Deploy Rehberi

Backend'i (Express + Prisma + Postgres) Railway üzerinde host etmek
için adımlar:

### 1. Railway hesabı + projesi

1. <https://railway.app> hesabı aç → **New Project**.
2. **Deploy from GitHub repo** seç → bu repo'yu (`salih12s/QRMenu`) bağla.
3. **Root Directory** alanına `server` yaz (Settings → Service → Source).
4. Aynı projede **+ New → Database → PostgreSQL** ekle.

### 2. Environment Variables (Service → Variables)

Postgres servisi otomatik olarak `${{Postgres.DATABASE_URL}}` referansı
sunar. Backend servisine şunları ekle:

```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
NODE_ENV     = production
JWT_SECRET   = <uzun, rastgele bir string — örn. 64 karakter>
JWT_EXPIRES_IN = 7d
CORS_ORIGIN  = https://senin-frontend-domainin.com
PUBLIC_BASE_URL = https://senin-backend-domainin.up.railway.app
UPLOAD_PROVIDER = local
```

> `PORT` Railway tarafından otomatik enjekte edilir, elle eklemeye gerek yok.

### 3. Build & start

`server/railway.json` zaten var. Railway şunları yapar:

- Build: `npm ci && npm run build` (otomatik `prisma generate` çalışır)
- Start: `npm run start:prod` (önce `prisma migrate deploy`, sonra Node)
- Health check: `/health`

### 4. İlk seed (bir defaya mahsus)

Railway servisinde **One-off command** veya CLI ile:

```bash
railway run --service <SERVICE_NAME> npm --prefix server run seed
```

> Local'den çalıştırırken DATABASE_URL'i Railway'in ürettiği URL ile
> set'le, sonra `npm --prefix server run seed` çalıştır.

### 5. Public domain

Railway → Service → **Networking → Generate Domain**.
Aldığın `https://...up.railway.app` adresini frontend'in
`VITE_API_URL` ve `VITE_PUBLIC_BASE_URL` değerlerine koy.

### ⚠️ Uploads volume

Railway'de dosya sistemi efemerik olabilir. Yüklenen görsellerin
silinmemesi için **Service → Settings → Volumes**'tan
`/app/server/uploads` (veya tek service için `/app/uploads`) yoluna
1 GB'lik volume ekle.

---

## 🌐 Frontend Hosting (cPanel / Static)

Frontend statik dosyalardır; herhangi bir hosting'e yüklenebilir.

### 1. Production env'ı yaz

`client/.env` (veya build sırasında ortam değişkenleri):

```
VITE_API_URL=https://<railway-backend>.up.railway.app/api
VITE_PUBLIC_BASE_URL=https://<railway-backend>.up.railway.app
```

### 2. Build

```powershell
npm --prefix client install
npm --prefix client run build
```

`client/dist/` klasörü oluşur.

### 3. cPanel / Plesk / Nginx'e yükle

1. `client/dist/` içindeki **tüm dosyaları** hosting'in `public_html`
   (ya da alan adının kök) klasörüne yükle.
2. Single-Page App olduğu için bilinmeyen tüm rotaları `index.html`'e
   yönlendiren bir kural ekle:

   **Apache (`.htaccess`):**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   **Nginx:**
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

3. Frontend domain'i Railway backend'inin `CORS_ORIGIN` değerine
   ekle (Variables sekmesinden güncelle, redeploy et).

### 4. Test

- `https://senin-domainin.com/` → Public menü
- `https://senin-domainin.com/admin/login` → Admin paneli
- Login: `admin@ugurumcafe.com / 123456` (canlıda değiştir)

---

## ⚠️ Önemli — Local Upload kalıcılığı

Bu MVP yalnızca **local Multer** ile dosya saklar. Yüklenen görseller
`server/uploads/` klasörüne yazılır.

> **Canlı ortamda local upload kullanılıyorsa `server/uploads` klasörü
> kalıcı disk/volume üzerinde tutulmalıdır.** Railway, Render gibi
> platformlarda dosya sistemi deploy/restart sonrası sıfırlanabilir.
> Bu yüzden production ortamında uploads klasörü için volume veya kalıcı
> disk ayarlanmalıdır.

İleride Cloudinary / S3 gibi bir servise geçmek istediğinizde
`server/src/services/uploadService.ts` içindeki provider abstraction'a
yeni bir `UploadProvider` implementasyonu eklemeniz yeterli. API
sözleşmesi (`{ url: string }`) ve admin upload endpoint'i değişmez.

## Güvenlik notları

- Admin şifreleri **bcrypt** ile hashlenir.
- Korumalı route'lar JWT (`Authorization: Bearer ...`) gerektirir.
- CORS origin `CORS_ORIGIN` env değişkeninden gelir; production'da
  yalnızca gerçek frontend domain'inize izin verin.
- `JWT_SECRET` production'da **mutlaka** uzun ve rastgele olmalıdır.
- Multer dosya tipi/boyut filtresi server tarafında zorunlu kılınır.

## Klasör yapısı (özet)

```
server/
├─ prisma/
│  ├─ schema.prisma        # User, Category, Product, Setting
│  ├─ seed.ts              # Default admin + categories + products + settings
│  └─ migrations/
├─ src/
│  ├─ config/              # env.ts (zod), prisma.ts
│  ├─ controllers/         # auth, category, product, setting, menu
│  ├─ middlewares/         # auth, error, validate, upload (multer)
│  ├─ routes/              # public, auth, admin
│  ├─ services/            # auth, category, product, setting, menu, upload
│  ├─ utils/               # slugify
│  └─ index.ts             # bootstrap
├─ uploads/                # multer dosyaları (gitignored)
└─ env/{local,production}.env

client/
├─ src/
│  ├─ components/
│  │  ├─ menu/             # Hero, SearchBar, CategoryTabs, Card, Modal, ...
│  │  └─ admin/            # ProtectedRoute, ImageUpload, Modal, FormFields
│  ├─ hooks/               # useMenu, useAuth
│  ├─ layouts/             # PublicLayout, AdminLayout
│  ├─ pages/
│  │  ├─ MenuPage.tsx
│  │  └─ admin/            # AdminApp, Login, Dashboard, Categories, Products, Settings
│  ├─ services/api.ts
│  ├─ theme/               # tokens.ts, applyTheme.ts
│  ├─ types/index.ts
│  └─ utils/format.ts
└─ env/{local,production}.env
```

## Lisans

Özel kullanım — Uğur'um Cafe.
