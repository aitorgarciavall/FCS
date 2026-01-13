
export enum Screen {
  HOME = 'HOME',
  TEAMS = 'TEAMS',
  NEWS = 'NEWS',
  CLUB = 'CLUB',
  CLUB_PRESENTACIO = 'CLUB_PRESENTACIO',
  CLUB_IDEARI = 'CLUB_IDEARI',
  CLUB_OBJECTIUS = 'CLUB_OBJECTIUS',
  CLUB_REGLAMENT = 'CLUB_REGLAMENT',
  CLUB_ORGANIGRAMA = 'CLUB_ORGANIGRAMA',
  CONTACT = 'CONTACT',
  ADMIN = 'ADMIN'
}

export interface NewsItem {
  id: string;
  category: string;
  date: string;
  title: string;
  description: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  linkText: string;
}

export interface TeamCategory {
  id: string;
  name: string;
  age: string;
  imageUrl: string;
  tag?: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  is_active?: boolean;
  created_at?: string;
  roles?: Role[]; // Per mostrar els rols a la interfície
  teams?: { id: string, name: string }[]; // Equips assignats
}
