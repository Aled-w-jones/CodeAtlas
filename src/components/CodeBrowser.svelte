<script>
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import hljs from 'highlight.js/lib/core';
  import python from 'highlight.js/lib/languages/python';
  import javascript from 'highlight.js/lib/languages/javascript';
  import json from 'highlight.js/lib/languages/json';
  import markdown from 'highlight.js/lib/languages/markdown';
  import bash from 'highlight.js/lib/languages/bash';
  import BrowserSearchPanel from './BrowserSearchPanel.svelte';
  
  // Register highlight.js languages
  hljs.registerLanguage('python', python);
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('markdown', markdown);
  hljs.registerLanguage('bash', bash);

  export let directories = [];
  export let files = [];
  export let currentPath = '';
  export let currentFile = null;
  export let searchIndex = [];
  export let pageData = null;

  // State variables
  let highlightedCode = '';
  let lineNumbers = [];
  let processedMarkdown = '';
  let codeContainer;
  let splitContainer;
  let leftPanelWidth = 50; // Percentage for split view
  let isResizing = false;
  let readmeMinimized = false;
  let isMobile = false;
  let showMobileModal = false;
  let mobileModalContent = 'code'; // 'code' or 'readme'
  
  // Check if we have README content to show split view
  $: hasReadmeContent = currentFile && currentFile.readmeContent && currentFile.readmeContent.length > 0;
  $: isCodeFileWithReadme = currentFile && hasReadmeContent && !currentFile.name.toLowerCase().includes('readme');
  
  // Mobile detection
  function checkMobile() {
    isMobile = window.innerWidth < 768;
  }
  
  // Resizable panel functionality
  function startResize(e) {
    isResizing = true;
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    e.preventDefault();
  }
  
  function handleResize(e) {
    if (!isResizing || !splitContainer) return;
    const rect = splitContainer.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    leftPanelWidth = Math.max(20, Math.min(80, newWidth));
  }
  
  function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  }
  
  function toggleMobileModal(contentType) {
    mobileModalContent = contentType;
    showMobileModal = !showMobileModal;
  }

  // Process current file content with highlight.js
  $: if (currentFile?.content) {
    const lines = currentFile.content.split('\n');
    lineNumbers = lines.map((_, i) => i + 1);
    
    // Process markdown if it's a markdown file
    if (isMarkdownFile) {
      try {
        processedMarkdown = marked(currentFile.content);
      } catch (error) {
        console.warn('Markdown processing failed:', error);
        processedMarkdown = `<pre>${currentFile.content}</pre>`;
      }
    }
  }
  
  // Highlight code when currentFile changes
  $: if (codeContainer && currentFile?.content && !isMarkdownFile) {
    setTimeout(() => {
      const codeElements = codeContainer.querySelectorAll('code');
      codeElements.forEach(codeElement => {
        hljs.highlightElement(codeElement);
      });
    }, 0);
  }

  function getLanguageFromExtension(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py': return 'python';
      case 'js': case 'mjs': return 'javascript';
      case 'ts': return 'typescript';
      case 'json': return 'json';
      case 'md': case 'markdown': return 'markdown';
      case 'sh': case 'bash': return 'bash';
      case 'yml': case 'yaml': return 'yaml';
      case 'toml': return 'toml';
      case 'css': return 'css';
      case 'html': return 'html';
      default: return 'plain';
    }
  }

  function getFileIcon(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py': return '🐍';
      case 'js': case 'mjs': case 'ts': return '📜';
      case 'json': return '⚙️';
      case 'md': case 'markdown': return '📝';
      case 'yml': case 'yaml': return '🔧';
      case 'toml': return '⚙️';
      case 'css': return '🎨';
      case 'html': return '🌐';
      case 'sh': case 'bash': return '💻';
      default: return '📄';
    }
  }

  // Copy to clipboard with better error handling
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(currentFile.content);
      console.log('Code copied to clipboard');
    } catch (err) {
      console.error('Could not copy to clipboard:', err);
      try {
        const textArea = document.createElement('textarea');
        textArea.value = currentFile.content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        console.log('Code copied to clipboard (fallback)');
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr);
      }
    }
  }

  $: isMarkdownFile = currentFile?.name?.endsWith('.md') || currentFile?.name?.endsWith('.markdown');

  onMount(() => {
    console.log('CodeBrowser MK2 mounted with:', {
      directories: directories.length,
      files: files.length,
      currentPath,
      hasCurrentFile: !!currentFile
    });
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });
</script>

