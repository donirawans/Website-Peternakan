import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { cattleAPI, transactionAPI } from './services/api';
import { getCattleImageUrl } from './utils/imageUrl';

function App() {
  const [cattleList, setCattleList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [farmSettings, setFarmSettings] = useState({});

  const loadCattleData = useCallback(async () => {
    try {
      const response = await cattleAPI.getAll({ status: 'all' });
      if (response.status === 200 && response.data) {
        // Map backend data to frontend format
        const mappedCattle = response.data.map(c => {
          // Parse media_urls (backend returns JSON string or array)
          let mediaUrls = [];
          if (c.media_urls) {
            if (Array.isArray(c.media_urls)) {
              mediaUrls = c.media_urls;
            } else if (typeof c.media_urls === 'string') {
              try {
                mediaUrls = JSON.parse(c.media_urls);
              } catch {
                mediaUrls = c.media_urls.split(',').filter(Boolean);
              }
            }
          }
          
          // Get primary image from media_urls or fallback to photo_url
          let primaryImage = getCattleImageUrl(mediaUrls.length ? mediaUrls : c.photo_url);
          
          return {
            id: c.ear_tag,  // Use ear_tag as display ID
            db_id: c.id,    // Keep database ID for API operations
            ear_tag: c.ear_tag,
            name: c.name,
            breed: c.breed || 'Unknown',
            gender: c.gender || 'Jantan',
            weight: c.weight || 0,
            age: c.age_phase || c.category || 'Unknown',
            price: c.price || 0,
            status: c.status || 'Tersedia',
            kondisi: c.kondisi || 'Kondisi Prima',
            category: c.category || 'Dewasa',
            age_phase: c.age_phase || '',
            feed_pattern: c.feed_pattern || 'Rumput Hijauan',
            care_notes: c.care_notes || 'Tidak ada catatan',
            media_urls: mediaUrls,
            images: mediaUrls.length ? mediaUrls : (c.images || (primaryImage ? [primaryImage] : [])),
            image: primaryImage,
          };
        });
        setCattleList(mappedCattle);
      }
    } catch (error) {
      console.error('Failed to load cattle data:', error);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    const isAuth = Boolean(token && token !== 'undefined' && token !== 'null' && token.trim() !== '');
    if (!isAuth) return; // skip admin call when not logged in

    try {
      const response = await transactionAPI.getAll();
      if (response.status === 200) {
        setTransactions(response.data || []);
        setTransactionSummary(response.summary || null);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }, []);

  useEffect(() => {
    loadCattleData();
    loadTransactions();
  }, [loadCattleData, loadTransactions]);

  const handleAddCattle = async (newCattle) => {
    try {
      // Payload matches backend CattleInputDTO exactly
      const cattleData = {
        ear_tag: newCattle.ear_tag,
        name: newCattle.name,
        breed: newCattle.breed || '',
        gender: newCattle.gender || 'Jantan',
        category: newCattle.category || 'Dewasa',
        age_phase: newCattle.age_phase || '',
        weight: Number(newCattle.weight) || 0,
        price: Number(newCattle.price) || 0,
        status: newCattle.status || 'Tersedia',
        feed_pattern: newCattle.feed_pattern || '',
        care_notes: newCattle.care_notes || '',
        media_urls: newCattle.media_urls || [],
      };
      
      const response = await cattleAPI.create(cattleData);
      if (response.status === 201) {
        await loadCattleData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add cattle:', error);
      alert('Gagal menambah sapi: ' + (error.response?.data?.message || error.message));
      return false;
    }
  };

  const handleEditCattle = async (updatedCattle) => {
    try {
      let targetId = updatedCattle.db_id || updatedCattle.id;
      if (!targetId || isNaN(Number(targetId))) {
        const response = await cattleAPI.getAllAdmin();
        const found = (response.data || []).find(c => c.ear_tag === updatedCattle.ear_tag || c.ear_tag === updatedCattle.id || c.id === targetId);
        if (found) targetId = found.id;
      }

      if (!targetId) {
        alert('Sapi tidak ditemukan di database');
        return false;
      }

      const cattleData = {
        ear_tag: updatedCattle.ear_tag || updatedCattle.id,
        name: updatedCattle.name,
        breed: updatedCattle.breed || '',
        gender: updatedCattle.gender || 'Jantan',
        category: updatedCattle.category || 'Dewasa',
        age_phase: updatedCattle.age_phase || updatedCattle.category || '',
        weight: Number(updatedCattle.weight) || 0,
        price: Number(updatedCattle.price) || 0,
        status: updatedCattle.status || 'Tersedia',
        feed_pattern: updatedCattle.feed_pattern || updatedCattle.pola_pakan || '',
        care_notes: updatedCattle.care_notes || updatedCattle.catatan || '',
        media_urls: updatedCattle.media_urls || [],
        images: updatedCattle.images || [],
        video_url: updatedCattle.video_url || null,
      };

      await cattleAPI.update(targetId, cattleData);
      await loadCattleData();
      return true;
    } catch (error) {
      console.error('Failed to update cattle:', error);
      alert('Gagal mengupdate sapi: ' + (error.response?.data?.message || error.message));
      return false;
    }
  };

  const handleDeleteCattle = async (targetIdOrEarTag) => {
    try {
      let targetId = targetIdOrEarTag;
      if (!targetId || isNaN(Number(targetId))) {
        const response = await cattleAPI.getAllAdmin();
        const found = (response.data || []).find(c => c.ear_tag === targetIdOrEarTag || c.id === targetIdOrEarTag);
        if (found) targetId = found.id;
      }

      if (!targetId) {
        alert('Sapi tidak ditemukan di database');
        return false;
      }

      await cattleAPI.delete(targetId);
      await loadCattleData();
      return true;
    } catch (error) {
      console.error('Failed to delete cattle:', error);
      alert('Gagal menghapus sapi: ' + (error.response?.data?.message || error.message));
      return false;
    }
  };

  const handleSaveSettings = (newSettings) => {
    setFarmSettings(newSettings);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTE PUBLIK - Bebas Akses Tanpa Proteksi */}
        <Route path="/" element={<LandingPage cattleList={cattleList} />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* RUTE ADMIN - Wajib Proteksi Token */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/admin/dashboard"
            element={
              <AdminDashboardPage
                cattleList={cattleList}
                onAddCattle={handleAddCattle}
                onEditCattle={handleEditCattle}
                onDeleteCattle={handleDeleteCattle}
                transactions={transactions}
                transactionSummary={transactionSummary}
                onTransactionChange={loadTransactions}
                farmSettings={farmSettings}
                onSaveSettings={handleSaveSettings}
              />
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Fallback jika route tidak ditemukan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
