<div align="center">
  
  # 🎯 LGS Koçu & AI Asistanı
  **LGS Sınavına Hazırlanan Öğrenciler İçin Yeni Nesil Dijital Koçluk ve Yapay Zeka Destekli Soru Çözüm Platformu**

  [![Status](https://img.shields.io/badge/Status-Active-success.svg)]()
  [![Platform](https://img.shields.io/badge/Platform-PWA%20Mobile%20First-blue.svg)]()
  [![AI](https://img.shields.io/badge/AI-Puter.js%20%7C%20GPT--4--mini-purple.svg)]()
  [![License](https://img.shields.io/badge/License-MIT-gray.svg)]()

  <p align="center">
    "Sadece bir ödev takip uygulaması değil, senin hedeflerine ulaşmanı sağlayan akıllı yol arkadaşın."
  </p>

</div>

---

## 🚀 Proje Hakkında

**LGS Koçu**, 8. sınıf öğrencilerinin Lise Geçiş Sistemi (LGS) maratonunda ihtiyaç duyduğu her şeyi tek bir platformda birleştiren modern, mobil odaklı (Mobile-First) bir PWA uygulamasıdır. İçerisinde barındırdığı yapay zeka (Puter.js AI) sayesinde sadece istatistik tutmakla kalmaz; öğrencinin çözemediği soruları okur (OCR), adım adım açıklar, günlük çalışma programını oluşturur ve hedeflenen liseye göre kişiselleştirilmiş motivasyon sağlar.

## ✨ Temel Özellikler

### 🧠 Yapay Zeka (AI) Entegrasyonu
- **Akıllı Soru Çözücü (OCR):** Telefonun kamerasıyla veya galeriden yüklenen test sorularını `Tesseract.js` ile okur. Yapay zeka sorunun hangi dersten/konudan olduğunu tespit eder ve adım adım Türkçe çözümünü sunar.
- **Dinamik AI Koç:** "Bugün ne çalışmalıyım?" veya "Nasıl daha iyi odaklanabilirim?" gibi sorulara 7/24 anında koçluk yanıtları verir.
- **Otomatik Planlayıcı:** Kütüphanedeki aktif kitaplara ve günlük soru hedefine bakarak halüsinasyon yapmadan mantıklı, uygulanabilir görev dağılımları yapar.

### 📈 Gelişim ve Deneme Takibi
- **Deneme Puanı Hesaplama Motoru:** LGS katsayılarına göre 190 taban ve 500 tavan puan üzerinden en güncel net/puan hesaplamasını yapar. Çizgi grafikler üzerinden gelişimi görselleştirir.
- **Akıllı Yanlış Analizi (Anti-Halüsinasyon):** Denemelerde yapılan yanlışların *nedenine* (Dikkatsizlik, Konu Eksikliği vb.) göre reaksiyon gösterir. Eksik hissedilen konular için **Tonguç Akademi, Rehber Matematik, Benim Hocam** gibi en kaliteli YouTube kanallarının spesifik arama URL'lerini üreterek anında videoya yönlendirir.
- **Canlı LGS Sayacı:** Geri sayım, LGS kitapçıklarının dağıtılacağı saniyeye (13 Haziran 09:30) odaklıdır.

### 🎮 Oyunlaştırma ve Psikolojik Destek
- **Sanal Bahçem:** Çalıştıkça ve soru çözdükçe büyüyen bir "Tohum -> Orman" gelişimi simülasyonu.
- **Hedef Lise Motivasyon Döngüsü:** Kayıtta seçilen hayaldeki liseye (Örn: Galatasaray Lisesi) kaç puan kaldığını deneme sonuçlarına göre anlık hesaplar ve öğrenciyi kamçılar.
- **Kişiselleştirilebilir Pomodoro:** Standart 25 Dk, Derin Odak 50 Dk veya tamamen Özel (Custom) dakika seçenekleriyle öğrencilerin kendi ritminde çalışmasını sağlar.

## 🛠️ Kullanılan Teknolojiler

- **Frontend Core:** HTML5, Vanilla JavaScript, Custom CSS (Değişken Mimari)
- **Yapay Zeka (LLM):** `Puter.js` API (gpt-4.1-mini entegrasyonu)
- **Görüntü İşleme (OCR):** `Tesseract.js`
- **Veri Görselleştirme:** `Chart.js` (Doughnut ve Line chart'lar)
- **İkon Seti:** `Remix Icon`
- **Veri Saklama:** Tarayıcı tabanlı güvenli `localStorage` Data API

## 🎨 Tasarım ve Arayüz (UI/UX)
- **Kusursuz Karanlık Tema (Dark Mode):** Tüm CSS renkleri `:root` değişkenleri üzerinden tanımlanmış olup, "Gece Modu" geçişinde %100 göz yormayan, premium bir his sunar.
- **PWA Uyumluluğu:** Manifest dosyası ve Service Worker ile doğrudan mobil ana ekrana indirilerek (Uygulama gibi) native hissiyatla kullanılabilir.

## 📦 Kurulum ve Çalıştırma

Proje tamamen istemci tarafında (client-side) çalışacak şekilde dizayn edilmiştir. Herhangi bir sunucu kurulumuna gerek yoktur.

1. Depoyu bilgisayarınıza klonlayın:
   ```bash
   git clone https://github.com/okyanusinegol/derskoclukprojesi.git
   ```
2. Klasöre gidin:
   ```bash
   cd derskoclukprojesi
   ```
3. `index.html` dosyasını tarayıcınızda açın veya `VS Code Live Server` benzeri bir eklentiyle çalıştırın:
   - *Not: Puter.js AI yeteneklerinin tam performans çalışması için uygulamanın bir sunucu (localhost) üzerinden veya PWA olarak (ana ekrana eklenerek) çalıştırılması önerilir.*

---

<div align="center">
  <p><strong>LGS Koçu</strong>, öğrencilerin stresi yönetmesine ve çalışma verimliliklerini maksimuma çıkarmasına yardımcı olmak için büyük bir özenle geliştirilmiştir. 🚀</p>
</div>
