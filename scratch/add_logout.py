import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already processed or if it doesn't have a sidebar
    if 'handleLogout' in content or '{/* Bottom Section */}' not in content:
        return False

    print(f"Processing {filepath}")

    # 1. Add imports
    imports_to_add = []
    if 'useAuth' not in content:
        imports_to_add.append('import { useAuth } from "@/components/auth/AuthProvider"')
    if 'useRouter' not in content:
        imports_to_add.append('import { useRouter } from "next/navigation"')
    
    if imports_to_add:
        # Find last import
        import_matches = list(re.finditer(r'^import .*$', content, re.MULTILINE))
        if import_matches:
            last_import = import_matches[-1]
            insert_pos = last_import.end()
            content = content[:insert_pos] + '\n' + '\n'.join(imports_to_add) + content[insert_pos:]
        else:
            # Add after "use client"
            if '"use client"' in content:
                content = content.replace('"use client"', '"use client"\n' + '\n'.join(imports_to_add))
            else:
                content = '\n'.join(imports_to_add) + '\n' + content

    # Add LogOut to lucide-react if not present
    if 'lucide-react"' in content and 'LogOut' not in content:
        content = re.sub(r'(import\s+\{.*?)(\}\s+from\s+["\']lucide-react["\'])', r'\1, LogOut\2', content, flags=re.DOTALL)
    elif 'lucide-react' not in content:
        content = 'import { LogOut } from "lucide-react"\n' + content

    # 2. Inject handleLogout function before return (
    logout_func = """
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login")
    } catch (err) {
      console.error("Logout failed", err)
      router.replace("/login")
    }
  }
"""
    # Find the main component return statement
    # Look for the last 'return (' that has JSX
    return_match = list(re.finditer(r'^(\s*)return\s*\(', content, re.MULTILINE))
    if return_match:
        # Usually the first return ( inside the export default function
        first_return = return_match[0]
        indent = first_return.group(1)
        insert_pos = first_return.start()
        # Adjust indentation
        indented_func = '\n'.join([indent + line if line else line for line in logout_func.strip().split('\n')]) + '\n\n'
        content = content[:insert_pos] + indented_func + content[insert_pos:]

    # 3. Inject the logout button into Bottom Section
    bottom_section_match = re.search(r'(\{\/\*\s*Bottom Section\s*\*\/\}.*?)(</div>\s*</div>\s*</aside>)', content, re.DOTALL)
    if bottom_section_match:
        full_bottom = bottom_section_match.group(1)
        
        button_html = """
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-[8px] py-2.5 px-4 text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors w-full text-left mt-2"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
"""
        # Inject just before the closing of the flex container in the bottom section
        # The structure is usually <div class="mt-auto..."> <div class="pt-6 border-t ..."> ... </div> </div>
        # We can append it to the inner div.
        inner_div_close = full_bottom.rfind('</div>')
        if inner_div_close != -1:
            new_bottom = full_bottom[:inner_div_close] + button_html + full_bottom[inner_div_close:]
            content = content[:bottom_section_match.start(1)] + new_bottom + content[bottom_section_match.start(2):]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

if __name__ == "__main__":
    files = glob.glob('app/(screens)/**/page.tsx', recursive=True)
    count = 0
    for f in files:
        if process_file(f):
            count += 1
    print(f"Processed {count} files.")
