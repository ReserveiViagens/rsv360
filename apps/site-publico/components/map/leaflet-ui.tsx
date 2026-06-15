'use client';

import type { ComponentProps, ReactElement } from 'react';
import {
  MapContainer as MapContainerPrimitive,
  TileLayer as TileLayerPrimitive,
  Marker as MarkerPrimitive,
  Popup as PopupPrimitive,
} from 'react-leaflet';
import { asRadixComponent } from '@/lib/radix-jsx';

const MapContainerEl = asRadixComponent(MapContainerPrimitive);
const TileLayerEl = asRadixComponent(TileLayerPrimitive);
const MarkerEl = asRadixComponent(MarkerPrimitive);
const PopupEl = asRadixComponent(PopupPrimitive);

type MapContainerProps = ComponentProps<typeof MapContainerPrimitive>;
type TileLayerProps = ComponentProps<typeof TileLayerPrimitive>;
type MarkerProps = ComponentProps<typeof MarkerPrimitive>;
type PopupProps = ComponentProps<typeof PopupPrimitive>;

export function MapContainer(props: MapContainerProps): ReactElement {
  return <MapContainerEl {...props} />;
}

export function TileLayer(props: TileLayerProps): ReactElement {
  return <TileLayerEl {...props} />;
}

export function Marker(props: MarkerProps): ReactElement {
  return <MarkerEl {...props} />;
}

export function Popup(props: PopupProps): ReactElement {
  return <PopupEl {...props} />;
}
