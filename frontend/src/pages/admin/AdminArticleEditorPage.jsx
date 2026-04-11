import React from "react";
import ReceptionistArticleEditorPage from "../receptionist/ReceptionistArticleEditorPage";

const AdminArticleEditorPage = () => {
  return <ReceptionistArticleEditorPage scope="admin" basePath="/admin/articles" />;
};

export default AdminArticleEditorPage;
