import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Copy, Trash2, Globe } from 'lucide-react';

const SpeechRecorder = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState('');
    const [supported, setSupported] = useState(true);

    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSupported(false);
            setError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError('');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let currentInterim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    currentInterim += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(prev => prev + (prev ? ' ' : '') + finalTranscript);
            }
            setInterimTranscript(currentInterim);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow permission.');
            } else {
                setError(`Error: ${event.error}`);
            }
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(transcript);
    };

    const handleClear = () => {
        setTranscript('');
        setInterimTranscript('');
    };

    if (!supported) {
        return (
            <div className="glass-panel recorder-card">
                <div style={{ textAlign: 'center', color: '#ef4444' }}>
                    <Globe size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>Browser Not Supported</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel recorder-card">
            <div className={`status-badge ${isListening ? 'listening' : ''}`}>
                {isListening ? 'Listening...' : 'Ready'}
            </div>

            <div className="recorder-controls">
                <button
                    className={`mic-button ${isListening ? 'listening' : ''}`}
                    onClick={toggleListening}
                    aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
                >
                    {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                </button>
            </div>

            <div className="transcript-area">
                {transcript || interimTranscript ? (
                    <>
                        <span>{transcript}</span>
                        <span className="interim-text"> {interimTranscript}</span>
                    </>
                ) : (
                    <div className="placeholder-text">
                        {error ? <span style={{ color: '#ef4444' }}>{error}</span> : "Tap the microphone and start speaking..."}
                    </div>
                )}
            </div>

            <div className="action-bar">
                <button className="action-btn" onClick={handleClear} disabled={!transcript}>
                    <Trash2 /> Clear
                </button>
                <button className="action-btn" onClick={handleCopy} disabled={!transcript}>
                    <Copy /> Copy Text
                </button>
            </div>
        </div>
    );
};

export default SpeechRecorder;
