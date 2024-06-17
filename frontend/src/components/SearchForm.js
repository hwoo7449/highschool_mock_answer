import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SearchForm() {
  const [subject, setSubject] = useState('사회문화');  // 기본값을 '사회문화'로 설정
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);  // 로그를 저장할 상태 추가
  const [backendUrl, setBackendUrl] = useState('');
  const [logsVisible, setLogsVisible] = useState(false);  // 로그 표시 여부를 관리하는 상태 추가

  useEffect(() => {
    setBackendUrl(process.env.REACT_APP_BACKEND_URL);
  }, []);

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);  // 로그 추가
    console.log(message); // 콘솔에도 로그 출력
  };

  const handleSearch = async (searchQuery = query) => {
    addLog(`handleSearch called with searchQuery="${searchQuery}"`);
    addLog(`Backend URL: ${backendUrl}/search`);
    try {
      const response = await axios.get(`${backendUrl}/search`, {
        params: {
          query: searchQuery,
          subject: subject,
        },
        responseType: 'blob'
      });

      addLog(`Response status: ${response.status}`);

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url);
    } catch (err) {
      addLog(`Search error: ${err}`);
      setError(err.response?.data?.error || '검색 중 오류가 발생했습니다.');
    }
  };

  const handleQuickSearch = async () => {
    addLog(`handleQuickSearch called`);
    try {
      const copiedText = await navigator.clipboard.readText();
      addLog(`Copied text from clipboard: "${copiedText}"`);
      if (validateSearchQuery(copiedText)) {
        setQuery(copiedText);
        handleSearch(copiedText);
      } else {
        setError('형식이 맞지 않습니다.');
      }
    } catch (err) {
      addLog(`Clipboard read error: ${err}`);
      setError('클립보드에서 텍스트를 읽는 중 오류가 발생했습니다.');
    }
  };

  const validateSearchQuery = (query) => {
    addLog(`validateSearchQuery called with query="${query}"`);
    const pattern1 = /^\d{2}학년도 \d{1,2}월 (모평|학평) \d{1,2}번$/;
    const pattern2 = /^\d{2}학년도 수능 \d{1,2}번$/;
    return pattern1.test(query) || pattern2.test(query);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <label>
          과목:
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="사회문화">사회문화</option>
            <option value="생활과 윤리">생활과 윤리</option>
            <option value="한국지리">한국지리</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div>
        <button onClick={() => handleSearch(query)}>검색</button>
        <button onClick={handleQuickSearch}>빠른 검색</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <button onClick={() => setLogsVisible(!logsVisible)}>
          {logsVisible ? '로그 숨기기' : '로그 보기'}
        </button>
        {logsVisible && (
          <div style={{ maxHeight: '200px', overflowY: 'scroll', border: '1px solid black', marginTop: '10px' }}>
            {logs.map((log, index) => (
              <p key={index} style={{ margin: '5px' }}>{log}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchForm;
