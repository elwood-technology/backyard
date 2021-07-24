import React, { ReactElement, useEffect, useState, createElement } from 'react';

type Func = () => JSX.Element;

export interface IconViewProps {
  name: string;
}

export function IconView(props: IconViewProps): JSX.Element {
  const { name } = props;
  const [el, setEl] = useState<ReactElement>();

  useEffect(() => {
    import(/* webpackChunkName: "icon" */ '@heroicons/react/outline').then(
      (icons) => {
        if (name in icons) {
          setEl(createElement(icons[name] as Func));
        }
      },
    );
  }, [name]);

  return <>{el}</>;
}
