import React from 'react';
import Input from '@ui/Input';

export default function SearchAndFilter({ 
  searchTerm, 
  onSearchChange, 
  sortOption, 
  onSortChange,
  totalCount 
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
      <div className="w-full sm:w-64">
        <Input
          id="searchUrls"
          type="text"
          placeholder="Search URLs..."
          value={searchTerm}
          onChange={onSearchChange}
          icon={
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">
          {totalCount} {totalCount === 1 ? 'URL' : 'URLs'}
        </span>
        <span className="text-sm text-gray-500">|</span>
        <label htmlFor="sortUrls" className="text-sm text-gray-500">Sort by:</label>
        <select
          id="sortUrls"
          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={sortOption}
          onChange={onSortChange}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="a-z">A-Z</option>
          <option value="z-a">Z-A</option>
        </select>
      </div>
    </div>
  );
}