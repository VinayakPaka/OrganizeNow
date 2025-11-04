export type Board = {
  id: string;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  position?: number;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ContentBlock = {
  id: string;
  user_id?: string;
  board_id: string;
  parent_id?: string | null;
  content_type: "text" | "checklist" | "sub-board" | "image" | "heading" | "file" | "shape";
  content: any;
  position_x: number;
  position_y: number;
  position_index?: number;
  is_done: boolean;
  is_collapsed: boolean;
  created_at?: string;
  updated_at?: string;
};


