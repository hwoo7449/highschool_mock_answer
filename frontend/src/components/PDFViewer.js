import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const PDFViewer = ({ url }) => {
    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <div
                style={{
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    width: '800px',
                    height: '800px',
                }}
            >
                <Viewer fileUrl={url} />
            </div>
        </Worker>
    );
};

export default PDFViewer;
