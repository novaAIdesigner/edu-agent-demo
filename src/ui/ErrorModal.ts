export class ErrorModal {
  private modal: HTMLElement;
  private message: HTMLElement;
  private closeBtn: HTMLElement;

  constructor() {
    this.modal = document.getElementById('error-modal')!;
    this.message = document.getElementById('error-message')!;
    this.closeBtn = document.getElementById('error-close')!;
    this.closeBtn.addEventListener('click', () => this.hide());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide();
    });
  }

  show(msg: string): void {
    this.message.textContent = msg;
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
  }

  hide(): void {
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
  }
}
