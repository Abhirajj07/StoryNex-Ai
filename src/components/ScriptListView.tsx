import { useState } from 'react';
import { FileText, Copy, Check } from 'lucide-react';
import type { ComicPanel, CharacterVoiceProfile } from '../types/comic';
import { showToast } from './Toast';

interface ScriptListViewProps {
  panels: ComicPanel[];
  characters: CharacterVoiceProfile[];
}

export default function ScriptListView({ panels, characters }: ScriptListViewProps) {
  const [copiedPanel, setCopiedPanel] = useState<number | null>(null);

  const getCharColor = (name: string) => {
    return characters.find(c => c.name === name)?.avatarColor || '#6366f1';
  };

  const copyPanelScript = async (panel: ComicPanel) => {
    const script = formatPanelAsScript(panel);
    try {
      await navigator.clipboard.writeText(script);
      setCopiedPanel(panel.panel_number);
      showToast(`Panel ${panel.panel_number} script copied!`, 'success');
      setTimeout(() => setCopiedPanel(null), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  if (panels.length === 0) {
    return (
      <div className="script-list-empty">
        <FileText size={48} className="empty-icon" />
        <p>Generate your comic script to see the screenplay view.</p>
      </div>
    );
  }

  return (
    <div className="script-list-view">
      <div className="script-header">
        <FileText size={20} />
        <h3>Screenplay View</h3>
      </div>

      {panels.map(panel => (
        <div key={panel.panel_number} className="script-panel">
          <div className="script-panel-header">
            <span className="script-panel-number">PANEL {panel.panel_number}</span>
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => copyPanelScript(panel)}
            >
              {copiedPanel === panel.panel_number ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>

          <div className="script-scene-heading">
            {panel.setting.toUpperCase()}
          </div>

          <div className="script-action">
            <em>({panel.emotion})</em> {panel.action}
          </div>

          {panel.narration && (
            <div className="script-narration">
              NARRATION: {panel.narration}
            </div>
          )}

          {panel.dialogue.map((d, i) => (
            <div key={i} className="script-dialogue">
              <div
                className="script-speaker"
                style={{ color: getCharColor(d.speaker) }}
              >
                {d.speaker.toUpperCase()}
              </div>
              <div className="script-delivery">({d.delivery})</div>
              <div className="script-line">{d.line}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function formatPanelAsScript(panel: ComicPanel): string {
  let script = `PANEL ${panel.panel_number}\n`;
  script += `${'='.repeat(40)}\n`;
  script += `SETTING: ${panel.setting}\n`;
  script += `EMOTION: ${panel.emotion}\n`;
  script += `ACTION: ${panel.action}\n\n`;

  if (panel.narration) {
    script += `NARRATION: ${panel.narration}\n\n`;
  }

  for (const d of panel.dialogue) {
    script += `  ${d.speaker.toUpperCase()}\n`;
    script += `  (${d.delivery})\n`;
    script += `  ${d.line}\n\n`;
  }

  if (panel.image_prompt) {
    script += `IMAGE PROMPT: ${panel.image_prompt}\n`;
  }

  return script;
}
