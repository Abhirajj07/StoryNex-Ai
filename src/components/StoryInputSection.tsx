
import { Pen, Sparkles, BookText, LayoutGrid } from 'lucide-react';
import type { Genre, TargetFormat } from '../types/comic';
import { GENRE_OPTIONS, FORMAT_OPTIONS } from '../types/comic';

interface StoryInputSectionProps {
  storyIdea: string;
  refinedStory?: string;
  genre: Genre;
  targetFormat: TargetFormat;
  title: string;
  isRefining: boolean;
  onStoryChange: (story: string) => void;
  onGenreChange: (genre: Genre) => void;
  onFormatChange: (format: TargetFormat) => void;
  onTitleChange: (title: string) => void;
  onRefineStory: () => void;
  onUseRefined: () => void;
}

export default function StoryInputSection({
  storyIdea,
  refinedStory,
  genre,
  targetFormat,
  title,
  isRefining,
  onStoryChange,
  onGenreChange,
  onFormatChange,
  onTitleChange,
  onRefineStory,
  onUseRefined,
}: StoryInputSectionProps) {
  return (
    <div className="story-input-section">
      <div className="section-header">
        <BookText size={20} />
        <h2>Story & Setup</h2>
      </div>

      <div className="form-group">
        <label>
          <Pen size={14} /> Project Title
        </label>
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="My Epic Comic..."
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>
          <BookText size={14} /> Story Idea / Plot
        </label>
        <textarea
          value={storyIdea}
          onChange={e => onStoryChange(e.target.value)}
          placeholder="Enter your story idea here... A detective investigates mysterious disappearances in a cyberpunk city..."
          className="form-textarea story-textarea"
          rows={5}
        />
        <div className="textarea-actions">
          <span className="char-count">{storyIdea.length} characters</span>
          <button
            className="btn btn-sm btn-accent"
            onClick={onRefineStory}
            disabled={isRefining || !storyIdea.trim()}
          >
            {isRefining ? (
              <>
                <span className="loading-dots">Refining</span>
              </>
            ) : (
              <>
                <Sparkles size={14} /> Refine with AI
              </>
            )}
          </button>
        </div>
      </div>

      {refinedStory && (
        <div className="refined-story-preview">
          <div className="refined-header">
            <Sparkles size={16} />
            <span>AI-Refined Story</span>
          </div>
          <p className="refined-text">{refinedStory}</p>
          <button className="btn btn-sm btn-primary" onClick={onUseRefined}>
            Use Refined Version
          </button>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label><LayoutGrid size={14} /> Genre / Tone</label>
          <div className="genre-grid">
            {GENRE_OPTIONS.map(g => (
              <button
                key={g.value}
                className={`genre-chip ${genre === g.value ? 'active' : ''}`}
                onClick={() => onGenreChange(g.value)}
              >
                <span className="genre-emoji">{g.emoji}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label><LayoutGrid size={14} /> Format</label>
        <div className="format-grid">
          {FORMAT_OPTIONS.map(f => (
            <button
              key={f.value}
              className={`format-chip ${targetFormat === f.value ? 'active' : ''}`}
              onClick={() => onFormatChange(f.value)}
            >
              <span className="format-panels">{f.panels}</span>
              <span className="format-label">{f.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
