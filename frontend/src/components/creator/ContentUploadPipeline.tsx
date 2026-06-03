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

  const accept = 'image/*,audio/mpeg,audio/wav,audio/mp3,audio/ogg';

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
    setSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    const isAudio = file.type.startsWith('audio/');
    const objectUrl = URL.createObjectURL(file);

    onSubmit({
      fileName: file.name,
      fileType: isAudio ? 'audio' : 'image',
      objectUrl,
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
    <section className="upload-pipeline">
      <h2>Content Upload Pipeline</h2>
      <p className="upload-pipeline-sub">
        Demo CMS form for protected uploads and authentic metadata.
      </p>

      <form onSubmit={handleSubmit} className="upload-form">
        <label className="field-label">Asset file selector</label>
        <div
          className="upload-dropzone"
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            hidden
            onChange={handleFile}
          />
          <Upload size={24} />
          <span>{file ? file.name : 'Choose image / audio file'}</span>
          <span className="upload-hint">MP3, WAV, PNG, JPG — max one file per submit</span>
        </div>

        <label className="field-label">Title & historical timeline tag</label>
        <input
          type="text"
          className="mint-input"
          placeholder="Market Memory / Contemporary painting"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="field-label">Lineage & cultural lore narrative</label>
        <textarea
          className="mint-input mint-textarea"
          placeholder="A cultural story describing origin, lineage, ownership, and context."
          rows={4}
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
        />

        <label className="field-label">Target room assignment</label>
        <select
          className="mint-input"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        >
          {ROOM_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <button type="submit" className="mint-btn-primary" disabled={!file || !title.trim()}>
          Submit to admin review
        </button>

        {submitted && (
          <p className="upload-success">
            <CheckCircle size={16} /> Queued for review — visible in your works list below.
          </p>
        )}
      </form>
    </section>
  );
};

export default ContentUploadPipeline;
