export type ElementType = 'text' | 'image';

export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  align: 'left' | 'center' | 'right';
  fontStyle: 'normal' | 'italic' | 'bold' | 'italic bold';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string; // The data url or blob url
  cornerRadius: number;
}

export type CanvasElement = TextElement | ImageElement;

export interface BackgroundConfig {
  type: 'color' | 'gradient' | 'image';
  color?: string; // e.g., '#ffffff'
  gradientColors?: [string, string]; // e.g., ['#ff0000', '#0000ff']
  gradientDirection?: 'vertical' | 'horizontal';
  imageSrc?: string;
}

export interface PresetSize {
  name: string;
  width: number;
  height: number;
}

export const PRESET_SIZES: PresetSize[] = [
  { name: 'iPhone 6.7" (1290 x 2796)', width: 1290, height: 2796 },
  { name: 'iPhone 6.5" (1242 x 2688)', width: 1242, height: 2688 },
  { name: 'iPhone 5.5" (1242 x 2208)', width: 1242, height: 2208 },
  { name: 'iPad Pro 12.9" (2048 x 2732)', width: 2048, height: 2732 },
  { name: 'Android Phone (1080 x 1920)', width: 1080, height: 1920 },
  { name: 'Android Tablet 7" (1200 x 1920)', width: 1200, height: 1920 },
  { name: 'Android Tablet 10" (1600 x 2560)', width: 1600, height: 2560 },
];
