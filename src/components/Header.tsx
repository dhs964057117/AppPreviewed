import React from 'react';
import { Download, MonitorSmartphone } from 'lucide-react';
import { useEditorStore } from '../store/EditorContext';
import { PRESET_SIZES } from '../types';

const Header: React.FC = () => {
    const { canvasSize, setCanvasSize, clearSelection } = useEditorStore();

    const [exportFormat, setExportFormat] = React.useState<'jpeg' | 'png'>('jpeg');

    const handleExport = () => {
        // Clear selection so bounding boxes aren't in the export
        clearSelection();
        // Small delay to ensure React state has cleared the transformer before rendering
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('export-canvas', { detail: { format: exportFormat } }));
        }, 100);
    };

    return (
        <header className="app-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MonitorSmartphone size={24} color="var(--primary)" />
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                    Store ScreenStudio
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <select
                    className="glass-panel"
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        color: 'white',
                        background: 'var(--bg-sidebar)',
                        border: '1px solid var(--border-color)',
                        outline: 'none',
                        fontFamily: 'var(--font-sans)'
                    }}
                    value={canvasSize.name}
                    onChange={(e) => {
                        const size = PRESET_SIZES.find(s => s.name === e.target.value);
                        if (size) setCanvasSize(size);
                    }}
                >
                    {PRESET_SIZES.map(size => (
                        <option key={size.name} value={size.name}>
                            {size.name}
                        </option>
                    ))}
                </select>

                <select
                    className="glass-panel"
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        color: 'white',
                        background: 'var(--bg-sidebar)',
                        border: '1px solid var(--border-color)',
                        outline: 'none',
                        fontFamily: 'var(--font-sans)'
                    }}
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'jpeg' | 'png')}
                >
                    <option value="jpeg">JPG</option>
                    <option value="png">PNG</option>
                </select>

                <button className="btn-primary" onClick={handleExport}>
                    <Download size={18} />
                    Export Image
                </button>
            </div>
        </header>
    );
};

export default Header;
