import os
import asyncio
import json
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# .env dosyasındaki değişkenleri ortam değişkeni olarak yükle
load_dotenv()

# Google Analytics credentials
if "GOOGLE_APPLICATION_CREDENTIALS" not in os.environ:
    raise SystemExit("KRİTİK HATA: GOOGLE_APPLICATION_CREDENTIALS ortam değişkeni ayarlanmamış.")
if "GOOGLE_PROJECT_ID" not in os.environ:
    raise SystemExit("KRİTİK HATA: GOOGLE_PROJECT_ID ortam değişkeni ayarlanmamış.")

# Gemini API
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise SystemExit("KRİTİK HATA: GEMINI_API_KEY ortam değişkeni ayarlanmamış.")
genai.configure(api_key=GEMINI_API_KEY)

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# MCP araçlarını import et
try:
    from analytics_mcp.tools.admin.info import (
        get_account_summaries,
        get_property_details,
    )
    from analytics_mcp.tools.reporting.metadata import get_custom_dimensions_and_metrics

    # Diğer potansiyel MCP araçları
    try:
        from analytics_mcp.tools.reporting.realtime import run_realtime_report
        from analytics_mcp.tools.reporting.core import run_report

        REPORTING_AVAILABLE = True
        logger.info("Reporting araçları da mevcut")
    except ImportError:
        REPORTING_AVAILABLE = False
        logger.info("Reporting araçları mevcut değil")

    MCP_AVAILABLE = True
    logger.info("MCP araçları başarıyla yüklendi")

except ImportError as e:
    logger.critical(f"KRITIK: MCP araçları yüklenemedi: {e}")
    logger.critical("Uygulama MCP olmadan çalışamaz!")
    raise SystemExit("MCP araçları gerekli!")

# Tool definitions - Sadece gerçek MCP araçları
AVAILABLE_TOOLS = [
    {
        "name": "get_account_summaries",
        "description": "Google Analytics hesap özetlerini ve mülklerini getirir",
        "parameters": {},
        "requires_property_id": False,
        "category": "admin",
    },
    {
        "name": "get_property_details",
        "description": "Belirli bir mülkün detaylı bilgilerini getirir",
        "parameters": {"property_id": "GA4 mülk ID'si"},
        "requires_property_id": True,
        "category": "admin",
    },
    {
        "name": "get_custom_dimensions_and_metrics",
        "description": "Bir mülkün özel boyutları ve metriklerini getirir",
        "parameters": {"property_id": "GA4 mülk ID'si"},
        "requires_property_id": True,
        "category": "metadata",
    },
]

# Reporting araçları varsa ekle
if REPORTING_AVAILABLE:
    AVAILABLE_TOOLS.extend(
        [
            {
                "name": "run_report",
                "description": "Runs a Google Analytics Data API report.",
                "parameters": {
                    "property_id": "The Google Analytics property ID.",
                    "date_ranges": "A list of date ranges to include in the report.",
                    "dimensions": "A list of dimensions to include in the report.",
                    "metrics": "A list of metrics to include in the report.",
                    "dimension_filter": "A filter for dimensions.",
                    "metric_filter": "A filter for metrics.",
                    "order_bys": "How to order the results.",
                    "limit": "The maximum number of rows to return.",
                    "offset": "The starting row.",
                    "currency_code": "The currency code to use.",
                    "return_property_quota": "Whether to return property quota.",
                },
                "requires_property_id": True,
                "category": "reporting",
            },
            {
                "name": "run_realtime_report",
                "description": "Runs a Google Analytics Data API realtime report.",
                "parameters": {
                    "property_id": "The Google Analytics property ID.",
                    "dimensions": "A list of realtime dimensions.",
                    "metrics": "A list of realtime metrics.",
                    "dimension_filter": "A filter for dimensions.",
                    "metric_filter": "A filter for metrics.",
                    "order_bys": "How to order the results.",
                    "limit": "The maximum number of rows to return.",
                    "offset": "The starting row.",
                    "return_property_quota": "Whether to return realtime property quota.",
                },
                "requires_property_id": True,
                "category": "reporting",
            },
        ]
    )


def run_async(coro):
    """Async fonksiyonları sync olarak çalıştır"""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Eğer loop zaten çalışıyorsa, task oluştur
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, coro)
                return future.result()
        else:
            return loop.run_until_complete(coro)
    except RuntimeError:
        # Yeni loop oluştur
        return asyncio.run(coro)


