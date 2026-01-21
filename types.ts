
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
  // Extended profile fields
  birth_date?: string;
  dni?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone_secondary?: string;
  shirt_size?: string;
  allergies?: string;
}

export interface SepaInfo {
  id?: string;
  user_id: string;
  iban: string;
  account_holder: string;
  swift_bic?: string;
  mandate_date?: string;
  is_active: boolean;
}

export interface PlayerGuardian {
  id: string;
  player_id: string;
  guardian_id: string;
  relationship_type: string;
  is_primary: boolean;
  player?: User; // Joined data
}
