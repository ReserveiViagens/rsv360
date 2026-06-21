#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/parks.tsx');
let src = fs.readFileSync(filePath, 'utf8');

// 1. Fix imports
src = src.replace(
  /import \{[\s\S]*?\} from 'lucide-react';\nimport NavigationButtons[\s\S]*?ProtectedRoute from '\.\.\/components\/ProtectedRoute';/,
  `import { 
    MapPin, 
    TreePine, 
    Star, 
    Clock, 
    DollarSign, 
    Users, 
    Plus, 
    Edit, 
    Trash, 
    X, 
    Image as ImageIcon,
    Download,
    BarChart3,
    Play
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';`
);

// 2. Add types after interface Park
src = src.replace(
  /(interface Park \{[\s\S]*?videos: string\[\];\n\})/,
  `$1

type StatsPeriod = 'daily' | 'weekly' | 'monthly' | 'annual';

type StatsRow = {
    name: string;
    visitors: number;
    revenue: number;
    rating: number;
};`
);

// 3. Extract mockParks to MOCK_PARKS at module level
const mockMatch = src.match(/    \/\/ Dados mockados para parques\r?\n    const mockParks: Park\[\] = (\[[\s\S]*?\r?\n    \]);/);
if (!mockMatch) {
  console.error('Could not find mockParks');
  process.exit(1);
}
const mockArray = mockMatch[1];
src = src.replace(mockMatch[0], '');
src = src.replace(
  /(type StatsRow = \{[\s\S]*?\};)/,
  `$1

const MOCK_PARKS: Park[] = ${mockArray};`
);

// 4. Remove selectedImage from parent state
src = src.replace(/\n    const \[selectedImage, setSelectedImage\] = useState<string\(''\)>;\n/, '\n');

// 5. Fix useEffect
src = src.replace(
  /setParks\(mockParks\)/,
  'setParks(MOCK_PARKS)'
);

// 6. Extract inner components block
const innerStart = src.indexOf('    // Componente ParkForm');
const innerEnd = src.indexOf('    if (loading) {');
if (innerStart === -1 || innerEnd === -1) {
  console.error('Could not find inner components block');
  process.exit(1);
}
let innerBlock = src.slice(innerStart, innerEnd);

// Remove duplicate getTypeColor, getStatsTitle, getStatsIcon from inside ParksPage
src = src.replace(/\n    const getTypeColor = \(type: string\) => \{[\s\S]*?    \};\n\n    const getStatsTitle[\s\S]*?    \};\n\n    const getStatsIcon[\s\S]*?    \};\n\n/, '\n');

