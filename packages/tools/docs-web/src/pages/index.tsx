import React from 'react';

export default function Index(): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px',
        backgroundImage: 'linear-gradient(270deg, #374142 0%, #423E53 100%)',
      }}
    >
      <div style={{ width: '80vw', maxWidth: '200px' }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none" fill-rule="evenodd">
            <rect fill="#fff" width="512" height="512" rx="117" />
            <text
              font-family="PTSans-Bold, PT Sans"
              font-size="271"
              font-weight="bold"
              fill="#333"
            >
              <tspan x="183" y="341">
                b
              </tspan>
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
