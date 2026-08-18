
import { LayoutGrid, Loader2, Sparkles } from 'lucide-react';
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
        <div className="empty-state-hero">
          <LayoutGrid size={64} className="empty-icon-large" />
          <h3>Your Comic Script Will Appear Here</h3>
          <p>Set up your story, genre, and characters above, then click <strong>"Generate Comic Script"</strong> to bring your story to life panel by panel.</p>
          <div className="empty-features">
            <div className="empty-feature">
              <Sparkles size={16} />
              <span>Panel-by-panel breakdown</span>
            </div>
            <div className="empty-feature">
              <Sparkles size={16} />
              <span>Character-authentic dialogue</span>
            </div>
            <div className="empty-feature">
              <Sparkles size={16} />
              <span>Image-gen-ready prompts</span>
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
