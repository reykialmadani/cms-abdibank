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
  reportType?: string;
reportYear?: string;
[key: string]: string | undefined;
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

export interface ReportMetadata {
  type: "triwulan" | "tahunan";
  year: string;
}
