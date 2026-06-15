'use client';

import type { ComponentProps, ReactElement } from 'react';
import {
  MapContainer as MapContainerPrimitive,
  TileLayer as TileLayerPrimitive,
  Marker as MarkerPrimitive,
  Popup as PopupPrimitive,
} from 'react-leaflet';
import { radixCreate } from '@/lib/radix-jsx';

type MapContainerProps = ComponentProps<typeof MapContainerPrimitive>;
type TileLayerProps = ComponentProps<typeof TileLayerPrimitive>;
type MarkerProps = ComponentProps<typeof MarkerPrimitive>;
type PopupProps = ComponentProps<typeof PopupPrimitive>;

export function MapContainer(props: MapContainerProps): ReactElement {
  return radixCreate(MapContainerPrimitive, props) as ReactElement;
}

export function TileLayer(props: TileLayerProps): ReactElement {
  return radixCreate(TileLayerPrimitive, props) as ReactElement;
}

export function Marker(props: MarkerProps): ReactElement {
  return radixCreate(MarkerPrimitive, props) as ReactElement;
}

export function Popup(props: PopupProps): ReactElement {
  return radixCreate(PopupPrimitive, props) as ReactElement;
}
