import React from 'react';

const SITES = [
    { name: 'KL University ERP', url: 'https://newerp.kluniversity.in/' },
    { name: 'KLH LMS Portal', url: 'https://bmp-lms.klh.edu.in/' },
];

const WebviewLoader: React.FC = () => {
    const openInNewTab = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl shadow-sm">
            <h2 className="text-3xl font-bold mb-2 text-light-text dark:text-dark-text">External Portals</h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8">These links will open in a new browser tab for security.</p>
            <div className="flex flex-col sm:flex-row gap-6">
                {SITES.map(site => (
                    <button
                        key={site.name}
                        onClick={() => openInNewTab(site.url)}
                        className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary to-primary-light rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/50"
                    >
                        Launch {site.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WebviewLoader;