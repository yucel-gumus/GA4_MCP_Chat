# Google Analytics MCP + Gemini Sohbet

GA4 verilerinize **doğal dilde** soru soran tam yığın uygulama: Google'ın **Analytics MCP** araçları + **Gemini** + **React** sohbet arayüzü.

**GitHub:** [yucel-gumus/GA4_MCP_Chat](https://github.com/yucel-gumus/GA4_MCP_Chat)  
**Temel:** [google-analytics-mcp](https://github.com/googleanalytics/google-analytics-mcp) (bu repoda `analytics_mcp` paketi gömülü/uyarlanmış)

---

## Özellikler

- “Son 3 ayda en çok görüntülenen 10 sayfa?” gibi **Türkçe/İngilizce** sorular
- MCP araçları: hesap özeti, rapor çalıştırma, metadata (`analytics_mcp.tools`)
- **Flask** REST API (`app.py`) — Gemini function/tool orchestration
- **React + TypeScript + MUI** frontend (`mcp_frontend/`)
- `start.sh` — MCP sunucusu + Flask'ı birlikte başlatır

---

## Mimari

```
mcp_frontend (React)
        │ POST /chat (veya ilgili endpoint)
        ▼
Flask app.py + Gemini
        │ tool calls
        ▼
analytics-mcp (stdio MCP) ──► Google Analytics Data API
        ▲
GOOGLE_APPLICATION_CREDENTIALS (service account JSON)
```

---

## Ön gereksinimler

- Python 3.10+
- Node.js 18+ (frontend)
- Google Cloud projesi + **Analytics Data API** etkin
- GA4 mülkü ve service account (Viewer veya uygun rol)
- **Gemini API key**

---

## Kurulum

```bash
git clone https://github.com/yucel-gumus/GA4_MCP_Chat.git
cd GA4_MCP_Chat

python3 -m venv venv
source venv/bin/activate
pip install -e .   # veya pyproject.toml / requirements akışı
```

### Ortam değişkenleri (`.env`)

```env
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/ga4-credentials.json
GOOGLE_PROJECT_ID=your-gcp-project-id
GEMINI_API_KEY=your_gemini_key
```

`app.py` bu üç değişken olmadan başlamaz.

---

## Çalıştırma

### Tek komut (önerilen)

```bash
chmod +x start.sh
./start.sh
```

`analytics-mcp` arka planda, ardından `python app.py`.

### Frontend

```bash
cd mcp_frontend
npm install
npm start
```

Flask API URL'ini frontend env'inde yapılandırın (geliştirmede proxy veya `REACT_APP_*`).

---

## Test

```bash
nox   # veya pytest (tests/)
```

---

## Proje yapısı

```
GA4_MCP_Chat/
├── app.py              # Flask + Gemini + MCP tool wiring
├── analytics_mcp/      # GA MCP tools (admin, reporting)
├── mcp_frontend/       # React UI
├── start.sh            # MCP + Flask launcher
├── pyproject.toml
└── tests/
```

---

## Güvenlik

- Service account JSON'u repoya **commit etmeyin**
- Production'da CORS ve auth sınırlandırın
- GA4 property ID'lerini kullanıcıya özel tutun

---

## Lisans

Upstream Google Analytics MCP lisansına tabi bileşenler içerebilir; `LICENSE` dosyasına bakın.