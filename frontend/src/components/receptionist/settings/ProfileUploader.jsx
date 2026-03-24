import React, { useRef } from "react";
import { Camera, UploadCloud } from "lucide-react";
import { useFilePreview } from "../../../hooks/useFilePreview";

const ProfileUploader = ({ initialImage, type = "hotel", onImageChange }) => {
  const fileInputRef = useRef(null);

  // Sử dụng Hook đã tách
  const { preview, handleFileChange, clearPreview } = useFilePreview(
    initialImage,
    onImageChange,
  );

  return (
    <div className="flex items-center gap-6 animate-in fade-in duration-300">
      <div className="relative group">
        <div
          className={`
          overflow-hidden border-4 border-white shadow-md bg-gray-50 flex items-center justify-center
          ${type === "hotel" ? "size-32 rounded-[2rem]" : "size-24 rounded-full"}
        `}
        >
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <UploadCloud
              className="text-gray-300"
              size={type === "hotel" ? 40 : 24}
            />
          )}
        </div>

        {/* Nút bấm nhanh cho style Cá nhân */}
        {type === "personal" && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-[#0085FF] text-white p-2 rounded-xl shadow-lg border-2 border-white hover:scale-110 transition-transform"
          >
            <Camera size={14} />
          </button>
        )}
      </div>

      {/* Điều khiển cho style Khách sạn */}
      {type === "hotel" && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#0085FF]/10 text-[#0085FF] px-4 py-2 rounded-xl text-[11px] font-black hover:bg-[#0085FF] hover:text-white transition-all"
            >
              Tải ảnh mới
            </button>
            {preview && (
              <button
                onClick={clearPreview}
                className="bg-rose-50 text-rose-500 px-4 py-2 rounded-xl text-[11px] font-black hover:bg-rose-500 hover:text-white transition-all"
              >
                Xóa
              </button>
            )}
          </div>
          <p className="text-[10px] font-bold text-gray-400">
            Tối đa 5MB. Định dạng JPG, PNG hoặc GIF.
          </p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ProfileUploader;
