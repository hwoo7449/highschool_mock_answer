const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.static(path.join(__dirname, 'PDF')));

const validateSearchQuery = (query) => {
    const pattern1 = /^\d{2}학년도 \d{1,2}월 (모평|학평) \d{1,2}번$/;
    const pattern2 = /^\d{2}학년도 수능 \d{1,2}번$/;
    return pattern1.test(query) || pattern2.test(query);
};

app.get('/search', (req, res) => {
    const query = req.query.query;
    const subject = req.query.subject;

    console.log(`Received search request: query="${query}", subject="${subject}"`);

    if (!validateSearchQuery(query)) {
        console.log(`Invalid query format: "${query}"`);
        return res.status(400).json({ error: "형식이 맞지 않습니다." });
    }

    let fileName;
    if (query.includes('모평') || query.includes('학평')) {
        const [year, month, , questionNum] = query.match(/\d{2}|\d{1,2}/g);
        fileName = `${year}학년도 ${month}월 ${subject}.pdf`;
    } else {
        const [year, questionNum] = query.match(/\d{2}|\d{1,2}/g);
        fileName = `${year}학년도 수능 ${subject}.pdf`;
    }

    const filePath = path.join(__dirname, 'PDF', fileName);
    console.log(`Searching for file: ${filePath}`); // 디버그 로그 추가

    // 파일이 존재하는지 확인
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return res.status(404).json({ error: "해당 파일을 찾을 수 없습니다." });
    }

    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`Error sending file: ${filePath}`, err);
            res.status(500).json({ error: "파일을 보내는 중 오류가 발생했습니다." });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
