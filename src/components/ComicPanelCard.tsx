import { useState } from 'react';
import {
  RefreshCw,
  Copy,
  Check,
  MessageSquare,
  Image,
  MapPin,
  Users,
  Zap,
  Heart,
  BookOpen,
  MoreHorizontal,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ComicPanel, CharacterVoiceProfile } from '../types/comic';
import ComicSpeechBubble from './ComicSpeechBubble';
import { showToast } from './Toast';

interface ComicPanelCardProps {
  panel: ComicPanel;
  characters: CharacterVoiceProfile[];
  isRegenerating: boolean;
  onRegenerateScene: () => void;
  onRegenerateDialogue: () => void;
  onRegenerateBoth: () => void;
}

export default function ComicPanelCard({
  panel,
  characters,
  isRegenerating,
  onRegenerateScene,
  onRegenerateDialogue,
  onRegenerateBoth,
}: ComicPanelCardProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const getCharColor = (name: string) => {
    return characters.find(c => c.name === name)?.avatarColor || '#6366f1';
  };

  const copyImagePrompt = async () => {
    try {
      await navigator.clipboard.writeText(panel.image_prompt);
      setCopiedPrompt(true);
      showToast('Image prompt copied!', 'success');
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  return (
    <div className={`comic-panel-card ${isRegenerating ? 'regenerating' : ''}`}>
      {/* Panel Number Badge */}
      <div className="panel-number-badge">
        <span>{panel.panel_number}</span>
      </div>

      {/* Header */}
      <div className="panel-card-header">
        <div className="panel-emotion-badge">
          <Heart size={12} />
          <span>{panel.emotion}</span>
        </div>
        <div className="panel-card-actions">
          <button
            className="btn-icon-sm"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <div className="dropdown-wrapper">
            <button
              className="btn-icon-sm"
              onClick={() => setShowMenu(!showMenu)}
              title="Regenerate options"
            >
              {isRegenerating ? <Loader2 size={14} className="spin" /> : <MoreHorizontal size={14} />}
            </button>
            {showMenu && (
              <div className="dropdown-menu" onMouseLeave={() => setShowMenu(false)}>
                <button className="dropdown-item" onClick={() => { onRegenerateScene(); setShowMenu(false); }}>
                  <MapPin size={14} /> Regenerate Scene
                </button>
                <button className="dropdown-item" onClick={() => { onRegenerateDialogue(); setShowMenu(false); }}>
                  <MessageSquare size={14} /> Regenerate Dialogue
                </button>
                <button className="dropdown-item" onClick={() => { onRegenerateBoth(); setShowMenu(false); }}>
                  <RefreshCw size={14} /> Regenerate Both
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Scene Description */}
          <div className="panel-section">
            <div className="panel-section-label">
              <MapPin size={12} /> Setting
            </div>
            <p className="panel-setting">{panel.setting}</p>
          </div>

          {/* Characters Present */}
          <div className="panel-section">
            <div className="panel-section-label">
              <Users size={12} /> Characters
            </div>
            <div className="panel-characters">
              {panel.characters_present.map(name => (
                <span
                  key={name}
                  className="char-present-chip"
                  style={{ '--chip-color': getCharColor(name) } as React.CSSProperties}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className="panel-section">
            <div className="panel-section-label">
              <Zap size={12} /> Action
            </div>
            <p className="panel-action">{panel.action}</p>
          </div>

          {/* Narration */}
          {panel.narration && (
            <div className="panel-narration-box">
              <BookOpen size={12} />
              <p>{panel.narration}</p>
            </div>
          )}

          {/* Dialogue Bubbles */}
          {panel.dialogue.length > 0 && (
            <div className="panel-dialogue-section">
              <div className="panel-section-label">
                <MessageSquare size={12} /> Dialogue
              </div>
              <div className="dialogue-bubbles">
                {panel.dialogue.map((d, i) => (
                  <ComicSpeechBubble
                    key={i}
                    item={d}
                    characterColor={getCharColor(d.speaker)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Image Prompt */}
          {panel.image_prompt && (
            <div className="panel-image-prompt">
              <div className="prompt-header">
                <div className="panel-section-label">
                  <Image size={12} /> Image Prompt
                </div>
                <button
                  className="btn btn-xs btn-outline"
                  onClick={copyImagePrompt}
                >
                  {copiedPrompt ? <Check size={12} /> : <Copy size={12} />}
                  {copiedPrompt ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="prompt-text">{panel.image_prompt}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
