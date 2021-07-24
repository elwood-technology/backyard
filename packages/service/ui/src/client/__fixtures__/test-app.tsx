import React from 'react';

import {
  createService,
  CanvasTitle,
  CanvasShortcuts,
  CanvasMenu,
  useUri,
} from '@backyard/ui-react';

createService({
  async before() {
    console.log('hello world');
  },
  async canvas() {
    return {
      default: () => {
        const uri = useUri();

        return (
          <>
            <CanvasTitle title="Hello World" />
            <CanvasShortcuts
              shortcuts={[
                {
                  id: '1',
                  text: 'hello world',
                  href: '/poop',
                  icon: 'SearchIcon',
                },
                {
                  id: '2',
                  text: 'hello world',
                  href: '/poop1',
                  icon: 'AnnotationIcon',
                },
              ]}
            />
            <CanvasMenu
              menu={[
                {
                  id: '2',
                  text: 'hello world',
                  href: '/poop1',
                  icon: 'AnnotationIcon',
                },
              ]}
            />
            hello <div>{uri}</div>
          </>
        );
      },
    };
  },
  async data() {
    return async () => {
      console.log('hello');
    };
  },
});
