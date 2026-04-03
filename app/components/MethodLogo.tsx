"use client";

import { useState, useEffect } from "react";
import { Landmark, CreditCard, Smartphone } from "lucide-react";

interface MethodLogoProps {
  name: string;
  category?: string;
}

export default function MethodLogo({ name, category }: MethodLogoProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  // Ubah initialSrc state agar melacak nama lokal (key)
  const [localFallbackName, setLocalFallbackName] = useState<string>("");
  const [svgFallback, setSvgFallback] = useState<string>("");

  useEffect(() => {
    // 1. Normalisasi nama
    const key = name.toLowerCase().trim();
    
    // 2. Domain Mapping (Opsional, ringan)
    const domainMap: Record<string, string> = {
      bri: "bri.co.id",
      bca: "bca.co.id",
      mandiri: "bankmandiri.co.id",
      bni: "bni.co.id",
      bsi: "bankbsi.co.id",
      ovo: "ovo.id",
      dana: "dana.id",
      gopay: "gopay.co.id",
      shopee: "shopeepay.co.id",
      linkaja: "linkaja.id"
    };

    let foundDomain = "";
    let foundKey = "";
    const normalizedKey = key.replace(/[^a-z0-9]/g, "");

    for (const [k, v] of Object.entries(domainMap)) {
      if (normalizedKey.includes(k)) {
        foundDomain = v;
        foundKey = k;
        break;
      }
    }

    // Tentukan nama lokal yang akan dicari saat fallback
    setLocalFallbackName(foundKey || normalizedKey);

    // Tentukan SVG fallback dari wikipedia/worldvectorlogo/Google S2 jika ada
    const svgMap: Record<string, string> = {
      bri: "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg",
      bsi: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.bankbsi.co.id&size=128",
      mandiri: "https://cdn.worldvectorlogo.com/logos/bank-mandiri.svg",
      bni: "https://upload.wikimedia.org/wikipedia/commons/4/41/BNI_logo.svg",
      bca: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
      dana: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg",
      ovo: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.ovo.id&size=128",
      gopay: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg",
      shopee: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee_logo.svg",
      linkaja: "https://upload.wikimedia.org/wikipedia/commons/8/85/LinkAja.svg"
    };
    setSvgFallback(foundKey ? (svgMap[foundKey] || "") : "");

    // 3. Set logo dari Clearbit
    let initialSrc = "";
    if (foundDomain) {
      initialSrc = `https://logo.clearbit.com/${foundDomain}`;
    } else {
      // Jika tidak ada di map, tebak berdasarkan nama 
      const guess = key.replace(/\s+/g, "") + ".com";
      initialSrc = `https://logo.clearbit.com/${guess}`;
    }
    
    setImgSrc(initialSrc);
    setFallbackIndex(0);
    setHasError(false);
  }, [name]);

  const handleError = () => {
    // Sistem Fallback berjenjang (Clearbit -> Wiki SVG -> Local PNG -> Icon Default)
    if (fallbackIndex === 0) {
      if (svgFallback) {
        setImgSrc(svgFallback);
        setFallbackIndex(1);
      } else {
        setImgSrc(`/logos/${localFallbackName}.png`);
        setFallbackIndex(2);
      }
    } else if (fallbackIndex === 1) {
      // Coba ambil dari folder lokal public/logos/nama.png
      setImgSrc(`/logos/${localFallbackName}.png`);
      setFallbackIndex(2);
    } else {
      // Jika masih gagal, tampilkan default icon
      setHasError(true);
    }
  };

  // Fallback icon default (Bank/E-Wallet icon)
  if (hasError || !imgSrc) {
    const isBank = category === "BANK";
    const isEWallet = category === "E-WALLET";
    const Icon = isEWallet ? Smartphone : isBank ? Landmark : CreditCard;

    return (
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 flex items-center justify-center rounded-xl p-2 shadow-sm shrink-0 border border-slate-100">
        <Icon size={24} className="text-slate-400" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white flex items-center justify-center rounded-xl p-2 shadow-sm shrink-0 border border-slate-100">
      <img 
        src={imgSrc} 
        alt={name} 
        className="object-contain max-w-full max-h-full"
        onError={handleError}
      />
    </div>
  );
}
