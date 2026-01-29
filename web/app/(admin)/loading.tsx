export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative inline-block">
          {/* 旋转圆圈 */}
          <svg className="w-16 h-16 text-green-500 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>

          {/* 中间的勾 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <p className="mt-6 text-gray-700 font-medium">Loading...</p>
        <p className="mt-2 text-gray-500 text-sm">Please wait a moment</p>
      </div>
    </div>
  );
}