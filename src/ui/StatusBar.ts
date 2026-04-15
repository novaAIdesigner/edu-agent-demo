export class StatusBar {
  private connDot: HTMLElement;
  private connLabel: HTMLElement;
  private assistantStatus: HTMLElement;

  constructor(connDot: HTMLElement, connLabel: HTMLElement, assistantStatus: HTMLElement) {
    this.connDot = connDot;
    this.connLabel = connLabel;
    this.assistantStatus = assistantStatus;
  }

  setConnectionStatus(status: string): void {
    const connected = status === 'connected';
    const connecting = status === 'connecting';
    this.connDot.className = `inline-block h-2 w-2 rounded-full ${connected ? 'bg-green-500' : connecting ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'}`;
    this.connLabel.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  }

  setAssistantStatus(status: string): void {
    this.assistantStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  }
}
