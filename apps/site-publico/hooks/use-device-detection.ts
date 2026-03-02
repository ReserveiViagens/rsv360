"use client"

import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv'

export interface DeviceInfo {
  type: DeviceType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTV: boolean
  width: number
  height: number
  isTouchDevice: boolean
  isLandscape: boolean
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTV: false,
    width: 0,
    height: 0,
    isTouchDevice: false,
    isLandscape: false
  })

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isLandscape = width > height

      let type: DeviceType = 'desktop'
      let isMobile = false
      let isTablet = false
      let isDesktop = false
      let isTV = false

      if (width < 640) {
        type = 'mobile'
        isMobile = true
      } else if (width < 1024) {
        type = 'tablet'
        isTablet = true
      } else if (width < 1920) {
        type = 'desktop'
        isDesktop = true
      } else {
        type = 'tv'
        isTV = true
      }

      setDeviceInfo({
        type,
        isMobile,
        isTablet,
        isDesktop,
        isTV,
        width,
        height,
        isTouchDevice,
        isLandscape
      })
    }

    detectDevice()
    window.addEventListener('resize', detectDevice)
    return () => window.removeEventListener('resize', detectDevice)
  }, [])

  return deviceInfo
}
