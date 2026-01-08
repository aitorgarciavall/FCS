
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
