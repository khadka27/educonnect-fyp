import { Search } from "lucide-react"

const SearchBar = () => {
  return (
    <div className="relative w-full max-w-xs sm:max-w-md">
      <input
        type="text"
        placeholder="Search..."
        className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  )
}

export default SearchBar

