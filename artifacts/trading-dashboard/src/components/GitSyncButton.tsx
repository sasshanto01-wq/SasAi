import React, { useState } from 'react';
import { syncGit } from '@workspace/api-client-react';
import type { GitSyncResponse } from '@workspace/api-client-react/src/generated/api.schemas';
import { GitBranch, Loader2, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'pushing' | 'pushed' | 'nothing' | 'failed';

export function GitSyncButton() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');

  async function handleClick() {
    if (status === 'pushing') return;
    setStatus('pushing');
    setMessage('');
    try {
      const res: GitSyncResponse = await syncGit({});
      if (res.ok && res.status === 'pushed') {
        setStatus('pushed');
        setMessage(
          res.commitSha
            ? `Pushed ${res.commitSha.slice(0, 7)}`
            : 'Pushed to GitHub'
        );
      } else if (res.ok && res.status === 'nothing_to_commit') {
        setStatus('nothing');
        setMessage('Nothing to commit');
      } else {
        setStatus('failed');
        setMessage(res.error || 'Push failed');
      }
    } catch (e) {
      setStatus('failed');
      setMessage(e instanceof Error ? e.message : 'Push failed');
    } finally {
      window.setTimeout(() => {
        setStatus((prev) => (prev === 'pushing' ? prev : 'idle'));
      }, 4000);
    }
  }

  const isBusy = status === 'pushing';

  const label =
    status === 'pushing'
      ? 'Pushing…'
      : status === 'pushed'
      ? 'Pushed'
      : status === 'nothing'
      ? 'Up to date'
      : status === 'failed'
      ? 'Failed'
      : 'Sync to GitHub';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      title={message || 'Commit and push the latest changes to GitHub'}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all duration-200 border',
        'bg-black/70 hover:bg-white/5',
        status === 'pushed'
          ? 'border-success/30 text-success'
          : status === 'failed'
          ? 'border-destructive/30 text-destructive'
          : status === 'nothing'
          ? 'border-white/10 text-muted-foreground'
          : 'border-white/[0.06] text-foreground hover:border-primary/30 hover:text-primary',
        isBusy && 'opacity-80 cursor-wait'
      )}
      aria-live="polite"
    >
      {status === 'pushing' ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : status === 'pushed' ? (
        <Check className="w-3.5 h-3.5" />
      ) : status === 'failed' ? (
        <AlertTriangle className="w-3.5 h-3.5" />
      ) : (
        <GitBranch className="w-3.5 h-3.5" />
      )}
      <span>{label}</span>
      {message && (status === 'pushed' || status === 'failed') && (
        <span className="text-[10px] opacity-70 max-w-[160px] truncate hidden sm:inline">
          · {message}
        </span>
      )}
    </button>
  );
}
