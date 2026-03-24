import { useState, useEffect } from "react";

export const useFilePreview = (initialImage, onImageChange) => {
  const [preview, setPreview] = useState(initialImage);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate dung lượng 5MB theo thiết kế
    if (file.size > 5 * 1024 * 1024) {
      alert("Dung lượng file không được quá 5MB");
      return;
    }

    setSelectedFile(file);

    // Tạo preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      if (onImageChange) onImageChange(file);
    };
    reader.readAsDataURL(file);
  };

  const clearPreview = () => {
    setPreview(null);
    setSelectedFile(null);
    if (onImageChange) onImageChange(null);
  };

  return { preview, handleFileChange, clearPreview, selectedFile };
};
