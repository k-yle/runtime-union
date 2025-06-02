import { promises as fs } from 'node:fs';
import ts from 'typescript';

export async function readJsoncFile(filePath: string) {
  const fileContent = await fs.readFile(filePath, 'utf8');

  // using the TypeScript compiler's API since it can parse jsonc without adding another dependency
  const { config, error } = ts.readConfigFile('irrelevant', () => fileContent);
  if (error) throw new Error(JSON.stringify(error.messageText));

  return config;
}
