<script>
  
  let searchQuery = '';
  let searchResults = [];
  let isSearching = false;
  let selectedTag = '';
  export let isPanelOpen = false;
  export let searchIndex = [];
  export let currentPath = '';
  
  // Compute available tags from embedded search index
  $: availableTags = searchIndex
    .filter(item => item.tags && Array.isArray(item.tags))
    .flatMap(item => item.tags)
    .filter((tag, index, arr) => arr.indexOf(tag) === index)
    .sort();
  
  function performSearch() {
    if (!searchQuery.trim() && !selectedTag) {
      searchResults = [];
      return;
    }
    
    isSearching = true;
    const query = searchQuery.toLowerCase().trim();
    
    searchResults = searchIndex.filter(item => {
      // Tag filter
      if (selectedTag && (!item.tags || !item.tags.includes(selectedTag))) {
        return false;
      }
      
      // Text search
      if (query) {
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query))) ||
          (item.content && item.content.toLowerCase().includes(query))
        );
      }
      
      return true;
    }).slice(0, 50); // More results for panel view
    
    isSearching = false;
  }
  
  function handleSearchInput() {
    performSearch();
  }
  
  function handleTagChange() {
    performSearch();
  }
  
  function navigateToResult(result) {
    // Use standard browser navigation for Astro
    window.location.href = result.url;
  }
  
  function clearSearch() {
    searchQuery = '';
    selectedTag = '';
    searchResults = [];
  }
  
  function togglePanel() {
    isPanelOpen = !isPanelOpen;
    
    // Emit custom event for the browser container to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('searchPanelToggle', {
        detail: { isOpen: isPanelOpen }
      }));
    }
  }
  
  function getResultIcon(type) {
    switch (type) {
      case 'notepad': return '📔';
      case 'python': return '🐍';
      case 'markdown': return '📝';
      case 'readme': return '📖';
      case 'javascript': return '📜';
      case 'json': return '📋';
      case 'directory': return '📁';
      default: return '📄';
    }
  }
  
  function highlightMatch(text, query) {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-vsc-selection-bg text-vsc-text-primary px-1 rounded">$1</mark>');
  }
  
  function truncateContent(content, maxLength = 100) {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }
  
  // Enhanced search that includes file content when available
  function searchFileContent(item, query) {
    if (!item.content) return false;
    return item.content.toLowerCase().includes(query.toLowerCase());
  }
  
  function getContentPreview(content, query, maxLength = 80) {
    if (!content || !query) return '';
    
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index === -1) return truncateContent(content, maxLength);
    
    // Show context around the match
    const start = Math.max(0, index - 20);
    const end = Math.min(content.length, index + query.length + 60);
    const snippet = content.substring(start, end);
    
    return (start > 0 ? '...' : '') + snippet + (end < content.length ? '...' : '');
  }
</script>

