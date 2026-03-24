import { useState } from "react";

export const usePostForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    tags: ["Đà Lạt", "2024"], // Mặc định từ thiết kế
    status: "public",
    publishDate: "",
    image: null,
  });

  // Xử lý thay đổi input cơ bản
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Quản lý Tags
  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Giả lập lưu bài viết
  const submitPost = async (type = "publish") => {
    console.log(`Đang thực hiện: ${type}`, formData);
    // Logic gọi API của bạn ở đây
  };

  return { formData, handleChange, addTag, removeTag, submitPost, setFormData };
};
