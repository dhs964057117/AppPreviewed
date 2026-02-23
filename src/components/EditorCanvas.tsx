import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line, Image as KonvaImage, Group } from 'react-konva';
import useImage from 'use-image';
import { useEditorStore } from '../store/EditorContext';
import { CanvasElementRenderer } from './CanvasElementRenderer';

const BackgroundImage: React.FC<{ src: string, width: number, height: number }> = ({ src, width, height }) => {
    const [image] = useImage(src);
    return <KonvaImage image={image} width={width} height={height} name="background" />;
};

const EditorCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<any>(null);
    const { canvasSize, background, elements, selectedIds, setSelectedIds, clearSelection, updateElement, showGrid } = useEditorStore();
    const [scale, setScale] = useState(1);
    const [guideLines, setGuideLines] = useState<{ id: string, points: number[], orientation: 'v' | 'h' }[]>([]);
    const [gridColor, setGridColor] = useState('rgba(255,255,255,0.15)');
    const [guideColor, setGuideColor] = useState('#ff0044');

    const GUIDELINE_OFFSET = 5;

    // Calculate smart contrast colors based on background
    useEffect(() => {
        if (background.type === 'color' && background.color) {
            const rgb = parseInt(background.color.slice(1), 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;
            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            if (luma < 128) {
                setGridColor('rgba(255,255,255,0.15)');
                setGuideColor('#ff0044');
            } else {
                setGridColor('rgba(0,0,0,0.15)');
                setGuideColor('#0055ff'); // Blue for light backgrounds
            }
        } else if (background.type === 'gradient' && background.gradientColors) {
            // Check first color for simplicity
            const rgb = parseInt(background.gradientColors[0].slice(1), 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;
            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            if (luma < 128) {
                setGridColor('rgba(255,255,255,0.15)');
                setGuideColor('#ff0044');
            } else {
                setGridColor('rgba(0,0,0,0.15)');
                setGuideColor('#0055ff');
            }
        } else {
            // Image background fallback: we can't easily read pixels synchronously in React State, 
            // so we stick to a high contrast shadow style or default to white grid with red lines.
            // But since image can be anything, dark lines with white shadow is best, though Konva lines don't do shadows well.
            // Let's stick to default dark mode styles for images as they are mostly photos.
            setGridColor('rgba(255,255,255,0.25)');
            setGuideColor('#ff0044');
        }
    }, [background]);

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
        const handleExport = (e: Event) => {
            const customEvent = e as CustomEvent;
            const format = customEvent.detail?.format || 'jpeg';

            if (stageRef.current) {
                try {
                    // Export at original resolution, overriding the CSS zoom scale
                    const canvas = stageRef.current.toCanvas({
                        pixelRatio: 1 / scale,
                    });

                    canvas.toBlob((blob: Blob | null) => {
                        if (!blob) {
                            alert('Export failed to generate image blob.');
                            return;
                        }
                        const blobUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.download = `store-promo-${Date.now()}.${format}`;
                        link.href = blobUrl;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                    }, `image/${format}`, 1);
                } catch (err) {
                    console.error('Export failed:', err);
                    alert('Export failed. The image might contain restricted cross-origin resources.');
                }
            }
        };

        window.addEventListener('export-canvas', handleExport);
        return () => window.removeEventListener('export-canvas', handleExport);
    }, [scale]);

    const handleDragMove = (e: any, id: string, isEnd: boolean = false) => {
        if (isEnd) {
            setGuideLines([]);
            return;
        }

        const node = e.target;
        const stage = node.getStage();

        // Exact bounding box of the dragging node in absolute viewport space
        const rawBox = node.getClientRect();

        // Convert to local unscaled stage space
        const box = {
            x: rawBox.x / scale,
            y: rawBox.y / scale,
            width: rawBox.width / scale,
            height: rawBox.height / scale
        };

        const stageWidth = canvasSize.width;
        const stageHeight = canvasSize.height;

        const newGuidelines: { id: string, points: number[], orientation: 'v' | 'h' }[] = [];

        let snappedV = false;
        let snappedH = false;

        // Collect all target x and y lines we might snap to
        const vLines = [
            { pos: stageWidth / 2, type: 'center' }
        ];
        const hLines = [
            { pos: stageHeight / 2, type: 'center' }
        ];

        // Add edge and center lines for all other elements
        elements.forEach(el => {
            if (el.id === id) return;
            const otherNode = stage.findOne('#' + el.id);
            if (!otherNode) return;

            const rawOtherBox = otherNode.getClientRect();
            const otherBox = {
                x: rawOtherBox.x / scale,
                y: rawOtherBox.y / scale,
                width: rawOtherBox.width / scale,
                height: rawOtherBox.height / scale
            };

            vLines.push(
                { pos: otherBox.x, type: 'edge' },
                { pos: otherBox.x + otherBox.width / 2, type: 'center' },
                { pos: otherBox.x + otherBox.width, type: 'edge' }
            );

            hLines.push(
                { pos: otherBox.y, type: 'edge' },
                { pos: otherBox.y + otherBox.height / 2, type: 'center' },
                { pos: otherBox.y + otherBox.height, type: 'edge' }
            );
        });

        // The dragging node can snap using its left, center, right OR top, middle, bottom
        const myEdgesV = [
            { pos: box.x, type: 'left' },
            { pos: box.x + box.width / 2, type: 'center' },
            { pos: box.x + box.width, type: 'right' }
        ];

        const myEdgesH = [
            { pos: box.y, type: 'top' },
            { pos: box.y + box.height / 2, type: 'center' },
            { pos: box.y + box.height, type: 'bottom' }
        ];

        // Find the best snap V
        for (const myEdge of myEdgesV) {
            if (snappedV) break;
            for (const targetLine of vLines) {
                if (Math.abs(myEdge.pos - targetLine.pos) < GUIDELINE_OFFSET) {
                    const shift = targetLine.pos - myEdge.pos;
                    node.x(node.x() + shift);
                    newGuidelines.push({ id: `v-snap-${targetLine.pos}`, points: [targetLine.pos, 0, targetLine.pos, stageHeight], orientation: 'v' });
                    snappedV = true;
                    break;
                }
            }
        }

        // Find the best snap H
        for (const myEdge of myEdgesH) {
            if (snappedH) break;
            for (const targetLine of hLines) {
                if (Math.abs(myEdge.pos - targetLine.pos) < GUIDELINE_OFFSET) {
                    const shift = targetLine.pos - myEdge.pos;
                    node.y(node.y() + shift);
                    newGuidelines.push({ id: `h-snap-${targetLine.pos}`, points: [0, targetLine.pos, stageWidth, targetLine.pos], orientation: 'h' });
                    snappedH = true;
                    break;
                }
            }
        }

        setGuideLines(newGuidelines);
    };

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
                        {background.type === 'image' && background.imageSrc ? (
                            <BackgroundImage src={background.imageSrc} width={canvasSize.width} height={canvasSize.height} />
                        ) : (
                            <Rect
                                x={0}
                                y={0}
                                width={canvasSize.width}
                                height={canvasSize.height}
                                fill={background.type === 'color' ? (background.color || '#ffffff') : undefined}
                                fillLinearGradientStartPoint={background.type === 'gradient' ? { x: 0, y: 0 } : undefined}
                                fillLinearGradientEndPoint={background.type === 'gradient' ? (background.gradientDirection === 'horizontal' ? { x: canvasSize.width, y: 0 } : { x: 0, y: canvasSize.height }) : undefined}
                                fillLinearGradientColorStops={background.type === 'gradient' && background.gradientColors ? [0, background.gradientColors[0], 1, background.gradientColors[1]] : undefined}
                                name="background"
                            />
                        )}

                        {/* Grid Guides */}
                        {showGrid && (
                            <Group name="guideline">
                                {/* Vertical Lines */}
                                {Array.from({ length: Math.ceil(canvasSize.width / 100) }).map((_, i) => (
                                    <Line
                                        key={`v-${i}`}
                                        points={[i * 100, 0, i * 100, canvasSize.height]}
                                        stroke={gridColor}
                                        strokeWidth={1}
                                    />
                                ))}
                                {/* Horizontal Lines */}
                                {Array.from({ length: Math.ceil(canvasSize.height / 100) }).map((_, i) => (
                                    <Line
                                        key={`h-${i}`}
                                        points={[0, i * 100, canvasSize.width, i * 100]}
                                        stroke={gridColor}
                                        strokeWidth={1}
                                    />
                                ))}
                            </Group>
                        )}

                        {/* Alignment Guides */}
                        {guideLines.map(guide => (
                            <Line
                                key={guide.id}
                                name="guideline"
                                points={guide.points}
                                stroke={guideColor}
                                strokeWidth={5}
                                dash={[4, 6]}
                            />
                        ))}

                        {/* Elements */}
                        {elements.map(el => (
                            <CanvasElementRenderer
                                key={el.id}
                                element={el}
                                isSelected={selectedIds.includes(el.id)}
                                onSelect={() => setSelectedIds([el.id])}
                                onChange={(newAttrs) => updateElement(el.id, newAttrs)}
                                onDragMove={(e, isEnd) => handleDragMove(e, el.id, isEnd)}
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
};

export default EditorCanvas;
