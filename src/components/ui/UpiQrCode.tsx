/**
 * UpiQrCode.tsx
 * Generates a real, scannable QR code using:
 *  - `qrcode` npm package  (pure CJS, already installed, produces the correct matrix)
 *  - `react-native-svg`    (already installed, renders the matrix as SVG rects)
 *
 * No Metro resolution issues — both packages are plain CJS.
 */

import React, { useMemo } from 'react';
import Svg, { Rect, G } from 'react-native-svg';
// qrcode is a pure-JS CJS package — Metro resolves it fine
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QRCodeLib = require('qrcode');

interface Props {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
}

export default function UpiQrCode({
  value,
  size = 200,
  backgroundColor = '#FFFFFF',
  color = '#000000',
}: Props) {
  const modules = useMemo(() => {
    if (!value) return null;
    try {
      // qrcode.create() is synchronous and returns a data object whose
      // .modules is a BitMatrix: .size × .size grid accessible via .get(row, col)
      const qr = QRCodeLib.create(value, { errorCorrectionLevel: 'M' });
      const size = qr.modules.size;
      const data = qr.modules.data as Uint8Array; // row-major flat array
      return { size, data };
    } catch (e) {
      console.warn('[UpiQrCode] Failed to generate QR:', e);
      return null;
    }
  }, [value]);

  if (!modules) return null;

  const { size: moduleCount, data } = modules;
  const cellSize = size / moduleCount;

  const cells: { row: number; col: number }[] = [];
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (data[r * moduleCount + c]) {
        cells.push({ row: r, col: c });
      }
    }
  }

  return (
    <Svg width={size} height={size}>
      {/* White background */}
      <Rect x={0} y={0} width={size} height={size} fill={backgroundColor} />
      {/* Dark modules */}
      <G>
        {cells.map(({ row, col }) => (
          <Rect
            key={`${row}-${col}`}
            x={col * cellSize}
            y={row * cellSize}
            width={cellSize}
            height={cellSize}
            fill={color}
          />
        ))}
      </G>
    </Svg>
  );
}
