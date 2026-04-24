import { Search } from "lucide-react";

export const SearchNoResult = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <Search className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-900">No results found</p>
      <p className="text-xs text-gray-500 mt-1">
        Try searching for something else
      </p>
    </div>
  );
};