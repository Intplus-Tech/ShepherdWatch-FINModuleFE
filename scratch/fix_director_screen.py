import os

path = 'c:/Users/HomePC/Desktop/shepherdwatch-finmodule-fe/app/(screens)/director-screen/transaction/page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = 0

for i, line in enumerate(lines):
    if skip > 0:
        skip -= 1
        continue
        
    if 'type="search"' in line:
        new_lines.append(line)
        if 'value={searchQuery}' not in lines[i+1]:
            new_lines.append('                      value={searchQuery}\n')
            new_lines.append('                      onChange={(e) => setSearchQuery(e.target.value)}\n')
    elif 'const { transactions: rawTransactions' in line:
        new_lines.append('  const [page, setPage] = useState(1)\n')
        new_lines.append('  const [limit, setLimit] = useState(20)\n')
        new_lines.append('  const [searchQuery, setSearchQuery] = useState("")\n')
        new_lines.append('  const [debouncedSearch, setDebouncedSearch] = useState("")\n')
        new_lines.append('  useEffect(() => {\n')
        new_lines.append('    const handler = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1) }, 300)\n')
        new_lines.append('    return () => clearTimeout(handler)\n')
        new_lines.append('  }, [searchQuery])\n')
        new_lines.append('  const { transactions: rawTransactions, pagination, loading: txLoading, error: txError, refresh: refreshTransactions } = useTransactions({\n')
        new_lines.append('    ...(statusFilter === "ALL" ? {} : { status: statusFilter }),\n')
        new_lines.append('    startDate,\n')
        new_lines.append('    endDate,\n')
        new_lines.append('    page,\n')
        new_lines.append('    limit,\n')
        new_lines.append('    search: debouncedSearch,\n')
        new_lines.append('  })\n')
        skip = 4 # Skip old useTransactions
    elif 'Showing {transactions.length' in line:
        new_lines.append('''                <div>
                  Showing {pagination && pagination.total > 0 
                      ? `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)}`
                      : "0"} of {pagination?.total ?? 0} transactions
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!pagination || pagination.page <= 1}
                    className="px-5 py-2 rounded-[6px] border border-[#EEF1F6] bg-white hover:bg-gray-50 transition-colors font-bold text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(pagination?.pages ?? 1, p + 1))}
                    disabled={!pagination || pagination.page >= (pagination?.pages ?? 1)}
                    className="px-5 py-2 rounded-[6px] border border-[#EEF1F6] bg-white hover:bg-gray-50 transition-colors font-bold text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>\n''')
        skip = 4 # Skip the rest of the old pagination block
    else:
        new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("SUCCESS!")
