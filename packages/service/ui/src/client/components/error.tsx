import React from 'react';

import { XCircleIcon } from '@heroicons/react/solid';

import { classNames } from './util';

export interface ErrorViewProps {
  className?: string;
  title?: string;
  error?: Error | string | Error[] | string[];
}

export function ErrorView(props: ErrorViewProps) {
  const { title, className = '', error = [] } = props;

  const errors = Array.isArray(error) ? error : [error];
  const errorMessage = errors.map((e) => {
    return typeof e === 'string' ? e : e.message;
  });

  return (
    <div className={classNames(className, 'rounded-md', 'bg-red-50', 'p-4')}>
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          {title && (
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
          )}
          {errorMessage.length > 0 && (
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc pl-5 space-y-1">
                {errorMessage.map((message) => {
                  return <li>{message}</li>;
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
