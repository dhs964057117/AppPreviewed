import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { PRESET_SIZES } from '../types';
import type { CanvasElement, BackgroundConfig, PresetSize } from '../types';
import type { Language } from '../utils/i18n';
import presetTemplate from '../../store-promo-template-1771840515058.json';

interface EditorContextProps {
    elements: CanvasElement[];
    setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
    selectedIds: string[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    canvasSize: PresetSize;
    setCanvasSize: React.Dispatch<React.SetStateAction<PresetSize>>;
    background: BackgroundConfig;
    setBackground: React.Dispatch<React.SetStateAction<BackgroundConfig>>;
    showGrid: boolean;
    setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
    language: Language;
    setLanguage: React.Dispatch<React.SetStateAction<Language>>;

    // Helpers
    addElement: (el: CanvasElement) => void;
    updateElement: (id: string, updates: Partial<CanvasElement>) => void;
    removeElement: (id: string) => void;
    clearSelection: () => void;
}

const EditorContext = createContext<EditorContextProps | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [elements, setElements] = useState<CanvasElement[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [canvasSize, setCanvasSize] = useState<PresetSize>(PRESET_SIZES[0]); // Default iPhone 6.7
    const [background, setBackground] = useState<BackgroundConfig>({ type: 'color', color: '#1e293b' });
    const [showGrid, setShowGrid] = useState<boolean>(false);
    const [language, setLanguage] = useState<Language>('zh'); // Defaulting to Chinese as requested

    useEffect(() => {
        // Load default preset template
        try {
            const preset: any = presetTemplate;
            if (preset && preset.elements) {
                setCanvasSize(preset.canvasSize);
                setBackground(preset.background as BackgroundConfig);
                setElements(preset.elements as CanvasElement[]);
            }
        } catch (e) {
            console.error("Failed to load preset template:", e);
        }
    }, []);

    const addElement = (el: CanvasElement) => {
        setElements(prev => [...prev, el]);
        setSelectedIds([el.id]);
    };

    const updateElement = (id: string, updates: Partial<CanvasElement>) => {
        setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } as CanvasElement : el)));
    };

    const removeElement = (id: string) => {
        setElements(prev => prev.filter(el => el.id !== id));
        setSelectedIds(prev => prev.filter(selId => selId !== id));
    };

    const clearSelection = () => {
        setSelectedIds([]);
    };

    const value = {
        elements, setElements,
        selectedIds, setSelectedIds,
        canvasSize, setCanvasSize,
        background, setBackground,
        showGrid, setShowGrid,
        language, setLanguage,
        addElement, updateElement, removeElement, clearSelection
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditorStore = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditorStore must be used within an EditorProvider');
    }
    return context;
};