// Transform inner components to module level
innerBlock = innerBlock
  .replace(/    \/\/ Componente ParkForm\n    const ParkForm = /, 'function ParkForm')
  .replace(/    \/\/ Componente ImageModal\n    const ImageModal = \(\{ park, onClose \}: \{ park: Park; onClose: \(\) => void \}\) => \{/, `function ImageModal({ park, onClose, onUploadImage, onDeleteImage, uploadingImage }: {
    park: Park;
    onClose: () => void;
    onUploadImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteImage: (imageUrl: string) => void;
    uploadingImage: boolean;
}) {`)
  .replace(/onChange=\{handleUploadImage\}/g, 'onChange={onUploadImage}')
  .replace(/onClick=\{\(\) => handleDeleteImage\(image\)\}/g, 'onClick={() => onDeleteImage(image)}')
  .replace(/                                <img\n                                    src=\{image\}/, `{/* eslint-disable-next-line @next/next/no-img-element -- park gallery preview URLs */}
                                <img
                                    src={image}`)
  .replace(/                                <img\n                                    src=\{selectedImage\}/, `{/* eslint-disable-next-line @next/next/no-img-element -- full-size preview */}
                                <img
                                    src={selectedImage}`)
  .replace(/    \/\/ Componente StatsDetails\n    const StatsDetails = \(\{ statsType, onClose \}: \{ statsType: string; onClose: \(\) => void \}\) => \{\n        const statsData = getStatsDataByPeriod\(\);\n\n        return \(/,
    `function StatsDetails({ statsType, onClose, statsPeriod, setStatsPeriod, statsSearchTerm, setStatsSearchTerm, statsFilter, setStatsFilter, statsData, onExportReport }: {
    statsType: string;
    onClose: () => void;
    statsPeriod: StatsPeriod;
    setStatsPeriod: (period: StatsPeriod) => void;
    statsSearchTerm: string;
    setStatsSearchTerm: (term: string) => void;
    statsFilter: string;
    setStatsFilter: (filter: string) => void;
    statsData: StatsRow[];
    onExportReport: () => void;
}) {
        return (`)
  .replace(/onChange=\{\(e\) => setStatsPeriod\(e\.target\.value as any\)\}/, 'onChange={(e) => setStatsPeriod(e.target.value as StatsPeriod)}')
  .replace(/onClick=\{handleExportReport\}/, 'onClick={onExportReport}')
  .replace(/    \/\/ Componente ExportModal\n    const ExportModal = \(\{ onClose \}: \{ onClose: \(\) => void \}\) => \{\n        return \(/,
    `function ExportModal({ onClose, exportFormat, setExportFormat, exportGenerating, onExportSubmit }: {
    onClose: () => void;
    exportFormat: 'csv' | 'pdf';
    setExportFormat: (format: 'csv' | 'pdf') => void;
    exportGenerating: boolean;
    onExportSubmit: () => void;
}) {
        return (`)
  .replace(/onClick=\{handleExportSubmit\}/, 'onClick={onExportSubmit}')
  .replace(/onChange=\{\(e\) => setFormData\(\{\.\.\.formData, type: e\.target\.value as any\}\)\}/, 'onChange={(e) => setFormData({...formData, type: e.target.value as Park[\'type\']})}');

// Fix closing of arrow functions -> function declarations
innerBlock = innerBlock.replace(/\n    \};\n\n    \/\/ Componente ImageModal/g, '\n}\n\n// Componente ImageModal');
innerBlock = innerBlock.replace(/\n    \};\n\n    \/\/ Componente StatsDetails/g, '\n}\n\n// Componente StatsDetails');
innerBlock = innerBlock.replace(/\n    \};\n\n    \/\/ Componente ExportModal/g, '\n}\n\n// Componente ExportModal');
innerBlock = innerBlock.replace(/\n    \};\n\n$/, '\n}\n\n');

// Remove inner block from src
src = src.slice(0, innerStart) + src.slice(innerEnd);

// Add module-level helpers before export default
const helpers = `
function getTypeColor(type: string) {
    switch (type) {
        case 'nacional': return 'bg-green-100 text-green-800';
        case 'estadual': return 'bg-blue-100 text-blue-800';
        case 'municipal': return 'bg-yellow-100 text-yellow-800';
        case 'privado': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getStatsTitle(statsType: string) {
    switch (statsType) {
        case 'total': return 'Total de Parques';
        case 'visitors': return 'Visitantes/Ano';
        case 'rating': return 'Avaliação Média';
        case 'revenue': return 'Receita Média';
        default: return 'Estatísticas';
    }
}

function getStatsIcon(statsType: string) {
    switch (statsType) {
        case 'total': return <TreePine className="w-6 h-6" />;
        case 'visitors': return <Users className="w-6 h-6" />;
        case 'rating': return <Star className="w-6 h-6" />;
        case 'revenue': return <DollarSign className="w-6 h-6" />;
        default: return <BarChart3 className="w-6 h-6" />;
    }
}

${innerBlock.replace(/^    /gm, '')}`;

src = src.replace('export default function ParksPage()', helpers + '\nexport default function ParksPage()');

// Fix ImageModal and StatsDetails and ExportModal JSX usages
src = src.replace(
  /(\{showImageModal && selectedPark && \(\n                    <ImageModal\n                        park=\{selectedPark\}\n                        onClose=\{\(\) => \{[\s\S]*?\}\}\n                    \/>)/,
  `{showImageModal && selectedPark && (
                    <ImageModal
                        park={selectedPark}
                        onClose={() => {
                            setShowImageModal(false);
                            setSelectedPark(null);
                        }}
                        onUploadImage={handleUploadImage}
                        onDeleteImage={handleDeleteImage}
                        uploadingImage={uploadingImage}
                    />`
);

src = src.replace(
  /(\{showStatsDetails && \(\n                    <StatsDetails\n                        statsType=\{selectedStatsType\}\n                        onClose=\{\(\) => setShowStatsDetails\(false\)\}\n                    \/>)/,
  `{showStatsDetails && (
                    <StatsDetails
                        statsType={selectedStatsType}
                        onClose={() => setShowStatsDetails(false)}
                        statsPeriod={statsPeriod}
                        setStatsPeriod={setStatsPeriod}
                        statsSearchTerm={statsSearchTerm}
                        setStatsSearchTerm={setStatsSearchTerm}
                        statsFilter={statsFilter}
                        setStatsFilter={setStatsFilter}
                        statsData={getStatsDataByPeriod()}
                        onExportReport={handleExportReport}
                    />`
);

src = src.replace(
  /(\{showExportModal && \(\n                    <ExportModal\n                        onClose=\{\(\) => setShowExportModal\(false\)\}\n                    \/>)/,
  `{showExportModal && (
                    <ExportModal
                        onClose={() => setShowExportModal(false)}
                        exportFormat={exportFormat}
                        setExportFormat={setExportFormat}
                        exportGenerating={exportGenerating}
                        onExportSubmit={handleExportSubmit}
                    />`
);

fs.writeFileSync(filePath, src);
console.log('parks.tsx updated');
