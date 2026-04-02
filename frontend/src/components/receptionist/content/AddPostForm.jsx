import React, { useState } from "react";
import {
  Save,
  Send,
  Image as ImageIcon,
  Calendar,
  Tag,
  ChevronDown,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { usePostForm } from "../../../hooks/usePostForm";

const AddPostForm = ({ onCancel }) => {
  const { formData, handleChange, removeTag, submitPost } = usePostForm();
  const [, setShowDatePicker] = useState(false);

  const handleDateChange = (date) => {
    handleChange({ target: { name: "publishDate", value: date } });
    setShowDatePicker(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
        <div className="text-sm text-gray-500">
          <span className="text-blue-600 cursor-pointer">Trang chủ</span> &gt;{" "}
          <span className="text-blue-600 cursor-pointer">Quản lý bài viết</span>{" "}
          &gt; Thêm bài viết mới
        </div>
        <div className="flex items-center gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Hủy
            </button>
          )}
          <button
            onClick={() => submitPost("draft")}
            className="text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Lưu bản nháp
          </button>
          <button
            onClick={() => submitPost("publish")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            Xuất bản bài viết
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-[1400px] mx-auto grid grid-cols-12 gap-8">
        {/* Left Section: Post Title and Content */}
        <div className="col-span-8">
          {/* Title Input */}
          <textarea
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tiêu đề để bài viết tại đây..."
            className="w-full text-4xl font-bold text-gray-800 placeholder-gray-400 border-none focus:ring-0 resize-none outline-none"
            rows={2}
          />

          {/* Content Editor */}
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg h-[400px]">
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Nhập nội dung bài viết tại đây..."
              className="w-full h-full text-gray-800 placeholder-gray-400 border-none focus:ring-0 resize-none outline-none"
            />
          </div>
        </div>

        {/* Right Section: Sidebar Settings */}
        <div className="col-span-4 space-y-6">
          {/* Post Settings */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Thiết lập bài viết
            </h3>
            <div className="space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Danh mục
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="news">Tin tức</option>
                    <option value="events">Sự kiện</option>
                  </select>
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Thẻ (tags)
                </label>
                <div className="flex items-center flex-wrap gap-2 border border-gray-200 rounded-lg p-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    name="tags"
                    placeholder="Nhập thẻ, nhấn Enter..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleChange(e);
                      }
                    }}
                    className="flex-1 border-none focus:ring-0 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Ảnh đại diện
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 cursor-pointer hover:bg-gray-50">
                  <ImageIcon className="mx-auto mb-2" size={24} />
                  <p>Click để tải lên</p>
                  <p className="text-xs text-gray-500">PNG, JPG, tối đa 5MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visibility and Publish Settings */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Trạng thái & Hiển thị
            </h3>
            <div className="space-y-4">
              {/* Visibility Options */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Chế độ hiển thị
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === "public"}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Công khai
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === "private"}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Bản nháp
                  </label>
                </div>
              </div>

              {/* Publish Date */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Lịch đăng bài
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.publishDate}
                    onChange={handleDateChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholderText="dd/mm/yyyy"
                  />
                  <Calendar
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={() => setShowDatePicker(true)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Nếu không chọn, ngày đăng sẽ là ngày hiện tại.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPostForm;