<div class="code-browser flex h-full bg-vsc-bg-dark text-vsc-text-primary" bind:this={splitContainer}>
  <!-- Left Panel - Directory/File Browser -->
  <div class="w-80 bg-vsc-bg-medium border-r border-vsc-border-light flex flex-col {isMobile ? 'hidden' : ''}">
    <!-- Header -->
    <div class="bg-vsc-bg-light px-4 py-3 border-b border-vsc-border-light">
      <h2 class="text-sm font-semibold text-vsc-text-primary">File Explorer</h2>
      <div class="text-xs text-vsc-text-secondary mt-1 font-mono">
        {currentPath || 'Root'}
      </div>
    </div>

    <!-- Directory and File List -->
    <div class="flex-1 overflow-auto p-3">
      <!-- Directories -->
      {#if directories.length > 0}
        <div class="mb-6">
          <h3 class="text-xs font-semibold text-vsc-text-secondary uppercase tracking-wide mb-3">Directories</h3>
          {#each directories as dir}
            <a 
              href={dir.url}
              class="flex items-center px-3 py-2 rounded text-sm text-vsc-text-primary hover:bg-vsc-bg-light hover:text-white transition-colors mb-1"
            >
              <span class="mr-3 text-yellow-400">📁</span>
              <span class="truncate">{dir.name}</span>
            </a>
          {/each}
        </div>
      {/if}

      <!-- Files -->
      {#if files.length > 0}
        <div>
          <h3 class="text-xs font-semibold text-vsc-text-secondary uppercase tracking-wide mb-3">Files</h3>
          {#each files as file}
            <a 
              href={file.url}
              class="flex items-center px-3 py-2 rounded text-sm transition-colors mb-1 {currentFile?.name === file.title ? 'bg-vsc-accent-blue text-white' : 'text-vsc-text-primary hover:bg-vsc-bg-light hover:text-white'}"
            >
              <span class="mr-3">
                {getFileIcon(file.title)}
              </span>
              <span class="truncate flex-1">{file.title}</span>
              {#if currentFile?.name === file.title}
                <span class="ml-2 text-xs text-blue-200">●</span>
              {/if}
            </a>
          {/each}
        </div>
      {/if}

      {#if directories.length === 0 && files.length === 0}
        <div class="text-center text-vsc-text-secondary mt-12">
          <div class="text-5xl mb-4">📁</div>
          <div class="text-sm">Empty directory</div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Resizable Handle for Split View -->
  {#if isCodeFileWithReadme && !isMobile}
    <div 
      class="w-1 bg-vsc-border-light hover:bg-vsc-accent-blue cursor-col-resize transition-colors"
      on:mousedown={startResize}
    ></div>
  {/if}
  
  <!-- Right Panel - File Content -->
  <div class="flex-1 flex flex-col" style={isCodeFileWithReadme && !isMobile ? `width: ${100 - leftPanelWidth}%` : ''}>
    {#if currentFile}
      <!-- File Header -->
      <div class="bg-vsc-bg-light px-6 py-3 border-b border-vsc-border-light flex items-center justify-between">
        {#if isMobile}
          <!-- Mobile Navigation Buttons -->
          <div class="flex items-center gap-2">
            <button 
              on:click={() => toggleMobileModal('code')}
              class="px-3 py-1 bg-vsc-accent-blue text-white rounded text-xs hover:bg-blue-600 transition-colors"
            >
              Code
            </button>
            {#if hasReadmeContent}
              <button 
                on:click={() => toggleMobileModal('readme')}
                class="px-3 py-1 bg-vsc-bg-medium text-vsc-text-primary rounded text-xs hover:bg-vsc-bg-light transition-colors border border-vsc-border-light"
              >
                README
              </button>
            {/if}
          </div>
        {/if}
        
        <div class="flex items-center">
          <span class="text-lg mr-3">{getFileIcon(currentFile.name)}</span>
          <div>
            <span class="text-sm text-white font-medium">{currentFile.name}</span>
            <span class="ml-4 text-xs px-2 py-1 bg-vsc-bg-dark rounded text-vsc-text-secondary font-mono">
              {getLanguageFromExtension(currentFile.name)}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-vsc-text-secondary font-mono">
            {lineNumbers.length} lines
          </span>
          <button 
            on:click={copyToClipboard}
            class="text-xs px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium shadow-sm"
            title="Copy code to clipboard"
          >
            📋 Copy
          </button>
        </div>
      </div>

      <!-- File Content -->
      <div class="flex-1 overflow-hidden flex">
        {#if isCodeFileWithReadme && !isMobile}
          <!-- Split View: Code and README -->
          <div class="flex h-full w-full">
            <!-- Left: Code -->
            <div class="flex-1 overflow-hidden" style="width: {leftPanelWidth}%">
              <div class="h-full overflow-auto flex bg-vsc-bg-dark" bind:this={codeContainer}>
                <!-- Line Numbers -->
                <div 
                  class="bg-vsc-bg-medium text-vsc-text-secondary select-none border-r border-vsc-border-light flex-shrink-0 sticky left-0" 
                  style="
                    padding: 16px 12px 16px 16px; 
                    min-width: 60px; 
                    text-align: right; 
                    white-space: pre; 
                    font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace; 
                    font-size: 14px; 
                    line-height: 21px; 
                    letter-spacing: 0;
                    z-index: 10;
                  "
                >
                  {#each lineNumbers as num}
                    <div style="height: 21px; line-height: 21px;">
                      {num}
                    </div>
                  {/each}
                </div>
                
                <!-- Code Content -->
                <div class="flex-1" style="padding: 16px 16px 16px 12px;">
                  <pre 
                    class="relative m-0 p-0" 
                    style="
                      font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace; 
                      font-size: 14px; 
                      line-height: 21px; 
                      letter-spacing: 0;
                      white-space: pre;
                      overflow: visible;
                    "
                  ><code 
                    class="language-{getLanguageFromExtension(currentFile.name)}" 
                    style="
                      line-height: 21px; 
                      display: block; 
                      font-family: inherit; 
                      font-size: inherit; 
                      letter-spacing: 0; 
                      color: #d4d4d4;
                      white-space: pre;
                    "
                  >{currentFile.content}</code></pre>
                </div>
              </div>
            </div>
            
            <!-- Resizer Handle -->
            <div 
              class="w-1 bg-vsc-border-light hover:bg-vsc-accent-blue cursor-col-resize transition-colors"
              on:mousedown={startResize}
            ></div>
            
            <!-- Right: README -->
            <div class="flex-1 overflow-hidden bg-vsc-bg-dark" style="width: {100 - leftPanelWidth}%">
              <div class="h-full overflow-auto p-8">
                <div class="prose prose-invert max-w-none markdown-content">
                  {@html marked(currentFile.readmeContent)}
                </div>
              </div>
            </div>
          </div>
        {:else if isMarkdownFile}
          <!-- Markdown Preview -->
          <div class="h-full overflow-auto p-8 bg-vsc-bg-dark">
            <div class="prose prose-invert max-w-none markdown-content">
              {#if currentFile.isMarkdownRendered}
                {@html currentFile.content}
              {:else}
                {@html processedMarkdown}
              {/if}
            </div>
          </div>
        {:else}
          <!-- Code View with Line Numbers -->
          <div class="h-full overflow-auto flex bg-vsc-bg-dark" bind:this={codeContainer}>
            <!-- Line Numbers -->
            <div 
              class="bg-vsc-bg-medium text-vsc-text-secondary select-none border-r border-vsc-border-light flex-shrink-0 sticky left-0" 
              style="
                padding: 16px 12px 16px 16px; 
                min-width: 60px; 
                text-align: right; 
                white-space: pre; 
                font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace; 
                font-size: 14px; 
                line-height: 21px; 
                letter-spacing: 0;
                z-index: 10;
              "
            >
              {#each lineNumbers as num}
                <div style="height: 21px; line-height: 21px;">
                  {num}
                </div>
              {/each}
            </div>
            
            <!-- Code Content -->
            <div class="flex-1" style="padding: 16px 16px 16px 12px;">
              <pre 
                class="relative m-0 p-0" 
                style="
                  font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace; 
                  font-size: 14px; 
                  line-height: 21px; 
                  letter-spacing: 0;
                  white-space: pre;
                  overflow: visible;
                "
              ><code 
                class="language-{getLanguageFromExtension(currentFile.name)}" 
                style="
                  line-height: 21px; 
                  display: block; 
                  font-family: inherit; 
                  font-size: inherit; 
                  letter-spacing: 0; 
                  color: #d4d4d4;
                  white-space: pre;
                "
              >{currentFile.content}</code></pre>
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <!-- No File Selected -->
      <div class="flex-1 flex items-center justify-center bg-vsc-bg-dark">
        <div class="text-center text-vsc-text-secondary">
          <div class="text-8xl mb-6">📄</div>
          <div class="text-xl mb-3">Select a file to view</div>
          <div class="text-sm text-vsc-text-secondary">Choose a file from the explorer to see its contents</div>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Mobile Modal -->
{#if isMobile && showMobileModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-vsc-bg-dark rounded-lg w-full h-full max-w-4xl max-h-full flex flex-col">
      <!-- Modal Header -->
      <div class="bg-vsc-bg-light px-4 py-3 border-b border-vsc-border-light flex items-center justify-between">
        <h3 class="text-lg font-semibold text-vsc-text-primary">
          {mobileModalContent === 'code' ? currentFile?.name : 'README'}
        </h3>
        <button 
          on:click={() => showMobileModal = false}
          class="text-vsc-text-secondary hover:text-vsc-text-primary transition-colors p-1"
        >
          ✕
        </button>
      </div>
      
      <!-- Modal Content -->
      <div class="flex-1 overflow-hidden">
        {#if mobileModalContent === 'code'}
          <!-- Code View -->
          <div class="h-full overflow-auto flex bg-vsc-bg-dark">
            <!-- Line Numbers -->
            <div 
              class="bg-vsc-bg-medium text-vsc-text-secondary select-none border-r border-vsc-border-light flex-shrink-0 sticky left-0" 
              style="
                padding: 16px 12px 16px 16px; 
                min-width: 60px; 
                text-align: right; 
                white-space: pre; 
                font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace; 
                font-size: 14px; 
                line-height: 21px; 
                letter-spacing: 0;
                z-index: 10;
              "
            >
              {#each lineNumbers as num}
                <div style="height: 21px; line-height: 21px;">
                  {num}
                </div>
              {/each}
            </div>
            
            <!-- Code Content -->
            <div class="flex-1" style="padding: 16px 16px 16px 12px;">
              <pre 
                class="relative m-0 p-0" 
                style="
                  font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace; 
                  font-size: 14px; 
                  line-height: 21px; 
                  letter-spacing: 0;
                  white-space: pre;
                  overflow: visible;
                "
              ><code 
                class="language-{getLanguageFromExtension(currentFile.name)}" 
                style="
                  line-height: 21px; 
                  display: block; 
                  font-family: inherit; 
                  font-size: inherit; 
                  letter-spacing: 0; 
                  color: #d4d4d4;
                  white-space: pre;
                "
              >{currentFile.content}</code></pre>
            </div>
          </div>
        {:else}
          <!-- README View -->
          <div class="h-full overflow-auto p-6 bg-vsc-bg-dark">
            <div class="prose prose-invert max-w-none markdown-content">
              {@html marked(currentFile.readmeContent)}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* Enhanced VS Code Markdown Preview Styles */
  .markdown-content {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #e6edf3;
    background-color: transparent;
  }

  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4,
  .markdown-content h5,
  .markdown-content h6 {
    font-weight: 600;
    margin-top: 24px;
    margin-bottom: 16px;
    line-height: 1.25;
    color: #f0f6fc;
  }

  .markdown-content h1 {
    font-size: 2em;
    border-bottom: 1px solid #21262d;
    padding-bottom: 0.3em;
  }

  .markdown-content h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #21262d;
    padding-bottom: 0.3em;
  }

  .markdown-content p {
    margin-top: 0;
    margin-bottom: 16px;
    line-height: 1.6;
    color: #e6edf3;
  }

  .markdown-content a {
    color: #58a6ff;
    text-decoration: none;
    font-weight: 500;
  }

  .markdown-content a:hover {
    text-decoration: underline;
    color: #79c0ff;
  }

  .markdown-content ul,
  .markdown-content ol {
    margin-top: 0;
    margin-bottom: 16px;
    padding-left: 2em;
    color: #e6edf3;
  }

  .markdown-content li {
    margin: 0.25em 0;
    line-height: 1.6;
    color: #e6edf3;
  }

  .markdown-content blockquote {
    border-left: 0.25em solid #30363d;
    padding: 0 1em;
    margin: 0 0 16px 0;
    color: #7d8590;
    background-color: rgba(110, 118, 129, 0.1);
    border-radius: 0 6px 6px 0;
  }

  .markdown-content strong {
    font-weight: 600;
    color: #f0f6fc;
  }

  .markdown-content em {
    font-style: italic;
    color: #e6edf3;
  }

  .markdown-content code {
    background-color: rgba(110, 118, 129, 0.4);
    color: #f0f6fc;
    padding: 0.2em 0.4em;
    border-radius: 6px;
    font-size: 85%;
    font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace;
  }

  .markdown-content pre {
    background-color: #161b22;
    border: 1px solid #30363d;
    border-radius: 6px;
    padding: 16px;
    overflow: auto;
    margin: 16px 0;
    font-size: 85%;
    line-height: 1.45;
  }

  .markdown-content pre code {
    background: transparent;
    border: none;
    padding: 0;
    font-size: inherit;
    color: #e6edf3;
  }

  .markdown-content table {
    border-collapse: collapse;
    margin: 16px 0;
    border: 1px solid #30363d;
    border-radius: 6px;
    overflow: hidden;
  }

  .markdown-content th,
  .markdown-content td {
    padding: 12px 16px;
    border: 1px solid #30363d;
    text-align: left;
  }

  .markdown-content th {
    background-color: #161b22;
    font-weight: 600;
    color: #f0f6fc;
  }

  .markdown-content td {
    background-color: rgba(110, 118, 129, 0.05);
    color: #e6edf3;
  }
</style>