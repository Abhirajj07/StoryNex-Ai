import { Loader2, Sparkles } from 'lucide-react';
import type { ComicPanel, CharacterVoiceProfile, PipelineStatus } from '../types/comic';
import ComicPanelCard from './ComicPanelCard';

interface ComicBoardViewProps {
  panels: ComicPanel[];
  characters: CharacterVoiceProfile[];
  pipelineStatus: PipelineStatus;
  regeneratingPanels: Set<number>;
  onRegeneratePanel: (panelNumber: number, mode: 'scene' | 'dialogue' | 'both') => void;
}

export default function ComicBoardView({
  panels,
  characters,
  pipelineStatus,
  regeneratingPanels,
  onRegeneratePanel,
}: ComicBoardViewProps) {
  if (panels.length === 0 && pipelineStatus.stage === 'idle') {
    return (
      <div className="comic-board-empty">
        <div className="empty-state-hero glass-card-hero">
          <div className="hero-badge-container">
            <span className="hero-glow-pill">
              <Sparkles size={13} /> Powered by Next-Gen AI
            </span>
          </div>
          <h2 className="empty-hero-brand">StoryNex <span className="gradient-text">AI</span></h2>
          <h3 className="empty-hero-subtitle">Transform Your Story Ideas Into Panel-Ready Comic Scripts</h3>
          <p>
            Write your story concept on the left, extract or customize your character voices, and generate rich panel breakdowns with character-authentic dialogue and image-generation prompts.
          </p>
          <div className="empty-features-grid">
            <div className="empty-feature-card glass-subcard">
              <div className="feature-icon-badge">✨</div>
              <h4>Story-Aware Breakdown</h4>
              <p>Scene pacing, visual beats & mood direction</p>
            </div>
            <div className="empty-feature-card glass-subcard">
              <div className="feature-icon-badge">🎭</div>
              <h4>Persistent Character Voice</h4>
              <p>Dialogue tuned to unique speech quirks & dynamics</p>
            </div>
            <div className="empty-feature-card glass-subcard">
              <div className="feature-icon-badge">🎨</div>
              <h4>Image-Gen Prompts</h4>
              <p>Ready to paste into Midjourney, DALL-E & more</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isGenerating = ['generating-breakdown', 'generating-dialogue'].includes(pipelineStatus.stage);

  return (
    <div className="comic-board">
      {isGenerating && (
        <div className="pipeline-progress">
          <div className="pipeline-progress-inner">
            <Loader2 size={20} className="spin" />
            <div className="pipeline-info">
              <span className="pipeline-stage">{pipelineStatus.message}</span>
              {pipelineStatus.totalPanels && (
                <div className="pipeline-bar">
                  <div
                    className="pipeline-bar-fill"
                    style={{
                      width: `${((pipelineStatus.currentPanel || 0) / pipelineStatus.totalPanels) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
            <span className="pipeline-count">
              {pipelineStatus.currentPanel}/{pipelineStatus.totalPanels}
            </span>
          </div>
        </div>
      )}

      <div className="comic-grid">
        {panels.map(panel => (
          <ComicPanelCard
            key={panel.panel_number}
            panel={panel}
            characters={characters}
            isRegenerating={regeneratingPanels.has(panel.panel_number)}
            onRegenerateScene={() => onRegeneratePanel(panel.panel_number, 'scene')}
            onRegenerateDialogue={() => onRegeneratePanel(panel.panel_number, 'dialogue')}
            onRegenerateBoth={() => onRegeneratePanel(panel.panel_number, 'both')}
          />
        ))}
      </div>
    </div>
  );
}
