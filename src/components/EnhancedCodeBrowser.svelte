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
  
  // Register highlight.js languages like MK1
  hljs.registerLanguage('python', python);
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('markdown', markdown);
  hljs.registerLanguage('bash', bash);

  // Props - matching MK1's data structure
  export let searchIndex = [];
  export let pageData = null;

  // Component state
  let codeElement;
  let directoryMinimized = false;
  let splitContainer;
  let isResizing = false;
  let leftPanelWidth = 50; // Percentage
  let isPanelOpen = false;
  
  // Mobile-specific state
  let isMobile = false;
  let showMobileModal = false;
  let mobileModalContent = 'code'; // 'code' or 'documentation'
  
  // Markdown display state
  let showRawMarkdown = false;
  let showRawReadme = false;
  
  // Check if this file has README.md for split view (but exclude README files themselves)
  $: isFileWithReadme = pageData?.type === 'file' && 
    pageData?.readmeContent && 
    !(pageData?.name?.toLowerCase().includes('readme') && pageData?.extension === 'md');
  
  // Check if this is a markdown file (for proper markdown rendering)
  $: isMarkdownFile = pageData?.type === 'file' && pageData?.extension === 'md';
  
  // Initialize component
  onMount(() => {
    // Set panel closed by default for better UX
    isPanelOpen = false;
    
    // Check if mobile
    isMobile = window.innerWidth < 1024; // lg breakpoint
    window.addEventListener('resize', () => {
      isMobile = window.innerWidth < 1024;
      if (!isMobile && showMobileModal) {
        showMobileModal = false;
      }
    });
  });
  
  // Highlight code when pageData changes
  $: if (codeElement && pageData?.type === 'file') {
    setTimeout(() => {
      hljs.highlightElement(codeElement);
    }, 0);
  }

  // Re-highlight when raw markdown toggle changes
  $: if (codeElement && (showRawMarkdown || showRawReadme)) {
    setTimeout(() => {
      hljs.highlightElement(codeElement);
    }, 0);
  }

  function getFileIcon(item) {
    if (item.type === 'directory') return '📁';
    
    switch (item.extension) {
      case 'py': return '🐍';
      case 'js': return '📜';
      case 'json': return '📋';
      case 'md': return '📝';
      case 'csv': return '📊';
      case 'txt': return '📄';
      default: return '📄';
    }
  }

  function getLanguageClass(extension) {
    switch (extension) {
      case 'py': return 'language-python';
      case 'js': return 'language-javascript';
      case 'json': return 'language-json';
      case 'md': return 'language-markdown';
      case 'txt': return 'language-text';
      case 'csv': return 'language-csv';
      default: return 'language-text';
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function copyToClipboard() {
    if (pageData?.content) {
      navigator.clipboard.writeText(pageData.content).then(() => {
        alert('Content copied to clipboard!');
      });
    }
  }

  function toggleDirectoryMinimize() {
    directoryMinimized = !directoryMinimized;
  }

  function startResize(e) {
    if (!isFileWithReadme || directoryMinimized) return;
    isResizing = true;
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    e.preventDefault();
  }

  function handleResize(e) {
    if (!isResizing || !splitContainer) return;
    
    const containerRect = splitContainer.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain between 20% and 80%
    leftPanelWidth = Math.max(20, Math.min(80, newLeftWidth));
  }

  function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  }

  // Mobile modal functions
  function showMobileCode() {
    mobileModalContent = 'code';
    showMobileModal = true;
    // Highlight code after modal opens
    setTimeout(() => {
      if (codeElement) {
        hljs.highlightElement(codeElement);
      }
    }, 100);
  }

  function showMobileDocumentation() {
    mobileModalContent = 'documentation';
    showMobileModal = true;
  }

  function closeMobileModal() {
    showMobileModal = false;
  }

  function toggleRawMarkdown() {
    showRawMarkdown = !showRawMarkdown;
  }

  function toggleRawReadme() {
    showRawReadme = !showRawReadme;
  }
</script>

<!-- VS Code-style Browser Interface -->
<div class="browser-container h-screen bg-vsc-bg-dark text-vsc-text-primary flex" bind:this={splitContainer}>
  
  <!-- Search Panel (Left Side) -->
  <div class="search-panel flex-shrink-0 transition-all duration-300">
    <BrowserSearchPanel 
      searchIndex={searchIndex}
      currentPath={pageData?.path || ''}
      bind:isPanelOpen
    />
  </div>
  
  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col overflow-hidden">
    
    <!-- Header with breadcrumbs -->
    <div class="bg-vsc-bg-light px-6 py-3 border-b border-vsc-border-light flex-shrink-0">
      <nav class="breadcrumb">
        <div class="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm text-vsc-text-secondary overflow-x-auto whitespace-nowrap">
          <a href="/pythonmap-mk2/browser" class="hover:text-vsc-accent-blue flex-shrink-0">Home</a>
          <span class="flex-shrink-0">/</span>
          <a href="/pythonmap-mk2/browser/" class="hover:text-vsc-accent-blue flex-shrink-0">Scripts</a>
          {#if pageData?.breadcrumbs && pageData.breadcrumbs.length > 0}
            {#each pageData.breadcrumbs as crumb, index}
              <span class="flex-shrink-0">/</span>
              <a 
                href="/pythonmap-mk2/browser/{pageData.breadcrumbs.slice(0, index + 1).join('/')}"
                class="hover:text-vsc-accent-blue flex-shrink-0"
              >
                {crumb}
              </a>
            {/each}
          {/if}
        </div>
      </nav>
    </div>

    {#if pageData?.type === 'directory'}
      <!-- Directory View -->
      <header class="px-6 py-4 border-b border-vsc-border-light">
        <h1 class="text-2xl lg:text-3xl font-bold text-vsc-text-primary">
          📁 {pageData.path === 'scripts' || pageData.path === '.' ? 'Scripts Directory' : pageData.path}
        </h1>
      </header>

      <!-- Directory Listing -->
      <div class="flex-1 p-6 overflow-auto">
        <div class="bg-vsc-bg-medium border border-vsc-border-light rounded-lg">
          <div class="bg-vsc-bg-light px-4 py-2 border-b border-vsc-border-light">
            <span class="text-vsc-text-secondary text-sm">Files and Directories</span>
          </div>
          
          {#if pageData.items && pageData.items.length === 0}
            <div class="p-8 text-center text-vsc-text-secondary">
              This directory is empty.
            </div>
          {:else if pageData.items}
            <div class="divide-y divide-vsc-border-light">
              {#each pageData.items as item, index}
                <div class="folder-item px-4 py-3 hover:bg-vsc-bg-light transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:translate-x-2" 
                  style="animation-delay: {index * 100}ms">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <span class="text-xl transition-transform duration-300 hover:scale-125 hover:rotate-12">
                        {getFileIcon(item)}
                      </span>
                      <div class="transform transition-transform duration-300 hover:translate-x-1">
                        <a 
                          href="/pythonmap-mk2/browser/{item.path}"
                          class="text-vsc-text-primary hover:text-vsc-accent-blue font-medium transition-colors duration-200"
                        >
                          {item.name}
                        </a>
                        {#if item.type === 'file' && item.extension}
                          <span class="text-vsc-text-secondary text-sm ml-2 opacity-70 hover:opacity-100 transition-opacity">
                            .{item.extension}
                          </span>
                        {/if}
                      </div>
                    </div>
                    
                    {#if item.size}
                      <span class="text-vsc-text-secondary text-sm opacity-60 group-hover:opacity-100 transition-opacity">
                        {formatFileSize(item.size)}
                      </span>
                    {/if}
                  </div>
                  
                  <!-- Hover underline effect -->
                  <div class="h-0.5 bg-gradient-to-r from-vsc-accent-blue to-transparent scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left mt-1"></div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- README Content for directories -->
        {#if pageData.readmeContent}
          <div class="bg-vsc-bg-medium border border-vsc-border-light rounded-lg mt-8">
            <div class="bg-vsc-bg-light px-4 py-2 border-b border-vsc-border-light flex items-center justify-between">
              <span class="text-vsc-text-secondary text-sm">📖 README.md</span>
              <button 
                on:click={toggleRawReadme}
                class="text-vsc-text-secondary hover:text-vsc-text-primary transition-colors text-xs px-2 py-1 rounded hover:bg-vsc-bg-medium"
                title="Toggle raw markdown"
              >
                {showRawReadme ? '👁️ Rendered' : '📝 Raw'}
              </button>
            </div>
            <div class="p-6">
              {#if showRawReadme}
                <pre class="!bg-vsc-bg-dark !border border-vsc-border-light !rounded m-0 p-3 text-xs leading-relaxed overflow-auto"><code class="language-markdown">{pageData.rawReadmeContent || pageData.readmeContent}</code></pre>
              {:else}
                <div class="prose prose-invert max-w-none">
                  {@html pageData.readmeContent}
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>

    {:else if pageData?.type === 'file'}
      <!-- File View -->
      <header class="px-6 py-4 border-b border-vsc-border-light">
        <h1 class="text-xl lg:text-3xl font-bold text-vsc-text-primary break-all mb-4">
          {getFileIcon({ extension: pageData.extension })} {pageData.name}
        </h1>
        
        <div class="flex flex-wrap gap-2 lg:gap-3">
          <button 
            on:click={copyToClipboard}
            class="bg-vsc-accent-blue text-white px-3 lg:px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm lg:text-base"
          >
            📋 Copy Content
          </button>
          
          {#if pageData.extension === 'md'}
            <button 
              on:click={toggleRawMarkdown}
              class="bg-vsc-bg-light text-vsc-text-primary px-3 lg:px-4 py-2 rounded hover:bg-vsc-bg-dark transition-colors border border-vsc-border-light text-sm lg:text-base"
            >
              {showRawMarkdown ? '👁️ Rendered' : '📝 Raw'} Markdown
            </button>
          {/if}
          
          {#if isFileWithReadme && !isMobile}
            <button 
              on:click={toggleDirectoryMinimize}
              class="bg-vsc-bg-light text-vsc-text-primary px-3 lg:px-4 py-2 rounded hover:bg-vsc-bg-dark transition-colors border border-vsc-border-light text-sm lg:text-base"
            >
              {directoryMinimized ? '📄 Show' : '⏸️ Hide'} Documentation
            </button>
          {/if}
          
          {#if isFileWithReadme && isMobile}
            <button 
              on:click={showMobileCode}
              class="bg-vsc-bg-light text-vsc-text-primary px-3 py-2 rounded hover:bg-vsc-bg-dark transition-colors border border-vsc-border-light text-sm"
            >
              💻 Show Code
            </button>
            <button 
              on:click={showMobileDocumentation}
              class="bg-vsc-bg-light text-vsc-text-primary px-3 py-2 rounded hover:bg-vsc-bg-dark transition-colors border border-vsc-border-light text-sm"
            >
              📖 Show Documentation
            </button>
          {/if}
        </div>
      </header>

      <!-- File Content Area -->
      <div class="flex-1 overflow-hidden">
        {#if isFileWithReadme && !isMobile}
          <!-- Desktop Split View: Code and README -->
          <div class="split-view flex h-full" bind:this={splitContainer}>
            <!-- Left: Code -->
            <div class="code-panel bg-vsc-bg-medium border border-vsc-border-light rounded-lg overflow-hidden flex flex-col transition-all duration-300"
              style="width: {directoryMinimized ? '100%' : `${leftPanelWidth}%`}">
              <div class="bg-vsc-bg-light px-4 py-2 border-b border-vsc-border-light flex-shrink-0">
                <span class="text-vsc-text-secondary text-sm">{getFileIcon({ extension: pageData.extension })} {pageData.path}</span>
              </div>
              <div class="flex-1 overflow-auto">
                {#if isMarkdownFile}
                  <!-- Markdown file rendered with proper styling -->
                  {#if showRawMarkdown}
                    <pre class="!bg-vsc-bg-medium !border-0 !rounded-none m-0 h-full"><code 
                      bind:this={codeElement}
                      class="language-markdown block p-4 text-sm leading-relaxed"
                    >{pageData.rawContent || pageData.content}</code></pre>
                  {:else}
                    <div class="p-4 prose prose-invert max-w-none">
                      {#if pageData.isMarkdownRendered}
                        {@html pageData.content}
                      {:else}
                        {@html marked(pageData.content)}
                      {/if}
                    </div>
                  {/if}
                {:else}
                  <!-- Regular code file -->
                  <pre class="!bg-vsc-bg-medium !border-0 !rounded-none m-0 h-full"><code 
                    bind:this={codeElement}
                    class="{getLanguageClass(pageData.extension)} block p-4 text-sm leading-relaxed"
                  >{pageData.content}</code></pre>
                {/if}
              </div>
            </div>
            
            {#if !directoryMinimized}
              <!-- Resizer Bar -->
              <div 
                class="w-1 bg-vsc-border-light hover:bg-vsc-accent-blue cursor-col-resize transition-colors flex-shrink-0"
                on:mousedown={startResize}
                role="separator"
                title="Drag to resize panels"
              />

              <!-- Right: README Documentation Panel -->
              <div class="readme-panel bg-vsc-bg-medium border border-vsc-border-light rounded-lg overflow-hidden flex flex-col transition-all duration-300"
                style="width: {100 - leftPanelWidth}%">
                <div class="bg-vsc-bg-light px-4 py-2 border-b border-vsc-border-light flex-shrink-0 flex items-center justify-between">
                  <span class="text-vsc-text-secondary text-sm">📖 README.md</span>
                  <div class="flex items-center gap-2">
                    <button 
                      on:click={toggleRawReadme}
                      class="text-vsc-text-secondary hover:text-vsc-text-primary transition-colors text-xs px-2 py-1 rounded hover:bg-vsc-bg-medium"
                      title="Toggle raw markdown"
                    >
                      {showRawReadme ? '👁️' : '📝'}
                    </button>
                    <button 
                      on:click={toggleDirectoryMinimize}
                      class="text-vsc-text-secondary hover:text-vsc-text-primary transition-colors text-sm"
                      title="Minimize panel"
                    >
                      ⏸️
                    </button>
                  </div>
                </div>
                <div class="flex-1 overflow-auto">
                  <div class="p-4">
                    {#if showRawReadme}
                      <pre class="!bg-vsc-bg-dark !border border-vsc-border-light !rounded m-0 p-3 text-xs leading-relaxed overflow-auto"><code class="language-markdown">{pageData.rawReadmeContent || pageData.readmeContent}</code></pre>
                    {:else}
                      <div class="prose prose-invert max-w-none">
                        {@html pageData.readmeContent}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <!-- Single Panel View -->
          <div class="single-panel bg-vsc-bg-medium border border-vsc-border-light rounded-lg overflow-hidden flex flex-col h-full">
            <div class="bg-vsc-bg-light px-4 py-2 border-b border-vsc-border-light flex-shrink-0">
              <span class="text-vsc-text-secondary text-sm">{getFileIcon({ extension: pageData.extension })} {pageData.path}</span>
            </div>
            <div class="flex-1 overflow-auto">
              {#if isMarkdownFile}
                <!-- Markdown file rendered with proper styling -->
                {#if showRawMarkdown}
                  <pre class="!bg-vsc-bg-medium !border-0 !rounded-none m-0 h-full"><code 
                    bind:this={codeElement}
                    class="language-markdown block p-4 text-sm leading-relaxed"
                  >{pageData.rawContent || pageData.content}</code></pre>
                {:else}
                  <div class="p-4 prose prose-invert max-w-none">
                    {#if pageData.isMarkdownRendered}
                      {@html pageData.content}
                    {:else}
                      {@html marked(pageData.content)}
                    {/if}
                  </div>
                {/if}
              {:else}
                <!-- Regular code file -->
                <pre class="!bg-vsc-bg-medium !border-0 !rounded-none m-0 h-full"><code 
                  bind:this={codeElement}
                  class="{getLanguageClass(pageData.extension)} block p-4 text-sm leading-relaxed"
                >{pageData.content}</code></pre>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Mobile Modal -->
{#if showMobileModal && isMobile}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-vsc-bg-medium border border-vsc-border-light rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
      <!-- Modal Header -->
      <div class="bg-vsc-bg-light px-4 py-3 border-b border-vsc-border-light flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-lg">
            {mobileModalContent === 'code' ? '💻' : '📖'}
          </span>
          <span class="text-sm font-medium text-vsc-text-primary">
            {mobileModalContent === 'code' ? 'Code' : 'Documentation'}: {pageData.name}
          </span>
        </div>
        <button 
          on:click={closeMobileModal}
          class="text-vsc-text-secondary hover:text-vsc-text-primary transition-colors text-xl"
          title="Close"
        >
          ✕
        </button>
      </div>
      
      <!-- Modal Content -->
      <div class="flex-1 overflow-auto">
        {#if mobileModalContent === 'code'}
          <pre class="!bg-vsc-bg-medium !border-0 !rounded-none m-0 h-full"><code 
            bind:this={codeElement}
            class="{getLanguageClass(pageData.extension)} block p-3 text-xs leading-relaxed"
          >{pageData.content}</code></pre>
        {:else if mobileModalContent === 'documentation'}
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm text-vsc-text-secondary">README.md</span>
              <button 
                on:click={toggleRawReadme}
                class="text-vsc-text-secondary hover:text-vsc-text-primary transition-colors text-xs px-2 py-1 rounded hover:bg-vsc-bg-light"
                title="Toggle raw markdown"
              >
                {showRawReadme ? '👁️ Rendered' : '📝 Raw'}
              </button>
            </div>
            {#if showRawReadme}
              <pre class="!bg-vsc-bg-dark !border border-vsc-border-light !rounded m-0 p-3 text-xs leading-relaxed overflow-auto"><code class="language-markdown">{pageData.rawReadmeContent || pageData.readmeContent}</code></pre>
            {:else}
              <div class="prose prose-invert max-w-none">
                {@html pageData.readmeContent}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .folder-item {
    opacity: 0;
    transform: translateY(20px);
    animation: slideInUp 0.6s ease-out forwards;
  }
  
  @keyframes slideInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Resizing cursor */
  .split-view.resizing {
    cursor: col-resize;
  }
  
  /* Enhanced prose styles for README content */
  :global(.prose h1) {
    color: theme('colors.vsc-text-primary');
    font-size: 1.875rem;
    font-weight: bold;
    margin-top: 2rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid theme('colors.vsc-border-light');
    padding-bottom: 0.5rem;
  }
  
  :global(.prose h2) {
    color: theme('colors.vsc-text-primary');
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid theme('colors.vsc-border-light');
    padding-bottom: 0.25rem;
  }
  
  :global(.prose h3, .prose h4, .prose h5, .prose h6) {
    color: theme('colors.vsc-text-primary');
    font-weight: bold;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
  }
  
  :global(.prose p) {
    color: theme('colors.vsc-text-secondary');
    line-height: 1.7;
    margin-bottom: 1rem;
  }
  
  :global(.prose code) {
    background-color: theme('colors.vsc-bg-light');
    color: theme('colors.vsc-keyword');
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  }
  
  :global(.prose pre) {
    background-color: theme('colors.vsc-bg-light') !important;
    border: 1px solid theme('colors.vsc-border-light');
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
    margin: 1rem 0;
  }
  
  :global(.prose pre code) {
    background-color: transparent !important;
    padding: 0;
    border-radius: 0;
    color: theme('colors.vsc-text-primary');
  }
  
  :global(.prose ul, .prose ol) {
    color: theme('colors.vsc-text-secondary');
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  :global(.prose li) {
    margin-bottom: 0.5rem;
  }
  
  :global(.prose a) {
    color: theme('colors.vsc-accent-blue');
    text-decoration: underline;
  }
  
  :global(.prose a:hover) {
    text-decoration: none;
  }
</style>