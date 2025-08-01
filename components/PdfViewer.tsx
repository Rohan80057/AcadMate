import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PdfFolders, PdfFile } from '../types';

const STORAGE_KEY = 'acadmate-pdf-folders';

const PdfViewer: React.FC = () => {
    const [folders, setFolders] = useState<PdfFolders>({ General: [] });
    const [currentFolder, setCurrentFolder] = useState<string>('General');
    const [currentFile, setCurrentFile] = useState<PdfFile | null>(null);
    const [newFolderName, setNewFolderName] = useState('');

    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.5);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                if (Object.keys(parsedData).length > 0) {
                  setFolders(parsedData);
                  setCurrentFolder(Object.keys(parsedData)[0]);
                }
            }
        } catch (error) {
            console.error("Failed to load PDF data from localStorage", error);
        }
        // pdfjsLib is loaded from a script tag in index.html
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    }, []);

    const saveFolders = useCallback((newFolders: PdfFolders) => {
        setFolders(newFolders);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newFolders));
        } catch (error) {
            alert("Error saving file. The file might be too large for browser storage.");
            console.error("Failed to save to localStorage", error);
        }
    }, []);
    
    const renderPage = useCallback(async (pageNum: number, doc = pdfDoc, newScale = scale) => {
        if (!doc) return;
        try {
          const page = await doc.getPage(pageNum);
          const viewport = page.getViewport({ scale: newScale });
          const canvas = canvasRef.current;
          if (canvas) {
              const context = canvas.getContext('2d');
              if (context) {
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;
                  const renderContext = { canvasContext: context, viewport };
                  await page.render(renderContext).promise;
              }
          }
          setCurrentPage(pageNum);
        } catch(e) {
            console.error("Failed to render page", e)
        }
    }, [pdfDoc, scale]);

    useEffect(() => {
        if (currentFile) {
            const loadingTask = (window as any).pdfjsLib.getDocument({ data: atob(currentFile.dataUrl.split(',')[1]) });
            loadingTask.promise.then((doc: any) => {
                setPdfDoc(doc);
                setTotalPages(doc.numPages);
                renderPage(1, doc, scale);
            }).catch((err: any) => console.error("Error loading PDF document:", err));
        }
    }, [currentFile, renderPage, scale]);

    const handleCreateFolder = () => {
        if (newFolderName && !folders[newFolderName]) {
            const newFolders = { ...folders, [newFolderName]: [] };
            saveFolders(newFolders);
            setCurrentFolder(newFolderName);
            setNewFolderName('');
        }
    };
    
    const handleDeleteFile = (fileName: string) => {
        if(window.confirm(`Are you sure you want to delete ${fileName}?`)){
            const updatedFiles = folders[currentFolder].filter(f => f.name !== fileName);
            saveFolders({ ...folders, [currentFolder]: updatedFiles });
            if(currentFile?.name === fileName){
                setCurrentFile(null);
                setPdfDoc(null);
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                const newFile = { name: file.name, dataUrl };
                const updatedFolder = [...(folders[currentFolder] || []), newFile];
                saveFolders({ ...folders, [currentFolder]: updatedFolder });
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-10rem)]">
            <div className="lg:col-span-1 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl p-4 flex flex-col h-full overflow-y-auto shadow-sm">
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="New Folder Name" className="flex-1 w-0 p-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg focus:ring-primary focus:outline-none"/>
                        <button onClick={handleCreateFolder} className="px-4 py-2 text-white font-semibold bg-primary rounded-lg hover:opacity-90 transition-opacity">Create</button>
                    </div>
                    <div>
                        <select value={currentFolder} onChange={e => {setCurrentFolder(e.target.value); setCurrentFile(null); setPdfDoc(null);}} className="w-full p-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg appearance-none text-center font-semibold">
                            {Object.keys(folders).map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="w-full block text-center px-4 py-2 text-white font-semibold bg-primary-light rounded-lg hover:opacity-90 cursor-pointer transition-opacity">
                            Upload PDF
                            <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
                        </label>
                    </div>
                </div>
                <hr className="my-4 border-gray-300 dark:border-gray-600"/>
                <ul className="space-y-2 flex-1 overflow-y-auto pr-2">
                    {(folders[currentFolder] || []).map((file, index) => (
                        <li key={index}  className={`p-2 rounded-lg cursor-pointer flex justify-between items-center group ${currentFile?.name === file.name ? 'bg-primary text-white' : 'hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'}`}>
                            <span onClick={() => setCurrentFile(file)} className="truncate flex-1">{file.name}</span>
                            <button onClick={() => handleDeleteFile(file.name)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-xs font-bold">DELETE</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="lg:col-span-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl p-4 flex flex-col items-center h-full shadow-sm">
                <div className="flex-1 w-full overflow-auto mb-4 flex justify-center items-start bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg">
                    {pdfDoc ? (
                         <canvas ref={canvasRef} className="max-w-full h-auto" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary">Select a PDF to view</div>
                    )}
                </div>
                {pdfDoc && (
                     <div className="flex items-center gap-2 sm:gap-4 p-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-xl text-sm font-semibold">
                        <button onClick={() => renderPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="px-3 py-1 rounded-md disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600">Prev</button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button onClick={() => renderPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} className="px-3 py-1 rounded-md disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600">Next</button>
                        <button onClick={() => setScale(s => s + 0.1)} className="px-3 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Zoom In</button>
                        <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="px-3 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Zoom Out</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfViewer;