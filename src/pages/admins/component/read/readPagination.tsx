// // pages/admins/content/components/readPagination.tsx
// import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
// import { Pagination } from "@/types/read";

// interface ReadPaginationProps {
//   pagination: Pagination;
//   onPageChange: (page: number) => void;
// }

// const ReadPagination: React.FC<ReadPaginationProps> = ({
//   pagination,
//   onPageChange,
// }) => {
//   if (pagination.last_page <= 1) {
//     return null;
//   }

//   return (
//     <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
//       <div className="flex-1 flex items-center justify-between">
//         <div>
//           <p className="text-sm text-gray-700">
//             Menampilkan{" "}
//             <span className="font-medium">
//               {(pagination.current_page - 1) * pagination.per_page + 1}
//             </span>{" "}
//             sampai{" "}
//             <span className="font-medium">
//               {Math.min(
//                 pagination.current_page * pagination.per_page,
//                 pagination.total
//               )}
//             </span>{" "}
//             dari{" "}
//             <span className="font-medium">{pagination.total}</span>{" "}
//             hasil
//           </p>
//         </div>
//         <div>
//           <nav
//             className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
//             aria-label="Pagination"
//           >
//             <button
//               onClick={() => onPageChange(pagination.current_page - 1)}
//               disabled={pagination.current_page === 1}
//               className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
//                 pagination.current_page === 1
//                   ? "text-gray-300 cursor-not-allowed"
//                   : "text-gray-500 hover:bg-gray-50"
//               }`}
//             >
//               <span className="sr-only">Previous</span>
//               <ArrowLeftIcon className="h-4 w-4" />
//             </button>

//             {/* Page numbers */}
//             {Array.from(
//               { length: pagination.last_page },
//               (_, i) => i + 1
//             ).map((page) => {
//               // Show current page, first page, last page, and 1 page before and after current
//               if (
//                 page === 1 ||
//                 page === pagination.last_page ||
//                 (page >= pagination.current_page - 1 &&
//                   page <= pagination.current_page + 1)
//               ) {
//                 return (
//                   <button
//                     key={page}
//                     onClick={() => onPageChange(page)}
//                     className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
//                       pagination.current_page === page
//                         ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
//                         : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 );
//               }

//               // Show ellipsis for pages that are not shown
//               if (
//                 (page === 2 && pagination.current_page > 3) ||
//                 (page === pagination.last_page - 1 &&
//                   pagination.current_page < pagination.last_page - 2)
//               ) {
//                 return (
//                   <span
//                     key={page}
//                     className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
//                   >
//                     ...
//                   </span>
//                 );
//               }

//               return null;
//             })}

//             <button
//               onClick={() => onPageChange(pagination.current_page + 1)}
//               disabled={pagination.current_page === pagination.last_page}
//               className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
//                 pagination.current_page === pagination.last_page
//                   ? "text-gray-300 cursor-not-allowed"
//                   : "text-gray-500 hover:bg-gray-50"
//               }`}
//             >
//               <span className="sr-only">Next</span>
//               <ArrowRightIcon className="h-4 w-4" />
//             </button>
//           </nav>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReadPagination;