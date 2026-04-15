export class AudioLevelMeter {
  private bar: HTMLElement;
  private container: HTMLElement;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'h-2 w-full rounded-full bg-gray-800 overflow-hidden';
    this.bar = document.createElement('div');
    this.bar.className = 'level-bar h-full rounded-full bg-blue-500';
    this.bar.style.width = '0%';
    this.container.appendChild(this.bar);
    parent.appendChild(this.container);
  }

  setLevel(level: number): void {
    this.bar.style.width = `${Math.min(100, level)}%`;
  }
}
