import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ContentUploadPipeline } from '../components/creator/ContentUploadPipeline';
import {
  getMockCreatorForUser,
  formatDuration,
} from '../data/mockCreators';
import type { CreatorProfile, CreatorWork, CreatorUploadDraft } from '../types/creator';
import {
  loadPendingUploads,
  savePendingUpload,
  draftToWork,
  loadPaymentPointer,
  savePaymentPointer,
} from '../services/creatorStorage';
import { fetchCreatorAnalytics, fetchCreatorProfile } from '../utils/apiService';
import '../styles/kulthera-mint.css';
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
          paymentPointer: apiProfile.paymentPointer || apiProfile.walletAddress || base.paymentPointer,
        };
        const analytics = await fetchCreatorAnalytics();
        if (analytics.totalEarnings) {
          base.webMonetizationUsd = analytics.totalEarnings;
        }
      } catch {
        /* use mock */
      }

      const pointer = loadPaymentPointer(userId, base.paymentPointer);
      setPaymentPointer(pointer);
      setProfile(base);

      const uploads = loadPendingUploads(userId).map(draftToWork);
      setPendingWorks(uploads);
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

  const savePointer = () => {
    savePaymentPointer(userId, paymentPointer);
  };

  if (!user || !profile) {
    return (
      <div className="page-mint creator-workspace">
        <p>Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="page-mint">
      <div className="creator-workspace">
        <header className="creator-workspace-header">
          <div className="creator-brand">
            <div className="creator-brand-icon">K</div>
            <div>
              <div className="creator-brand-title">Kulthera</div>
              <div className="creator-brand-sub">Creator Workspace</div>
            </div>
          </div>
          <div className="creator-header-actions">
            <button type="button" className="mint-btn-outline" onClick={() => navigate('/')}>
              Museum lobby
            </button>
            <button type="button" className="mint-btn-outline" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <p className="mint-kicker">Creator management dashboard</p>
        <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', marginBottom: 24, lineHeight: 1.3 }}>
          Track success, control funds, and prepare exhibits for review.
        </h1>

        <div className="creator-stats-row">
          <div className="creator-stat-card">
            <h3>Total minutes streamed</h3>
            <p className="creator-stat-value">{profile.minutesStreamed}</p>
          </div>
          <div className="creator-stat-card">
            <h3>Earnings summary</h3>
            <div className="creator-stat-split">
              <div>
                <strong>${profile.webMonetizationUsd.toFixed(2)}</strong>
                <span>Web Monetization streams</span>
              </div>
              <div>
                <strong>${profile.directTipsUsd.toFixed(2)}</strong>
                <span>Direct tips received</span>
              </div>
            </div>
          </div>
          <div className="creator-stat-card">
            <h3>Payment pointer</h3>
            <input
              type="text"
              className="mint-input"
              value={paymentPointer}
              onChange={(e) => setPaymentPointer(e.target.value)}
              onBlur={savePointer}
              placeholder="$ilp.uphold.com/yourname"
            />
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 8 }}>
              Paste your Interledger wallet / payment pointer here.
            </p>
          </div>
        </div>

        <ContentUploadPipeline onSubmit={handleUpload} />

        <section className="exhibit-rows">
          <h2>Your exhibits</h2>
          <p style={{ color: '#94a3b8', marginBottom: 16, fontSize: '0.9rem' }}>
            Analytics stored locally for demo. New uploads appear with pending review status.
          </p>

          {allWorks.length === 0 ? (
            <p style={{ color: '#64748b' }}>No exhibits yet — upload your first work above.</p>
          ) : (
            allWorks.map((work) => (
              <ExhibitRow key={work.id} work={work} creatorName={profile.name} />
            ))
          )}
        </section>

        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Aggregate (mock)</h2>
          <div className="creator-stats-row">
            <div className="creator-stat-card">
              <h3>Total views</h3>
              <p className="creator-stat-value">{profile.totalViews}</p>
            </div>
            <div className="creator-stat-card">
              <h3>Time spent</h3>
              <p className="creator-stat-value" style={{ fontSize: '1.5rem' }}>
                {formatDuration(profile.totalAttentionSeconds)}
              </p>
            </div>
            <div className="creator-stat-card">
              <h3>Monetized time</h3>
              <p className="creator-stat-value" style={{ fontSize: '1.5rem' }}>
                {formatDuration(profile.totalMonetizedSeconds)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

function ExhibitRow({ work, creatorName }: { work: CreatorWork; creatorName: string }) {
  const isAudio = work.mediaType === 'audio';

  return (
    <div className="exhibit-row">
      <img src={work.thumbnailUrl} alt="" className="exhibit-row-thumb" />
      <div>
        <p className="exhibit-row-title">
          {work.title}
          {work.status === 'pending_review' && (
            <span className="badge-pending">Pending review</span>
          )}
        </p>
        <p className="exhibit-row-by">
          by {creatorName} · {work.roomName}
          {isAudio && ' · 🎵 Audio'}
        </p>
        {isAudio && work.mediaUrl && (
          <audio
            controls
            preload="metadata"
            src={work.mediaUrl}
            style={{ width: '100%', maxWidth: 320, marginTop: 8, height: 36 }}
          />
        )}
      </div>
      <div className="exhibit-row-stats">
        <div>{work.views} views</div>
        <div>{formatDuration(work.attentionSeconds)} attention</div>
        <div>{formatDuration(work.monetizedSeconds)} monetized</div>
        <div className="exhibit-row-earnings">${work.testSupportUsd.toFixed(2)} test</div>
      </div>
    </div>
  );
}

export default CreatorDashboardPage;
