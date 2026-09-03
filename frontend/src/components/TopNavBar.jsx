import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BullLogo from './BullLogo';
import { farmSettingAPI } from '../services/api';

const TopNavBar = ({ activeNav: externalActiveNav, onNavChange }) => {
  const [internalActiveNav, setInternalActiveNav] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [farmSettings, setFarmSettings] = useState({});

  const currentNav = externalActiveNav || internalActiveNav;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await farmSettingAPI.getPublic();
        if (response.status === 200 && response.data) {
          setFarmSettings(response.data);
        }
      } catch (err) {
        console.error('Failed to load farm settings:', err);
      }
    };
    loadSettings();
  }, []);

  const navLinks = [
    { label: 'Katalog Sapi', targetId: 'katalog', key: 'katalog' },
    { label: 'Tentang Kandang', targetId: 'tentang', key: 'tentang' },
    { label: 'Lokasi Kandang', targetId: 'lokasi', key: 'lokasi' },
    { label: 'Kontak', targetId: 'kontak', key: 'kontak' },
  ];

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onNavChange) {
      onNavChange('katalog');
    } else {
      setInternalActiveNav('katalog');
    }
    setMobileOpen(false);
  };

  const handleNavClick = (e, key, targetId) => {
    e.preventDefault();
    if (onNavChange) {
      onNavChange(key);
    } else {
      setInternalActiveNav(key);
    }
    setMobileOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      if (targetId === 'lokasi') {
        const navbarHeight = 80;
        const availableHeight = window.innerHeight - navbarHeight;
        const elementHeight = element.offsetHeight;
        const verticalMargin = Math.max((availableHeight - elementHeight) / 2, 20);
        const targetScrollY = element.getBoundingClientRect().top + window.pageYOffset - (navbarHeight + verticalMargin);

        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
      } else {
        const navOffset = 75;
        const elementPosition = element.getBoundingClientRect().top;
        window.scrollTo({ top: elementPosition + window.pageYOffset - navOffset, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + 200;
          const lokasiEl = document.getElementById('lokasi');
          const tentangEl = document.getElementById('tentang');
          const katalogEl = document.getElementById('katalog');
          const kontakEl = document.getElementById('kontak');

          const nearBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 80;

          let newNav = '';
          if (nearBottom || (kontakEl && scrollPos >= kontakEl.offsetTop)) {
            newNav = 'kontak';
          } else if (lokasiEl && scrollPos >= lokasiEl.offsetTop) {
            newNav = 'lokasi';
          } else if (tentangEl && scrollPos >= tentangEl.offsetTop) {
            newNav = 'tentang';
          } else if (katalogEl && scrollPos >= katalogEl.offsetTop) {
            newNav = 'katalog';
          }
          
          if (newNav !== currentNav) {
            if (onNavChange) onNavChange(newNav);
            else setInternalActiveNav(newNav);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onNavChange, currentNav]);

  const waNumber = farmSettings?.whatsapp_number || '6281234567890';

  return (
    <nav className="fixed left-0 right-0 top-0 w-full z-50 bg-surface/90 border-b border-primary/10 backdrop-blur-md transition-all duration-200">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-3 md:py-4">
        <Link to="/" onClick={handleLogoClick} className="font-display-lg font-bold flex items-center gap-3 group cursor-pointer select-none">
          <BullLogo size={56} className="w-14 h-14 transition-transform group-hover:scale-105" />
          <div className="flex flex-col items-start leading-none">
            <span className="text-[26px] md:text-[28px] font-bold text-[#2D6A4F] leading-none">{farmSettings?.farm_name || 'KANDAS'}</span>
            <span className="text-[11px] font-normal tracking-wider uppercase opacity-70 leading-none mt-0.5 text-slate-600">{farmSettings?.tagline || 'Kandang Dastro'}</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.key} href={`#${link.targetId}`} onClick={(e) => handleNavClick(e, link.key, link.targetId)} className={`text-[15px] py-1.5 transition-all duration-200 ${currentNav === link.key ? 'text-[#2D6A4F] font-bold border-b-2 border-[#2D6A4F]' : 'text-slate-600 font-medium hover:text-emerald-800'}`}>
              {link.label}
            </a>
          ))}
        </div>
        <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 bg-[#2D6A4F] text-white font-label-md text-label-md px-6 py-2.5 rounded-full hover:bg-[#23533e] transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 font-bold">
          <span className="material-symbols-outlined text-sm">chat</span>
          Hubungi Penjual
        </a>
        <button className="md:hidden text-[#2D6A4F] p-2 focus:outline-none" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle mobile menu">
          <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-outline-variant/20 px-6 py-4 flex flex-col gap-3 animate-fade-in shadow-lg">
          {navLinks.map((link) => (
            <a key={link.key} href={`#${link.targetId}`} onClick={(e) => handleNavClick(e, link.key, link.targetId)} className={`py-2 px-3 rounded-lg text-[15px] transition-colors ${currentNav === link.key ? 'bg-emerald-50 text-[#2D6A4F] font-bold border-l-4 border-[#2D6A4F]' : 'text-slate-600 font-medium hover:text-emerald-800 hover:bg-slate-50'}`}>
              {link.label}
            </a>
          ))}
          <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="mt-2 bg-[#2D6A4F] text-white font-label-md px-6 py-2.5 rounded-full hover:bg-[#23533e] transition-all flex items-center justify-center gap-2 font-bold">
            <span className="material-symbols-outlined text-sm">chat</span>
            Hubungi Penjual
          </a>
        </div>
      )}
    </nav>
  );
};

export default TopNavBar;
