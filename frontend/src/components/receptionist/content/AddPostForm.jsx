import React from "react";
import {
  Save,
  Send,
  Image as ImageIcon,
  Calendar,
  Tag,
  ChevronDown,
  LayoutGrid,
  Eye,
} from "lucide-react";
import { usePostForm } from "../../../hooks/usePostForm";

const AddPostForm = ({ onCancel }) => {
  const { formData, handleChange, removeTag, submitPost } = usePostForm();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b">
        {/* Điều hướng */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => submitPost("draft")}
            className="text-xs font-bold text-gray-500"
          >
            Lưu bản nháp
          </button>
          <button
            onClick={() => submitPost("publish")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase"
          >
            Xuất bản bài viết
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-8 max-w-[1400px] mx-auto grid grid-cols-12 gap-8">
        <div className="col-span-8">
          <textarea
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tiêu đề bài viết tại đây..."
            className="w-full text-4xl font-black border-none focus:ring-0 resize-none"
          />
        </div>

        {/* Sidebar Settings */}
        <div className="col-span-4 space-y-8">
          {/* Render Tags */}
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black"
              >
                {tag} <button onClick={() => removeTag(tag)}>×</button>
              </span>
            ))}
          </div>

          {/* Date Picker */}
          <input
            type="date"
            name="publishDate"
            value={formData.publishDate}
            onChange={handleChange}
            className="w-full bg-gray-50 border-none rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default AddPostForm;
