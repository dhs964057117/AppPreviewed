import React, { useRef, useEffect, useState } from 'react';
import { Text, Image as KonvaImage, Transformer } from 'react-konva';
import type { CanvasElement, TextElement, ImageElement } from '../types';

interface Props {
    element: CanvasElement;
    isSelected: boolean;
    onSelect: () => void;
    onChange: (newAttrs: Partial<CanvasElement>) => void;
}

const URLImage: React.FC<{ element: ImageElement, onSelect: () => void, onChange: any, shapeRef: any }> = ({ element, onSelect, onChange, shapeRef }) => {
    const [img, setImg] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const image = new window.Image();
        image.src = element.src;
        image.onload = () => {
            setImg(image);
        };
    }, [element.src]);

    return (
        <KonvaImage
            ref={shapeRef}
            image={img || undefined}
            x={element.x}
            y={element.y}
            scaleX={element.scaleX}
            scaleY={element.scaleY}
            rotation={element.rotation}
            draggable
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={(e) => {
                onChange({ x: e.target.x(), y: e.target.y() });
            }}
            onTransformEnd={() => {
                const node = shapeRef.current;
                if (!node) return;
                onChange({
                    x: node.x(),
                    y: node.y(),
                    scaleX: node.scaleX(),
                    scaleY: node.scaleY(),
                    rotation: node.rotation(),
                });
            }}
            cornerRadius={element.cornerRadius || 0}
        />
    );
};

export const CanvasElementRenderer: React.FC<Props> = ({ element, isSelected, onSelect, onChange }) => {
    const shapeRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const onDragEnd = (e: any) => {
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
                    onClick={onSelect}
                    onTap={onSelect}
                    draggable
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
