import React from "react";
import PostContent from "../../components/blog/PostContent";
import PostSidebar from "../../components/blog/PostSidebar";
import CommentSection from "../../components/blog/CommentSection";

const PostDetailPage = () => {
  const dummyPost = {
    title:
      "Top 10 địa điểm du lịch Đà Lạt mộng mơ cho cặp đôi vào mùa hoa dã quỳ",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000",
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-10 py-10 flex flex-col lg:flex-row gap-10">
        <div className="lg:w-2/3">
          <PostContent post={dummyPost} />
          <CommentSection />
        </div>
        <div className="lg:w-1/3">
          <PostSidebar />
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
