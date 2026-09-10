import os

def patch_file(path, is_income):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update useTransactions call
    old_use_tx = "const { transactions: allTransactions, loading, error, refresh } = useTransactions();"
    new_use_tx = """const [page, setPage] = useState(1);
  const { transactions: allTransactions, pagination, loading, error, refresh } = useTransactions({ page, limit: 20 });"""
    if old_use_tx in content:
        content = content.replace(old_use_tx, new_use_tx)
    
    # 2. Update footer
    old_footer = """              <div className="flex items-center justify-between px-6 py-5 mt-auto">
                <div className="text-[13px] font-bold text-[#6B7280]">Showing {transactions.length} records</div>
                <div className="flex gap-2">
                  <button className="h-9.5 w-[38px] rounded-[10px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#9CA3AF] hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button className="h-[38px] w-[38px] rounded-[10px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#111827] hover:bg-gray-50 shadow-sm transition-colors cursor-pointer">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>"""
    
    new_footer = """              <div className="flex items-center justify-between px-6 py-5 mt-auto">
                <div className="text-[13px] font-bold text-[#6B7280]">
                  Showing {pagination && pagination.total > 0 
                      ? `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * Math.max(pagination.limit, 1), pagination.total)}`
                      : "0"} of {pagination?.total ?? 0} records
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!pagination || pagination.page <= 1}
                    className="h-[38px] w-[38px] rounded-[10px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#9CA3AF] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(pagination?.pages ?? 1, p + 1))}
                    disabled={!pagination || pagination.page >= (pagination?.pages ?? 1)}
                    className="h-[38px] w-[38px] rounded-[10px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#111827] hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>"""

    if old_footer in content:
        content = content.replace(old_footer, new_footer)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched {path}")

base = "c:/Users/HomePC/Desktop/shepherdwatch-finmodule-fe/app/(screens)"
patch_file(f"{base}/branchlead-pastor/income-tracking/page.tsx", True)
patch_file(f"{base}/branchlead-pastor/expense-tracking/page.tsx", False)
print("SUCCESS!")
