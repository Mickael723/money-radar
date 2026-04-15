import * as fs from 'fs';
import * as path from 'path';

// Load the JSON locally 
const rulesPath = path.join(__dirname, 'merchant_rules.json');
let rulesData = { exact_match: {} as Record<string, string>, regex_match: {} as Record<string, string[]> };

try {
  const fileContent = fs.readFileSync(rulesPath, 'utf-8');
  rulesData = JSON.parse(fileContent);
} catch (error) {
  console.warn('Failed to load merchant_rules.json. Ensure it exists in src/modules/categorizer/');
}

// Compile regex maps for faster lookup
const compiledRegexRules: { category: string; test: RegExp }[] = [];
if (rulesData.regex_match) {
  for (const [category, patterns] of Object.entries(rulesData.regex_match)) {
    // Join patterns allowing early exit, using word boundary logic where helpful, 
    // but just sticking to global insensitve regex match is safer.
    const joinedPattern = patterns.join('|');
    if (joinedPattern.length > 0) {
      compiledRegexRules.push({
        category,
        test: new RegExp(joinedPattern, 'i')
      });
    }
  }
}

/**
 * Re-import Transaction type. Usually imports from shared or parser types.
 * For loose coupling, define it locally or import from parser.
 */
import { Transaction } from '../parser/types';

export async function categorizeTransactions(transactions: Transaction[]): Promise<Transaction[]> {
  const result: Transaction[] = [];

  for (const t of transactions) {
    if (!t.description) {
      result.push({ ...t, category: 'other' });
      continue;
    }

    // 1. Clean description
    const cleanedDesc = t.description.trim().toLowerCase();

    // 2. Exact match check
    if (rulesData.exact_match && rulesData.exact_match[cleanedDesc]) {
      result.push({ ...t, category: rulesData.exact_match[cleanedDesc] });
      continue;
    }

    // 3. Regex match check
    let matchedCategory = 'other';
    for (const rule of compiledRegexRules) {
      if (rule.test.test(cleanedDesc)) {
        matchedCategory = rule.category;
        break; // found highest priority match (first listed in object iteration if consistent, but usually unordered)
      }
    }

    // 4. Fallback pushed
    result.push({ ...t, category: matchedCategory });
  }

  // Claude API has been deferred. 'other' remains 'other'.
  return result;
}