async def call_mcp_function(tool_name, **kwargs):
    """Gerçek MCP fonksiyonlarını çağır"""
    try:
        logger.info(f"MCP çağrısı: {tool_name} - Parametreler: {kwargs}")

        if tool_name == "get_account_summaries":
            result = await get_account_summaries()

        elif tool_name == "get_property_details":
            if not kwargs.get("property_id"):
                raise ValueError("property_id gerekli")
            result = await get_property_details(property_id=kwargs["property_id"])

        elif tool_name == "get_custom_dimensions_and_metrics":
            if not kwargs.get("property_id"):
                raise ValueError("property_id gerekli")
            result = await get_custom_dimensions_and_metrics(
                property_id=kwargs["property_id"]
            )

        elif tool_name == "run_report" and REPORTING_AVAILABLE:
            if not kwargs.get("property_id"):
                raise ValueError("property_id gerekli")
            result = await run_report(**kwargs)

        elif tool_name == "run_realtime_report" and REPORTING_AVAILABLE:
            if not kwargs.get("property_id"):
                raise ValueError("property_id gerekli")
            result = await run_realtime_report(**kwargs)

        else:
            raise ValueError(f"Bilinmeyen tool: {tool_name}")

        logger.info(f"MCP çağrısı başarılı: {tool_name}")
        return result

    except Exception as e:
        logger.error(f"MCP çağrısı hatası ({tool_name}): {e}")
        raise


async def extract_first_property_id():
    """Hesap özetlerinden ilk mülk ID'sini çıkar"""
    try:
        logger.info("İlk property ID çıkarılıyor...")
        account_data = await call_mcp_function("get_account_summaries")

        if not account_data:
            raise ValueError("Hesap verisi alınamadı")

        # Veri formatını analiz et
        property_summaries = None

        if isinstance(account_data, dict):
            property_summaries = account_data.get("property_summaries", [])
        elif hasattr(account_data, "property_summaries"):
            property_summaries = account_data.property_summaries
        elif isinstance(account_data, list) and account_data:
            # Bazen liste olarak dönebilir
            first_account = account_data[0]
            if isinstance(first_account, dict):
                property_summaries = first_account.get("property_summaries", [])

        if not property_summaries:
            raise ValueError("Hiç mülk bulunamadı")

        # İlk mülk ID'sini al
        first_property = property_summaries[0]
        if isinstance(first_property, dict):
            property_id = first_property.get("property", "")
        else:
            property_id = getattr(first_property, "property", "")

        if property_id.startswith("properties/"):
            property_id = property_id.replace("properties/", "")

        if not property_id:
            raise ValueError("Property ID çıkarılamadı")

        logger.info(f"İlk property ID: {property_id}")
        return property_id

    except Exception as e:
        logger.error(f"Property ID çıkarma hatası: {e}")
        raise


def ai_orchestrator(user_query):
    """AI ile tool seçimi ve parametre çıkarımı"""

    tools_info = "\n".join(
        [f"- {tool['name']}: {tool['description']}" for tool in AVAILABLE_TOOLS]
    )

    system_prompt = f"""
Sen bir Google Analytics MCP orchestrator'ısın. Kullanıcının Türkçe sorusunu analiz et ve hangi MCP tool'unun çağrılması gerektiğini belirle.

MEVCUT ARAÇLAR:
{tools_info}

KARAR KURALLARI:
1. "custom dimension", "özel boyut", "custom metric" → get_custom_dimensions_and_metrics
2. "mülk detayları", "property details", "site bilgileri" → get_property_details
3. "hesaplarım", "accounts", "genel bilgi" → get_account_summaries
4. "rapor", "report", "veri" → run_report (varsa)
5. "canlı", "realtime", "şu an" → run_realtime_report (varsa)
6. Eğer kullanıcı bir rapor istiyorsa (run_report), sorgudan `dimensions`, `metrics` ve `date_ranges` parametrelerini çıkarmaya çalış. Eğer metrik belirtilmemişse, varsayılan olarak `["eventCount","totalUsers"]` kullan. Eğer tarih aralığı belirtilmemişse, varsayılan olarak son 7 günü (`"start_date": "7daysAgo", "end_date": "today"`) kullan.
7. Eğer bir boyut standart bir GA4 boyutu değilse, bunun bir özel etkinlik boyutu olduğunu varsay ve başına `customEvent:` ekle. Örneğin, kullanıcı "certificate_name" isterse, boyut olarak "customEvent:certificate_name" kullan.

PROPERTY ID KURALI:
- Kullanıcı specific bir property ID vermemişse, otomatik olarak ilk property kullanılacak
- needs_property_id: true/false olarak belirle

Kullanıcı sorusu: "{user_query}"

SADECE JSON yanıtla. run_report veya run_realtime_report için boyutları ve metrikleri kullanıcı girdisinden dikkatlice çıkar.

Örnek Yanıt Formatı:
{{
    "tool_name": "seçilen_tool_adı",
    "parameters": {{
        "property_id": "varsa_buraya",
        "dimensions": ["boyut1", "boyut2"],
        "metrics": ["metrik1", "metrik2"],
        "date_ranges": [{{ "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }}]
    }},
    "reasoning": "neden bu tool seçildi",
    "needs_property_id": true/false,
    "confidence": 0.0-1.0
}}

"""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(system_prompt)

        response_text = response.candidates[0].content.parts[0].text.strip()

        # JSON çıkar
        if "{" in response_text and "}" in response_text:
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            json_str = response_text[json_start:json_end]
        else:
            raise ValueError("AI yanıtı JSON formatında değil")

        decision = json.loads(json_str)

        # Validation
        if decision.get("tool_name") not in [tool["name"] for tool in AVAILABLE_TOOLS]:
            raise ValueError(f"Geçersiz tool: {decision.get('tool_name')}")

        return decision

    except Exception as e:
        logger.error(f"AI orchestrator hatası: {e}")
        # Fallback karar
        return {{
            "tool_name": "get_account_summaries",
            "parameters": {{}},
            "reasoning": f"AI hatası nedeniyle varsayılan seçim. Hata: {str(e)}",
            "needs_property_id": False,
            "confidence": 0.1,
        }}


