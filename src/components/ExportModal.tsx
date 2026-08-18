import { useState } from 'react';
import { X, Download, FileText, FileJson, Image, Copy, Check } from 'lucide-react';
import type { StoryProject } from '../types/comic';
import { showToast } from './Toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: StoryProject;
}

export default function ExportModal({ isOpen, onClose, project }: ExportModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const { panels, characters } = project;

  const generateMarkdown = (): string => {
    let md = `# ${project.title}\n\n`;
    md += `**Genre:** ${project.genre} | **Format:** ${project.target_format}\n\n`;
    md += `## Story\n${project.story_idea}\n\n`;

    md += `## Characters\n`;
    for (const c of characters) {
      md += `### ${c.name}\n`;
      md += `- **Physical:** ${c.physical_description}\n`;
      md += `- **Personality:** ${c.personality}\n`;
      md += `- **Speech Style:** ${c.speech_style}\n`;
      md += `- **Vocabulary:** ${c.vocabulary_level}\n`;
      if (Object.keys(c.relationships).length > 0) {
        md += `- **Relationships:** ${Object.entries(c.relationships).map(([k, v]) => `${k} (${v})`).join(', ')}\n`;
      }
      md += '\n';
    }

    md += `## Script\n\n`;
    for (const p of panels) {
      md += `### Panel ${p.panel_number}\n`;
      md += `**Setting:** ${p.setting}\n`;
      md += `**Characters:** ${p.characters_present.join(', ')}\n`;
      md += `**Action:** ${p.action}\n`;
      md += `**Emotion:** ${p.emotion}\n\n`;

      if (p.narration) {
        md += `> *${p.narration}*\n\n`;
      }

      for (const d of p.dialogue) {
        md += `**${d.speaker}** *(${d.delivery})*: "${d.line}"\n\n`;
      }

      if (p.image_prompt) {
        md += `📷 **Image Prompt:** ${p.image_prompt}\n\n`;
      }

      md += '---\n\n';
    }

    return md;
  };

  const generateJSON = (): string => {
    return JSON.stringify({
      title: project.title,
      genre: project.genre,
      target_format: project.target_format,
      story_idea: project.story_idea,
      characters: characters.map(c => ({
        name: c.name,
        physical_description: c.physical_description,
        personality: c.personality,
        speech_style: c.speech_style,
        vocabulary_level: c.vocabulary_level,
        emotional_tendencies: c.emotional_tendencies,
        relationships: c.relationships,
      })),
      panels: panels.map(p => ({
        panel_number: p.panel_number,
        setting: p.setting,
        characters_present: p.characters_present,
        action: p.action,
        emotion: p.emotion,
        dialogue: p.dialogue,
        narration: p.narration,
        image_prompt: p.image_prompt,
      })),
    }, null, 2);
  };

  const generateImagePrompts = (): string => {
    return panels.map(p =>
      `Panel ${p.panel_number}:\n${p.image_prompt}\n`
    ).join('\n---\n\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`, 'success');
  };

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedType(type);
      showToast(`${type} copied to clipboard!`, 'success');
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal export-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Download size={20} /> Export Script</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="export-options">
            <div className="export-card">
              <div className="export-card-icon">
                <FileText size={32} />
              </div>
              <h3>Markdown Script</h3>
              <p>Readable screenplay format with all panels, dialogue, and image prompts</p>
              <div className="export-card-actions">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => downloadFile(generateMarkdown(), `${slug}-script.md`, 'text/markdown')}
                >
                  <Download size={14} /> Download .md
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => copyToClipboard(generateMarkdown(), 'Markdown')}
                >
                  {copiedType === 'Markdown' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="export-card">
              <div className="export-card-icon">
                <FileJson size={32} />
              </div>
              <h3>Structured JSON</h3>
              <p>Machine-readable format matching the panel schema — perfect for integrations</p>
              <div className="export-card-actions">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => downloadFile(generateJSON(), `${slug}-script.json`, 'application/json')}
                >
                  <Download size={14} /> Download .json
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => copyToClipboard(generateJSON(), 'JSON')}
                >
                  {copiedType === 'JSON' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="export-card">
              <div className="export-card-icon">
                <Image size={32} />
              </div>
              <h3>Image Prompts Batch</h3>
              <p>All image_prompt fields in order — paste directly into any image generator</p>
              <div className="export-card-actions">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => downloadFile(generateImagePrompts(), `${slug}-prompts.txt`, 'text/plain')}
                >
                  <Download size={14} /> Download .txt
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => copyToClipboard(generateImagePrompts(), 'Prompts')}
                >
                  {copiedType === 'Prompts' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
