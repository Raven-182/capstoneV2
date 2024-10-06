// Based on sample from
// https://github.com/GoogleChromeLabs/web-audio-samples/blob/main/src/audio-worklet/migration/worklet-recorder/recording-processor.js

//a custom audio worklet to process audio data 
class RecordingProcessor extends AudioWorkletProcessor {

  static SILENCE_THRESHOLD = 0.001;
  
     /**
   * Converts a Float32Array to a 16-bit PCM format.
   * 
   * @param {DataView} output - The DataView to write the PCM data to.
   * @param {number} offset - The offset in the DataView where writing should start.
   * @param {Float32Array} input - The Float32Array containing audio samples to convert.
   */
     floatTo16BitPCM(output, offset, input) {
      for (var i = 0; i < input.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    }
  
    /**
     * Writes a string to a DataView at a specified offset.
     * 
     * @param {DataView} view - The DataView to write the string to.
     * @param {number} offset - The offset in the DataView where writing should start.
     * @param {string} string - The string to write.
     */
    writeString(view, offset, string) {
      for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }
    /**
     * Interleaves two Float32Arrays into a single Float32Array.
     *
     * @param {Float32Array} inputL - The left(mic - L) channel
     * @param {Float32Array} inputR - The right(display - R) channel
     * @returns {Float32Array} - The interleaved Float32Array([LRLRLR....])
     */
    interleave(inputL, inputR) {
      const length = inputL.length + inputR.length;
      const result = new Float32Array(length);
      for (let i = 0, j = 0; i < length; i += 2, j++) {
        result[i] = inputL[j];
        result[i + 1] = inputR[j];
      }
      return result;
    }
    /**
     * Encodes audio samples into WAV format.
     *
     * @param {Float32Array} samples - The audio samples to encode.
     * @param {number} [numChannels=2] - The number of audio channels.
     * @param {number} [sampleRate=8000] - The sample rate of the audio.
     * @returns {DataView} - The DataView containing the WAV data.
     */
    encodeWAV(samples, numChannels = 2, sampleRate = 8000) {
      var buffer = new ArrayBuffer(44 + samples.length * 2); // 44 bytes for WAV header + PCM data
      var view = new DataView(buffer);
      /* RIFF identifier */
      this.writeString(view, 0, "RIFF");
      /* RIFF chunk length */
      view.setUint32(4, 36 + samples.length * 2, true);
      /* RIFF type */
      this.writeString(view, 8, "WAVE");
      /* format chunk identifier */
      this.writeString(view, 12, "fmt ");
      /* format chunk length */
      view.setUint32(16, 16, true);
      /* sample format (raw) */
      view.setUint16(20, 1, true);
      /* channel count */
      view.setUint16(22, numChannels, true);
      /* sample rate */
      view.setUint32(24, sampleRate, true);
      /* byte rate (sample rate * block align) */
      view.setUint32(28, sampleRate * 4, true);
      /* block align (channel count * bytes per sample) */
      view.setUint16(32, numChannels * 2, true);
      /* bits per sample */
      view.setUint16(34, 16, true);
      /* data chunk identifier */
      this.writeString(view, 36, "data");
      /* data chunk length */
      view.setUint32(40, samples.length * 2, true);
      this.floatTo16BitPCM(view, 44, samples);
      return view;
    }
   /**
     * Exports audio data from recording buffers to WAV format.
     *
     * @param {Float32Array[]} recBuffers - An array containing audio buffers.
     * @returns {DataView} - The DataView containing the exported WAV data.
     */
    exportWAV(recBuffers) {
      var buffers = [];
      var numChannels = recBuffers.length;
      let micData = recBuffers[0];
      let displayData = recBuffers[1];
      buffers.push(this.mergeBuffers([micData]));
      buffers.push(this.mergeBuffers([displayData]));
      // console.log("Buffer 0 :", buffers[0]);
      // console.log("Buffer 1 :", buffers[1]);
      var interleaved;
      if (numChannels === 2) {
        interleaved = this.interleave(buffers[0], buffers[1]);
      } else {
        interleaved = buffers[0];
      }
      var dataview = this.encodeWAV(interleaved);
      return dataview;
    }
  /**
   * Checks if the audio buffer is silent by determining if all elements 
   * are below a certain threshold.
   *
   * @param {Float32Array} buffer - The audio buffer to check for silence.
   * @returns {boolean} - Returns true if the buffer is silent, otherwise false.
   */
  isSilent(buffer) {
    for (let i = 0; i < buffer.length; i++) {
      if (Math.abs(buffer[i]) > RecordingProcessor.SILENCE_THRESHOLD) {
        return false; // Not silent
      }
    }
    return true; // Buffer is silent
  }
  
  /**
   * Encodes PCM audio samples into a 16-bit PCM format.
   *
   * @param {Float32Array} input - The audio samples to encode.
   * @returns {ArrayBuffer} - The ArrayBuffer containing the encoded PCM data.
   */
  pcmEncode = (input) => {
    const buffer = new ArrayBuffer(input.length * 2); // buffer for 16 bit audio, 2 bytes per sample
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i += 1) {
      const s = Math.max(-1, Math.min(1, input[i])); // clamp values between -1 and 1
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); // Convert to 16-bit signed integer
    }
    return buffer;
  };
  
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      let micBuffer = input[0];
      let displayBuffer = input[1];
      let pcm;
     
      if (!this.isSilent(micBuffer)) {
        //send back mic data for transcription if not silent
        pcm = this.pcmEncode(input[0]);
      } else if (!this.isSilent(displayBuffer)) {
        //send back display data for transcription mic data is silent and display is not
        pcm = this.pcmEncode(input[1]);
      }
      // communicate with the node 
      this.port.postMessage(pcm);
    }
    return true;
  }
}

registerProcessor("recording-processor", RecordingProcessor);
