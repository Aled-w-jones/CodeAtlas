import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename, dirname } from 'path';

export interface FileItem {
  name: string;
  title: string;
  url: string;
  isDirectory: boolean;
  size?: number;
  modified?: Date;
}

export interface DirectoryListing {
  directories: FileItem[];
  files: FileItem[];
  currentPath: string;
  parentPath?: string;
}

export interface FileContent {
  name: string;
  content: string;
  language: string;
  size: number;
  modified: Date;
}

const SCRIPTS_DIR = join(process.cwd(), 'scripts');

/**
 * Helper function to get the correct path with base
 */
function getPath(path: string): string {
  // Get the base URL from environment variable
  const base = process.env.BASE_URL || import.meta.env?.BASE_URL || '/';
  return base === '/' ? path : base.replace(/\/$/, '') + path;
}

/**
 * Get directory listing for the file browser
 */
export function getDirectoryListing(relativePath: string = ''): DirectoryListing {
  const fullPath = join(SCRIPTS_DIR, relativePath);
  const currentPath = relativePath || '';

  try {
    const items = readdirSync(fullPath);
    const directories: FileItem[] = [];
    const files: FileItem[] = [];

    for (const item of items) {
      const itemPath = join(fullPath, item);
      const stat = statSync(itemPath);
      const itemRelativePath = join(relativePath, item).replace(/\\/g, '/');

      if (stat.isDirectory()) {
        directories.push({
          name: item,
          title: item,
          url: getPath(`/browser/${itemRelativePath}`),
          isDirectory: true,
          size: 0,
          modified: stat.mtime
        });
      } else {
        files.push({
          name: item,
          title: item,
          url: getPath(`/browser/${itemRelativePath}`),
          isDirectory: false,
          size: stat.size,
          modified: stat.mtime
        });
      }
    }

    // Sort directories and files alphabetically
    directories.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));

    return {
      directories,
      files,
      currentPath,
      parentPath: currentPath ? dirname(currentPath).replace(/\\/g, '/') : undefined
    };
  } catch (error) {
    console.error('Error reading directory:', error);
    return {
      directories: [],
      files: [],
      currentPath,
      parentPath: currentPath ? dirname(currentPath).replace(/\\/g, '/') : undefined
    };
  }
}

/**
 * Get file content for the code viewer
 */
export function getFileContent(relativePath: string): FileContent | null {
  const fullPath = join(SCRIPTS_DIR, relativePath);

  try {
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      return null;
    }

    const content = readFileSync(fullPath, 'utf-8');
    const name = basename(fullPath);
    const language = getLanguageFromExtension(name);

    return {
      name,
      content,
      language,
      size: stat.size,
      modified: stat.mtime
    };
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

/**
 * Get programming language from file extension
 */
export function getLanguageFromExtension(filename: string): string {
  const ext = extname(filename).toLowerCase().slice(1);
  
  const languageMap: Record<string, string> = {
    'py': 'python',
    'js': 'javascript',
    'mjs': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'jsx': 'javascript',
    'json': 'json',
    'md': 'markdown',
    'markdown': 'markdown',
    'sh': 'bash',
    'bash': 'bash',
    'yml': 'yaml',
    'yaml': 'yaml',
    'toml': 'toml',
    'css': 'css',
    'scss': 'scss',
    'less': 'less',
    'html': 'html',
    'xml': 'xml',
    'sql': 'sql',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'c': 'c',
    'cpp': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'java': 'java',
    'kt': 'kotlin',
    'swift': 'swift',
    'dart': 'dart',
    'lua': 'lua',
    'r': 'r',
    'scala': 'scala',
    'clj': 'clojure',
    'hs': 'haskell'
  };

  return languageMap[ext] || 'text';
}

/**
 * Check if a file path exists within the scripts directory
 */
export function fileExists(relativePath: string): boolean {
  try {
    const fullPath = join(SCRIPTS_DIR, relativePath);
    statSync(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get breadcrumb navigation for the current path
 */
export function getBreadcrumbs(currentPath: string): Array<{ name: string; url: string }> {
  if (!currentPath) return [];

  const parts = currentPath.split('/').filter(Boolean);
  const breadcrumbs = [];

  for (let i = 0; i < parts.length; i++) {
    const path = parts.slice(0, i + 1).join('/');
    breadcrumbs.push({
      name: parts[i],
      url: getPath(`/browser/${path}`)
    });
  }

  return breadcrumbs;
}