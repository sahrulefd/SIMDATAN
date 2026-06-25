import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { 
  Map, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Sprout, 
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { value: '50+', label: 'Kelompok Tani Terbina', icon: Users },
    { value: '100+', label: 'Lahan Terpetakan GIS', icon: Map },
    { value: '10', label: 'Wilayah Kecamatan Binaan', icon: Building },
    { value: '99.9%', label: 'SLA Validitas Data', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* 1. Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="SIMDATAN Logo" className="h-11 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#beranda" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Beranda</a>
            <a href="#statistik" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Statistik</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              to={token ? "/dashboard" : "/login"}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-sm transition-all shadow-md shadow-primary/10 flex items-center gap-2 hover:shadow-lg cursor-pointer"
            >
              Masuk Sistem
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Spacer */}
      <div id="beranda" className="pt-20"></div>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-36 bg-gradient-to-b from-primary/5 via-white to-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-wider text-primary animate-pulse">
            <Sprout className="w-3.5 h-3.5" /> Portal Pertanian Terpadu
          </div>
          
          <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-primary leading-tight max-w-4xl mx-auto">
            Transformasi Digital Informasi Pertanian Daerah
          </h1>
          
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            SIMDATAN menyajikan portal informasi terpadu Dinas Pertanian untuk koordinasi spasial lahan, pemantauan kapasitas kelompok tani, dan estimasi data panen daerah secara akurat.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to={token ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-sm shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
            >
              Masuk ke Sistem
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#statistik"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              Lihat Statistik
            </a>
          </div>
        </div>
      </section>

      {/* 3. Statistik Section */}
      <section id="statistik" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Metrik Basis Data</span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary">Informasi & Statistik Sistem</h2>
            <div className="w-12 h-1 bg-amber-500 mx-auto rounded-full"></div>
            <p className="text-sm text-gray-500 pt-2">
              Gambaran sebaran basis data spasial dan kuantitatif pertanian daerah yang aktif terintegrasi saat ini.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div 
                key={i}
                className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center space-y-3 hover:scale-[1.03] transition-transform duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="font-heading font-extrabold text-3xl text-primary">{stat.value}</div>
                  <div className="text-xs font-semibold text-gray-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="bg-primary text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
          <div className="space-y-6">
            <div className="flex items-center">
              <img src={logo} alt="SIMDATAN Logo" className="h-12 w-auto object-contain bg-white p-2.5 rounded-xl shadow-sm border border-white/10" />
            </div>
            <p className="text-xs text-white/60 leading-relaxed max-w-sm">
              Sistem Informasi Manajemen Data Pertanian terintegrasi berbasis koordinat GIS spasial untuk mengamankan data komoditas pangan daerah.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="font-heading font-bold text-sm tracking-widest uppercase text-amber-500">Tautan Pintar</h4>
            <ul className="space-y-3 text-xs text-white/70">
              <li><a href="#beranda" className="hover:text-white transition-colors">Beranda</a></li>
              <li><a href="#statistik" className="hover:text-white transition-colors">Statistik Sistem</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-heading font-bold text-sm tracking-widest uppercase text-amber-500">Kantor Dinas</h4>
            <ul className="space-y-3 text-xs text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Jl. Jenderal Sudirman No. 45, Kompleks Perkantoran Pemda</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>021-5551234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>info@simdatan.go.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <span>&copy; 2026 Dinas Pertanian. All rights reserved.</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-amber-500" /> Enterprise Grade Security Encryption</span>
        </div>
      </footer>

    </div>
  );
};
