"use client";

import { useState, useEffect } from "react";
import { ChevronDown, CalendarDays, HelpCircle, CheckCircle2, Loader2 } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import DaftarButton from "@/app/components/DaftarButton";
import Footer from "@/app/components/Footer";
import * as LucideIcons from "lucide-react";

const DynamicIcon = ({ name, className, size = 24 }: { name: string, className?: string, size?: number }) => {
  // @ts-ignore
  const IconComponent = LucideIcons[name] || LucideIcons.CheckCircle;
  return <IconComponent size={size} className={className} />;
};

export default function CaraDaftarPage() {
  const [openStep, setOpenStep] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const [steps, setSteps] = useState<any[]>([]);
  const [timelines, setTimelines] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [persyaratan, setPersyaratan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/cara-daftar/alur').then(res => res.json()),
      fetch('/api/cara-daftar/timeline').then(res => res.json()),
      fetch('/api/cara-daftar/faq').then(res => res.json()),
      fetch('/api/cara-daftar/persyaratan').then(res => res.json())
    ]).then(([alurData, timelineData, faqData, persyaratanData]) => {
      setSteps(Array.isArray(alurData) ? alurData : []);
      setTimelines(Array.isArray(timelineData) ? timelineData : []);
      setFaqs(Array.isArray(faqData) ? faqData : []);
      setPersyaratan(Array.isArray(persyaratanData) ? persyaratanData : []);

      if (Array.isArray(alurData) && alurData.length > 0) {
        setOpenStep(alurData[0].id);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const toggleStep = (id: string) => setOpenStep(openStep === id ? null : id);
  const toggleFaq = (id: string) => setOpenFaq(openFaq === id ? null : id);

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-24 sm:pb-32 md:pt-32 md:pb-40 px-4 sm:px-6 text-center bg-gradient-to-br from-[#14532D] via-[#166534] to-[#22C55E] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#34d399]/10 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#86efac]/10 blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto animate-in slide-in-from-bottom-6 fade-in duration-700">
          <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-green-50 text-xs sm:text-sm font-semibold tracking-wider shadow-sm">
            Panduan &amp; Prosedur
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 drop-shadow-md leading-tight">
            Cara Daftar Online
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-green-50/90 font-medium leading-relaxed max-w-2xl mx-auto">
            Ikuti langkah-langkah mudah di bawah ini untuk menjadi bagian dari keluarga besar Yayasan Jamaluddin Suralaga.
          </p>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-[50px] sm:h-[70px] md:h-[90px] lg:h-[120px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" fill="rgba(240, 253, 244, 0.4)"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-23.84V120H0Z" fill="rgba(240, 253, 244, 0.7)"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V120H0Z" fill="#F0FDF4"></path>
          </svg>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 sm:py-32 z-10 relative">
          <Loader2 size={44} className="animate-spin text-[#16A34A] mb-4" />
          <p className="text-gray-500 font-medium text-sm sm:text-base">Memuat Panduan Pendaftaran...</p>
        </div>
      ) : (
        <>
          {/* Main Content */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 w-full relative z-10 -mt-6 sm:-mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 md:gap-12 items-start">

              {/* LEFT COLUMN: Steps Accordion */}
              <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-green-50">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#111827] mb-6 sm:mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-7 sm:h-8 bg-[#16A34A] rounded-full inline-block shrink-0"></span>
                  Alur Pendaftaran
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  {steps.map((step, index) => {
                    const isOpen = openStep === step.id;
                    return (
                      <div
                        key={step.id}
                        className={`border rounded-xl sm:rounded-2xl transition-all duration-300 overflow-hidden ${isOpen ? 'border-[#16A34A]/30 bg-[#F0FDF4] shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                      >
                        <button
                          onClick={() => toggleStep(step.id)}
                          className="w-full text-left px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between group focus:outline-none"
                        >
                          <div className="flex items-center gap-3 sm:gap-5">
                            <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-base sm:text-lg shadow-sm transition-colors duration-300 shrink-0 ${isOpen ? 'bg-gradient-to-br from-[#22C55E] to-[#15803D] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-600'}`}>
                              {isOpen ? <DynamicIcon name={step.icon} className="text-white" size={22} /> : (index + 1)}
                            </div>
                            <span className={`text-base sm:text-lg font-bold transition-colors ${isOpen ? 'text-[#14532D]' : 'text-gray-700'}`}>
                              {step.title}
                            </span>
                          </div>
                          <ChevronDown size={20} className={`shrink-0 text-gray-400 transition-transform duration-300 ml-2 ${isOpen ? 'rotate-180 text-[#16A34A]' : ''}`} />
                        </button>

                        <div className={`transition-all duration-300 ease-in-out px-4 sm:px-6 flex flex-col items-start ${isOpen ? 'max-h-96 opacity-100 pb-5 sm:pb-6 pointer-events-auto' : 'max-h-0 opacity-0 pb-0 pointer-events-none'}`}>
                          <div className="ml-[56px] sm:ml-[76px] text-gray-600 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {step.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {steps.length === 0 && <p className="text-gray-400 text-center py-4 text-sm">Panduan alur belum tersedia saat ini.</p>}
                </div>
              </div>

              {/* RIGHT COLUMN: Timeline & Requirements */}
              <div className="lg:col-span-5 space-y-6 sm:space-y-8">

                {/* Timeline */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-green-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-28 h-28 sm:w-32 sm:h-32 bg-yellow-100/50 rounded-bl-[100px] -z-10"></div>
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 text-[#111827]">
                    <CalendarDays className="text-[#16A34A] shrink-0" size={22} />
                    Timeline Penerimaan
                  </h3>

                  <div className="relative border-l-2 border-green-100 ml-4 space-y-6 sm:space-y-8 pb-4">
                    {timelines.length === 0 && <p className="text-gray-400 ml-4 text-sm mt-2">Jadwal belum tersedia.</p>}
                    {timelines.map((item) => (
                      <div key={item.id} className="relative pl-5 sm:pl-6">
                        <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-[3px] border-white shadow-sm ${item.status === 'active' ? 'bg-[#16A34A] animate-pulse' : 'bg-gray-300'}`}></span>
                        <h4 className={`font-bold text-sm sm:text-base mb-1 ${item.status === 'active' ? 'text-[#166534]' : 'text-gray-700'}`}>{item.event}</h4>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium bg-gray-50 inline-block px-2.5 sm:px-3 py-1 rounded-md mt-0.5">{item.date}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Requirements */}
                <div className="bg-gradient-to-br from-[#166534] to-[#15803D] rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden">
                  <CheckCircle2 size={100} className="absolute -bottom-6 -right-6 text-white opacity-5" />

                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                    <DynamicIcon name="FileText" className="text-yellow-300" size={20} />
                    Persyaratan Umum Wajib
                  </h3>
                  <ul className="space-y-2.5 sm:space-y-3 relative z-10">
                    {persyaratan.length === 0 && <p className="text-green-200/50 text-sm italic">Belum ada data persyaratan.</p>}
                    {persyaratan.map((req) => (
                      <li key={req.id} className="flex items-start gap-2.5 sm:gap-3">
                        {req.isImportant ? (
                          <CheckCircle2 size={16} className="text-yellow-300 mt-0.5 shrink-0 animate-pulse" />
                        ) : (
                          <CheckCircle2 size={16} className="text-green-300 mt-0.5 shrink-0" />
                        )}
                        <span className={`text-green-50 text-xs sm:text-sm leading-relaxed ${req.isImportant ? 'font-bold text-white' : ''}`}>{req.teks}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-3xl sm:max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full mb-8 sm:mb-12">
            <div className="text-center mb-8 sm:mb-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white shadow-sm border border-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-[#16A34A] rotate-3 hover:rotate-6 transition-transform">
                <HelpCircle size={28} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-2 sm:mb-3">Tanya Jawab (FAQ)</h2>
              <p className="text-gray-500 text-sm sm:text-base">Pertanyaan yang sering diajukan terkait proses pendaftaran.</p>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {faqs.length === 0 && <p className="text-gray-400 text-center text-sm">Belum ada pertanyaan FAQ yang dicatat.</p>}
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl shadow-sm hover:border-green-100 transition-colors">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between font-bold text-gray-800 text-sm sm:text-base gap-3"
                  >
                    <span className="flex-1">{faq.q}</span>
                    <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${openFaq === faq.id ? 'rotate-180 text-green-600' : ''}`} />
                  </button>
                  <div className={`transition-all duration-300 px-4 sm:px-6 text-gray-600 text-sm font-medium leading-relaxed whitespace-pre-wrap ${openFaq === faq.id ? 'pb-5 sm:pb-6 max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pb-0 overflow-hidden'}`}>
                    {faq.a}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Final CTA */}
      <section className="bg-white py-12 sm:py-16 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#14532D] to-[#16A34A] mb-3 sm:mb-4">
            Siap Bergabung Bersama Kami?
          </h2>
          <p className="text-sm sm:text-lg text-[#6B7280] mb-6 sm:mb-8 max-w-xl mx-auto">
            Pendaftaran dibuka setiap saat sesuai dengan gelombang. Tunggu apalagi, kuota sangat terbatas!
          </p>
          <DaftarButton className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white font-extrabold text-base sm:text-lg shadow-lg shadow-green-600/30 hover:shadow-green-600/50 hover:-translate-y-1 transition duration-300" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
