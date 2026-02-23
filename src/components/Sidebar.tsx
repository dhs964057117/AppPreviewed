import React, { useRef, useState } from 'react';
import { Type, Image as ImageIcon, Download, Upload, Grid3X3, Trash2 } from 'lucide-react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useEditorStore } from '../store/EditorContext';
import { v4 as uuidv4 } from 'uuid';
import type { TextElement, ImageElement } from '../types';

const Sidebar: React.FC = () => {
    const { elements, selectedIds, background, setBackground, clearSelection, updateElement, addElement, removeElement, showGrid, setShowGrid, setElements, canvasSize, setCanvasSize } = useEditorStore();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const bgFileInputRef = useRef<HTMLInputElement>(null);
    const templateInputRef = useRef<HTMLInputElement>(null);
    const replaceFileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [cropTarget, setCropTarget] = useState<'element' | 'background' | 'replace'>('element');
    const [crop, setCrop] = useState<Crop>({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
    const [completedCrop, setCompletedCrop] = useState<any>(null);

    const selectedElement = elements.find(e => e.id === selectedIds[0]);

    const handleAddText = () => {
        const textEl: TextElement = {
            id: uuidv4(),
            type: 'text',
            name: 'Text ' + (elements.length + 1),
            text: 'Headline goes here',
            x: 150,
            y: 150,
            fontSize: 80,
            fontFamily: 'Inter',
            fill: '#ffffff',
            align: 'center',
            fontStyle: 'bold',
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            zIndex: elements.length,
        };
        addElement(textEl);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCropTarget('element');
                    setCropImageSrc(event.target.result as string);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCropComplete = () => {
        if (!completedCrop || !imgRef.current) return;

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY
        );

        const base64Image = canvas.toDataURL('image/png');

        if (cropTarget === 'element') {
            const imgEl: ImageElement = {
                id: uuidv4(),
                type: 'image',
                name: 'Cropped Image',
                src: base64Image,
                x: 50,
                y: 50,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                cornerRadius: 0,
                zIndex: elements.length,
            };
            addElement(imgEl);
        } else if (cropTarget === 'replace' && selectedElement) {
            updateElement(selectedElement.id, { src: base64Image });
        } else if (cropTarget === 'background') {
            setBackground({ ...background, type: 'image', imageSrc: base64Image });
        }

        setCropImageSrc(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (bgFileInputRef.current) bgFileInputRef.current.value = '';
        if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    };

    const handleReplaceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCropTarget('replace');
                    setCropImageSrc(event.target.result as string);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCropTarget('background');
                    setCropImageSrc(event.target.result as string);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleExportTemplate = () => {
        const projectData = {
            version: 1,
            canvasSize,
            background,
            elements
        };
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `store-promo-template-${Date.now()}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target?.result as string);
                    if (data && data.elements && data.canvasSize && data.background) {
                        setCanvasSize(data.canvasSize);
                        setBackground(data.background);
                        setElements(data.elements);
                        clearSelection();
                    } else {
                        alert('Invalid template file format.');
                    }
                } catch (err) {
                    alert('Failed to parse template file.');
                }

                if (templateInputRef.current) {
                    templateInputRef.current.value = '';
                }
            };
            reader.readAsText(e.target.files[0]);
        }
    };

    return (
        <aside className="app-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Crop Modal */}
            {cropImageSrc && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '8px', maxWidth: '80%', maxHeight: '80%', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginTop: 0, color: 'white' }}>Crop Image</h3>
                        <div style={{ overflow: 'auto', flex: 1 }}>
                            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                                <img ref={imgRef} src={cropImageSrc} style={{ maxHeight: '60vh' }} />
                            </ReactCrop>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                            <button className="btn-ghost" onClick={() => {
                                setCropImageSrc(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                                if (bgFileInputRef.current) bgFileInputRef.current.value = '';
                                if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
                            }}>Cancel</button>
                            <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={handleCropComplete}>Apply Crop</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tools Section */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                    Tools & Workspace
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    <button className="btn-ghost" onClick={() => setShowGrid(!showGrid)} style={{ padding: '12px 8px', color: showGrid ? 'var(--primary)' : 'white', background: showGrid ? 'rgba(56, 189, 248, 0.1)' : 'transparent', border: `1px solid ${showGrid ? 'var(--primary)' : 'transparent'}` }}>
                        <Grid3X3 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        {showGrid ? 'Hide Grid' : 'Show Grid'}
                    </button>
                    <button className="btn-ghost" onClick={() => templateInputRef.current?.click()} style={{ padding: '12px 8px' }}>
                        <Upload size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Load Template
                    </button>
                    <input type="file" ref={templateInputRef} onChange={handleImportTemplate} accept=".json" style={{ display: 'none' }} />
                </div>

                <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                    Insert Layer
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button className="btn-ghost" onClick={handleAddText} style={{ flexDirection: 'column', padding: '16px 8px', gap: '8px' }}>
                        <Type size={20} color="var(--primary)" />
                        Text
                    </button>
                    <button className="btn-ghost" onClick={() => fileInputRef.current?.click()} style={{ flexDirection: 'column', padding: '16px 8px', gap: '8px' }}>
                        <ImageIcon size={20} color="var(--primary)" />
                        Image
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            {/* Properties Section */}
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                    Properties
                </h2>

                {!selectedElement ? (
                    // Canvas Properties
                    <div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Background Type</label>
                            <select
                                value={background.type}
                                onChange={e => setBackground({ ...background, type: e.target.value as any })}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}
                            >
                                <option value="color">Solid Color</option>
                                <option value="gradient">Gradient</option>
                                <option value="image">Image</option>
                            </select>

                            {background.type === 'color' && (
                                <>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Color</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="color"
                                            value={background.color || '#1e293b'}
                                            onChange={e => setBackground({ ...background, color: e.target.value })}
                                            style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                                        />
                                        <input
                                            type="text"
                                            value={background.color || '#1e293b'}
                                            onChange={e => setBackground({ ...background, color: e.target.value })}
                                            style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '0 8px', borderRadius: '4px', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                </>
                            )}

                            {background.type === 'gradient' && (
                                <>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Gradient Colors</label>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <input type="color" value={background.gradientColors?.[0] || '#ff0000'} onChange={e => setBackground({ ...background, gradientColors: [e.target.value, background.gradientColors?.[1] || '#0000ff'] })} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
                                        <input type="text" value={background.gradientColors?.[0] || '#ff0000'} onChange={e => setBackground({ ...background, gradientColors: [e.target.value, background.gradientColors?.[1] || '#0000ff'] })} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '0 8px', borderRadius: '4px', fontFamily: 'monospace' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                        <input type="color" value={background.gradientColors?.[1] || '#0000ff'} onChange={e => setBackground({ ...background, gradientColors: [background.gradientColors?.[0] || '#ff0000', e.target.value] })} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
                                        <input type="text" value={background.gradientColors?.[1] || '#0000ff'} onChange={e => setBackground({ ...background, gradientColors: [background.gradientColors?.[0] || '#ff0000', e.target.value] })} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '0 8px', borderRadius: '4px', fontFamily: 'monospace' }} />
                                    </div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Direction</label>
                                    <select value={background.gradientDirection || 'vertical'} onChange={e => setBackground({ ...background, gradientDirection: e.target.value as any })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px' }}>
                                        <option value="vertical">Vertical</option>
                                        <option value="horizontal">Horizontal</option>
                                    </select>
                                </>
                            )}

                            {background.type === 'image' && (
                                <>
                                    <button className="btn-primary" onClick={() => bgFileInputRef.current?.click()} style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
                                        Upload Background Image
                                    </button>
                                    <input type="file" ref={bgFileInputRef} onChange={handleBgImageUpload} accept="image/*" style={{ display: 'none' }} />
                                </>
                            )}
                        </div>

                        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                            <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                                Project Data
                            </h2>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                                Save your entire workspace layout, including all uploaded images, settings, and layer configurations as a reusable Template JSON file.
                            </p>
                            <button className="btn-primary" onClick={handleExportTemplate} style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Download size={16} /> Save as Template
                            </button>
                        </div>
                    </div>
                ) : (
                    // Element Properties
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {selectedElement.type === 'text' && (
                            <>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Text Content</label>
                                    <textarea
                                        value={(selectedElement as TextElement).text}
                                        onChange={e => updateElement(selectedElement.id, { text: e.target.value })}
                                        style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Fill Type</label>
                                    <select
                                        value={(selectedElement as TextElement).fillType || 'color'}
                                        onChange={e => updateElement(selectedElement.id, { fillType: e.target.value as any })}
                                        style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}
                                    >
                                        <option value="color">Solid Color</option>
                                        <option value="gradient">Gradient</option>
                                    </select>

                                    {(!((selectedElement as TextElement).fillType) || (selectedElement as TextElement).fillType === 'color') && (
                                        <>
                                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Color</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="color"
                                                    value={(selectedElement as TextElement).fill}
                                                    onChange={e => updateElement(selectedElement.id, { fill: e.target.value })}
                                                    style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                                                />
                                                <input
                                                    type="text"
                                                    value={(selectedElement as TextElement).fill}
                                                    onChange={e => updateElement(selectedElement.id, { fill: e.target.value })}
                                                    style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '0 8px', borderRadius: '4px', fontFamily: 'monospace' }}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {((selectedElement as TextElement).fillType === 'gradient') && (
                                        <>
                                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Gradient Colors</label>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                <input type="color" value={(selectedElement as TextElement).gradientColors?.[0] || '#ff0000'} onChange={e => updateElement(selectedElement.id, { gradientColors: [e.target.value, (selectedElement as TextElement).gradientColors?.[1] || '#0000ff'] })} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
                                                <input type="text" value={(selectedElement as TextElement).gradientColors?.[0] || '#ff0000'} onChange={e => updateElement(selectedElement.id, { gradientColors: [e.target.value, (selectedElement as TextElement).gradientColors?.[1] || '#0000ff'] })} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '0 8px', borderRadius: '4px', fontFamily: 'monospace' }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                                <input type="color" value={(selectedElement as TextElement).gradientColors?.[1] || '#0000ff'} onChange={e => updateElement(selectedElement.id, { gradientColors: [(selectedElement as TextElement).gradientColors?.[0] || '#ff0000', e.target.value] })} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
                                                <input type="text" value={(selectedElement as TextElement).gradientColors?.[1] || '#0000ff'} onChange={e => updateElement(selectedElement.id, { gradientColors: [(selectedElement as TextElement).gradientColors?.[0] || '#ff0000', e.target.value] })} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '0 8px', borderRadius: '4px', fontFamily: 'monospace' }} />
                                            </div>
                                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Direction</label>
                                            <select value={(selectedElement as TextElement).gradientDirection || 'vertical'} onChange={e => updateElement(selectedElement.id, { gradientDirection: e.target.value as any })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px' }}>
                                                <option value="vertical">Vertical</option>
                                                <option value="horizontal">Horizontal</option>
                                            </select>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Font Size</label>
                                    <input
                                        type="number"
                                        value={(selectedElement as TextElement).fontSize}
                                        onChange={e => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 20 })}
                                        style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px' }}
                                    />
                                </div>
                            </>
                        )}

                        {selectedElement.type === 'image' && (
                            <>
                                <div>
                                    <button
                                        className="btn-ghost"
                                        style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px dashed var(--border-color)', justifyContent: 'center' }}
                                        onClick={() => replaceFileInputRef.current?.click()}
                                    >
                                        <Upload size={16} /> Replace Image
                                    </button>
                                    <input type="file" ref={replaceFileInputRef} onChange={handleReplaceImageUpload} accept="image/*" style={{ display: 'none' }} />
                                </div>
                                {((selectedElement as ImageElement).frameType || 'none') === 'none' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Corner Radius</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={(selectedElement as ImageElement).cornerRadius || 0}
                                            onChange={e => updateElement(selectedElement.id, { cornerRadius: Math.max(0, parseInt(e.target.value) || 0) })}
                                            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Device Frame</label>
                                    <select
                                        value={(selectedElement as ImageElement).frameType || 'none'}
                                        onChange={e => updateElement(selectedElement.id, { frameType: e.target.value as any })}
                                        style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}
                                    >
                                        <option value="none">None</option>
                                        <option value="iphone">iPhone Mockup</option>
                                        <option value="pixel">Pixel Mockup</option>
                                    </select>
                                </div>
                                {((selectedElement as ImageElement).frameType || 'none') !== 'none' && (
                                    <>
                                        <div>
                                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                                <span>Frame Thickness</span>
                                                <span style={{ color: 'white', fontFamily: 'monospace' }}>{(selectedElement as ImageElement).frameThickness ?? 1}x</span>
                                            </label>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                                                <input
                                                    type="range"
                                                    min="0.1"
                                                    max="3"
                                                    step="0.1"
                                                    value={(selectedElement as ImageElement).frameThickness ?? 1}
                                                    onChange={e => updateElement(selectedElement.id, { frameThickness: parseFloat(e.target.value) })}
                                                    style={{ flex: 1 }}
                                                />
                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    max="3"
                                                    step="0.1"
                                                    value={(selectedElement as ImageElement).frameThickness ?? 1}
                                                    onChange={e => updateElement(selectedElement.id, { frameThickness: parseFloat(e.target.value) || 1 })}
                                                    style={{ width: '60px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {(selectedElement as ImageElement).frameType && (selectedElement as ImageElement).frameType !== 'none' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Frame Color</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="color"
                                                value={(selectedElement as ImageElement).frameColor || '#000000'}
                                                onChange={e => updateElement(selectedElement.id, { frameColor: e.target.value })}
                                                style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={(selectedElement as ImageElement).frameColor || '#000000'}
                                                onChange={e => updateElement(selectedElement.id, { frameColor: e.target.value })}
                                                style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '0 8px', borderRadius: '4px', fontFamily: 'monospace' }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {(selectedElement as ImageElement).frameType && (selectedElement as ImageElement).frameType !== 'none' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', marginTop: '16px' }}>Camera Cutout</label>
                                        <select
                                            value={(selectedElement as ImageElement).cameraCutout || 'none'}
                                            onChange={e => updateElement(selectedElement.id, { cameraCutout: e.target.value as any })}
                                            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}
                                        >
                                            <option value="none">None</option>
                                            {(selectedElement as ImageElement).frameType === 'iphone' && (
                                                <>
                                                    <option value="notch">Notch</option>
                                                    <option value="island">Dynamic Island</option>
                                                </>
                                            )}
                                            {(selectedElement as ImageElement).frameType === 'pixel' && (
                                                <option value="punchHole">Punch Hole</option>
                                            )}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            className="btn-ghost"
                            onClick={() => removeElement(selectedElement.id)}
                            style={{ marginTop: '16px', color: '#ef4444', justifyContent: 'center' }}
                        >
                            <Trash2 size={16} /> Delete Element
                        </button>
                    </div>
                )
                }
            </div >
        </aside >
    );
};

export default Sidebar;
