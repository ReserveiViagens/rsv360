"use client"

import { useDeviceDetection } from "@/hooks/use-device-detection"
import { Badge } from "@/components/ui/badge"

export function DeviceDebug() {
  const deviceInfo = useDeviceDetection()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs">
      <div className="font-bold mb-2">Device Debug</div>
      <div className="space-y-1">
        <div>Type: <Badge variant="outline" className="text-xs">{deviceInfo.type}</Badge></div>
        <div>Size: {deviceInfo.width}x{deviceInfo.height}</div>
        <div>Touch: {deviceInfo.isTouchDevice ? 'Yes' : 'No'}</div>
        <div>Landscape: {deviceInfo.isLandscape ? 'Yes' : 'No'}</div>
        <div>Mobile: {deviceInfo.isMobile ? 'Yes' : 'No'}</div>
        <div>Tablet: {deviceInfo.isTablet ? 'Yes' : 'No'}</div>
        <div>Desktop: {deviceInfo.isDesktop ? 'Yes' : 'No'}</div>
        <div>TV: {deviceInfo.isTV ? 'Yes' : 'No'}</div>
      </div>
    </div>
  )
}
