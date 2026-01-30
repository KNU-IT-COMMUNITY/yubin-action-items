import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

// 1. QueryClient 인스턴스 생성
const queryClient = new QueryClient();

// 2. '!'를 붙여서 이 요소가 반드시 존재함을 알려줍니다.
const rootElement = document.getElementById('root')!;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* 3. TanStack Query 설정 */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);