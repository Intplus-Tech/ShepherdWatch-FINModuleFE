const fs = require('fs');

const content = fs.readFileSync('app/(screens)/branchlead-pastor/requisition/page.tsx', 'utf8');

let stack = [];
let i = 0;
while (i < content.length) {
    if (content.substring(i).startsWith('<!--')) {
        i = content.indexOf('-->', i) + 3;
        continue;
    }
    if (content.substring(i).startsWith('/*') || content.substring(i).startsWith('{/*')) {
        i = content.indexOf('*/', i) + 2;
        if (content[i] === '}') i++;
        continue;
    }
    
    let match = content.substring(i).match(/^<\/?([a-zA-Z0-9]+)[^>]*?(\/?)>/);
    if (match) {
        let tag = match[1];
        let isClose = content[i+1] === '/';
        let isSelfClose = match[2] === '/';
        
        if (!isSelfClose) {
            let line = content.substring(0, i).split('\n').length;
            if (isClose) {
                if (stack.length === 0) {
                    console.log(`Unmatched closing tag ${tag} at line ${line}`);
                    break;
                }
                let top = stack.pop();
                if (top.tag !== tag) {
                    console.log(`Mismatched closing tag. Expected ${top.tag} from line ${top.line}, got ${tag} at line ${line}`);
                    break;
                }
            } else {
                stack.push({tag, line});
            }
        }
        i += match[0].length;
    } else {
        i++;
    }
}
if (stack.length > 0) {
    console.log(`Unclosed tags remaining:`, stack);
} else {
    console.log("No tag mismatch found!");
}
