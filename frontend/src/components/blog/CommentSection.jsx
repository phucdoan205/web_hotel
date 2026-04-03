import React from "react";

const CommentSection = () => {
  return (
    <div className="mt-12 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-800 text-lg mb-8">Bình luận (32)</h3>

      {/* Input area */}
      <div className="mb-10">
        <textarea
          placeholder="Chia sẻ ý kiến của bạn về bài viết này..."
          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-300 transition-all h-32 text-sm"
        ></textarea>
        <div className="flex justify-end mt-4">
          <button className="bg-blue-500 text-white font-bold px-8 py-2.5 rounded-lg text-sm hover:bg-blue-600 transition-all">
            Gửi bình luận
          </button>
        </div>
      </div>

      {/* Single Comment */}
      <div className="flex gap-4">
        <img
          src="https://i.pravatar.cc/150?u=user1"
          className="w-10 h-10 rounded-full"
          alt=""
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-slate-800">Hoa Hạ</span>
            <span className="text-[10px] text-slate-400">1 giờ trước</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Bài viết hay quá! Mình cũng đang lên kế hoạch đi Đà Lạt cuối tuần
            này. Cảm ơn tác giả đã chia sẻ nhé.
          </p>
          <button className="text-[10px] font-bold text-blue-500 hover:underline">
            TRẢ LỜI
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
