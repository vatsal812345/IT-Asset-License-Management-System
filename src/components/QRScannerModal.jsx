import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, QrCode } from 'lucide-react';

const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
    useEffect(() => {
        if (!isOpen) return;

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render((decodedText, decodedResult) => {
            scanner.clear();
            onScanSuccess(decodedText);
        }, (errorMessage) => {
            // ignore scanning errors
        });

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, [isOpen, onScanSuccess]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 dark:border-dark-border animate-scale-in">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                            <QrCode className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Scan Asset QR</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <div id="reader" className="w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-dark-border html5-qrcode-container"></div>
                    <p className="text-center text-sm font-medium text-gray-500 dark:text-slate-400 mt-4">
                        Point your camera at the asset QR code.
                    </p>
                </div>
            </div>
            <style>{`
                .html5-qrcode-container {
                    background-color: var(--color-slate-50);
                }
                .dark .html5-qrcode-container {
                    background-color: var(--color-slate-900);
                }
                #reader__scan_region {
                    background: transparent;
                }
                #reader__dashboard_section_csr button {
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 10px;
                }
                #reader__dashboard_section_csr button:hover {
                    background-color: #2563eb;
                }
                #reader a {
                    color: #3b82f6;
                    text-decoration: none;
                }
            `}</style>
        </div>
    );
};

export default QRScannerModal;
