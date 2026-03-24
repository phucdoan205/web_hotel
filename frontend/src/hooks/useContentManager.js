import { useState } from "react";

export const useContentManager = () => {
  const [activeTab, setActiveTab] = useState("posts"); // 'posts' | 'categories'
  const [isAddingPost, setIsAddingPost] = useState(false);

  const toggleTab = (tab) => {
    setActiveTab(tab);
    setIsAddingPost(false);
  };

  return {
    activeTab,
    isAddingPost,
    setIsAddingPost,
    toggleTab,
  };
};
