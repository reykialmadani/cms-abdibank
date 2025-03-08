// pages/admins/content/components/readTableSkeleton.tsx

const ReadTableSkeleton: React.FC<{ rowCount?: number }> = ({ rowCount = 5 }) => {
    return (
      <>
        {Array(rowCount)
          .fill(0)
          .map((_, index) => (
            <tr key={index} className="hover:bg-gray-50 transition duration-150">
              <td className="px-6 py-4">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end space-x-2">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </td>
            </tr>
          ))}
      </>
    );
  };
  
  export default ReadTableSkeleton;