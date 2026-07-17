# HomeStay Dorm Frontend

Frontend React/TypeScript của hệ thống HomeStay Dorm.

Hướng dẫn đầy đủ về chức năng, cấu hình database, tài khoản demo và cách chạy toàn bộ ứng dụng nằm tại [README chính](../README.md).

## Chạy frontend

Backend cần chạy trước tại `http://localhost:5157`.

```powershell
cd D:\Hoccode\PTTKHTTT\Frontend
npm install
npm run dev -- --port 5173
```

Mở `http://localhost:5173/login`.

## Build

```powershell
npm run build
```

Địa chỉ API mặc định là `http://localhost:5157/api`. Có thể cấu hình bằng file `.env.local`:

```env
VITE_API_URL=http://localhost:5157/api
```
