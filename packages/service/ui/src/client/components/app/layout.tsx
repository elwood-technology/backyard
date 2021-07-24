import React, { PropsWithChildren, ReactNode } from 'react';

export interface AppViewProps {
  nav: ReactNode;
  header: ReactNode;
}

export function AppView(props: PropsWithChildren<AppViewProps>): JSX.Element {
  const { children, nav, header } = props;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {nav}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          {header}
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
