// pages/admins/content/components/interfaces.ts

// Interface untuk item content
export interface ContentItem {
    id: number;
    title: string;
    description: string;
    status: boolean;
    created_at: string;
    updated_at: string;
    sub_menu_name: string;
    sub_menu_id: number;
  }
  
  // Interface untuk pagination
  export interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }
  
  // Interface untuk content yang akan dihapus
  export interface ContentToDelete {
    id: number;
    title: string;
  }