
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
    <nav className="navbar glass-navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <PanelTop size={22} className="brand-icon" />
            <div className="brand-icon-glow"></div>
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <h1 className="brand-title">StoryNex<span className="brand-title-accent">AI</span></h1>
              <span className="brand-badge-pill">STUDIO</span>
            </div>
            <span className="brand-subtitle">AI Comic Script & Dialogue Studio</span>
          </div>
        </div>
      </div>

      <div className="navbar-center">
        <div className="project-title-badge glass-pill">
          <Sparkles size={14} className="sparkle-icon" />
          <span className="project-title-text">{project.title || 'Untitled Project'}</span>
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
