import React, { useState, useRef } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import type { CreatorUploadDraft } from '../../types/creator';

const ROOM_OPTIONS = [
  'Sound Roots',
  'Painted Memory',
  'Artifact House',
  'Living Stories',
];

interface ContentUploadPipelineProps {
  onSubmit: (draft: Omit<CreatorUploadDraft, 'id' | 'submittedAt' | 'status'>) => void;
}

export const ContentUploadPipeline: React.FC<ContentUploadPipelineProps> = ({ onSubmit }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [narrative, setNarrative] = useState('');
  const [roomName, setRoomName] = useState('Painted Memory');
  const [submitted, setSubmitted] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
    setSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    const isAudio = file.type.startsWith('audio/');
    onSubmit({
      fileName: file.name,
      fileType: isAudio ? 'audio' : 'image',
      objectUrl: URL.createObjectURL(file),
      title: title.trim(),
      narrative: narrative.trim(),
      roomName,
    });

    setSubmitted(true);
    setFile(null);
    setTitle('');
    setNarrative('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <section className="workspace-upload-panel">
      <h2>Content upload pipeline</h2>
      <p className="workspace-upload-sub">
        Demo CMS for protected uploads and authentic metadata. Submissions enter admin review.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="heritage-label">Asset file</label>
        <div
          className="workspace-dropzone"
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <input ref={fileRef} type="file" accept="image/*,audio/*" hidden onChange={handleFile} />
          <Upload size={24} />
          <span>{file ? file.name : 'Choose image or audio file'}</span>
        </div>

        <label className="heritage-label">Title & timeline tag</label>
        <input
          type="text"
          className="heritage-input"
          placeholder="Market Memory / Contemporary painting"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="heritage-label">Cultural lore narrative</label>
        <textarea
          className="heritage-textarea"
          placeholder="Origin, lineage, ownership, and context for custodians and visitors."
          rows={4}
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
        />

        <label className="heritage-label">Target room</label>
        <select
          className="heritage-select"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        >
          {ROOM_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <button type="submit" className="heritage-btn-primary" disabled={!file || !title.trim()}>
          Submit to admin review
        </button>

        {submitted && (
          <p className="workspace-upload-success">
            <CheckCircle size={16} /> Queued for review — see your exhibits list below.
          </p>
        )}
      </form>
    </section>
  );
};

export default ContentUploadPipeline;
