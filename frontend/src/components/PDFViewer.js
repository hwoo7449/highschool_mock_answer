import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const PDFViewer = ({ url }) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: defaultTabs => [
            // 탭 순서 변경, 삭제 또는 추가
            defaultTabs[0], // 썸네일 탭 유지
            // defaultTabs[1] 또는 [2]는 삭제하여 북마크와 첨부 파일 탭 제거
        ]
    });
    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <div
                style={{ width: '800px', height: '800px', margin: 'auto'}}
            >
                <Viewer
                    fileUrl={url}
                    plugins={[defaultLayoutPluginInstance]}
                    />
            </div>
        </Worker>
    );
};

export default PDFViewer;
