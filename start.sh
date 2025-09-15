#!/bin/bash

# Virtual environment klasörünün varlığını kontrol et
if [ ! -d "venv" ]; then
    echo "venv klasörü bulunamadı!"
    echo "Bu script'i proje kök dizininde çalıştırdığınızdan emin olun."
    exit 1
fi

# Virtual environment'ı aktif et
echo "Virtual environment aktif ediliyor..."
source venv/bin/activate

# Aktivasyon kontrolü
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Virtual environment aktif edilemedi!"
    exit 1
fi

echo "Virtual environment aktif: $VIRTUAL_ENV"
echo "MCP Server ve Flask uygulaması başlatılıyor..."

# MCP server'ı arka planda başlat
analytics-mcp &
MCP_PID=$!

echo "MCP Server başlatıldı (PID: $MCP_PID)"

# MCP server'ın hazır olması için bekle
sleep 3

echo "Flask uygulaması başlatılıyor..."

# Temizlik fonksiyonu
cleanup() {
    echo -e "\n Uygulamalar kapatılıyor..."
    kill $MCP_PID 2>/dev/null
    echo "Temizlik tamamlandı"
    exit 0
}

# CTRL+C yakalandığında temizlik yap
trap cleanup SIGINT SIGTERM

# Flask uygulamasını başlat
python app.py

# Script bittiğinde temizlik yap
cleanup