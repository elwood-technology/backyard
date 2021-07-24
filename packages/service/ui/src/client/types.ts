import { ReactNode } from 'react';

export interface HookState<Data> {
  loading: boolean;
  error?: Error;
  data?: Data;
}

export interface MenuItem {
  id: string;
  icon?: ReactNode;
  text: string;
  href: string;
  current?: true;
  children?: Array<Omit<MenuItem, 'children'>>;
}
