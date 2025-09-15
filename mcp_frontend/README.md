# Proje Adı: MCP Frontend

Bu proje, Vite, React, TypeScript ve Tailwind CSS kullanılarak oluşturulmuş bir web uygulamasıdır.

## Özellikler

- React 19 ve ReactDOM 19
- Vite ile hızlı geliştirme ve derleme
- TypeScript desteği
- Tailwind CSS ile stilendirme
- ESLint ile kod kalitesi kontrolü
- React Query ile veri çekme ve durum yönetimi

## Kurulum

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

1.  Depoyu klonlayın:

    ```bash
    git clone <depo-url>
    ```

2.  Proje dizinine gidin:

    ```bash
    cd mcp_frontend
    ```

3.  Bağımlılıkları yükleyin:

    ```bash
    npm install
    ```

## Kullanım

Projeyi geliştirme modunda çalıştırmak için aşağıdaki komutu kullanın:

```bash
npm run dev
```

Bu komut, uygulamayı `http://localhost:5173` adresinde başlatacaktır.

## Mevcut Komut Dosyaları

Bu projede aşağıdaki komut dosyaları mevcuttur:

- `npm run dev`: Geliştirme sunucusunu başlatır.
- `npm run build`: Uygulamayı üretim için derler.
- `npm run lint`: ESLint ile kod kalitesini kontrol eder.
- `npm run preview`: Üretim derlemesini yerel olarak önizler.

## Proje Yapısı

```
mcp_frontend/
├───.gitignore
├───eslint.config.js
├───index.html
├───package-lock.json
├───package.json
├───README.md
├───tsconfig.json
├───tsconfig.node.json
├───vite.config.ts
├───dist/
├───node_modules/
├───public/
│   └───vite.svg
└───src/
    ├───App.css
    ├───App.tsx
    ├───index.css
    ├───main.tsx
    ├───api/
    │   └───ask.ts
    ├───assets/
    │   └───react.svg
    └───features/
        └───chat/
            ├───components/
            │   └───ChatPage.tsx
            └───hooks/
                └───useAskApi.ts
```

## API Proxy

`vite.config.ts` dosyasında, `/api` ile başlayan isteklerin `http://127.0.0.1:5005` adresine yönlendirildiği bir proxy yapılandırması bulunmaktadır.

```ts
server: {
  proxy: {
    "/api": {
      target: "http://127.0.0.1:5005",
      changeOrigin: true,
    },
  },
},
```