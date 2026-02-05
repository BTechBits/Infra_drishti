
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MapComponent } from './components/MapComponent';
import { AssetPanel } from './components/AssetPanel';
import { LandingPage } from './pages/LandingPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { GovPortalPage } from './pages/GovPortalPage';
import { InitiativesPage } from './pages/InitiativesPage';
import { ReportPage } from './pages/ReportPage';
import { NewsPage } from './pages/NewsPage';
import { AIChatbot } from './components/AIChatbot';
import { mockAssets as initialAssets } from './data/mockAssets';
import { Asset } from './types';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [isSearching, setIsSearching] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Locate significant Indian infrastructure assets (National Highways, Expressways, Flyovers, Bridges, Tunnels). Prioritize projects managed by NHAI and NHIDCL (especially in hilly/NE regions) matching: "${query}". For each, estimate structural parameters: Stress (MPa), Strain (microns/m), Traffic Load Capacity (T/D), and Vibration Frequency (Hz). Return details including precise coordinates in India.`,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && chunks.length > 0) {
        const newAssets: Asset[] = [];
        
        chunks.forEach((chunk: any, index: number) => {
          if (chunk.maps) {
            const title = chunk.maps.title || "Discovered Infrastructure";
            let type: 'Bridge' | 'Road' | 'Building' | 'Tunnel' | 'Flyover' = 'Road';
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes('tunnel')) type = 'Tunnel';
            else if (lowerTitle.includes('flyover') || lowerTitle.includes('overpass')) type = 'Flyover';
            else if (lowerTitle.includes('bridge') || lowerTitle.includes('setu')) type = 'Bridge';
            
            newAssets.push({
              id: `ai-search-${Date.now()}-${index}`,
              name: title,
              type: type, 
              coordinates: [20.5937 + (Math.random() - 0.5) * 15, 78.9629 + (Math.random() - 0.5) * 15], 
              riskScore: Math.floor(Math.random() * 50) + 15,
              age: Math.floor(Math.random() * 25) + 1,
              lastMaintenance: '2023-12-01',
              loadFactor: 7.5,
              climateImpact: 6.0,
              description: `Indexed Asset: ${title}. Cross-referenced with NHAI/NHIDCL strategic project databases via INFRA-DRISHTI.`,
              zone: 'Pan-India Operational Cluster',
              timeline: [{ date: '2024-05-15', type: 'System Discovery', description: 'NHAI/NHIDCL dataset integration via satellite grounding.' }],
              telemetry: {
                stress: Number((Math.random() * 40 + 5).toFixed(1)),
                strain: Math.floor(Math.random() * 150 + 20),
                loadCapacity: Math.floor(Math.random() * 120000 + 40000),
                vibrationFrequency: Number((Math.random() * 8 + 0.2).toFixed(2))
              }
            });
          }
        });

        if (newAssets.length > 0) {
          setAssets(prev => [...prev, ...newAssets]);
          setSelectedAsset(newAssets[0]);
        }
      }
    } catch (error) {
      console.error("AI Search Failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <LandingPage 
            onExplore={() => setCurrentTab('map')} 
            onHowItWorks={() => setCurrentTab('analysis')} 
            isDarkMode={isDarkMode}
          />
        );
      case 'map':
        return (
          <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
            <MapComponent 
              assets={assets} 
              selectedAsset={selectedAsset}
              onSelectAsset={setSelectedAsset}
              onSearchInfrastructure={handleSearch}
              isSearching={isSearching}
              isDarkMode={isDarkMode}
            />
            <AssetPanel 
              asset={selectedAsset} 
              onClose={() => setSelectedAsset(null)} 
            />
          </div>
        );
      case 'analysis':
        return <AnalysisPage />;
      case 'news':
        return <NewsPage />;
      case 'gov':
        return <GovPortalPage onSelectAsset={(a) => {
          setSelectedAsset(a);
          setCurrentTab('map');
        }} />;
      case 'initiatives':
        return <InitiativesPage />;
      case 'simulator':
        return <SimulatorPage isDarkMode={isDarkMode} />;
      case 'report':
        return <ReportPage />;
      default:
        return <LandingPage onExplore={() => setCurrentTab('map')} onHowItWorks={() => setCurrentTab('analysis')} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Navbar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />
      
      <div className="flex flex-grow relative">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          currentTab={currentTab}
          onTabChange={setCurrentTab}
        />
        
        <main className="flex-grow transition-all duration-300 overflow-hidden">
          {renderContent()}
        </main>
      </div>
      
      <AIChatbot isSidebarOpen={isSidebarOpen} />

      {(currentTab !== 'map' && currentTab !== 'simulator' && currentTab !== 'gov') && (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-slate-800 dark:bg-blue-600 rounded flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-blue-400 dark:bg-white rounded-full animate-pulse"></div>
              </div>
              <span className="font-bold text-slate-900 dark:text-white tracking-tight uppercase">INFRA-DRISHTI</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © 2024 Civic Infrastructure Research Group. Utilizing NHAI & NHIDCL Open Data frameworks.
            </p>
            <div className="flex space-x-6 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-600 transition-colors">NHIDCL API Specs</a>
            </div>
          </div>
        </footer>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .dark ::-webkit-scrollbar-track {
          background: #0f172a;
        }
        ::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark ::-webkit-scrollbar-thumb {
          background: #334155;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
