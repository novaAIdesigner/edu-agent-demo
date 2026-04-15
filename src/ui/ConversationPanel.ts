import type { ConversationMessage } from '../core/types.js';

export class ConversationPanel {
  private container: HTMLElement;
  private messages: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.messages = document.createElement('div');
    this.messages.className = 'flex flex-col gap-2 p-4 custom-scroll overflow-y-auto h-full';
    this.container.appendChild(this.messages);
  }

  addMessage(msg: ConversationMessage): void {
    const el = this.createMessageEl(msg);
    this.messages.appendChild(el);
    this.scrollToBottom();
  }

  updateMessage(msg: ConversationMessage): void {
    if (!msg.messageId) {
      this.addMessage(msg);
      return;
    }
    let el = this.messages.querySelector<HTMLElement>(`[data-msg-id="${msg.messageId}"]`);
    if (!el) {
      el = this.createMessageEl(msg);
      this.messages.appendChild(el);
    } else {
      const contentEl = el.querySelector('.msg-content')!;
      if (msg.contentHtml) {
        contentEl.innerHTML = msg.contentHtml;
      } else {
        contentEl.textContent = msg.content;
      }
      // Streaming cursor
      const cursor = el.querySelector('.typing-cursor');
      if (msg.isStreaming && !cursor) {
        const c = document.createElement('span');
        c.className = 'typing-cursor';
        contentEl.appendChild(c);
      } else if (!msg.isStreaming && cursor) {
        cursor.remove();
      }
    }
    this.scrollToBottom();
  }

  clear(): void {
    this.messages.innerHTML = '';
  }

  private createMessageEl(msg: ConversationMessage): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = this.roleClasses(msg.role);
    if (msg.messageId) wrapper.dataset.msgId = msg.messageId;

    const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const label = msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'AI' : msg.role;

    wrapper.innerHTML = `
      <div class="flex items-baseline gap-2 mb-0.5">
        <span class="text-xs font-semibold ${msg.role === 'user' ? 'text-blue-400' : msg.role === 'assistant' ? 'text-emerald-400' : 'text-gray-500'}">${label}</span>
        <span class="text-[10px] text-gray-600">${time}</span>
      </div>
      <div class="msg-content text-sm leading-relaxed">${msg.contentHtml || this.escHtml(msg.content)}</div>
    `;

    if (msg.isStreaming) {
      const c = document.createElement('span');
      c.className = 'typing-cursor';
      wrapper.querySelector('.msg-content')!.appendChild(c);
    }
    return wrapper;
  }

  private roleClasses(role: string): string {
    const base = 'rounded-lg px-3 py-2 max-w-[85%]';
    switch (role) {
      case 'user': return `${base} self-end bg-blue-500/10 border border-blue-500/20 text-gray-200`;
      case 'assistant': return `${base} self-start bg-gray-800/80 border border-gray-700 text-gray-200`;
      case 'system': return `${base} self-center text-center bg-gray-800/50 text-gray-500 text-xs`;
      case 'error': return `${base} self-center text-center bg-red-500/10 border border-red-500/20 text-red-400 text-xs`;
      default: return base;
    }
  }

  private scrollToBottom(): void {
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  private escHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
