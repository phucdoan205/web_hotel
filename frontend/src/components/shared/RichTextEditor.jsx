import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";

const ToolbarButton = ({ children, onClick, title, active = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
      active 
        ? "border-orange-200 bg-orange-50 text-orange-600" 
        : "border-gray-100 bg-white text-slate-600 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="h-6 w-px bg-gray-200" />;

export default function RichTextEditor({ value, onChange, placeholder = "Nhập nội dung..." }) {
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, []);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !savedSelectionRef.current) return;
    selection.removeAllRanges();
    selection.addRange(savedSelectionRef.current);
  };

  const applyCommand = (command, val = null) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, val);
    saveSelection();
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleInsertLink = () => {
    const url = window.prompt("Nhập link cần chèn");
    if (url) applyCommand("createLink", url);
  };

  return (
    <div className={`flex flex-col rounded-2xl border transition-all ${
      isFocused ? "border-orange-300 ring-4 ring-orange-50" : "border-slate-200"
    }`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 bg-slate-50/50 p-2">
        <ToolbarButton title="Chữ đậm" onClick={() => applyCommand("bold")}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Chữ nghiêng" onClick={() => applyCommand("italic")}>
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Gạch chân" onClick={() => applyCommand("underline")}>
          <Underline className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Gạch ngang" onClick={() => applyCommand("strikeThrough")}>
          <Strikethrough className="size-4" />
        </ToolbarButton>
        
        <ToolbarDivider />
        
        <ToolbarButton title="Canh trái" onClick={() => applyCommand("justifyLeft")}>
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Canh giữa" onClick={() => applyCommand("justifyCenter")}>
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Canh phải" onClick={() => applyCommand("justifyRight")}>
          <AlignRight className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Danh sách chấm" onClick={() => applyCommand("insertUnorderedList")}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Danh sách số" onClick={() => applyCommand("insertOrderedList")}>
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Chèn link" onClick={handleInsertLink}>
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Trích dẫn" onClick={() => applyCommand("formatBlock", "<blockquote>")}>
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Xóa định dạng" onClick={() => applyCommand("removeFormat")}>
          <Eraser className="size-4" />
        </ToolbarButton>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || "")}
        onFocus={() => {
          setIsFocused(true);
          saveSelection();
        }}
        onBlur={() => {
          setIsFocused(false);
          saveSelection();
        }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        className="min-h-[200px] px-5 py-4 text-sm leading-relaxed text-slate-700 outline-none"
        data-placeholder={placeholder}
      />
      
      <style jsx>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          cursor: text;
        }
        blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
