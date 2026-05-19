import React, { useState, useEffect } from "react";
import { Star, X, MessageSquare, Check, Sparkles, Coffee } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useStoredAuth } from "../../hooks/useStoredAuth";
import userReviewsApi from "../../api/user/reviewsApi";

const CATEGORIES = [
  { key: "amenitiesRating", label: "Tiện nghi phòng", description: "Trang thiết bị, nội thất, giường ngủ, tivi, điều hòa..." },
  { key: "staffRating", label: "Phục vụ & Dịch vụ", description: "Thái độ phục vụ của nhân viên lễ tân, dọn phòng, hỗ trợ..." },
  { key: "cleanlinessRating", label: "Độ sạch sẽ", description: "Vệ sinh phòng ở, phòng tắm, ga giường, khăn tắm..." },
  { key: "locationRating", label: "Vị trí & Cảnh quan", description: "Sự thuận tiện di chuyển, tiếng ồn, view phòng..." },
];

export const PendingReviewsModal = () => {
  const auth = useStoredAuth();
  const location = useLocation();
  const [pendingRooms, setPendingRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [ratings, setRatings] = useState({
    amenitiesRating: 5,
    staffRating: 5,
    cleanlinessRating: 5,
    locationRating: 5,
  });
  const [comment, setComment] = useState("");
  const [serviceRatings, setServiceRatings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Load pending reviews when user is logged in
  useEffect(() => {
    if (!auth || !auth.user) {
      setShowModal(false);
      return;
    }

    const fetchPending = async () => {
      try {
        const data = await userReviewsApi.getPendingReviews();
        if (data && data.length > 0) {
          // Filter out stays that have been dismissed in this session
          const activeStays = data.filter(
            (r) => !sessionStorage.getItem(`dismissed_review_${r.bookingDetailId}`)
          );

          if (activeStays.length > 0) {
            setPendingRooms(activeStays);
            setCurrentRoom(activeStays[0]);
            setShowModal(true);
          } else {
            setShowModal(false);
          }
        } else {
          setShowModal(false);
        }
      } catch (err) {
        console.error("Lỗi khi tải đánh giá chờ:", err);
      }
    };

    fetchPending();
  }, [auth, location]);

  // Sync service ratings when currentRoom changes
  useEffect(() => {
    if (currentRoom) {
      setRatings({
        amenitiesRating: 5,
        staffRating: 5,
        cleanlinessRating: 5,
        locationRating: 5,
      });
      setComment("");
      if (currentRoom.services && currentRoom.services.length > 0) {
        setServiceRatings(
          currentRoom.services.map((s) => ({
            serviceId: s.serviceId,
            serviceName: s.serviceName,
            serviceImageUrl: s.serviceImageUrl,
            rating: 5,
            comment: "",
          }))
        );
      } else {
        setServiceRatings([]);
      }
    }
  }, [currentRoom]);

  // Calculate dynamic average rating
  const averageRating = (
    (ratings.amenitiesRating +
      ratings.staffRating +
      ratings.cleanlinessRating +
      ratings.locationRating) /
    4
  ).toFixed(1);

  const handleRatingChange = (category, value) => {
    setRatings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleServiceRatingChange = (serviceId, value) => {
    setServiceRatings((prev) =>
      prev.map((item) =>
        item.serviceId === serviceId ? { ...item, rating: value } : item
      )
    );
  };

  const handleServiceCommentChange = (serviceId, value) => {
    setServiceRatings((prev) =>
      prev.map((item) =>
        item.serviceId === serviceId ? { ...item, comment: value } : item
      )
    );
  };

  const handleDismiss = () => {
    if (currentRoom) {
      sessionStorage.setItem(`dismissed_review_${currentRoom.bookingDetailId}`, "true");
    }

    const nextRooms = pendingRooms.slice(1);
    setPendingRooms(nextRooms);
    if (nextRooms.length > 0) {
      setCurrentRoom(nextRooms[0]);
    } else {
      setShowModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentRoom) return;

    setIsSubmitting(true);
    try {
      const payload = {
        roomTypeId: currentRoom.roomTypeId,
        rating: Math.round(Number(averageRating)),
        amenitiesRating: ratings.amenitiesRating,
        staffRating: ratings.staffRating,
        cleanlinessRating: ratings.cleanlinessRating,
        locationRating: ratings.locationRating,
        comment: comment.trim() || null,
        bookingDetailId: currentRoom.bookingDetailId,
        serviceReviews: serviceRatings.map((sr) => ({
          serviceId: sr.serviceId,
          rating: sr.rating,
          comment: sr.comment.trim() || null,
        })),
      };

      await userReviewsApi.createReview(payload);
      setIsSuccess(true);

      // Transition to next room or close
      setTimeout(() => {
        const nextRooms = pendingRooms.slice(1);
        setPendingRooms(nextRooms);
        setIsSuccess(false);

        if (nextRooms.length > 0) {
          setCurrentRoom(nextRooms[0]);
        } else {
          setShowModal(false);
        }
      }, 2000);

    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
      alert("Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showModal || !currentRoom) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-[2.5rem] bg-white shadow-2xl transition-all duration-300 max-h-[90vh] overflow-y-auto">
        
        {/* Header Decor */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-gradient-to-tr from-sky-400 to-blue-500 opacity-20 blur-xl"></div>
        <div className="absolute left-0 bottom-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-gradient-to-tr from-cyan-400 to-sky-500 opacity-20 blur-xl"></div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-6 top-6 rounded-2xl bg-slate-50 p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none z-10"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 animate-bounce shadow-lg shadow-emerald-100/50">
              <Check size={40} strokeWidth={3} />
            </div>
            <h3 className="mt-6 text-2xl font-black text-slate-800">Cảm ơn đánh giá của bạn!</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md">
              Ý kiến đóng góp quý giá của bạn sẽ giúp TravelEase nâng cao chất lượng dịch vụ của khách sạn!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col p-8 md:p-10">
            {/* Title Block */}
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
                  Bạn thấy thế nào về kỳ lưu trú vừa qua?
                </h2>
                <p className="mt-1 text-sm font-semibold text-sky-600">
                  Phòng nghỉ: {currentRoom.roomTypeName}
                </p>
              </div>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Categories Ratings */}
              <div className="md:col-span-7 space-y-5">
                {CATEGORIES.map((category) => (
                  <div key={category.key} className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-slate-700">{category.label}</span>
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">{category.description}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isSelected = ratings[category.key] >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(category.key, star)}
                            className="p-0.5 transition transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              size={24}
                              className={`transition-colors ${
                                isSelected ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-50"
                              }`}
                            />
                          </button>
                        );
                      })}
                      <span className="ml-2.5 text-sm font-black text-slate-800">
                        {ratings[category.key]} / 5
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Score Board */}
              <div className="md:col-span-5 flex flex-col items-center justify-center rounded-3xl bg-slate-50 p-6 border border-slate-100 text-center shadow-inner">
                {currentRoom.roomImageUrl ? (
                  <img
                    src={currentRoom.roomImageUrl}
                    alt={currentRoom.roomTypeName}
                    className="h-24 w-36 object-cover rounded-2xl shadow-sm border border-white mb-4"
                  />
                ) : (
                  <div className="h-24 w-36 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 mb-4 font-bold text-xs">
                    Ảnh phòng
                  </div>
                )}

                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đánh giá chung</span>
                <span className="mt-1 text-5xl font-black text-slate-800 tracking-tight">{averageRating}</span>

                <div className="mt-2 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const diff = Number(averageRating) - star + 1;
                    const fillAmount = Math.max(0, Math.min(1, diff));
                    return (
                      <div key={star} className="relative">
                        <Star size={16} className="text-slate-200 fill-slate-200" />
                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{ width: `${fillAmount * 100}%` }}
                        >
                          <Star size={16} className="text-amber-400 fill-amber-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Room Comment */}
            <div className="mt-6 space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <MessageSquare size={14} />
                <span>Ý kiến đóng góp về phòng (không bắt buộc)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về phòng nghỉ và phục vụ..."
                rows={2}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
              ></textarea>
            </div>

            {/* Service Reviews Section */}
            {serviceRatings.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-6 space-y-5">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Coffee className="text-sky-500" size={18} />
                  Đánh giá dịch vụ đã sử dụng trong kỳ lưu trú
                </h3>
                
                <div className="space-y-4">
                  {serviceRatings.map((s) => (
                    <div key={s.serviceId} className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {s.serviceImageUrl ? (
                            <img src={s.serviceImageUrl} alt={s.serviceName} className="h-10 w-10 object-cover rounded-lg border border-white shadow-sm shrink-0" />
                          ) : (
                            <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                              <Coffee size={18} />
                            </div>
                          )}
                          <span className="font-bold text-slate-700 text-sm">{s.serviceName}</span>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleServiceRatingChange(s.serviceId, star)}
                              className="transition transform hover:scale-110 focus:outline-none"
                            >
                              <Star
                                size={18}
                                className={`transition-colors ${
                                  s.rating >= star ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-50"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment Input */}
                      <input
                        type="text"
                        value={s.comment}
                        onChange={(e) => handleServiceCommentChange(s.serviceId, e.target.value)}
                        placeholder="Nhận xét ngắn về dịch vụ này (không bắt buộc)..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-sky-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3.5 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all text-sm text-center"
              >
                Để sau / Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-sky-100 hover:shadow-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <span>Gửi đánh giá ngay</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PendingReviewsModal;
