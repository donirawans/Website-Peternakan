import BullLogo from './BullLogo';
import { useState, useEffect, useCallback } from 'react';
import { farmSettingAPI } from '../services/api';

const Footer = () => {
  const [farmSettings, setFarmSettings] = useState({});

  const loadFarmSettings = useCallback(async () => {
    try {
      const response = await farmSettingAPI.getPublic();
      if (response.status === 200 && response.data) {
        setFarmSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to load farm settings:', error);
    }
  }, []);

  useEffect(() => {
    loadFarmSettings();
  }, [loadFarmSettings]);

  return (
    <footer className="bg-surface-container border-t border-outline-variant/30 mt-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
        {/* Brand & Info */}
        <div className="flex flex-col gap-4">
          <a href="#" className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
            <BullLogo size={36} color="#2D6A4F" />
            {farmSettings?.farm_name || 'KANDAS'}
          </a>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
            {farmSettings?.description || 'Pusat penyediaan sapi bakalan dan qurban berkualitas dengan perawatan tradisional yang modern.'}
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-2">
            Quick Links
          </h4>
          <a href="#lokasi" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary hover:opacity-80 transition-all duration-200">
            Alamat Kandang
          </a>
          {farmSettings?.google_maps_url && (
            <a href={farmSettings.google_maps_url} target="_blank" rel="noopener noreferrer" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary hover:opacity-80 transition-all duration-200">
              Google Maps
            </a>
          )}
          {farmSettings?.whatsapp_number && (
            <a href={`https://wa.me/${farmSettings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary hover:opacity-80 transition-all duration-200">
              WhatsApp Admin
            </a>
          )}
        </div>

        {/* Location Card */}
        <div id="kontak" className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-2">
            Our Location
          </h4>
          <div className="bg-surface rounded-xl p-4 border border-outline-variant/30 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <div>
              <p className="font-body-md text-body-md text-on-surface mb-2">
                {farmSettings?.address || 'Jl. Peternakan Makmur No. 123, Desa Sukamaju, Kab. Agrikultura.'}
              </p>
              {farmSettings?.google_maps_url && (
                <a href={farmSettings.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-primary font-label-sm text-label-sm flex items-center gap-1 hover:underline">
                  Buka di Google Maps
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-outline-variant/20 py-6 px-margin-mobile md:px-margin-desktop text-center">
        <p className="font-body-md text-body-md text-secondary">
          © 2026 {farmSettings?.farm_name || 'KANDAS - Kandang Dastro'}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
