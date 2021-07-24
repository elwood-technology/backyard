import React from 'react';

import { SearchIcon } from '@heroicons/react/solid';

export function SearchBoxView(): JSX.Element {
  return (
    <form className="flex md:ml-0" action="#" method="GET">
      <label htmlFor="search-field" className="sr-only">
        Search
      </label>
      <div className="btn relative w-full text-gray-400 focus-within:text-gray-600 ">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        <input
          id="search-field"
          className="block w-full h-full pl-8 pr-3 py-2 bg-transparent border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
          placeholder="Search"
          type="search"
          name="search"
        />
      </div>
    </form>
  );
}
