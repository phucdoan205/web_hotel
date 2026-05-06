import React, { useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import Quill from "quill";
import ImageResize from "quill-image-resize-module-react";

import { uploadImage } from "../../../api/admin/vouchersApi";

// Đăng ký module
Quill.register("modules/imageResize", ImageResize);

const RichEmailEditor = ({ value, onChange }) => {
  const quillRef = useRef();

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadImage(formData);
        const imageUrl = res.data?.url || res.data;

        if (!imageUrl) return;

        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true); // true = lấy vị trí hiện tại nếu không có selection

        quill.insertEmbed(range.index, "image", imageUrl);
        quill.setSelection(range.index + 1, 0); // Di chuyển con trỏ sau hình
      } catch (error) {
        console.error("Upload image failed:", error);
        alert("Tải ảnh lên thất bại");
      }
    };

    input.click();
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: handleImageUpload,
      },
    },
    // Cấu hình Resize
    imageResize: {
      parchment: Quill.import("parchment"),
      modules: ["Resize", "DisplaySize", "Toolbar"], // Toolbar cho phép chỉnh tỷ lệ %
      handleStyles: {
        backgroundColor: "white",
        border: "1px solid #0085FF",
        borderRadius: "4px",
      },
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "align",
    "link",
    "image",
  ];

  return (
    <div className="rounded-2xl overflow-hidden border bg-white shadow-sm">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Nhập nội dung email..."
      />
    </div>
  );
};

export default RichEmailEditor;