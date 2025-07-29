import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { marked } from 'marked';

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
  rawContent?: string; // Store original raw content for markdown files
  language: string;
  size: number;
  modified: Date;
  readmeContent?: string;
  rawReadmeContent?: string; // Store original raw README content
  isMarkdownRendered?: boolean;
}

export interface SearchIndexItem {
  title: string;
  description: string;
  content: string;
  url: string;
  filePath: string;
  type: string;
  language?: string;
  tags?: string[];
  modified?: Date;
}

const SCRIPTS_DIR = join(process.cwd(), 'scripts');

/**
 * Helper function to get the correct path with base
 */
function getPath(path: string): string {
  // Get the base URL from environment variable - handle pythonmap-mk2 basepath
  const base = process.env.BASE_URL || import.meta.env?.BASE_URL || '/pythonmap-mk2/';
  if (base === '/') return path;
  const normalizedBase = base.replace(/\/$/, '');
  return normalizedBase + path;
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

    const rawContent = readFileSync(fullPath, 'utf-8');
    let content = rawContent;
    const name = basename(fullPath);
    const language = getLanguageFromExtension(name);
    let isMarkdownRendered = false;

    // Process markdown files to HTML like MK1
    if (language === 'markdown') {
      try {
        content = marked(rawContent);
        isMarkdownRendered = true;
      } catch (error) {
        console.warn('Markdown processing failed:', error);
        // Keep original content if processing fails
      }
    }

    // Find README content for split view (processed as HTML like MK1)
    let readmeContent = '';
    let rawReadmeContent = '';
    const fileDir = dirname(fullPath);
    const readmeFiles = ['README.md', 'readme.md', 'Readme.md'];
    
    for (const readmeFile of readmeFiles) {
      try {
        const readmePath = join(fileDir, readmeFile);
        rawReadmeContent = readFileSync(readmePath, 'utf-8');
        readmeContent = marked(rawReadmeContent);
        break;
      } catch {
        // Continue to next readme option
      }
    }

    return {
      name,
      content,
      rawContent: language === 'markdown' ? rawContent : undefined,
      language,
      size: stat.size,
      modified: stat.mtime,
      readmeContent: readmeContent || undefined,
      rawReadmeContent: rawReadmeContent || undefined,
      isMarkdownRendered
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

/**
 * Build search index for files and directories
 */
export function buildSearchIndex(relativePath: string = ''): SearchIndexItem[] {
  const fullPath = join(SCRIPTS_DIR, relativePath);
  const searchIndex: SearchIndexItem[] = [];

  function indexDirectory(dirPath: string, relativeBasePath: string = '') {
    try {
      const items = readdirSync(dirPath);

      for (const item of items) {
        const itemPath = join(dirPath, item);
        const itemRelativePath = join(relativeBasePath, item).replace(/\\/g, '/');
        
        try {
          const stat = statSync(itemPath);

          if (stat.isDirectory()) {
            // Index directory
            searchIndex.push({
              title: item,
              description: `Directory: ${item}`,
              content: '',
              url: getPath(`/browser/${itemRelativePath}`),
              filePath: itemRelativePath,
              type: 'directory',
              tags: ['directory', 'folder'],
              modified: stat.mtime
            });

            // Recursively index subdirectory (but limit depth to avoid performance issues)
            if (relativeBasePath.split('/').length < 5) {
              indexDirectory(itemPath, itemRelativePath);
            }
          } else {
            // Index file
            const language = getLanguageFromExtension(item);
            let content = '';
            let description = `${language} file`;
            const tags = [language, 'file'];

            // Try to read file content for search (with size limit)
            if (stat.size < 1024 * 1024) { // Only read files smaller than 1MB
              try {
                content = readFileSync(itemPath, 'utf-8');
                
                // Generate description from first few lines
                const lines = content.split('\n').slice(0, 3).join(' ').trim();
                if (lines.length > 0) {
                  description = lines.substring(0, 100) + (lines.length > 100 ? '...' : '');
                }

                // Add language-specific tags
                if (language === 'python' && content.includes('def ')) tags.push('functions');
                if (language === 'python' && content.includes('class ')) tags.push('classes');
                if (language === 'javascript' && content.includes('function ')) tags.push('functions');
                if (language === 'markdown') tags.push('documentation');
                if (item.toLowerCase().includes('readme')) tags.push('readme', 'documentation');
                if (item.toLowerCase().includes('config')) tags.push('configuration');
                if (item.toLowerCase().includes('test')) tags.push('tests');
                
              } catch (error) {
                // If we can't read the file, just index basic info
                console.warn(`Could not read file ${itemPath}:`, error.message);
              }
            }

            searchIndex.push({
              title: item,
              description,
              content,
              url: getPath(`/browser/${itemRelativePath}`),
              filePath: itemRelativePath,
              type: language,
              language,
              tags,
              modified: stat.mtime
            });
          }
        } catch (error) {
          console.warn(`Skipping ${itemPath}:`, error.message);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory ${dirPath}:`, error.message);
    }
  }

  indexDirectory(fullPath, relativePath);
  
  // Sort by modified date (newest first) and then by name
  return searchIndex.sort((a, b) => {
    if (a.modified && b.modified) {
      return b.modified.getTime() - a.modified.getTime();
    }
    return a.title.localeCompare(b.title);
  });
}