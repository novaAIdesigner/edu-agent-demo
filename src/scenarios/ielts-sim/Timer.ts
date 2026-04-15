export class ExamTimer {
  private remaining: number;
  private intervalId?: ReturnType<typeof setInterval>;
  private onTick: (remaining: number) => void;
  private onComplete: () => void;

  constructor(durationSeconds: number, onTick: (r: number) => void, onComplete: () => void) {
    this.remaining = durationSeconds;
    this.onTick = onTick;
    this.onComplete = onComplete;
  }

  start(): void {
    this.onTick(this.remaining);
    this.intervalId = setInterval(() => {
      this.remaining--;
      this.onTick(this.remaining);
      if (this.remaining <= 0) {
        this.stop();
        this.onComplete();
      }
    }, 1000);
  }

  stop(): void {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  reset(durationSeconds: number): void {
    this.stop();
    this.remaining = durationSeconds;
    this.onTick(this.remaining);
  }
}
