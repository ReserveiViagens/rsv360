#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/parks.tsx');
let src = fs.readFileSync(filePath, 'utf8');

// Move MOCK_PARKS to module scope
const mockRe = /    \/\/ Dados mockados para parques\r?\n    const MOCK_PARKS: Park\[\] = (\[[\s\S]*?\r?\n    \]);\r?\n\r?\n    useEffect/;
const mockMatch = src.match(mockRe);
if (!mockMatch) {
  console.error('MOCK_PARKS block not found');
  process.exit(1);
}
src = src.replace(mockMatch[0], '\n    useEffect');
src = src.replace(
  /(type StatsRow = \{[\s\S]*?\};)/,
  `$1

const MOCK_PARKS: Park[] = ${mockMatch[1]};`
);

// Extract inner components
const start = src.indexOf('    // Componente ParkForm');
const end = src.indexOf('    if (loading) {');
if (start === -1 || end === -1) {
  console.error('Inner components not found');
  process.exit(1);
}
let block = src.slice(start, end);

block = block
  .replace(/^    \/\/ Componente ParkForm\n    const ParkForm = /m, 'function ParkForm')
  .replace(/^    \/\/ Componente ImageModal\n    const ImageModal = \(\{ park, onClose \}: \{ park: Park; onClose: \(\) => void \}\) => \{/m,
    `function ImageModal({ park, onClose, onUploadImage, onDeleteImage, uploadingImage }: {
  park: Park;
  onClose: () => void;
  onUploadImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: (imageUrl: string) => void;
  uploadingImage: boolean;
}) {`)
  .replace(/onChange=\{handleUploadImage\}/g, 'onChange={onUploadImage}')
  .replace(/onClick=\{\(\) => handleDeleteImage\(image\)\}/g, 'onClick={() => onDeleteImage(image)}')
  .replace(/^    \/\/ Componente StatsDetails\n    const StatsDetails = \(\{ statsType, onClose \}: \{ statsType: string; onClose: \(\) => void \}\) => \{\n        const statsData = getStatsDataByPeriod\(\);\n\n        return \(/m,
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
  .replace(/onClick=\{handleExportReport\}/g, 'onClick={onExportReport}')
  .replace(/^    \/\/ Componente ExportModal\n    const ExportModal = \(\{ onClose \}: \{ onClose: \(\) => void \}\) => \{\n        return \(/m,
    `function ExportModal({ onClose, exportFormat, setExportFormat, exportGenerating, onExportSubmit }: {
  onClose: () => void;
  exportFormat: 'csv' | 'pdf';
  setExportFormat: (format: 'csv' | 'pdf') => void;
  exportGenerating: boolean;
  onExportSubmit: () => void;
}) {
        return (`)
  .replace(/onClick=\{handleExportSubmit\}/g, 'onClick={onExportSubmit}');

// Fix arrow closings to function closings
block = block.replace(/\n    \};\n\n    \/\/ Componente /g, '\n}\n\n// Componente ');
block = block.replace(/\n    \};\n\n$/, '\n}\n\n');
block = block.replace(/^    /gm, '');

src = src.slice(0, start) + src.slice(end);
src = src.replace('export default function ParksPage()', block + '\nexport default function ParksPage()');

// Update modal JSX
src = src.replace(
  `{showImageModal && selectedPark && (
                    <ImageModal
                        park={selectedPark}
                        onClose={() => {
                            setShowImageModal(false);
                            setSelectedPark(null);
                        }}
                    />`,
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
  `{showStatsDetails && (
                    <StatsDetails
                        statsType={selectedStatsType}
                        onClose={() => setShowStatsDetails(false)}
                    />`,
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
  `{showExportModal && (
                    <ExportModal
                        onClose={() => setShowExportModal(false)}
                    />`,
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
console.log('Done');
