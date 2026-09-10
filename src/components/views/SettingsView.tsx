import React, { useState } from 'react';
import { Key, Copy, Check, ShieldCheck, Globe, Webhook, RefreshCw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-satoshi font-semibold text-charcoal">Developer Settings & API Access</h1>
        <p className="text-xs text-steel">Manage publishable and secret keys to integrate ZManage with custom mobile apps and backends.</p>
      </div>

      {/* API Keys Card */}
      <div className="dub-card p-6 bg-white space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-ash">
          <div>
            <h3 className="text-sm font-semibold text-charcoal flex items-center gap-2">
              <Key className="w-4 h-4 text-electric" /> Project API Credentials
            </h3>
            <p className="text-xs text-steel mt-0.5">Use these keys to authenticate requests to ZManage-APIs (Port 4003).</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Publishable Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-charcoal">Publishable Key (Client Web & Mobile)</span>
              <span className="text-[11px] font-mono text-fog">Safe for client-side bundle</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value="zm_live_pub_4f92a10b83ec4920b12e"
                className="dub-input w-full font-mono text-xs bg-paper text-steel select-all"
              />
              <button
                onClick={() => copyToClipboard('zm_live_pub_4f92a10b83ec4920b12e', 'pub')}
                className="dub-btn-outline p-2 text-xs flex items-center gap-1 shrink-0"
              >
                {copiedKey === 'pub' ? <Check className="w-4 h-4 text-vividGreen" /> : <Copy className="w-4 h-4 text-steel" />}
              </button>
            </div>
          </div>

          {/* Secret Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-charcoal">Secret Key (Server-to-Server ERP)</span>
              <span className="text-[11px] font-mono text-tangerine">Keep confidential</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                type="password"
                value="zm_live_sec_9921b3084ac91823ef40192a"
                className="dub-input w-full font-mono text-xs bg-paper text-steel select-all"
              />
              <button
                onClick={() => copyToClipboard('zm_live_sec_9921b3084ac91823ef40192a', 'sec')}
                className="dub-btn-outline p-2 text-xs flex items-center gap-1 shrink-0"
              >
                {copiedKey === 'sec' ? <Check className="w-4 h-4 text-vividGreen" /> : <Copy className="w-4 h-4 text-steel" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Configuration Card */}
      <div className="dub-card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-ash">
          <div>
            <h3 className="text-sm font-semibold text-charcoal flex items-center gap-2">
              <Webhook className="w-4 h-4 text-vividGreen" /> Webhooks & Event Dispatch (ZConnect)
            </h3>
            <p className="text-xs text-steel mt-0.5">Receive instant notifications for equipment checkout and collision detections.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-charcoal block mb-1">Target Webhook URL</label>
            <input
              type="text"
              defaultValue="https://api.aurastudio.com/webhooks/zmanage"
              className="dub-input w-full font-mono text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {['asset.checked_out', 'asset.returned', 'collision.blocked', 'payout.settled'].map(ev => (
              <span key={ev} className="dub-pill text-[11px] py-0.5 px-2 bg-paper text-steel font-mono">
                {ev}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
