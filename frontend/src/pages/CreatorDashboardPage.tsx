import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ContentUploadPipeline } from '../components/creator/ContentUploadPipeline';
import { getMockCreatorForUser, formatDuration } from '../data/mockCreators';
import type { CreatorProfile, CreatorWork, CreatorUploadDraft } from '../types/creator';
import {
  loadPendingUploads,
  savePendingUpload,
  draftToWork,
  loadPaymentPointer,
  savePaymentPointer,
} from '../services/creatorStorage';
import { fetchCreatorAnalytics, fetchCreatorProfile } from '../utils/apiService';
import '../styles/creator-workspace.css';
import '../styles/responsive.css';

export const CreatorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [paymentPointer, setPaymentPointer] = useState('');
  const [pendingWorks, setPendingWorks] = useState<CreatorWork[]>([]);

  const userId = user?.id?.toString() || user?.email || 'guest';

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      let base = getMockCreatorForUser(user.email, user.name);

      try {
        const apiProfile = await fetchCreatorProfile();
        base = {
          ...base,
          name: apiProfile.name || base.name,
          avatarUrl: apiProfile.avatarUrl || base.avatarUrl,
          paymentPointer:
            apiProfile.paymentPointer || apiProfile.walletAddress || base.paymentPointer,
        };
        const analytics = await fetchCreatorAnalytics();
        if (analytics.totalEarnings) {
          base.webMonetizationUsd = analytics.totalEarnings;
        }
      } catch {
        /* mock */
      }

      setPaymentPointer(loadPaymentPointer(userId, base.paymentPointer));
      setProfile(base);
      setPendingWorks(loadPendingUploads(userId).map(draftToWork));
    };

    load();
  }, [user, userId]);

  const allWorks = useMemo(() => {
    if (!profile) return pendingWorks;
    return [...pendingWorks, ...profile.works];
  }, [profile, pendingWorks]);

  const handleUpload = (draft: Omit<CreatorUploadDraft, 'id' | 'submittedAt' | 'status'>) => {
    const full: CreatorUploadDraft = {
      ...draft,
      id: `upload-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending_review',
    };
    savePendingUpload(full, userId);
    setPendingWorks((prev) => [draftToWork(full), ...prev]);
  };

  if (!user || !profile) {
    return (
      <div className="page-workspace workspace-loading">
        <p>Loading creator workspace…</p>
      </div>
    );
  }

  return (
    <div className="page-workspace">
      <div className="workspace-shell">
        <header className="workspace-header">
          <div className="workspace-brand">
            <div className="workspace-brand-mark">K</div>
            <div>
              <div className="workspace-brand-title">Kulthera</div>
              <div className="workspace-brand-sub">Creator Workspace</div>
            </div>
          </div>
          <div className="workspace-header-actions">
            <button type="button" className="heritage-btn-secondary" onClick={() => navigate('/')}>
              Museum lobby
            </button>
            <button type="button" className="heritage-btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <p className="workspace-kicker">Creator management</p>
        <h1 className="workspace-title">
          Track success, control funds, and prepare exhibits for review.
        </h1>

        <div className="workspace-analytics-row">
          <div className="workspace-analytics-card">
            <h4>Total views</h4>
            <p className="workspace-stat-value-sm">{profile.totalViews.toLocaleString()}</p>
          </div>
          <div className="workspace-analytics-card">
            <h4>Time spent</h4>
            <p className="workspace-stat-value-sm">
              {formatDuration(profile.totalAttentionSeconds)}
            </p>
          </div>
          <div className="workspace-analytics-card">
            <h4>Monetized time</h4>
            <p className="workspace-stat-value-sm">
              {formatDuration(profile.totalMonetizedSeconds)}
            </p>
          </div>
        </div>

        <div className="workspace-stats-grid">
          <div className="workspace-stat-card">
            <h3>Minutes streamed</h3>
            <p className="workspace-stat-value">{profile.minutesStreamed}</p>
          </div>
          <div className="workspace-stat-card">
            <h3>Earnings</h3>
            <div className="workspace-stat-split">
              <div>
                <strong>${profile.webMonetizationUsd.toFixed(2)}</strong>
                <span>Web Monetization (demo)</span>
              </div>
              <div>
                <strong>${profile.directTipsUsd.toFixed(2)}</strong>
                <span>Direct tips (demo)</span>
              </div>
            </div>
          </div>
          <div className="workspace-stat-card">
            <h3>Payment pointer</h3>
            <input
              type="text"
              className="heritage-input"
              value={paymentPointer}
              onChange={(e) => setPaymentPointer(e.target.value)}
              onBlur={() => savePaymentPointer(userId, paymentPointer)}
              placeholder="$ilp.interledger-test.dev/yourname"
            />
            <p className="workspace-stat-hint">
              Interledger wallet where streamed support is routed during exhibits.
            </p>
          </div>
        </div>

        <ContentUploadPipeline onSubmit={handleUpload} />

        <section className="workspace-exhibits">
          <h2>Your exhibits</h2>
          <p className="workspace-exhibits-intro">
            Time-attention is measurable—each row shows views, dwell time, and demo test support.
          </p>

          {allWorks.length === 0 ? (
            <p className="workspace-exhibits-intro">Upload your first work above.</p>
          ) : (
            allWorks.map((work) => (
              <ExhibitRow key={work.id} work={work} creatorName={profile.name} />
            ))
          )}
        </section>
      </div>
    </div>
  );
};

function ExhibitRow({ work, creatorName }: { work: CreatorWork; creatorName: string }) {
  const isAudio = work.mediaType === 'audio';

  return (
    <div className="workspace-exhibit-row">
      <img src={work.thumbnailUrl} alt="" className="workspace-exhibit-thumb" />
      <div>
        <p className="workspace-exhibit-title">
          {work.title}
          {work.status === 'pending_review' && (
            <span className="badge-pending-review">Pending review</span>
          )}
        </p>
        <p className="workspace-exhibit-meta">
          {creatorName} · {work.roomName}
          {isAudio ? ' · Audio' : ''}
        </p>
        {isAudio && work.mediaUrl && (
          <audio controls preload="metadata" src={work.mediaUrl} style={{ width: '100%', maxWidth: 360, marginTop: 10 }} />
        )}
      </div>
      <div className="workspace-exhibit-stats">
        <div>{work.views} views</div>
        <div>{formatDuration(work.attentionSeconds)} attention</div>
        <div>{formatDuration(work.monetizedSeconds)} monetized</div>
        <div className="workspace-exhibit-earnings">${work.testSupportUsd.toFixed(2)} test</div>
      </div>
    </div>
  );
}

export default CreatorDashboardPage;
