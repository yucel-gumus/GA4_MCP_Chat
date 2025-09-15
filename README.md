# Google Analytics MCP ile Gemini AI Destekli Sohbet Arayüzü

Bu proje, Google'ın [Google Analytics MCP ](https://github.com/googleanalytics/google-analytics-mcp) projesini temel alarak, Google Analytics verilerinizle doğal dilde sohbet etmenizi sağlayan bir web arayüzü sunar. Gemini AI'ın gücünü kullanarak, GA4 verilerinizi kolayca sorgulayabilir ve analiz edebilirsiniz.

![Proje Arayüzü](httpshttps://via.placeholder.com/800x400.png?text=Proje+Ekran+G%C3%B6r%C3%BCnt%C3%BCs%C3%BC)
*(Not: Bu alana kendi uygulamanızın ekran görüntüsünü ekleyebilirsiniz.)*

## ✨ Öne Çıkan Özellikler

- **Doğal Dil Sorgulama:** "Son 3 ayda en çok etkileşim alan ilk 10 sayfam hangisi?" gibi karmaşık soruları doğrudan sorun.
- **Gemini AI Entegrasyonu:** Google'ın güçlü yapay zeka modeli ile GA4 verilerinizden anlamlı içgörüler elde edin.
- **Modern Web Arayüzü:** React ile geliştirilmiş, kullanıcı dostu ve modern bir sohbet arayüzü.
- **Esnek Altyapı:** Orijinal Google Analytics MCP projesinin tüm gücünü ve esnekliğini devralır.
- **Kolay Kurulum:** Flask ve React tabanlı yapısı sayesinde hızlıca ayağa kaldırılabilir.

## 🛠️ Kullanılan Teknolojiler

- **Backend:** Python, Flask, Google Analytics MCP, Gemini AI
- **Frontend:** React, TypeScript, Material UI
- **API:** Google Analytics Data API

## 🚀 Kurulum ve Başlatma

Bu projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### Ön Gereksinimler

- Python 3.10+
- Node.js ve npm
- Google Cloud Projesi ve etkinleştirilmiş Google Analytics Data API
- Bir Google Analytics 4 mülkü

### 1. Backend Kurulumu (Flask Sunucusu)

Projenin ana sunucusu olan Flask uygulamasını kurun.

```bash
# 1. Projeyi klonlayın (eğer zaten yapmadıysanız)
git clone https://github.com/googleanalytics/google-analytics-mcp.git
cd google-analytics-mcp

# 2. Python sanal ortamı oluşturun ve aktifleştirin
python3 -m venv venv
source venv/bin/activate

# 3. Gerekli Python paketlerini yükleyin
pip install -r requirements.txt

# 4. Google Cloud kimlik bilgilerinizi ayarlayın
# İndirdiğiniz hizmet hesabı JSON anahtarını proje kök dizinine ekleyin
# ve adını `ga4-credentials.json` olarak değiştirin veya aşağıdaki gibi bir ortam değişkeni ayarlayın:
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/ga4-credentials.json"

# 5. `.env` dosyasını oluşturun ve gerekli bilgileri girin
# Proje kök dizininde bir .env dosyası oluşturun:
touch .env
```

`.env` dosyanızın içeriği şu şekilde olmalıdır:

```
# Google Analytics Property ID'niz
GA_PROPERTY_ID="YOUR_GA_PROPERTY_ID"

# Gemini API Anahtarınız
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### 2. Frontend Kurulumu (React Arayüzü)

Sohbet arayüzünü sunan React uygulamasını kurun.

```bash
# 1. Frontend proje dizinine gidin
# (Proje yapınıza göre bu yolu düzenleyin)
cd /path/to/your/mcp_frontend

# 2. Gerekli npm paketlerini yükleyin
npm install
```

### 3. Uygulamayı Başlatma

Hem backend hem de frontend sunucularını başlatın.

```bash
# Backend'i başlatmak için (google-analytics-mcp kök dizininde)
./start.sh

# Frontend'i başlatmak için (mcp_frontend kök dizininde)
npm start
```

Artık tarayıcınızda `http://localhost:3000` (veya React'in kullandığı port) adresine giderek uygulamanızı kullanmaya başlayabilirsiniz!

## 🤝 Katkıda Bulunma

Bu projeye katkıda bulunmak isterseniz, lütfen `CONTRIBUTING.md` dosyasını inceleyin. Pull request'ler ve issue'lar her zaman beklerim.

## 📄 Lisans

Bu proje, [Apache 2.0 Lisansı](LICENSE) altında lisanslanmıştır.
