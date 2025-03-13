"use client";

// import { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Define interface for component props
interface DescriptionFormatSelectorProps {
  content: string;
  setContent: (content: string) => void;
}

// Load ReactQuill dynamically to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ font: [] }, { size: [] }], 
    ["bold", "italic", "underline"], 
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }], 
    ["link"], 
    ["clean"], 
  ],
};

const formats = ["font", "size", "bold", "italic", "underline", "list","align","link"];

const DescriptionFormatSelector = ({ content, setContent }: DescriptionFormatSelectorProps) => {
  return (
    <div className="w-full p-4 border rounded-md bg-white">
      <h2 className="text-black text-sm font-semibold mb-2">Tulis Deskripsi</h2>
      <ReactQuill
        value={content}
        onChange={setContent}
        modules={modules}
        formats={formats}
        className="text-black"
      />
    </div>
  );
};

export default DescriptionFormatSelector;