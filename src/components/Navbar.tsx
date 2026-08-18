
import {
  Settings,
  Download,
  Sparkles,
  PanelTop,
  Plus,
  BookOpen,
} from 'lucide-react';
import type { StoryProject } from '../types/comic';

interface NavbarProps {
  project: StoryProject;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onNewProject: () => void;
  onLoadSample: () => void;
}

export default function Navbar({
  project,
  onOpenSettings,
  onOpenExport,
  onNewProject,
  onLoadSample,
}: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <PanelTop size={28} className="brand-icon" />
          <div className="brand-text">
            <h1 className="brand-title">StoryNex AI</h1>
            <span className="brand-subtitle">Script & Dialogue Generator</span>
          </div>
        </div>
      </div>

      <div className="navbar-center">
        <div className="project-title-badge">
          <Sparkles size={14} />
          <span>{project.title || 'Untitled Project'}</span>
        </div>
      </div>

      <div className="navbar-right">
        <button className="nav-btn" onClick={onLoadSample} title="Load Sample Project">
          <BookOpen size={18} />
          <span className="nav-btn-label">Sample</span>
        </button>
        <button className="nav-btn" onClick={onNewProject} title="New Project">
          <Plus size={18} />
          <span className="nav-btn-label">New</span>
        </button>
        <button className="nav-btn" onClick={onOpenExport} title="Export Script" disabled={project.panels.length === 0}>
          <Download size={18} />
          <span className="nav-btn-label">Export</span>
        </button>
        <button className="nav-btn nav-btn-settings" onClick={onOpenSettings} title="Settings">
          <Settings size={18} />
        </button>
      </div>
    </nav>
  );
}
