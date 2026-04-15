export type TabId = string;

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
  panel: HTMLElement;
}

export class NavTabs {
  private tabs: TabDef[] = [];
  private activeTab: TabId = '';
  private container: HTMLElement;
  private contentArea: HTMLElement;
  private onSwitch?: (from: TabId, to: TabId) => void;

  constructor(container: HTMLElement, contentArea: HTMLElement) {
    this.container = container;
    this.contentArea = contentArea;
    window.addEventListener('hashchange', () => this.handleHash());
  }

  registerTab(id: TabId, label: string, icon: string, panel: HTMLElement): void {
    this.tabs.push({ id, label, icon, panel });
    panel.classList.add('hidden');
    this.contentArea.appendChild(panel);
  }

  onTabSwitch(fn: (from: TabId, to: TabId) => void): void {
    this.onSwitch = fn;
  }

  render(): void {
    this.container.innerHTML = '';
    for (const tab of this.tabs) {
      const btn = document.createElement('button');
      btn.className = 'nav-tab-btn flex items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-gray-600 hover:text-gray-300';
      btn.dataset.tab = tab.id;
      btn.innerHTML = `<span>${tab.icon}</span><span>${tab.label}</span>`;
      btn.addEventListener('click', () => this.switchTo(tab.id));
      this.container.appendChild(btn);
    }
    this.handleHash();
    if (!this.activeTab && this.tabs.length > 0) {
      this.switchTo(this.tabs[0].id);
    }
  }

  switchTo(id: TabId): void {
    if (id === this.activeTab) return;
    const prev = this.activeTab;
    this.activeTab = id;
    // Update hash
    window.location.hash = id;
    // Update buttons
    this.container.querySelectorAll<HTMLButtonElement>('.nav-tab-btn').forEach((btn) => {
      const isActive = btn.dataset.tab === id;
      btn.classList.toggle('border-blue-500', isActive);
      btn.classList.toggle('text-blue-400', isActive);
      btn.classList.toggle('border-transparent', !isActive);
      btn.classList.toggle('text-gray-500', !isActive);
    });
    // Show/hide panels
    for (const tab of this.tabs) {
      tab.panel.classList.toggle('hidden', tab.id !== id);
      if (tab.id === id) {
        tab.panel.classList.add('tab-panel');
      }
    }
    this.onSwitch?.(prev, id);
  }

  private handleHash(): void {
    const hash = window.location.hash.slice(1);
    if (hash && this.tabs.some((t) => t.id === hash)) {
      this.switchTo(hash);
    }
  }
}
