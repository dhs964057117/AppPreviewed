import React, { useRef, useEffect, useState } from 'react';
import { Text, Image as KonvaImage, Transformer, Group, Rect } from 'react-konva';
import type { CanvasElement, TextElement, ImageElement } from '../types';

interface Props {
    element: CanvasElement;
    isSelected: boolean;
    onSelect: () => void;
    onChange: (newAttrs: Partial<CanvasElement>) => void;
    onDragMove?: (e: any, isEnd?: boolean) => void;
}

const URLImage: React.FC<{ element: ImageElement, onSelect: () => void, onChange: any, shapeRef: any, onDragMove?: any, onImageLoad?: () => void }> = ({ element, onSelect, onChange, shapeRef, onDragMove, onImageLoad }) => {
    const [img, setImg] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const image = new window.Image();
        image.src = element.src;
        image.onload = () => {
            setImg(image);
            if (onImageLoad) onImageLoad();
        };
    }, [element.src]);

    const contentWidth = img ? img.width * element.scaleX : 100;
    const contentHeight = img ? img.height * element.scaleY : 100;

    // Proportional dimensions for realistic phone mockups with adjustable thickness
    const thicknessMultiplier = typeof element.frameThickness === 'number' ? element.frameThickness : 1;
    const frameOffset = element.frameType && element.frameType !== 'none' ? Math.max(2, contentWidth * 0.04 * thicknessMultiplier) : 0;
    const outerWidth = contentWidth + frameOffset * 2;
    const outerHeight = contentHeight + frameOffset * 2;

    const renderFrame = () => {
        if (!element.frameType || element.frameType === 'none') {
            return (
                <KonvaImage
                    image={img || undefined}
                    width={contentWidth}
                    height={contentHeight}
                    cornerRadius={element.cornerRadius || 0}
                />
            );
        }

        const borderRadius = element.frameType === 'iphone' ? contentWidth * 0.14 : contentWidth * 0.1;
        const innerRadius = Math.max(0, borderRadius - frameOffset * 0.6);

        return (
            <Group>
                {/* Outer frame */}
                <Rect
                    width={outerWidth}
                    height={outerHeight}
                    fill={element.frameColor || '#000000'}
                    cornerRadius={borderRadius}
                />
                <KonvaImage
                    image={img || undefined}
                    x={frameOffset}
                    y={frameOffset}
                    width={contentWidth}
                    height={contentHeight}
                    cornerRadius={innerRadius}
                />
                {/* Camera Cutouts */}
                {element.cameraCutout === 'notch' && (
                    <Rect
                        x={outerWidth / 2 - (contentWidth * 0.45 * thicknessMultiplier) / 2}
                        y={frameOffset - 1} // overlaps with the frame slightly
                        width={contentWidth * 0.45 * thicknessMultiplier}
                        height={contentWidth * 0.09 * thicknessMultiplier}
                        fill="#000000"
                        cornerRadius={[0, 0, contentWidth * 0.03 * thicknessMultiplier, contentWidth * 0.03 * thicknessMultiplier]}
                    />
                )}
                {element.cameraCutout === 'island' && (
                    <Rect
                        x={outerWidth / 2 - (contentWidth * 0.32 * thicknessMultiplier) / 2}
                        y={frameOffset + contentWidth * 0.035 * thicknessMultiplier}
                        width={contentWidth * 0.32 * thicknessMultiplier}
                        height={contentWidth * 0.08 * thicknessMultiplier}
                        fill="#000000"
                        cornerRadius={contentWidth * 0.04 * thicknessMultiplier}
                    />
                )}
                {element.cameraCutout === 'punchHole' && (
                    <Rect
                        x={outerWidth / 2 - (contentWidth * 0.07 * thicknessMultiplier) / 2}
                        y={frameOffset + contentWidth * 0.04 * thicknessMultiplier}
                        width={contentWidth * 0.07 * thicknessMultiplier}
                        height={contentWidth * 0.07 * thicknessMultiplier}
                        fill="#000000"
                        cornerRadius={contentWidth * 0.035 * thicknessMultiplier}
                    />
                )}
            </Group>
        );
    };

    return (
        <Group
            id={element.id}
            ref={shapeRef}
            x={element.x}
            y={element.y}
            scaleX={element.frameType && element.frameType !== 'none' ? 1 : element.scaleX}
            scaleY={element.frameType && element.frameType !== 'none' ? 1 : element.scaleY}
            rotation={element.rotation}
            draggable
            onClick={onSelect}
            onTap={onSelect}
            onDragMove={onDragMove}
            onDragEnd={(e) => {
                if (onDragMove) onDragMove(e, true); // final clear
                onChange({ x: e.target.x(), y: e.target.y() });
            }}
            onTransformEnd={() => {
                const node = shapeRef.current;
                if (!node) return;

                // If it has a frame, we scale the internal image via scaleX/Y of the element, so the frame doesn't stretch weirdly
                // This requires a more complex layout engine we might approximate for now
                onChange({
                    x: node.x(),
                    y: node.y(),
                    scaleX: node.scaleX(),
                    scaleY: node.scaleY(),
                    rotation: node.rotation(),
                });
            }}
        >
            {renderFrame()}
        </Group>
    );
};

export const CanvasElementRenderer: React.FC<Props> = ({ element, isSelected, onSelect, onChange, onDragMove }) => {
    const shapeRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const onDragEnd = (e: any) => {
        if (onDragMove) onDragMove(e);
        onChange({
            x: e.target.x(),
            y: e.target.y(),
        });
    };

    const onTransformEnd = () => {
        const node = shapeRef.current;
        if (!node) return;
        onChange({
            x: node.x(),
            y: node.y(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            rotation: node.rotation(),
        });
    };

    return (
        <React.Fragment>
            {element.type === 'text' && (
                <Text
                    ref={shapeRef}
                    {...(element as TextElement)}
                    fill={(element as TextElement).fillType === 'gradient' ? undefined : (element as TextElement).fill}
                    fillLinearGradientStartPoint={(element as TextElement).fillType === 'gradient' ? { x: 0, y: 0 } : undefined}
                    fillLinearGradientEndPoint={(element as TextElement).fillType === 'gradient' ? ((element as TextElement).gradientDirection === 'horizontal' ? { x: (element as TextElement).text.length * (element as TextElement).fontSize * 0.6, y: 0 } : { x: 0, y: (element as TextElement).fontSize }) : undefined}
                    fillLinearGradientColorStops={(element as TextElement).fillType === 'gradient' ? [0, (element as TextElement).gradientColors?.[0] || '#ff0000', 1, (element as TextElement).gradientColors?.[1] || '#0000ff'] : undefined}
                    onClick={onSelect}
                    onTap={onSelect}
                    draggable
                    onDragMove={onDragMove}
                    onDragEnd={onDragEnd}
                    onTransformEnd={onTransformEnd}
                />
            )}

            {element.type === 'image' && (
                <URLImage
                    element={element as ImageElement}
                    onSelect={onSelect}
                    onChange={onChange}
                    shapeRef={shapeRef}
                    onDragMove={onDragMove}
                    onImageLoad={() => {
                        if (isSelected && trRef.current) {
                            trRef.current.getLayer()?.batchDraw();
                            trRef.current.forceUpdate();
                        }
                    }}
                />
            )}

            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < 5 || newBox.height < 5) return oldBox;
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
};
