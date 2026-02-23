import React, { useRef } from 'react';
import { Type, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useEditorStore } from '../store/EditorContext';
import { v4 as uuidv4 } from 'uuid';
import type { TextElement, ImageElement } from '../types';

const Sidebar: React.FC = () => {
    const {
        addElement, selectedIds, elements, updateElement, removeElement,
        background, setBackground
    } = useEditorStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            const file = e.target.files[0];
            reader.onload = (event) => {
                if (event.target?.result) {
                    const imgEl: ImageElement = {
                        id: uuidv4(),
                        type: 'image',
                        name: file.name,
                        src: event.target.result as string,
                        x: 50,
                        y: 50,
                        rotation: 0,
                        scaleX: 1,
                        scaleY: 1,
                        cornerRadius: 16,
                        zIndex: elements.length,
                    };
                    addElement(imgEl);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <aside className="app-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tools Section */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                    Insert
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
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Background Color</label>
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
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Color</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="color"
                                            value={(selectedElement as TextElement).fill}
                                            onChange={e => updateElement(selectedElement.id, { fill: e.target.value })}
                                            style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                                        />
                                    </div>
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
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Corner Radius</label>
                                <input
                                    type="number"
                                    value={(selectedElement as ImageElement).cornerRadius || 0}
                                    onChange={e => updateElement(selectedElement.id, { cornerRadius: parseInt(e.target.value) || 0 })}
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px' }}
                                />
                            </div>
                        )}

                        <button
                            className="btn-ghost"
                            onClick={() => removeElement(selectedElement.id)}
                            style={{ marginTop: '16px', color: '#ef4444', justifyContent: 'center' }}
                        >
                            <Trash2 size={16} /> Delete Element
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
