// types/content.ts
export interface DropdownOption {
    id: number;
    name: string;
  }
  
  export interface ValidationErrors {
    sub_menu_id?: string;
    title?: string;
    description?: string;
    required_documents?: string;
    thumbnail?: string;
  }
  
  export interface SubMenuResponse {
    id: number;
    sub_menu_name: string;
  }
  
  export interface ListItem {
    id: string;
    text: string;
    level: number;
    children: ListItem[];
    isExpanded?: boolean;
  }