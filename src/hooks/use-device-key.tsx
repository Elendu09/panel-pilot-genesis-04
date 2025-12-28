import { useState, useEffect } from 'react';

export type DeviceKey = 'mobile' | 'tablet' | 'desktop';

export interface DeviceLayoutSettings {
  mobile: string;
  tablet: string;
  desktop: string;
}

export interface DeviceBooleanSettings {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
}

export function useDeviceKey(): DeviceKey {
  const [deviceKey, setDeviceKey] = useState<DeviceKey>('desktop');

  useEffect(() => {
    const updateDeviceKey = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceKey('mobile');
      } else if (width < 1024) {
        setDeviceKey('tablet');
      } else {
        setDeviceKey('desktop');
      }
    };

    updateDeviceKey();
    window.addEventListener('resize', updateDeviceKey);
    return () => window.removeEventListener('resize', updateDeviceKey);
  }, []);

  return deviceKey;
}

// Default device layout settings
export const defaultHeroDeviceLayout: DeviceLayoutSettings = {
  mobile: 'stacked',
  tablet: 'stacked',
  desktop: 'split',
};

export const defaultHeroShowFloatingCards: DeviceBooleanSettings = {
  mobile: false,
  tablet: true,
  desktop: true,
};

export const defaultHeroShowCategories: DeviceBooleanSettings = {
  mobile: true,
  tablet: true,
  desktop: true,
};

export const defaultFaqDeviceLayout: DeviceLayoutSettings = {
  mobile: 'accordion',
  tablet: 'accordion',
  desktop: 'grid',
};

export const defaultFaqCompactMode: DeviceBooleanSettings = {
  mobile: true,
  tablet: false,
  desktop: false,
};
