import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, User, CheckCircle, XCircle, AlertCircle, ArrowLeft, Car, Truck, Monitor, Bike } from 'lucide-react';

const TARGET_DATE = new Date('2026-07-02T07:00:00+07:00').getTime();

export default function StudentPortal() {
  const [noPendaftaran, setNoPendaftaran] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (result) {
      setNow(Date.now());
      const interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [result]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noPendaftaran, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult(data.student);
      } else {
        setError(data.error || 'Terjadi kesalahan saat login.');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setResult(null);
    setNoPendaftaran('');
    setPassword('');
    setError('');
  };

  const renderResult = () => {
    const status = result.status.toLowerCase();
    
    let config = {
      icon: <CheckCircle className="w-16 h-16 text-green-500 mb-4 mx-auto" />,
      color: 'bg-green-50 border-green-200 text-green-800',
      title: 'SELAMAT! ANDA DITERIMA',
    };

    if (status.includes('tidak')) {
      config = {
        icon: <XCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />,
        color: 'bg-red-50 border-red-200 text-red-800',
        title: 'MOHON MAAF, ANDA TIDAK DITERIMA',
      };
    } else if (status.includes('cadangan')) {
      config = {
        icon: <AlertCircle className="w-16 h-16 text-yellow-500 mb-4 mx-auto" />,
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        title: 'ANDA MASUK DAFTAR CADANGAN',
      };
    }

    const isTimeUp = now >= TARGET_DATE;
    const distance = Math.max(0, TARGET_DATE - now);
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-blue-900 p-6 text-center text-white">
            <h2 className="text-2xl font-bold tracking-tight">Hasil Seleksi SPMB 2026</h2>
            <p className="text-blue-200 mt-1">SMK Muhammadiyah 1 Randublatung</p>
          </div>
          
          <div className="p-8">
            {!isTimeUp ? (
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pengumuman Belum Dibuka</h3>
                <p className="text-gray-500 mb-8">Hasil seleksi akan diumumkan pada 2 Juli 2026 pukul 07.00 WIB.</p>
                
                <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mb-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-900">{days}</div>
                    <div className="text-[10px] sm:text-xs text-blue-600 font-medium uppercase mt-1">Hari</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-900">{hours.toString().padStart(2, '0')}</div>
                    <div className="text-[10px] sm:text-xs text-blue-600 font-medium uppercase mt-1">Jam</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-900">{minutes.toString().padStart(2, '0')}</div>
                    <div className="text-[10px] sm:text-xs text-blue-600 font-medium uppercase mt-1">Menit</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-900">{seconds.toString().padStart(2, '0')}</div>
                    <div className="text-[10px] sm:text-xs text-blue-600 font-medium uppercase mt-1">Detik</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mt-6 inline-block text-left text-sm w-full max-w-sm">
                  <div className="mb-2"><span className="text-gray-500 mr-2">No. Pendaftaran:</span> <span className="font-semibold text-gray-900">{result.noPendaftaran}</span></div>
                  <div className="mb-2"><span className="text-gray-500 mr-2">Nama Lengkap:</span> <span className="font-semibold text-gray-900">{result.nama}</span></div>
                  <div><span className="text-gray-500 mr-2">Program Keahlian:</span> <span className="font-semibold text-gray-900">{result.programKeahlian || '-'}</span></div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="grid grid-cols-3 gap-2 text-left">
                      <div className="text-gray-500 text-sm font-medium col-span-1">No Pendaftaran</div>
                      <div className="font-semibold text-gray-900 col-span-2">: {result.noPendaftaran}</div>
                      
                      <div className="text-gray-500 text-sm font-medium col-span-1">Nama Lengkap</div>
                      <div className="font-semibold text-gray-900 col-span-2">: {result.nama}</div>
                      
                      <div className="text-gray-500 text-sm font-medium col-span-1">Program Keahlian</div>
                      <div className="font-semibold text-gray-900 col-span-2">: {result.programKeahlian || '-'}</div>

                      <div className="text-gray-500 text-sm font-medium col-span-1">Status</div>
                      <div className="font-semibold text-gray-900 col-span-2">: {result.status}</div>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-xl border text-center ${config.color}`}>
                  {config.icon}
                  <h4 className="font-bold text-lg">{config.title}</h4>
                </div>

                <p className="text-sm text-center text-gray-500 mt-6 italic">
                  *Jika ingin merubah jurusan hubungi admin SPMB
                </p>
              </>
            )}
          </div>

          <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Login
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderLogin = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-8 text-center text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <GraduationCap className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="mx-auto w-24 h-24 mb-4">
              <img 
                src="/logo.png" 
                alt="Logo SMK Muhammadiyah 1 Randublatung" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback if logo.png is not found
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://placehold.co/100x100/1e3a8a/ffffff?text=SMK';
                }}
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">SPMB 2026</h1>
            <p className="text-blue-200 font-medium text-sm">
              SMK Muhammadiyah 1 Randublatung
            </p>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Cek Status Pendaftaran
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                No. Pendaftaran
              </label>
              <input
                type="text"
                required
                value={noPendaftaran}
                onChange={(e) => setNoPendaftaran(e.target.value)}
                placeholder="Masukkan nomor pendaftaran"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold text-lg py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <span className="w-6 h-6 border-2 border-blue-950/30 border-t-blue-950 rounded-full animate-spin"></span>
              ) : (
                'Lihat Hasil'
              )}
            </button>
          </form>
        </div>
        
        <div className="text-center pb-6">
          <a href="/admin" className="text-xs text-gray-400 hover:text-blue-500 transition-colors">
            Admin Portal
          </a>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden"
         style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      
      {/* Animated Background Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => {
          const Icon = [Monitor, Truck, Car, Bike][i % 4];
          return (
            <motion.div
              key={i}
              className="absolute text-blue-900/10"
              initial={{
                y: Math.random() * window.innerHeight,
                x: Math.random() * window.innerWidth,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                x: [null, Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                opacity: [0, 0.5, 0],
                rotate: 360,
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Icon size={48 + Math.random() * 48} />
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {result ? renderResult() : renderLogin()}
      </AnimatePresence>
    </div>
  );
}
