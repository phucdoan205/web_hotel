import React, { useEffect, useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ReviewCard from "../../components/user/reviews/ReviewCard";
import { getArticles } from "../../api/articles/articleApi";

const reviewsData = [
  {
    id: 1,
    hotelName: "The Grand Hyatt Singapore",
    image: "https://ik.imagekit.io/tvlk/blog/2021/06/alma-oasis-long-hai-cvdes.jpg",
    rating: 4.5,
    stayDate: "Oct 12, 2023",
    isVerified: true,
    content:
      "Exceptional service and the breakfast buffet was outstanding. The pool area is very relaxing, though it can get a bit crowded in the afternoons.",
    reply:
      "Dear Alex, thank you for your kind words. We are delighted to hear you enjoyed the breakfast and our hospitality.",
  },
];

const UserReviewsPage = () => {
  const [activeTab, setActiveTab] = useState("reviews");
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      setLoadingArticles(true);

      try {
        const data = await getArticles({ scope: "public" });
        setArticles(data);
      } finally {
        setLoadingArticles(false);
      }
    };

    loadArticles();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="mb-10">
        <nav className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
          Home / Account Settings / <span className="text-gray-900">Bài viết & Review</span>
        </nav>
        <h1 className="mb-2 text-3xl font-black text-gray-900">Bài viết & Review</h1>
        <p className="text-[13px] font-bold text-gray-400">
          Xem lại review của bạn và theo dõi các bài viết đã được admin duyệt.
        </p>
      </div>

      <div className="mb-8 flex gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`rounded-2xl px-5 py-3 text-sm font-black ${activeTab === "reviews" ? "bg-[#0085FF] text-white" : "bg-white text-gray-500"}`}
        >
          Review
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("articles")}
          className={`rounded-2xl px-5 py-3 text-sm font-black ${activeTab === "articles" ? "bg-[#0085FF] text-white" : "bg-white text-gray-500"}`}
        >
          Bài viết
        </button>
      </div>

      {activeTab === "reviews" ? (
        <>
          <div className="max-w-4xl">
            {reviewsData.map((item) => (
              <ReviewCard key={item.id} review={item} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-8 py-3 text-[11px] font-black text-[#0085FF] shadow-sm transition-all hover:shadow-md">
              Load More Reviews
              <ChevronDown size={14} />
            </button>
          </div>
        </>
      ) : loadingArticles ? (
        <div className="py-16 text-center text-sm font-semibold text-gray-400">
          Đang tải bài viết...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/articles/${article.slug || article.id}`}
              className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={article.thumbnailUrl || "https://placehold.co/800x420/e2e8f0/64748b?text=News"}
                alt={article.title}
                className="h-52 w-full object-cover"
              />
              <div className="space-y-3 p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-600">
                    {article.categoryName || "Tin tức"}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {article.authorName || "Hotel"}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{article.title}</h2>
                <p className="line-clamp-3 text-sm font-medium text-slate-500">
                  {article.summary || "Xem chi tiết bài viết đã duyệt."}
                </p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <MessageCircle className="size-4" />
                  {article.commentCount} bình luận
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserReviewsPage;
