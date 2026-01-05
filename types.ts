
export enum Screen {
  HOME = 'HOME',
  TEAMS = 'TEAMS',
  NEWS = 'NEWS',
  CLUB = 'CLUB',
  CONTACT = 'CONTACT'
}

export interface NewsItem {
  id: string;
  category: string;
  date: string;
  title: string;
  description: string;
  imageUrl: string;
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
