import { useState } from 'react'
import SpeechRecorder from './components/SpeechRecorder'
import './App.css'

function App() {
    return (
        <div className="app-container">
            <header className="header">
                <h1>Voice Notes</h1>
                <p>Simple, privacy-focused speech to text.</p>
            </header>

            <main>
                <SpeechRecorder />
            </main>
        </div>
    )
}

export default App
