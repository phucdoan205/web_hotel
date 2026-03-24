import React from "react";
import { useContentManager } from "../../hooks/useContentManager";
import ContentFilters from "../../components/receptionist/content/ContentFilters";
import PostTable from "../../components/receptionist/content/PostTable";
import CategoryTable from "../../components/receptionist/content/CategoryTable";
import ContentStats from "../../components/receptionist/content/ContentStats";
import AddPostForm from "../../components/receptionist/content/AddPostForm";

const ContentManagement = () => {
  const { activeTab, isAddingPost, setIsAddingPost, toggleTab } =
    useContentManager();

  // Nếu đang ở chế độ thêm bài viết, hiển thị Form toàn màn hình
  if (isAddingPost) {
    return <AddPostForm onCancel={() => setIsAddingPost(false)} />;
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-700">
      {/* Header & Breadcrumbs */}
      <div>
        <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          <span className="hover:text-gray-600 cursor-pointer">Trang chủ</span>
          <span>/</span>
          <span className="text-blue-500">Quản lý Bài viết</span>
        </nav>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          {activeTab === "posts"
            ? "Quản lý Bài viết & Nội dung"
            : "Quản lý Danh mục Bài viết"}
        </h1>
        <p className="text-sm font-bold text-gray-400 mt-1">
          {activeTab === "posts"
            ? "Quản lý hệ thống tin tức, hướng dẫn và các bài viết của khách sạn."
            : "Quản lý các nhóm chủ đề bài viết trên hệ thống."}
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-8 border-b border-gray-100">
        <button
          onClick={() => toggleTab("posts")}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "posts"
              ? "text-blue-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Bài viết
          {activeTab === "posts" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 animate-in slide-in-from-left-full" />
          )}
        </button>
        <button
          onClick={() => toggleTab("categories")}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "categories"
              ? "text-blue-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Danh mục
          {activeTab === "categories" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 animate-in slide-in-from-left-full" />
          )}
        </button>
      </div>

      {/* Action Bar (Search, Filter, Add Button) */}
      <ContentFilters
        activeTab={activeTab}
        onAdd={() => setIsAddingPost(true)}
      />

      {/* Main Content Area */}
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {activeTab === "posts" ? <PostTable /> : <CategoryTable />}
      </div>

      {/* Statistics Section */}
      <ContentStats activeTab={activeTab} />
    </div>
  );
};

export default ContentManagement;