<!-- VS Code-style Search Panel -->
<div class="h-full bg-vsc-bg-medium border-r border-vsc-border-light flex flex-col {isPanelOpen ? 'w-80' : 'w-12'} transition-all duration-300">
  <!-- Panel Header -->
  <div class="bg-vsc-bg-light px-3 py-2 border-b border-vsc-border-light flex items-center justify-between flex-shrink-0">
    {#if isPanelOpen}
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-vsc-text-primary">🔍</span>
        <span class="text-sm text-vsc-text-primary">SEARCH</span>
      </div>
      <button 
        on:click={togglePanel}
        class="text-vsc-text-secondary hover:text-vsc-text-primary transition-colors p-1 rounded hover:bg-vsc-bg-medium"
        title="Collapse search panel"
      >
        ◀
      </button>
    {:else}
      <button 
        on:click={togglePanel}
        class="text-vsc-text-secondary hover:text-vsc-text-primary transition-colors mx-auto p-2 rounded hover:bg-vsc-bg-light"
        title="Expand search panel"
      >
        <span class="text-lg">🔍</span>
      </button>
    {/if}
  </div>

  {#if isPanelOpen}
    <!-- Search Controls -->
    <div class="p-3 border-b border-vsc-border-light flex-shrink-0 space-y-3">
      <!-- Current Path Display -->
      {#if currentPath}
        <div class="text-xs text-vsc-text-secondary font-mono bg-vsc-bg-dark px-2 py-1 rounded">
          📁 {currentPath || 'Root'}
        </div>
      {/if}
      
      <!-- Search Input -->
      <div class="relative">
        <input
          type="text"
          bind:value={searchQuery}
          on:input={handleSearchInput}
          placeholder="Search files and content..."
          class="w-full bg-vsc-bg-dark border border-vsc-border-light rounded px-3 py-2 text-sm text-vsc-text-primary placeholder-vsc-text-secondary focus:outline-none focus:border-vsc-accent-blue focus:ring-1 focus:ring-vsc-accent-blue transition-colors"
        />
        {#if searchQuery}
          <button
            on:click={clearSearch}
            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-vsc-text-secondary hover:text-vsc-text-primary text-sm p-1 rounded hover:bg-vsc-bg-light transition-colors"
            title="Clear search"
          >
            ✕
          </button>
        {/if}
      </div>
      
      <!-- Tag Filter -->
      {#if availableTags.length > 0}
        <div>
          <select
            bind:value={selectedTag}
            on:change={handleTagChange}
            class="w-full bg-vsc-bg-dark border border-vsc-border-light rounded px-3 py-2 text-sm text-vsc-text-primary focus:outline-none focus:border-vsc-accent-blue focus:ring-1 focus:ring-vsc-accent-blue transition-colors"
          >
            <option value="">All Tags</option>
            {#each availableTags as tag}
              <option value={tag}>{tag}</option>
            {/each}
          </select>
        </div>
      {/if}
      
      <!-- Results Counter -->
      {#if searchQuery || selectedTag}
        <div class="text-xs text-vsc-text-secondary flex items-center justify-between">
          <span>
            {isSearching ? 'Searching...' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
          </span>
          {#if searchResults.length > 0}
            <button
              on:click={clearSearch}
              class="text-vsc-text-secondary hover:text-vsc-text-primary transition-colors underline"
            >
              Clear
            </button>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Search Results -->
    <div class="flex-1 overflow-y-auto">
      {#if searchQuery || selectedTag}
        {#if searchResults.length === 0 && !isSearching}
          <div class="p-6 text-center">
            <div class="text-4xl mb-3">🔍</div>
            <div class="text-sm text-vsc-text-secondary mb-2">No results found</div>
            <div class="text-xs text-vsc-text-secondary opacity-75">
              Try adjusting your search terms or filters
            </div>
          </div>
        {:else if isSearching}
          <div class="p-6 text-center">
            <div class="text-2xl mb-3">⏳</div>
            <div class="text-sm text-vsc-text-secondary">Searching...</div>
          </div>
        {:else}
          <div class="space-y-1">
            {#each searchResults as result, index}
              <button
                on:click={() => navigateToResult(result)}
                class="w-full text-left p-3 hover:bg-vsc-bg-light transition-colors border-b border-vsc-border-light/30 last:border-b-0 group"
              >
                <div class="flex items-start gap-3">
                  <span class="text-lg mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {getResultIcon(result.type)}
                  </span>
                  <div class="flex-1 min-w-0">
                    <!-- Title -->
                    <div class="text-sm font-medium text-vsc-text-primary mb-1 truncate">
                      {@html highlightMatch(result.title, searchQuery)}
                    </div>
                    
                    <!-- Description -->
                    {#if result.description}
                      <div class="text-xs text-vsc-text-secondary mb-2 line-clamp-2">
                        {@html highlightMatch(truncateContent(result.description), searchQuery)}
                      </div>
                    {/if}
                    
                    <!-- Content Preview (if search matches content) -->
                    {#if searchQuery && result.content && searchFileContent(result, searchQuery)}
                      <div class="text-xs text-vsc-text-secondary bg-vsc-bg-dark p-2 rounded font-mono mb-2 border-l-2 border-vsc-accent-blue">
                        {@html highlightMatch(getContentPreview(result.content, searchQuery), searchQuery)}
                      </div>
                    {/if}
                    
                    <!-- Tags -->
                    {#if result.tags && result.tags.length > 0}
                      <div class="flex flex-wrap gap-1 mb-2">
                        {#each result.tags.slice(0, 3) as tag}
                          <span class="text-xs bg-vsc-bg-dark text-vsc-text-secondary px-2 py-0.5 rounded border border-vsc-border-light">
                            {tag}
                          </span>
                        {/each}
                        {#if result.tags.length > 3}
                          <span class="text-xs text-vsc-text-secondary px-1">
                            +{result.tags.length - 3} more
                          </span>
                        {/if}
                      </div>
                    {/if}
                    
                    <!-- File Path -->
                    <div class="text-xs text-vsc-text-secondary opacity-60 truncate font-mono">
                      {result.filePath || result.url}
                    </div>
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      {:else}
        <!-- Empty State -->
        <div class="p-6 text-center">
          <div class="text-6xl mb-4 opacity-50">🔍</div>
          <div class="text-lg text-vsc-text-primary mb-2">Search Your Codebase</div>
          <div class="text-sm text-vsc-text-secondary mb-4 max-w-xs mx-auto leading-relaxed">
            Enter keywords to find files, scripts, and content across your project
          </div>
          <div class="text-xs text-vsc-text-secondary opacity-75 space-y-1">
            <div>• Search file names and content</div>
            <div>• Filter by tags</div>
            <div>• Browse results with previews</div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  :global(mark) {
    background-color: rgba(100, 181, 246, 0.3) !important;
    color: inherit !important;
    padding: 0.125rem 0.25rem;
    border-radius: 0.125rem;
    font-weight: 500;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  /* Smooth scrollbar */
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>