import React, { useState, useMemo } from 'react';
import { useProjectStore } from '../stores/projectStore';
import type { Project } from '../types';
import { ProjectStatus } from '../types';
import { Plus, FolderKanban, Trash2, Edit3, GitBranch, ExternalLink, Calendar, Code, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function ProjectsPage() {
  const projects = useProjectStore((s) => s.projects);
  const addProject = useProjectStore((s) => s.addProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.ACTIVE);
  const [technologies, setTechnologies] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState(0);

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus(ProjectStatus.ACTIVE);
    setTechnologies('');
    setGithubUrl('');
    setDeadline('');
    setProgress(0);
    setEditingProject(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setStatus(project.status);
    setTechnologies(project.technologies.join(', '));
    setGithubUrl(project.githubUrl || '');
    setDeadline(project.deadline || '');
    setProgress(project.progress);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const techArray = technologies
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    const projectData = {
      title,
      description,
      status,
      technologies: techArray,
      githubUrl: githubUrl || undefined,
      deadline: deadline || undefined,
      progress,
    };

    if (editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      addProject(projectData);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const getStatusBadgeClass = (s: ProjectStatus) => {
    switch (s) {
      case ProjectStatus.PLANNING: return 'badge-cyan';
      case ProjectStatus.ACTIVE: return 'badge-accent';
      case ProjectStatus.COMPLETED: return 'badge-emerald';
      case ProjectStatus.ARCHIVED: return 'badge-rose';
      default: return 'badge-accent';
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter === 'all') return true;
      return p.status === statusFilter;
    });
  }, [projects, statusFilter]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>Projects</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Manage your personal, cybersecurity, and coding projects in one central hub.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ gap: 6 }}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={14} /> Filter Status:
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', ProjectStatus.PLANNING, ProjectStatus.ACTIVE, ProjectStatus.COMPLETED, ProjectStatus.ARCHIVED].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="btn btn-sm"
              style={{
                background: statusFilter === s ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                color: statusFilter === s ? 'white' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                textTransform: 'capitalize',
                padding: '6px 12px',
              }}
            >
              {s === 'all' ? 'All Projects' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <FolderKanban size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 14, fontWeight: 600 }}>No projects found.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Track your coding milestones, security research, or portfolio development.</p>
          <button onClick={handleOpenAddModal} className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>
            Create a Project
          </button>
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}
        >
          {filteredProjects.map((project) => (
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              key={project.id} 
              className="glass-card" 
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className={`badge ${getStatusBadgeClass(project.status)}`} style={{ textTransform: 'capitalize', fontSize: 10, marginBottom: 6 }}>
                    {project.status}
                  </span>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{project.title}</h4>
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => handleOpenEditModal(project)} className="btn btn-ghost btn-icon btn-sm" style={{ width: 28, height: 28 }} title="Edit">
                    <Edit3 size={12} />
                  </button>
                  <button onClick={() => deleteProject(project.id)} className="btn btn-ghost btn-icon btn-sm" style={{ width: 28, height: 28, color: 'var(--color-rose)' }} title="Delete">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4, minHeight: 40 }}>
                  {project.description}
                </p>
              )}

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  <span>Completion Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-bar-fill" style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              {/* Technology Tags */}
              {project.technologies.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {project.technologies.map((tech) => (
                    <span key={tech} className="badge badge-accent" style={{ fontSize: 9, background: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                      <Code size={8} style={{ marginRight: 4 }} />
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer info: Deadline, GitHub link */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 4, fontSize: 12, color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} />
                  {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'No deadline'}
                </div>

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    <GitBranch size={14} /> Repository <ExternalLink size={10} />
                  </a>
                )}
              </div>

            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter project name..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Description</label>
                  <textarea
                    placeholder="Add brief details about the project goals..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input"
                    rows={3}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                      className="input"
                    >
                      {Object.values(ProjectStatus).map((s) => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Completion Percentage ({progress}%)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(Number(e.target.value))}
                        style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Technologies (comma separated)</label>
                  <input
                    type="text"
                    placeholder="E.g., React, TypeScript, Rust, Python, Docker"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    className="input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>GitHub Repository URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Target Deadline</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
