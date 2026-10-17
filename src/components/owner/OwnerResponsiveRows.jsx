/**
 * Desktop table + mobile stacked cards for owner list data.
 * @param {{
 *   columns: Array<{ key: string, label: string, render?: (row: object) => import('react').ReactNode, emphasize?: boolean, className?: string }>,
 *   rows: object[],
 *   getRowKey: (row: object) => string,
 *   emptyMessage?: string,
 * }} props
 */
export default function OwnerResponsiveRows({
  columns,
  rows,
  getRowKey,
  emptyMessage = 'No rows for this view.',
}) {
  if (!rows?.length) {
    return <p className="text-sm text-muted">{emptyMessage}</p>;
  }

  const cell = (column, row) => (
    column.render ? column.render(row) : row[column.key]
  );

  return (
    <>
      <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-line md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-canvas/80 text-xs font-extrabold uppercase tracking-wider text-muted">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="border-t border-line">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 ${column.emphasize ? 'font-bold text-ink' : 'text-muted'} ${column.className || ''}`}
                    style={column.emphasize ? { fontVariantNumeric: 'tabular-nums' } : undefined}
                  >
                    {cell(column, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 md:hidden">
        {rows.map((row) => {
          const titleCol = columns.find((column) => column.emphasize) || columns[0];
          const detailCols = columns.filter((column) => column.key !== titleCol.key);
          return (
            <article key={getRowKey(row)} className="surface-card p-4">
              <p className="break-words text-sm font-extrabold text-ink">{cell(titleCol, row)}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {detailCols.map((column) => (
                  <div key={column.key} className="min-w-0">
                    <dt className="text-xs font-extrabold uppercase tracking-wider text-muted">{column.label}</dt>
                    <dd className="mt-0.5 break-words font-bold text-ink">{cell(column, row)}</dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>
    </>
  );
}
