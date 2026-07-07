# GA4 MCP Chat (Google Analytics 4 + Gemini AI & MCP Agent)

Bu proje, Google Analytics 4 (GA4) verilerinize **doğal dilde (Türkçe/İngilizce)** sorular sorup gerçek zamanlı raporlar, analizler ve görselleştirmeler alabileceğiniz tam yığın (Full-Stack) bir yapay zeka uygulamasıdır. Proje, Google'ın **Model Context Protocol (MCP)** standartlarını temel alarak **Gemini 2.5/3.5** modellerini Google Analytics Data API ile entegre eder.

---

## 🛠️ Teknolojik Altyapı ve Mimarî
Uygulama, veri güvenliğini korurken yapay zekanın dinamik olarak sorgu parametreleri oluşturmasını ve verileri yorumlamasını sağlayan katmanlı bir mimariye sahiptir:

```
[ mcp_frontend (React + TypeScript) ]
         │  (HTTP POST /chat)
         ▼
[ Flask API (app.py) + Gemini Agent ] 
         │  (Model-Driven Tool Calls)
         ▼
[ Google Analytics MCP Sunucusu ] ──(Google Analytics Data API)──► [ GA4 Property ]
         ▲
         │ (GCP Service Account Credentials JSON)
```

### Kullanılan Teknolojiler
* **Frontend:** React.js, TypeScript, Material UI (MUI), Vite, Responsive UI layout.
* **Backend:** Flask (Python 3.10+), `google-generativeai` (Gemini API SDK), `python-dotenv`, `nox` (test otomasyonu).
* **AI/Protokol:** Google Analytics MCP (Model Context Protocol) entegrasyonu, Gemini Tool/Function Calling.

---

## 🌟 Öne Çıkan Özellikler

* **Doğal Dil Raporlama:** *"Geçen ay en çok ziyaret edilen 5 sayfam hangisiydi?"* veya *"Son 3 günde mobil cihazlardan gelen trafik durumumuz nedir?"* gibi serbest metinli soruları algılar.
* **Akıllı Mülk Eşleme (Auto-Discovery):** Sorgu sırasında kullanıcı doğrudan bir `property_id` belirtmezse, sistem arka planda otomatik olarak kullanıcının erişimi olan Google Analytics hesaplarını listeler, ilk mülkü (`property_id`) tespit eder ve sorguyu o mülk üzerinden çalıştırır.
* **Yerleşik Raporlama Araçları (MCP Tools):**
  * `get_account_summaries`: Google Analytics hesap ve mülk listesini hiyerarşik olarak getirir.
  * `get_property_details`: Belirli bir mülkün detaylı yapılandırma ve metadata bilgilerini çeker.
  * `get_custom_dimensions_and_metrics`: Mülk için tanımlanmış özel boyutları (custom dimensions) ve metrikleri sorgular.
  * `run_report`: Belirlenen tarih aralıkları, boyutlar (dimensions), metrikler ve filtrelerle standart GA4 Data API raporları çalıştırır.
  * `run_realtime_report`: Son 30 dakikaya ait anlık (realtime) trafik raporları sunar.

---

## 🚀 Kurulum ve Yapılandırma

### 1. Ön Gereksinimler
* **Google Cloud Console** üzerinde bir proje ve bu projede **Google Analytics Data API** etkinleştirilmiş olmalıdır.
* Mülkünüze erişim yetkisi olan bir **Service Account (Hizmet Hesabı)** oluşturulmalı ve buna ait `credentials.json` dosyası indirilmelidir.
* **Gemini API Anahtarı** (`GEMINI_API_KEY`) edinilmelidir.

### 2. Backend Kurulumu
Proje kök dizininde:

```bash
# Sanal ortam oluşturun ve aktif edin
python3 -m venv venv
source venv/bin/activate

# Gerekli bağımlılıkları ve projeyi geliştirme modunda yükleyin
pip install -e .
```

### 3. Ortam Değişkenleri (`.env`)
Proje kök dizininde bir `.env` dosyası oluşturun ve aşağıdaki değişkenleri tanımlayın:

```env
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/your/ga4-credentials.json
GOOGLE_PROJECT_ID=gcp-project-id-xyz
GEMINI_API_KEY=AIzaSy...your_gemini_api_key
PORT=5000
```

### 4. Frontend Kurulumu
```bash
cd mcp_frontend
npm install
```

---

## 💻 Çalıştırma

### Backend & MCP Sunucusunu Başlatma
Proje kök dizinindeki `start.sh` scripti, gerekli ortam değişkenleriyle MCP sunucusunu ve Flask backend sunucusunu otomatik olarak başlatır:

```bash
chmod +x start.sh
./start.sh
```

### Frontend'i Başlatma
```bash
cd mcp_frontend
npm start
```
Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

---

## 🧪 Test ve Kalite Güvencesi
Proje içinde nox otomasyon aracı ile testleri koşturabilirsiniz:

```bash
# Nox ile testleri çalıştırın
nox
```

## 🔒 Güvenlik
* Google Service Account kimlik bilgilerini barındıran JSON dosyanızı kesinlikle git repolarına veya açık kaynak mecralara **commit etmeyin**.
* Üretim (Production) ortamlarında CORS ayarlarını sınırlandırın ve kullanıcı kimlik doğrulaması ekleyin.