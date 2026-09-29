const fs = require("fs");
const p = "app/api/v1/financial/coa/route.ts";
let s = fs.readFileSync(p, "utf8");
const must = (n) => { if (!s.includes(n)) throw new Error("not found: " + n.slice(0, 90)); };
const rep = (a, b) => { must(a); s = s.replace(a, b); };

// The backend's enum is income | expense | asset | liability | equity.
// `revenue` is what the swagger claims and what the API rejects.
rep(`  accountType: "asset" | "liability" | "equity" | "revenue" | "expense"`,
    `  accountType: "asset" | "liability" | "equity" | "income" | "expense"`);

rep(`  const accountTypeRaw = String(source.accountType ?? "").toLowerCase()
  const accountType = ["asset", "liability", "equity", "revenue", "expense"].includes(accountTypeRaw)
    ? (accountTypeRaw as CreateChartPayload["accountType"])
    : null`,
`  // The API names the inflow type \`income\`; older callers say \`revenue\`.
  const accountTypeRaw = String(source.accountType ?? "").toLowerCase()
  const normalizedType = accountTypeRaw === "revenue" ? "income" : accountTypeRaw === "expenses" ? "expense" : accountTypeRaw
  const accountType = ["asset", "liability", "equity", "income", "expense"].includes(normalizedType)
    ? (normalizedType as CreateChartPayload["accountType"])
    : null`);

rep(`      const mappedAccountType =
        normalized === "income"
          ? "revenue"
          : normalized === "expenses"
            ? "expense"
            : normalized

      if (["asset", "liability", "equity", "revenue", "expense"].includes(mappedAccountType)) {`,
`      const mappedAccountType =
        normalized === "revenue"
          ? "income"
          : normalized === "expenses"
            ? "expense"
            : normalized

      if (["asset", "liability", "equity", "income", "expense"].includes(mappedAccountType)) {`);
fs.writeFileSync(p, s);
console.log("coa proxy accepts income both ways");
