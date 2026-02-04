import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export class LiveSessionManager {
    private ai: GoogleGenAI;
    private sessionPromise: Promise<any> | null = null;
    private inputAudioContext: AudioContext | null = null;
    private outputAudioContext: AudioContext | null = null;
    private inputNode: ScriptProcessorNode | null = null;
    private outputNode: GainNode | null = null;
    private sources = new Set<AudioBufferSourceNode>();
    private nextStartTime = 0;
    private stream: MediaStream | null = null;
    
    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }

    async connect(onTranscription: (inText: string, outText: string) => void) {
        this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        this.outputNode = this.outputAudioContext.createGain();
        this.outputNode.connect(this.outputAudioContext.destination);

        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        this.sessionPromise = this.ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            callbacks: {
                onopen: () => {
                    console.log('Live session opened');
                    this.startAudioInput();
                },
                onmessage: async (message: LiveServerMessage) => {
                    // Handle Audio Output
                    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio) {
                        this.playAudioChunk(base64Audio);
                    }

                    // Handle Transcriptions
                    let inText = '';
                    let outText = '';
                    if (message.serverContent?.inputTranscription) {
                        inText = message.serverContent.inputTranscription.text;
                    }
                    if (message.serverContent?.outputTranscription) {
                        outText = message.serverContent.outputTranscription.text;
                    }
                    if (inText || outText) {
                        onTranscription(inText, outText);
                    }

                    const interrupted = message.serverContent?.interrupted;
                    if (interrupted) {
                        this.stopAllAudio();
                    }
                },
                onclose: () => console.log('Live session closed'),
                onerror: (err) => console.error('Live session error', err),
            },
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                },
                systemInstruction: `You are a professional NBA analyst specializing in the Toronto Raptors. 
                You have deep knowledge of basketball statistics, player matchups, and team strategies. 
                Keep your answers concise, energetic, and focused on helping the user analyze the game.
                If asked about stats, give specific numbers.`,
            }
        });
    }

    private startAudioInput() {
        if (!this.inputAudioContext || !this.stream || !this.sessionPromise) return;

        const source = this.inputAudioContext.createMediaStreamSource(this.stream);
        this.inputNode = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        this.inputNode.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = this.createPcmBlob(inputData);
            this.sessionPromise?.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        };

        source.connect(this.inputNode);
        this.inputNode.connect(this.inputAudioContext.destination); // Required for script processor to run
    }

    private createPcmBlob(data: Float32Array) {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        
        // Manual Base64 Encode since we need to send raw bytes often
        let binary = '';
        const bytes = new Uint8Array(int16.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);

        return {
            data: base64Data,
            mimeType: 'audio/pcm;rate=16000'
        };
    }

    private async playAudioChunk(base64: string) {
        if (!this.outputAudioContext || !this.outputNode) return;

        // Decode Base64 to ArrayBuffer
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Decode Audio Data
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = this.outputAudioContext.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i=0; i<dataInt16.length; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }

        // Schedule Playback
        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.outputNode);
        source.start(this.nextStartTime);
        this.nextStartTime += buffer.duration;
        
        this.sources.add(source);
        source.onended = () => this.sources.delete(source);
    }

    private stopAllAudio() {
        this.sources.forEach(s => {
            try { s.stop(); } catch(e) {}
        });
        this.sources.clear();
        this.nextStartTime = 0;
    }

    disconnect() {
        this.stopAllAudio();
        this.inputNode?.disconnect();
        this.inputAudioContext?.close();
        this.outputAudioContext?.close();
        this.stream?.getTracks().forEach(t => t.stop());
        // No explicit session close method in current API docs, rely on connection drop
    }
}
