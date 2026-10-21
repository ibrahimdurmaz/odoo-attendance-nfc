# NFC Attendance App

Odoo 19'a bağlanan Expo / React Native mesai uygulaması. Çalışanlar giriş-çıkış yapar, takvimlerini ve izinlerini görür. Yöneticiler çalışanları yönetir ve çalışma yerlerinin NFC giriş kartlarını telefondan yazar.

Uygulamanın kendi sunucusu yoktur. Bütün veri Odoo'dadır. Geliştirmede Odoo, bu repodaki `docker-compose.yml` ile Docker'da çalışır.

```
addons/              Odoo modülleri (nfc_card_writer, nfc_gate_access)
app/                 Ekranlar (Expo Router)
components/ helper/  Arayüz parçaları ve Odoo API çağrıları
docker-compose.yml   Odoo 19 + PostgreSQL
```

## Gereksinimler

- **Node.js 22**
- **Docker Desktop** (açık olmalı)
- **NFC'li bir Android telefon**. Kart yazmak için NTAG213/215/216 gibi NDEF yazılabilir bir kart gerekir.
- Bilgisayar ve telefon **aynı Wi-Fi ağında** olmalı.

> **Expo Go ile çalışmaz.** NFC, Expo Go'da olmayan bir native modül (`react-native-nfc-manager`) kullanır. Telefona bu projenin **development build**'i kurulmalı (bkz. 3. adım).

---

## 1. Odoo'yu çalıştırma

### İlk kurulum

```bash
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
docker compose up -d
```

Odoo şu adreste açılır: **http://localhost:8088**

İlk açılışta veritabanı oluşturma ekranı gelir:

1. Bir veritabanı adı (ör. `nfc_dev`), admin e-postası ve şifresi gir. **Demo data** kutusunu işaretlersen hazır çalışanlarla gelir, test için kolaylık sağlar.
2. **Uygulamalar** menüsünden şunları kur: **Employees**, **Attendances**, **Time Off**, **Calendar**, **Discuss**.
3. Geliştirici modunu aç: **Ayarlar → en alttaki "Geliştirici modunu etkinleştir"**. Ya da adresin sonuna `?debug=1` ekle.
4. **Uygulamalar → Uygulama Listesini Güncelle**.
5. Arama kutusundaki "Apps" filtresini kaldır, **NFC Card Writer** modülünü bulup kur.
   `Gate & Turnstile Management` (`nfc_gate_access`) da aynı klasörde. Uygulama şu an onu kullanmıyor, kurmak isteğe bağlı.

### Test verisi

Uygulama, giriş yapan Odoo kullanıcısının **çalışan kaydını** bulur. Bu yüzden:

- Her test kullanıcısının bir çalışan kaydı olmalı: **Çalışanlar → çalışan → İK Ayarları → İlgili Kullanıcı**.
- Giriş kartı kontrolü için çalışanın bir **Çalışma Yeri** seçili olmalı.
- **Yönetici** ekranını, Odoo'da admin yetkisi olan kullanıcılar görür. Diğer kullanıcılar çalışan olarak girer.

### Günlük kullanım

```bash
docker compose up -d          # başlat
docker compose stop           # durdur (veri kalır)
docker compose logs -f odoo   # Odoo loglarını izle
docker compose down -v        # DİKKAT: veritabanı dahil her şeyi siler
```

`addons/` altındaki bir modülü değiştirdiysen önce `docker compose restart odoo` çalıştır. Sonra Odoo'da **Uygulamalar →** modül **→ Yükselt** de.

---

## 2. Bağımlılıkları kurma

```bash
npm ci
```

Paket eklerken `npm install` yerine `npx expo install <paket>` kullan. Bu komut SDK ile uyumlu sürümü seçer.

## 3. Telefona development build kurma

Bu adım bir kez yapılır. Sadece native kod içeren yeni bir paket eklendiğinde tekrarlanır.

**Yol A: EAS (bulutta, Android Studio gerekmez)**

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android
```

Build bitince verilen linkten APK'yı telefona indirip kur. EAS projesine erişimin yoksa ekipteki birinden hazır APK linkini iste. Aynı APK herkes için çalışır.

**Yol B: Yerelde**

Android Studio kurulu olmalı. Telefonda USB hata ayıklamayı aç, telefonu USB ile bağla ve şunu çalıştır:

```bash
npx expo run:android
```

## 4. Uygulamayı çalıştırma

```bash
npx expo start --dev-client
```

Telefondaki **NFC Attendance App** uygulamasını aç ve terminaldeki QR kodu okut. Kod değişiklikleri telefona anında yansır.

### Uygulamayı Odoo'ya bağlama

Telefon `localhost`'a erişemez. Bilgisayarının yerel ağdaki IP adresini kullanman gerekir.

1. Bilgisayarda `ipconfig` çalıştır, Wi-Fi bağdaştırıcısının **IPv4 Adresi**'ni al (ör. `192.168.1.20`).
2. Uygulamadaki sunucu ekranında protokol olarak **`http://`** seç, adres olarak `192.168.1.20:8088` yaz.
3. Listeden veritabanını seç ve Odoo kullanıcınla giriş yap.

Önce bağlantıyı kontrol et: telefonun tarayıcısında `http://192.168.1.20:8088` açılmalı. Açılmıyorsa Windows Güvenlik Duvarı 8088 portunu engelliyor olabilir. Gelen bağlantılar için TCP 8088'e izin ver.

> Düz `http://` yalnızca development build'de çalışır. `preview` ve `production` build'lerinde Odoo'nun `https://` ile yayında olması gerekir.

## 5. NFC kart yazmayı test etme

1. Telefonda NFC'yi aç.
2. Yönetici hesabıyla gir: **Yönetim → Giriş Kartı Tanımla**.
3. Çalışma yerinin adını yaz, ardından kartı telefonun arkasına tut.
4. Odoo'da **NFC Cards** menüsünü aç. Kart "Written" durumunda, seri numarasıyla birlikte görünmeli.

Odoo'da o adla bir çalışma yeri yoksa uygulama yeni bir tane açar. Aynı yere yeni bir kart yazılırsa eski kart geçersiz olur.

---

## Kontroller

Bir işi bitirmeden önce şunları çalıştır:

```bash
npx tsc --noEmit
npx expo lint
```

## Sorun giderme

| Belirti | Çözüm |
| --- | --- |
| Editörde her dosya kırmızı ama uygulama çalışıyor | `node_modules` içindeki tip dosyaları bozulmuş. `node_modules` klasörünü sil, `npm ci` çalıştır, VS Code'da **TypeScript: Restart TS Server** de. "Update imports" önerisini `node_modules` için kabul etme. |
| Kartı tutunca hiçbir şey olmuyor | Expo Go'da açmışsındır, development build'i aç. Telefonda NFC açık mı, kart NDEF yazılabilir mi kontrol et. |
| "Sunucuya bağlanılamadı" | IP, port (`8088`) ve protokolü (`http://`) kontrol et. Telefon ve bilgisayar aynı ağda mı bak. Güvenlik duvarını kontrol et. |
| Odoo açılmıyor | Docker Desktop açık mı bak, sonra `docker compose ps` ve `docker compose logs odoo` çalıştır. |
| NFC Card Writer modülü listede yok | Geliştirici modunu aç, **Uygulama Listesini Güncelle** de, aramadaki "Apps" filtresini kaldır. |
| `odoo` imajı yanlış sürümde | `docker-compose.yml` içinde `odoo:19.0` yazmalı. `latest` artık başka bir sürümü getiriyor. |
