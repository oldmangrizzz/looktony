import { Deepgram } from '@deepgram/sdk';
import { EventEmitter } from 'events';
import { Room } from 'livekit-client';

interface ProcessedData {
  vector: Float32Array;
  metadata: {
    type: string;
    confidence: number;
    context: Record<string, any>;
  };
}

interface SensoryInput {
  type: 'audio' | 'visual' | 'text';
  data: any;
  timestamp: number;
}

export class SensorySystem extends EventEmitter {
  private deepgram: Deepgram;
  private visualProcessor: Room;
  private processingQueue: SensoryInput[];
  private fallbackSpeechRecognition: any = null;

  constructor() {
    super();
    this.deepgram = new Deepgram(import.meta.env.VITE_DEEPGRAM_API_KEY || '');
    this.visualProcessor = new Room();
    this.processingQueue = [];
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (typeof window !== 'undefined' && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
      this.fallbackSpeechRecognition = new SpeechRecognition();
      
      this.fallbackSpeechRecognition.continuous = true;
      this.fallbackSpeechRecognition.interimResults = true;
      
      this.fallbackSpeechRecognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          this.emit('speech', { 
            text: result[0].transcript,
            confidence: result[0].confidence
          });
        }
      };
    }
  }

  async startListening() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const deepgramLive = this.deepgram.transcription.live({
        language: 'en',
        smart_format: true,
        model: 'nova-2',
      });

      deepgramLive.on('transcription', (data: any) => {
        const { transcript, confidence } = data.channel.alternatives[0];
        if (transcript) {
          this.emit('speech', { text: transcript, confidence });
        }
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(1024, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        const audioData = e.inputBuffer.getChannelData(0);
        deepgramLive.send(audioData);
      };
    } catch (error) {
      console.warn('Deepgram initialization failed, falling back to Web Speech API');
      if (this.fallbackSpeechRecognition) {
        this.fallbackSpeechRecognition.start();
      }
    }
  }

  async stopListening() {
    if (this.fallbackSpeechRecognition) {
      this.fallbackSpeechRecognition.stop();
    }
  }

  async process(input: any): Promise<ProcessedData> {
    const sensoryInput = this.categorizeInput(input);
    this.processingQueue.push(sensoryInput);
    return this.processNext();
  }

  private categorizeInput(input: any): SensoryInput {
    const type = this.detectInputType(input);
    return {
      type,
      data: input,
      timestamp: Date.now()
    };
  }

  private detectInputType(input: any): 'audio' | 'visual' | 'text' {
    if (input instanceof Blob && input.type.startsWith('audio/')) {
      return 'audio';
    }
    if (input instanceof ImageData || input instanceof HTMLImageElement) {
      return 'visual';
    }
    return 'text';
  }

  private async processNext(): Promise<ProcessedData> {
    const input = this.processingQueue.shift();
    if (!input) throw new Error('No input to process');

    switch (input.type) {
      case 'audio':
        return this.processAudio(input);
      case 'visual':
        return this.processVisual(input);
      case 'text':
        return this.processText(input);
      default:
        throw new Error(`Unknown input type: ${input.type}`);
    }
  }

  private async processAudio(input: SensoryInput): Promise<ProcessedData> {
    if (input.data instanceof Blob) {
      const audioData = await input.data.arrayBuffer();
      const response = await this.deepgram.transcription.preRecorded({
        buffer: new Uint8Array(audioData),
        mimetype: input.data.type,
      });

      return {
        vector: new Float32Array(1536),
        metadata: {
          type: 'audio',
          confidence: response.results?.channels[0]?.alternatives[0]?.confidence || 0,
          context: {
            transcript: response.results?.channels[0]?.alternatives[0]?.transcript
          }
        }
      };
    }
    
    throw new Error('Invalid audio input format');
  }

  private async processVisual(input: SensoryInput): Promise<ProcessedData> {
    return {
      vector: new Float32Array(1536),
      metadata: {
        type: 'visual',
        confidence: 0.8,
        context: {}
      }
    };
  }

  private async processText(input: SensoryInput): Promise<ProcessedData> {
    return {
      vector: new Float32Array(1536),
      metadata: {
        type: 'text',
        confidence: 1.0,
        context: {
          text: input.data
        }
      }
    };
  }
}