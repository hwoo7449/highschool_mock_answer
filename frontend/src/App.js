import React from 'react';
import SearchForm from './components/SearchForm';
import './App.css'; // CSS 파일을 추가합니다.

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>모의고사 해설 검색</h1>
      </header>
      <main>
        <SearchForm />
      </main>
    </div>
  );
}

export default App;
