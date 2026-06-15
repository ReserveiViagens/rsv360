'use client';

import type { FC } from 'react';
import {
  MapContainer as MapContainerPrimitive,
  TileLayer as TileLayerPrimitive,
  Marker as MarkerPrimitive,
  Popup as PopupPrimitive,
  type MapContainerProps,
  type TileLayerProps,
  type MarkerProps,
  type PopupProps,
} from 'react-leaflet';
import { radixCreate, radixUiExport } from '@/lib/radix-jsx';

export const MapContainer = radixUiExport(
  ((props: MapContainerProps) => radixCreate(MapContainerPrimitive, props)) as FC<MapContainerProps>
);

export const TileLayer = radixUiExport(
  ((props: TileLayerProps) => radixCreate(TileLayerPrimitive, props)) as FC<TileLayerProps>
);

export const Marker = radixUiExport(
  ((props: MarkerProps) => radixCreate(MarkerPrimitive, props)) as FC<MarkerProps>
);

export const Popup = radixUiExport(
  ((props: PopupProps) => radixCreate(PopupPrimitive, props)) as FC<PopupProps>
);
