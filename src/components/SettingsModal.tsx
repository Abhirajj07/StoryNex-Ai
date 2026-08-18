import { useState } from 'react';
import { X, Key, Cpu, Thermometer, Hash, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { LLMSettings } from '../types/comic';
import { GROQ_MODELS, testGroqConnection } from '../services/groqApi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LLMSettings;
  onSave: (settings: LLMSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<LLMSettings>(settings);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const success = await testGroqConnection(localSettings);
    setTestResult(success ? 'success' : 'error');
    setTesting(false);
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Cpu size={20} /> LLM Settings</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="settings-info-banner">
            <Zap size={16} />
            <span>No API key? No problem! StoryNex works with a built-in demo engine. Add your Groq key for full AI power.</span>
          </div>

          <div className="form-group">
            <label><Key size={14} /> Groq API Key</label>
            <div className="input-with-action">
              <input
                type="password"
                value={localSettings.apiKey}
                onChange={e => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                placeholder="gsk_..."
                className="form-input"
              />
              <button
                className="btn btn-sm btn-outline"
                onClick={handleTest}
                disabled={testing || !localSettings.apiKey}
              >
                {testing ? <Loader2 size={14} className="spin" /> : 'Test'}
              </button>
            </div>
            {testResult && (
              <div className={`test-result test-${testResult}`}>
                {testResult === 'success' ? (
                  <><CheckCircle size={14} /> Connected successfully!</>
                ) : (
                  <><AlertCircle size={14} /> Connection failed. Check your key.</>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label><Cpu size={14} /> Model</label>
            <select
              value={localSettings.model}
              onChange={e => setLocalSettings({ ...localSettings, model: e.target.value })}
              className="form-select"
            >
              {GROQ_MODELS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Thermometer size={14} /> Temperature</label>
              <div className="slider-group">
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={e => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
                  className="form-range"
                />
                <span className="slider-value">{localSettings.temperature}</span>
              </div>
            </div>

            <div className="form-group">
              <label><Hash size={14} /> Max Tokens</label>
              <input
                type="number"
                value={localSettings.maxTokens}
                onChange={e => setLocalSettings({ ...localSettings, maxTokens: parseInt(e.target.value) || 2048 })}
                min={256}
                max={8192}
                step={256}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
