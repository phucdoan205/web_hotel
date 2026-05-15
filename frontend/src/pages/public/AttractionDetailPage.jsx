import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, MapPin, ChevronLeft, ChevronRight, X, Navigation } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../../api/client";

const normalizeContent = (content) => {
  if (!content) return "";

  let processed = content;

  // 1. Handle escaped HTML if detected (e.g., &lt;p&gt; instead of <p>)
  if (processed.includes("&lt;") && (processed.includes("&lt;p") || processed.includes("&lt;div") || processed.includes("&lt;br"))) {
    const doc = new DOMParser().parseFromString(processed, "text/html");
    processed = doc.documentElement.textContent || processed;
  }

  // 2. Detect if it's HTML content
  const isHtml = /<[a-z][\s\S]*>/i.test(processed);

  if (isHtml) {
    // Clean up unwanted attributes often found in pasted content (like data-start, data-end from AI tools)
    processed = processed.replace(/\sdata-(?:start|end|state)=["'][^"']*["']/g, "");
    return processed;
  }

  // 3. If plain text, convert double newlines to paragraphs and single to br
  return processed
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("");
};

const AttractionDetailPage = () => {
  const { id } = useParams();
  const contentRef = useRef(null);
  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedContent, setExpandedContent] = useState(false);
  const [canExpandContent, setCanExpandContent] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [otherAttractions, setOtherAttractions] = useState([]);

  const htmlContent = useMemo(() => normalizeContent(attraction?.description), [attraction?.description]);

  const imageUrls = useMemo(() => {
    if (!attraction) return [];
    return [...new Set([attraction.imageUrl, ...(attraction.images || [])].filter(Boolean))];
  }, [attraction]);

  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isGalleryOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadAttraction = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.get(`/Attractions/public/${id}`);
        setAttraction(response.data);
        
        // Fetch others for bottom section
        const othersRes = await apiClient.get("/Attractions/public", { params: { pageSize: 5 } });
        setOtherAttractions((othersRes.data?.items || othersRes.data || []).filter(a => a.id !== id).slice(0, 4));
      } catch (err) {
        setError("Không tải được chi tiết địa điểm.");
      } finally {
        setLoading(false);
      }
    };
    loadAttraction();
  }, [id]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    setCanExpandContent(node.scrollHeight > 800);
  }, [htmlContent, expandedContent]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="mb-4 size-10 animate-spin rounded-full border-4 border-slate-200 border-t-rose-500"></div>
          <p className="text-sm font-semibold text-slate-500">Đang tải địa điểm...</p>
        </div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-lg font-bold text-slate-900">{error || "Không tìm thấy địa điểm."}</p>
          <Link to="/attractions/search" className="mt-4 inline-block font-semibold text-rose-500 hover:underline">
            Quay lại danh sách địa điểm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 pt-6 md:pt-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Link to="/activities" className="hover:text-rose-500 transition-colors">Khám Phá</Link>
          <span className="text-slate-300">/</span>
          <Link to="/attractions/search" className="hover:text-rose-500 transition-colors">Địa điểm</Link>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-900 truncate hidden sm:inline">{attraction.name}</span>
        </div>

        {/* Title & Category */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {attraction.category && (
              <span className="rounded-md bg-rose-500 px-3 py-1 text-xs font-black text-white uppercase tracking-wider">
                {attraction.category}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl lg:text-5xl mb-4">
            {attraction.name}
          </h1>
          {attraction.address && (
             <p className="flex items-start gap-2 text-base font-medium text-slate-600 mb-4">
               <MapPin className="size-5 text-rose-500 shrink-0 mt-0.5" />
               {attraction.address}
             </p>
          )}
        </div>

        {/* Image Grid */}
        {imageUrls.length > 0 && (
          <div 
            className="mb-12 grid gap-2 overflow-hidden rounded-2xl cursor-pointer group h-[300px] sm:h-[400px] md:h-[500px] md:grid-cols-4"
            onClick={() => { setIsGalleryOpen(true); setCurrentImageIndex(0); }}
          >
            <div className={`${imageUrls.length >= 2 ? "md:col-span-3" : "md:col-span-4"} h-full overflow-hidden relative`}>
              <img src={imageUrls[0]} alt="Ảnh chính" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
            </div>

            {imageUrls.length >= 2 && (
               <div className="hidden md:grid gap-2 grid-cols-1 grid-rows-2">
                 {imageUrls.slice(1, 3).map((url, idx) => {
                   const isLast = idx === 1;
                   return (
                     <div key={idx} className="relative h-full overflow-hidden">
                       <img src={url} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                       {isLast && imageUrls.length > 3 && (
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold flex-col gap-1.5 transition-colors hover:bg-black/40">
                           <div className="flex gap-1 mb-1">
                             <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                             <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                             <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                           </div>
                           <span className="text-sm">Hiển thị tất cả ({imageUrls.length})</span>
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
            )}
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
          
            {/* HTML Content */}
            <div className="relative">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Giới thiệu về {attraction.name}</h2>
              {attraction.description ? (
                <div
                  ref={contentRef}
                  className={`prose prose-lg prose-slate max-w-none prose-headings:font-black prose-a:text-rose-500 prose-img:rounded-2xl transition-all duration-500 ${expandedContent ? "" : "max-h-[800px] overflow-hidden"}`}
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              ) : (
                <p className="text-slate-500 italic">Chưa có thông tin mô tả cho địa điểm này.</p>
              )}
              {!expandedContent && canExpandContent && (
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Expand Button */}
            {!expandedContent && canExpandContent && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setExpandedContent(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-rose-500"
                >
                  Xem thêm <ChevronDown className="size-4" />
                </button>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-4">Thông tin nhanh</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-rose-50 rounded-lg text-rose-500 shrink-0">
                     <MapPin className="size-5" />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Khoảng cách</p>
                     <p className="text-sm font-bold text-slate-700">{attraction.distanceKm ? `Cách đây ${attraction.distanceKm} km` : "Chưa cập nhật"}</p>
                   </div>
                </div>

                <div className="flex items-start gap-3">
                   <div className="p-2 bg-rose-50 rounded-lg text-rose-500 shrink-0">
                     <Navigation className="size-5" />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Địa chỉ</p>
                     <p className="text-sm font-bold text-slate-700">{attraction.address || "Chưa cập nhật"}</p>
                   </div>
                </div>
              </div>

              {/* Map in Sidebar */}
              {(attraction.mapEmbedLink || attraction.address) && (
                <div className="mt-6 overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-100 bg-slate-50 h-[200px]">
                  {attraction.mapEmbedLink ? (
                    <div dangerouslySetInnerHTML={{ __html: attraction.mapEmbedLink }} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
                  ) : (
                    <iframe
                      title="Google Maps"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(attraction.name + " " + attraction.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    />
                  )}
                </div>
              )}

              {attraction.mapEmbedLink && (
                 <a 
                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.name + " " + attraction.address)}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-rose-600 transition-colors"
                 >
                   Chỉ đường tới đây
                 </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OTHER ATTRACTIONS SECTION - Crucial for mobile UX */}
      <div className="mx-auto max-w-6xl px-5 lg:px-8 mt-20 pt-16 border-t border-slate-100">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Địa điểm khác</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Khám phá thêm những địa danh thú vị xung quanh</p>
          </div>
          <Link 
            to="/attractions/search" 
            className="flex items-center gap-1.5 text-sm font-black text-rose-500 hover:underline"
          >
            Xem tất cả <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {otherAttractions.map((item) => (
            <Link 
              key={item.id} 
              to={`/attractions/${item.slug || item.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={item.imageUrl || "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400"} 
                  alt={item.name} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3">
                  <span className="rounded-lg bg-rose-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                    {item.category || "Địa điểm"}
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-1 flex-col">
                <h3 className="text-[15px] font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-rose-500 transition-colors">
                  {item.name}
                </h3>
                <div className="mt-auto pt-4 flex items-center gap-2 text-slate-400">
                   <MapPin size={12} className="text-rose-400" />
                   <span className="text-[10px] font-bold line-clamp-1">{item.address || "Việt Nam"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* GALLERY MODAL OVERLAY */}
      {isGalleryOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setIsGalleryOpen(false)}
        >
          <div 
            className="relative flex flex-col w-full h-full max-w-5xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between border-b bg-white px-6">
              <span className="font-bold text-slate-900">{currentImageIndex + 1} / {imageUrls.length}</span>
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="flex items-center gap-2 text-slate-500 font-bold hover:text-red-500 transition-colors"
              >
                <span>Đóng</span>
                <X size={20} />
              </button>
            </div>

            <div className="relative flex flex-1 flex-col items-center justify-center bg-slate-50 p-4">
              <div className="relative flex-1 w-full flex items-center justify-center">
                {imageUrls.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1)); }}
                    className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}

                <img
                  src={imageUrls[currentImageIndex]}
                  alt="Ảnh địa điểm"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                />

                {imageUrls.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0)); }}
                    className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Thumbnail Strip */}
            {imageUrls.length > 1 && (
              <div className="h-24 border-t bg-white p-2 flex items-center justify-center gap-2 overflow-x-auto">
                {imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`relative h-full aspect-[4/3] flex-shrink-0 overflow-hidden rounded-md transition-all duration-300 ${
                      i === currentImageIndex ? "ring-2 ring-rose-500 scale-105 z-10 shadow-sm" : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttractionDetailPage;
