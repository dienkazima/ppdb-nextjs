"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Loader2 } from "lucide-react";
import Footer from "@/app/components/Footer";

interface Gallery {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
}

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/galeri");
        const data = await res.json();
        if (Array.isArray(data)) {
          setGalleryImages(data);
        } else {
          setGalleryImages([]);
        }
      } catch (error) {
        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = "auto";
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null && galleryImages.length > 0) {
      setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null && galleryImages.length > 0) {
      setSelectedImageIndex((selectedImageIndex - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null || galleryImages.length === 0) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length);
      if (e.key === "ArrowLeft") setSelectedImageIndex((selectedImageIndex - 1 + galleryImages.length) % galleryImages.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, galleryImages.length]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* HEADER SECTION */}
      <section className="bg-green-700 text-white py-14 sm:py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto relative z-10 text-center"
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 drop-shadow-md leading-tight">
            Galeri Kegiatan &amp; Fasilitas
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-green-100 max-w-2xl mx-auto">
            Jelajahi momen-momen berharga, fasilitas unggulan, dan ragam kegiatan edukatif di Yayasan Jamaluddin Suralaga.
          </p>
        </motion.div>
      </section>

      {/* GALLERY GRID */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-grow relative -mt-6 sm:-mt-10 z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
            <Loader2 className="animate-spin text-green-600 mb-4" size={44} />
            <p className="text-slate-500 font-semibold text-sm sm:text-base">Memuat koleksi foto...</p>
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 text-center px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <ZoomIn size={36} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-700 mb-2">Galeri Masih Kosong</h2>
            <p className="text-slate-500 max-w-md text-sm sm:text-base">Foto-foto kegiatan dan fasilitas akan segera ditambahkan oleh Admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {galleryImages.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index % 10) * 0.08 }}
                whileHover={{ y: -5 }}
                className="group relative cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border-4 border-white bg-white"
                onClick={() => openLightbox(index)}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-400">
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out absolute inset-0"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                    }}
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6">
                    <span className="text-green-400 font-bold text-[10px] sm:text-xs uppercase tracking-wider mb-1">{img.category}</span>
                    <h3 className="text-white font-semibold text-base sm:text-lg drop-shadow-sm line-clamp-2">{img.title}</h3>
                  </div>

                  {/* Hover Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-2.5 sm:p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                    <ZoomIn size={22} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImageIndex !== null && galleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-6 md:p-10"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 sm:top-6 sm:right-6 md:top-8 md:right-8 text-white/70 hover:text-white p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
              onClick={closeLightbox}
            >
              <X size={26} />
            </button>

            {/* Prev Button — desktop only */}
            <button
              className="absolute left-3 sm:left-6 md:left-8 text-white/70 hover:text-white p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50 transform -translate-y-1/2 top-1/2 hidden sm:block"
              onClick={prevImage}
            >
              <ChevronLeft size={28} />
            </button>

            {/* Main Image View */}
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryImages[selectedImageIndex].imageUrl}
                alt={galleryImages[selectedImageIndex].title}
                className="max-w-full max-h-[65vh] sm:max-h-[75vh] object-contain rounded-xl shadow-2xl bg-black/50"
              />

              {/* Caption */}
              <div className="mt-4 w-full text-center px-4">
                <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full mb-2">
                  {galleryImages[selectedImageIndex].category}
                </span>
                <h2 className="text-white text-xl sm:text-3xl font-bold drop-shadow-md">
                  {galleryImages[selectedImageIndex].title}
                </h2>
                <p className="text-green-300 font-semibold text-xs sm:text-sm mt-1">
                  Gambar {selectedImageIndex + 1} dari {galleryImages.length}
                </p>

                {/* Mobile Nav */}
                <div className="flex sm:hidden justify-center gap-4 mt-4">
                  <button className="text-white bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors" onClick={prevImage}>
                    <ChevronLeft size={22} />
                  </button>
                  <button className="text-white bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors" onClick={nextImage}>
                    <ChevronRight size={22} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Next Button — desktop only */}
            <button
              className="absolute right-3 sm:right-6 md:right-8 text-white/70 hover:text-white p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50 transform -translate-y-1/2 top-1/2 hidden sm:block"
              onClick={nextImage}
            >
              <ChevronRight size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
