import React from 'react';
import SearchForm from './components/SearchForm';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import './App.css'; // CSS 파일을 추가합니다.

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>모의고사 해설 검색</h1>
      </header>
      <main>
        <SearchForm />
        <Analytics />
        <SpeedInsights />
      </main>
    </div>
  );
}

export default App;
