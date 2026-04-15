export class AudioResampler {
  static async to16kHzPcm16(
    chunks: Uint8Array[],
    inputSampleRate: number
  ): Promise<ArrayBuffer> {
    return this.toTargetRatePcm16(chunks, inputSampleRate, 16000);
  }

  static async toTargetRatePcm16(
    chunks: Uint8Array[],
    inputSampleRate: number,
    targetSampleRate: number
  ): Promise<ArrayBuffer> {
    if (!chunks.length) {
      return new ArrayBuffer(0);
    }

    const pcm16 = this.concatPcm16Chunks(chunks);
    const float32 = this.pcm16ToFloat32(pcm16);

    const resampled =
      inputSampleRate === targetSampleRate
        ? float32
        : await this.resampleFloat32(float32, inputSampleRate, targetSampleRate);

    const pcm16Out = this.float32ToPcm16(resampled);

    const u8 = new Uint8Array(pcm16Out.buffer);
    const buffer = new ArrayBuffer(u8.byteLength);
    new Uint8Array(buffer).set(u8);
    return buffer;
  }

  private static concatPcm16Chunks(chunks: Uint8Array[]): Int16Array {
    let totalBytes = 0;
    for (const c of chunks) {
      totalBytes += c.byteLength;
    }

    const buffer = new ArrayBuffer(totalBytes);
    const view = new Uint8Array(buffer);

    let offset = 0;
    for (const c of chunks) {
      view.set(c, offset);
      offset += c.byteLength;
    }

    return new Int16Array(buffer);
  }

  private static pcm16ToFloat32(pcm16: Int16Array): Float32Array {
    const out = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      const v = pcm16[i];
      out[i] = v < 0 ? v / 0x8000 : v / 0x7fff;
    }
    return out;
  }

  private static async resampleFloat32(
    input: Float32Array,
    inputSampleRate: number,
    targetSampleRate: number
  ): Promise<Float32Array> {
    const offlineCtx = new OfflineAudioContext(
      1,
      Math.ceil(input.length * targetSampleRate / inputSampleRate),
      targetSampleRate
    );

    const buffer = offlineCtx.createBuffer(1, input.length, inputSampleRate);
    buffer.getChannelData(0).set(input);

    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineCtx.destination);
    source.start();

    const rendered = await offlineCtx.startRendering();
    return rendered.getChannelData(0);
  }

  private static float32ToPcm16(float32: Float32Array): Int16Array {
    const pcm16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return pcm16;
  }
}
