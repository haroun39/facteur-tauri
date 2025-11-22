import React from "react";
type PropsData = {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  notMore: boolean;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
};
function Pagination(props: PropsData) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex space-x-2">
        <button
          className="text-body bg-neutral-secondary-medium border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-2 focus:outline-none rounded me-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() =>
            props.setCurrentPage(
              props.notMore ? props.currentPage - 1 : props.currentPage - 1
            )
          }
          disabled={props.currentPage === 1}
        >
          السابق
        </button>

        <button
          className="text-body bg-neutral-secondary-medium border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-2 focus:outline-none rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => props.setCurrentPage(props.currentPage + 1)}
          disabled={props.notMore}
        >
          التالي
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-600"> الصفحة:{props.currentPage}</div>
        <select
          className="border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-primary focus:border-transparent"
          value={props.pageSize}
          onChange={(e) => props.setPageSize(Number(e.target.value))}
        >
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  );
}

export default Pagination;