@app.route("/api/ask", methods=["POST"])
def ask_ai():
    """Ana endpoint - Tamamen gerçek MCP ile"""
    try:
        data = request.get_json()
        user_query = data.get("query", "").strip()

        if not user_query:
            return jsonify({"error": "Soru boş olamaz"}), 400

        logger.info(f"Kullanıcı sorusu: {user_query}")

        # AI ile tool seçimi
        ai_decision = ai_orchestrator(user_query)
        logger.info(f"AI kararı: {ai_decision}")

        if not ai_decision.get("tool_name"):
            return (
                jsonify(
                    {
                        "error": "Uygun MCP tool bulunamadı",
                        "reasoning": ai_decision.get("reasoning"),
                        "available_tools": [tool["name"] for tool in AVAILABLE_TOOLS],
                    }
                ),
                400,
            )

        tool_name = ai_decision["tool_name"]
        parameters = ai_decision.get("parameters", {})

        # Property ID otomatik tespiti
        if ai_decision.get("needs_property_id", False):
            if not parameters.get("property_id"):
                logger.info("Property ID gerekli, otomatik tespit ediliyor...")
                try:
                    property_id = run_async(extract_first_property_id())
                    parameters["property_id"] = property_id
                    logger.info(f"Otomatik property ID: {property_id}")
                except Exception as e:
                    return (
                        jsonify(
                            {
                                "error": "Property ID tespit edilemedi",
                                "details": str(e),
                                "suggestion": "Önce hesap bilgilerini kontrol edin",
                            }
                        ),
                        400,
                    )

        # Gerçek MCP çağrısı
        logger.info(f"MCP tool çağrılıyor: {tool_name}")
        mcp_result = run_async(call_mcp_function(tool_name, **parameters))

        return jsonify(
            {
                "success": True,
                "query": user_query,
                "ai_decision": ai_decision,
                "used_parameters": parameters,
                "mcp_result": mcp_result,
                "metadata": {
                    "tool_used": tool_name,
                    "mcp_available": True,
                    "property_id": parameters.get("property_id"),
                },
            }
        )
    except Exception as e:
        logger.error(f"Kritik hata: {e}")
        import traceback

        traceback.print_exc()

        return (
            jsonify(
                {
                    "error": "MCP çağrısı hatası",
                    "details": str(e),
                    "mcp_available": MCP_AVAILABLE,
                }
            ),
            500,
        )


if __name__ == "__main__":
    print("Google Analytics MCP API Başlatılıyor...")
    print(f"MCP Durumu: {"Aktif" if MCP_AVAILABLE else "İnaktif"}")
    print(f"Mevcut Araçlar: {len(AVAILABLE_TOOLS)}")
    print(f" Reporting: {"Aktif" if REPORTING_AVAILABLE else "İnaktif"}")
    print("\n" + "=" * 50)
    print("KULLANIM: POST /api/ask")
    print("=" * 50 + "\n")

    app.run(debug=True, host="0.0.0.0", port=5005)
