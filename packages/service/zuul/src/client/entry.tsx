import { createService } from '@backyard/ui-react';

createService({
  title: 'Authorization',
  data: () => import('./data'),
  canvas: () => import('./canvas'),
});

// window.onmessage = (msg) => {
//   console.log('test 1 message', msg);

//   if (typeof msg.data !== 'string') {
//     return;
//   }

//   const { payload: { token } = {} } = JSON.parse(msg.data) as {
//     payload: { token: string };
//   };

//   if (!token) {
//     return;
//   }

//   parent.postMessage(
//     JSON.stringify({
//       token,
//       type: 'set-shortcuts',
//       payload: {
//         shortcuts: [
//           {
//             id: '1',
//             icon: 'SearchIcon',
//             text: '2',
//             path: '4',
//           },
//         ],
//       },
//     }),
//     msg.origin,
//   );

//   parent.postMessage(
//     JSON.stringify({
//       token,
//       type: 'set-display-name',
//       payload: {
//         displayName: 'Authorization',
//       },
//     }),
//     msg.origin,
//   );
// };

// parent.postMessage(
//   JSON.stringify({
//     type: 'ready',
//   }),
//   'http://localhost:8080',
// );
