// utils/contentHelpers.tsx
import React from 'react';
import { ListItem } from "@/types/content";

// Convert nested list structure to HTML
export const convertListToHtml = (items: ListItem[]): string => {
  // Skip empty lists
  if (
    items.length === 0 ||
    (items.length === 1 &&
      items[0].text.trim() === "" &&
      items[0].children.length === 0)
  ) {
    return "";
  }
  
  let html = '<ol class="c">';
  
  items.forEach((item) => {
    // Skip empty items
    if (item.text.trim() === "" && item.children.length === 0) {
      return;
    }
    
    html += `<li>${item.text.trim()}`;
    
    if (item.children.length > 0) {
      const hasNonEmptyChildren = item.children.some(
        (child) => child.text.trim() !== ""
      );
      
      if (hasNonEmptyChildren) {
        html += `<ol class="d">${item.children
          .filter((child) => child.text.trim() !== "")
          .map((child) => `<li>${child.text.trim()}</li>`)
          .join("")}</ol>`;
      }
    }
    
    html += "</li>";
  });
  
  html += "</ol>";
  return html;
};

// Extract text content from HTML for validation
export const getTextContentLength = (html: string): number => {
  // Strip HTML tags and count remaining characters
  const textContent = html.replace(/<[^>]*>/g, "").trim();
  return textContent.length;
};

// Convert nested list structure to description field based on format
export const generateDescriptionFromList = (
  listItems: ListItem[],
  descriptionFormat: "paragraph" | "simple-list" | "nested-list"
): string => {
  if (descriptionFormat === "nested-list") {
    return convertListToHtml(listItems);
  } else if (descriptionFormat === "simple-list") {
    // Create simple bulleted list
    let content = "";
    
    const processItems = (items: ListItem[], indent: string = "") => {
      items.forEach((item) => {
        if (item.text.trim()) {
          content += `${indent}- ${item.text.trim()}\n`;
        }
        
        if (item.children.length > 0) {
          processItems(item.children, indent + "  ");
        }
      });
    };
    
    processItems(listItems);
    return content;
  }
  
  return ""; // Return empty string for paragraph format
};

// Format description for preview
export const getFormattedPreview = (
  description: string,
  descriptionFormat: "paragraph" | "simple-list" | "nested-list",
  listItems: ListItem[]
): JSX.Element => {
  if (descriptionFormat === "paragraph") {
    return <div className="whitespace-pre-wrap">{description}</div>;
  } else if (descriptionFormat === "simple-list") {
    const items = description
      .split(/\n+/)
      .filter((item) => item.trim() !== "");
    
    return (
      <ul className="list-disc pl-5">
        {items.map((item, index) => (
          <li key={index}>{item.trim().replace(/^-\s*/, "")}</li>
        ))}
      </ul>
    );
  } else {
    // Render nested list preview
    return (
      <div
        className="nested-list-preview"
        dangerouslySetInnerHTML={{ __html: convertListToHtml(listItems) }}
      />
    );
  }
};

// Parse simple list from string to array
export const parseSimpleListFromString = (content: string): string[] => {
  if (!content) return [];
  
  return content
    .split(/\n+/)
    .filter(item => item.trim() !== "")
    .map(item => item.trim().replace(/^-\s*/, ""));
};

// Format complex content for display
export const formatComplexContent = (
  content: string,
  format: "paragraph" | "simple-list" | "nested-list"
): string => {
  if (format === "paragraph") {
    return content;
  } else if (format === "simple-list") {
    // Ensure consistent formatting for simple lists
    const items = parseSimpleListFromString(content);
    return items.map(item => `- ${item}`).join('\n');
  } else {
    // For nested-list, the content should already be HTML
    return content;
  }
};

// Detect content format based on content structure
export const detectContentFormat = (content: string): "paragraph" | "simple-list" | "nested-list" => {
  if (content.includes('<ol class="c">') || content.includes('<ol class="d">')) {
    return "nested-list";
  } else if (content.trim().split(/\n+/).every(line => line.trim().startsWith('-'))) {
    return "simple-list";
  } else {
    return "paragraph";
  }
};

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (html: string): string => {
  // A simple sanitization - in production you might want a more robust solution
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
};