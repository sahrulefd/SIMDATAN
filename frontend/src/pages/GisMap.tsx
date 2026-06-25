import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Sprout, ShieldAlert, Layers } from 'lucide-react';

interface LahanMarker {
  id: number;
  kode_lahan: string;
  nama_lahan: string;
  luas_ha: number;
  latitude: number;
  longitude: number;
  pemilik: string;
  kelompok_tani: string;
  status_panen: string;
  komoditas: string;
  hasil_panen: number | null;
}

interface KecamatanItem {
  id: number;
  nama_kecamatan: string;
}

interface KomoditasItem {
  id: number;
  nama_komoditas: string;
}

export const GisMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  const [markersData, setMarkersData] = useState<LahanMarker[]>([]);
  const [kecamatans, setKecamatans] = useState<KecamatanItem[]>([]);
  const [komoditasList, setKomoditasList] = useState<KomoditasItem[]>([]);

  // Filter parameters
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('');
  const [selectedKomoditas, setSelectedKomoditas] = useState<string>('');
  const [viewMode, setViewMode] = useState<'marker' | 'heatmap'>('marker');

  // Load filter options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const kecRes = await api.get('/kecamatan');
        setKecamatans(kecRes.data.data || []);
        
        const komRes = await api.get('/komoditas');
        setKomoditasList(komRes.data.data || []);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch markers on parameters change
  const fetchMarkers = async () => {
    try {
      const url = `/lahan/map-markers?kecamatan_id=${selectedKecamatan}&komoditas_id=${selectedKomoditas}`;
      const response = await api.get(url);
      setMarkersData(response.data);
    } catch (err) {
      console.error('Error loading map markers:', err);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, [selectedKecamatan, selectedKomoditas]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Create Leaflet Map centered near Pekanbaru, Riau, Indonesia
      const map = L.map(mapRef.current).setView([0.507000, 101.447000], 11);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstance.current = map;
      markersLayer.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstance.current) {
        // cleanup on unmount
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Sync Markers to Leaflet Map
  useEffect(() => {
    const layerGroup = markersLayer.current;
    if (mapInstance.current && layerGroup) {
      // Clear existing markers
      layerGroup.clearLayers();

      markersData.forEach((item) => {
        // Determine pin colors based on crop phase
        let markerColor = '#10b981'; // Green (default)
        if (item.status_panen === 'Sedang Tanam') markerColor = '#3b82f6'; // Blue
        if (item.status_panen === 'Akan Panen') markerColor = '#eab308'; // Yellow
        if (item.status_panen === 'Gagal Panen') markerColor = '#ef4444'; // Red

        // Create a custom SVG marker
        const svgIcon = L.divIcon({
          html: `<div style="background-color: ${markerColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3)"></div>`,
          className: 'custom-leaflet-icon',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        // Popup content layout
        const popupHtml = `
          <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 180px;">
            <h5 style="margin: 0 0 4px; font-weight: bold; font-size: 13px; color: #1f2937;">${item.nama_lahan}</h5>
            <span style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Kode: ${item.kode_lahan}</span>
            <hr style="margin: 6px 0; border: 0; border-top: 1px solid #e5e7eb;" />
            <div style="font-size: 11px; color: #4b5563; line-height: 1.5;">
              <strong>Pemilik:</strong> ${item.pemilik}<br/>
              <strong>Kelompok:</strong> ${item.kelompok_tani}<br/>
              <strong>Luas:</strong> ${item.luas_ha} Ha<br/>
              <strong>Komoditas:</strong> ${item.komoditas}<br/>
              <strong>Status Tanam:</strong> <span style="color: ${markerColor}; font-weight: bold;">${item.status_panen}</span>
              ${item.hasil_panen ? `<br/><strong>Produksi:</strong> ${item.hasil_panen} Ton` : ''}
            </div>
          </div>
        `;

        const marker = L.marker([item.latitude, item.longitude], { icon: svgIcon })
          .bindPopup(popupHtml);

        layerGroup.addLayer(marker);
      });

      // Pan to first marker if available
      if (markersData.length > 0) {
        mapInstance.current.panTo([markersData[0].latitude, markersData[0].longitude]);
      }
    }
  }, [markersData]);

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* 1. Header and quick controls */}
      <div>
        <h1 className="font-heading font-bold text-3xl leading-none">Peta Sebaran GIS</h1>
        <p className="text-xs text-gray-400 mt-1">Pemetaan spasial lahan pertanian dan kelompok tani di wilayah Dinas.</p>
      </div>

      {/* 2. Map filters and workspace wrapper */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[500px]">
        
        {/* Left Drawer Filter Settings */}
        <div className="w-full lg:w-72 p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="font-heading font-bold text-lg border-b border-gray-100 dark:border-gray-850 pb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" /> Layer & Filter
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Filter Wilayah Kecamatan</label>
              <select
                value={selectedKecamatan}
                onChange={(e) => setSelectedKecamatan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Semua Kecamatan</option>
                {kecamatans.map(k => (
                  <option key={k.id} value={k.id}>{k.nama_kecamatan}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Filter Komoditas</label>
              <select
                value={selectedKomoditas}
                onChange={(e) => setSelectedKomoditas(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Semua Komoditas</option>
                {komoditasList.map(c => (
                  <option key={c.id} value={c.id}>{c.nama_komoditas}</option>
                ))}
              </select>
            </div>

            {/* Mode selection buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500">Mode Tampilan Spasial</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('marker')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${viewMode === 'marker' ? 'bg-primary border-primary text-white' : 'border-gray-200 dark:border-gray-800 text-gray-400'}`}
                >
                  Pin Markers
                </button>
                <button
                  onClick={() => setViewMode('heatmap')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${viewMode === 'heatmap' ? 'bg-primary border-primary text-white' : 'border-gray-200 dark:border-gray-800 text-gray-400'}`}
                >
                  Sebaran Lahan
                </button>
              </div>
            </div>

          </div>

          {/* Map Legends */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-6">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Legenda Status Tanam</h5>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10b981]" /> <span>Sudah Panen / Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3b82f6]" /> <span>Sedang Tanam</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#eab308]" /> <span>Akan Panen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]" /> <span>Gagal Panen (Incident)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Leaflet Map Drawing Area */}
        <div className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] p-2 relative overflow-hidden">
          <div ref={mapRef} className="w-full h-full min-h-[450px] relative z-10" />
        </div>

      </div>

    </div>
  );
};
