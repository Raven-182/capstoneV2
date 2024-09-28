// # Web Audio API Worklet for audio processing

// Based on sample from 
// https://github.com/GoogleChromeLabs/web-audio-samples/blob/main/src/audio-worklet/migration/worklet-recorder/recording-processor.js


//a custom audio worklet 
class RecordingProcessor extends AudioWorkletProcessor {

    // floatTo16BitPCM (input) {
    // //32 bit pcm int values to 16 bit
    //   const output = new Int16Array(input.length);
    //   for (let i = 0; i < input.length; i += 1) {
    //     const s = Math.max(-1, Math.min(1, input[i]));
    //     output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    //   }
    //   return output;
    // };
    floatTo16BitPCM(output, offset, input) {
        for (var i = 0; i < input.length; i++, offset += 2) {
            var s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    writeString(view, offset, string) {
        for (var i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    //decode to wave

    encodeWAV(samples, numChannels, sampleRate) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        var view = new DataView(buffer);
    
        /* RIFF identifier */
        this.writeString(view, 0, 'RIFF');
        /* RIFF chunk length */
        view.setUint32(4, 36 + samples.length * 2, true);
        /* RIFF type */
        this.writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        this.writeString(view, 12, 'fmt ');
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
        this.writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, samples.length * 2, true);
    
        this.floatTo16BitPCM(view, 44, samples);
    
        return view;
    }
    
    //
    // decodeWebMToAudioBuffer (audioBuffer) {
    //     //sterio channels left and right 
    //   const left32Bit = audioBuffer[0];
    //   const right32Bit = audioBuffer[1];
    //   const left16Bit = this.floatTo16BitPCM(left32Bit);
    //   const right16Bit = this.floatTo16BitPCM(right32Bit);
    //   const length = left16Bit.length + right16Bit.length;
    //   const interleaved = new Int16Array(length);
    //     //left and right data interleaved together
    //   for (let i = 0, j = 0; i < length; j += 1) {
    //     interleaved[(i += 1)] = left16Bit[j];
    //     interleaved[(i += 1)] = right16Bit[j];
    //   }
  
    //   return interleaved;
    // }
  
    interleave(audioBuffer) {
        const inputL = audioBuffer[0];
        const inputR = audioBuffer[1];
        var length = inputL.length + inputR.length;
        var result = new Float32Array(length);

        var index = 0,
            inputIndex = 0;

        while (index < length) {
            result[index++] = inputL[inputIndex];
            result[index++] = inputR[inputIndex];
            inputIndex++;
        }
        return result;
    }

  
    // process(inputs, outputs, parameters) {
    //   const input = inputs[0];
  
    //   if (input && input.length > 0) {
    //     const outputData = this.decodeWebMToAudioBuffer(input);
    //     this.port.postMessage(outputData);
    //   }
    //   return true;
    // }
    process(inputs, outputs, parameters) {
        const input = inputs[0];
    
        if (input && input.length > 0) {
          const numChannels = input.length;  // Number of input channels
          const sampleRate = 44100;     // You can set this dynamically
    
          // Decode input to interleaved PCM 16-bit data
          const pcmData = this.interleave(input);
    
          // Encode to WAV
          const wavData = this.encodeWAV(pcmData, numChannels, sampleRate);
    
          // Send the encoded WAV data to the main thread
          this.port.postMessage(wavData);
        }
        return true;
      }

  }
  
  registerProcessor('recording-processor', RecordingProcessor);