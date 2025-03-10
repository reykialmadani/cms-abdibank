// components/content/NestedListEditor.tsx
import React from "react";
import { ListItem } from "@/types/content";

interface NestedListEditorProps {
  listItems: ListItem[];
  setListItems: React.Dispatch<React.SetStateAction<ListItem[]>>;
  currentListId: number;
  setCurrentListId: React.Dispatch<React.SetStateAction<number>>;
  validationError?: string;
}

const NestedListEditor: React.FC<NestedListEditorProps> = ({
  listItems,
  setListItems,
  currentListId,
  setCurrentListId,
  validationError,
}) => {
  // Add new list item
  const addListItem = (parentId: string | null = null, level: number = 1) => {
    const newId = currentListId.toString();
    setCurrentListId((prev) => prev + 1);

    if (!parentId) {
      // Add to root level
      setListItems([
        ...listItems,
        { id: newId, text: "", level, children: [] },
      ]);
    } else {
      // Add as child of specified parent
      const updatedItems = [...listItems];

      // Helper function to recursively find and update the parent
      const addChild = (items: ListItem[], parentId: string): boolean => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === parentId) {
            items[i].children.push({
              id: newId,
              text: "",
              level: items[i].level + 1,
              children: [],
            });
            items[i].isExpanded = true;
            return true;
          }

          if (items[i].children.length > 0) {
            if (addChild(items[i].children, parentId)) {
              return true;
            }
          }
        }
        return false;
      };

      addChild(updatedItems, parentId);
      setListItems(updatedItems);
    }
  };

  // Remove list item
  const removeListItem = (id: string) => {
    // Helper function to recursively filter out the item and its children
    const filterItems = (items: ListItem[]): ListItem[] => {
      return items.filter((item) => {
        if (item.id === id) return false;
        if (item.children.length > 0) {
          item.children = filterItems(item.children);
        }
        return true;
      });
    };

    setListItems(filterItems([...listItems]));
  };

  // Update list item text
  const updateListItemText = (id: string, text: string) => {
    // Helper function to recursively find and update item
    const updateItem = (items: ListItem[]): ListItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, text };
        }
        if (item.children.length > 0) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });
    };

    setListItems(updateItem([...listItems]));
  };

  // Toggle expand/collapse of a list item
  const toggleExpand = (id: string) => {
    // Helper function to recursively find and toggle item
    const toggleItem = (items: ListItem[]): ListItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children.length > 0) {
          return { ...item, children: toggleItem(item.children) };
        }
        return item;
      });
    };

    setListItems(toggleItem([...listItems]));
  };

  // Recursive component to render list items with proper indentation
  const renderListItems = (items: ListItem[], indent: number = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        <div
          className="flex items-center mb-2"
          style={{ marginLeft: `${indent * 20}px` }}
        >
          <div className="flex-grow flex items-center">
            {item.children.length > 0 && (
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                className="mr-2 text-gray-500 focus:outline-none"
              >
                {item.isExpanded ? "▼" : "►"}
              </button>
            )}
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateListItemText(item.id, e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-md text-sm text-black" // Ensure text is black
              placeholder={`Level ${item.level} item...`}
            />
          </div>
          <div className="ml-2 flex">
            <button
              type="button"
              onClick={() => addListItem(item.id, item.level + 1)}
              className="p-1 bg-blue-100 text-blue-600 rounded-md mr-1 text-xs"
              title="Add child item"
            >
              + Sub
            </button>
            <button
              type="button"
              onClick={() => removeListItem(item.id)}
              className="p-1 bg-red-100 text-red-600 rounded-md text-xs"
              title="Remove item"
            >
              ✕
            </button>
          </div>
        </div>

        {item.children.length > 0 && item.isExpanded && (
          <div className="ml-4">
            {renderListItems(item.children, indent + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Deskripsi Daftar Berjenjang
      </label>
      <div className="border border-gray-300 rounded-md p-4">
        <div className="mb-3 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">
            Daftar Item
          </h3>
          <button
            type="button"
            onClick={() => addListItem(null, 1)}
            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm"
          >
            + Tambah Item
          </button>
        </div>

        <div className="space-y-1">
          {renderListItems(listItems)}
        </div>

        {validationError && (
          <p className="mt-2 text-sm text-red-600">
            {validationError}
          </p>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Klik + Sub untuk menambahkan sub-item. Klik ✕ untuk menghapus item.
      </p>
    </div>
  );
};

export default NestedListEditor;
