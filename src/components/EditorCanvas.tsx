import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { useEditorStore } from '../store/EditorContext';
import { CanvasElementRenderer } from './CanvasElementRenderer';

const EditorCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<any>(null);
    const { canvasSize, background, elements, selectedIds, setSelectedIds, clearSelection, updateElement } = useEditorStore();
    const [scale, setScale] = useState(1);

    // Responsive scaling to fit stage in container
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            const { clientWidth, clientHeight } = containerRef.current;
            const padding = 80;
            const availableWidth = clientWidth - padding;
            const availableHeight = clientHeight - padding;

            const scaleX = availableWidth / canvasSize.width;
            const scaleY = availableHeight / canvasSize.height;
            const newScale = Math.min(scaleX, scaleY);
            setScale(newScale);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [canvasSize.width, canvasSize.height]);

    useEffect(() => {
        const handleExport = () => {
            if (stageRef.current) {
                // Export at original resolution, overriding the CSS zoom scale
                const dataURL = stageRef.current.toDataURL({
                    pixelRatio: 1 / scale, // If scale is 0.5, pixelRatio needs to be 2 to get original size
                    mimeType: 'image/jpeg',
                    quality: 1,
                });

                const link = document.createElement('a');
                link.download = `store-promo-${Date.now()}.jpg`;
                link.href = dataURL;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };

        window.addEventListener('export-canvas', handleExport);
        return () => window.removeEventListener('export-canvas', handleExport);
    }, [scale]);

    const checkDeselect = (e: any) => {
        const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
        if (clickedOnEmpty) {
            clearSelection();
        }
    };

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
                style={{
                    width: canvasSize.width * scale,
                    height: canvasSize.height * scale,
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    borderRadius: '4px'
                }}
            >
                <Stage
                    ref={stageRef}
                    width={canvasSize.width * scale}
                    height={canvasSize.height * scale}
                    scaleX={scale}
                    scaleY={scale}
                    onMouseDown={checkDeselect}
                    onTouchStart={checkDeselect}
                >
                    <Layer>
                        {/* Background */}
                        <Rect
                            x={0}
                            y={0}
                            width={canvasSize.width}
                            height={canvasSize.height}
                            fill={background.type === 'color' ? background.color : '#ffffff'}
                            name="background"
                        />

                        {/* Elements */}
                        {elements.map(el => (
                            <CanvasElementRenderer
                                key={el.id}
                                element={el}
                                isSelected={selectedIds.includes(el.id)}
                                onSelect={() => setSelectedIds([el.id])}
                                onChange={(newAttrs) => updateElement(el.id, newAttrs)}
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
};

export default EditorCanvas;
