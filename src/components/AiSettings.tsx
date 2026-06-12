import { useState } from 'react'
import { PixelDialog, PixelButton } from '../ui'
import { loadAiConfig, saveAiConfig, clearAiConfig, chat } from '../services/aiGateway'
import type { LocalAssetPackState } from '../services/localAssetPack'

export function AiSettings({ onClose, assetPackState }: { onClose: () => void; assetPackState?: LocalAssetPackState }) {
  const existing = loadAiConfig()
  const [baseURL, setBaseURL] = useState(existing?.baseURL ?? 'https://api.deepseek.com')
  const [apiKey, setApiKey] = useState(existing?.apiKey ?? '')
  const [model, setModel] = useState(existing?.model ?? 'deepseek-chat')
  const [status, setStatus] = useState<string | null>(null)

  const save = () => {
    saveAiConfig({ baseURL: baseURL.trim(), apiKey: apiKey.trim(), model: model.trim() })
    setStatus('✅ 已保存(只存在你自己的浏览器里)')
  }
  const test = async () => {
    saveAiConfig({ baseURL: baseURL.trim(), apiKey: apiKey.trim(), model: model.trim() })
    setStatus('⏳ 测试连接中…')
    try {
      await chat([{ role: 'user', content: 'ping,只回复 pong' }], { temperature: 0 })
      setStatus('✅ 连接成功,AI 玩法已解锁!')
    } catch (e) {
      setStatus(`❌ ${(e as Error).message}`)
    }
  }
  const clear = () => { clearAiConfig(); setApiKey(''); setStatus('已清除本机配置') }

  return (
    <PixelDialog onClose={onClose} className="ai-settings">
      <h2 className="shelf-title">⚙️ 接入 AI(BYOK)</h2>
      <p className="body-text">填入任意 OpenAI 兼容服务。没有 Key?去 platform.deepseek.com 注册一个(教程第 5 章同款,几块钱能玩很久)。Key 只存本机浏览器,不会上传。</p>
      <label className="body-text ai-field">服务地址
        <input className="fill-input" aria-label="baseURL" value={baseURL} onChange={e => setBaseURL(e.target.value)} />
      </label>
      <label className="body-text ai-field">API Key
        <input className="fill-input" aria-label="apiKey" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-…" />
      </label>
      <label className="body-text ai-field">模型名
        <input className="fill-input" aria-label="model" value={model} onChange={e => setModel(e.target.value)} />
      </label>
      <div className="asset-pack-note">
        <h3>🎨 本地素材包</h3>
        <p className="body-text">
          {assetPackState?.status === 'ready'
            ? `✅ ${assetPackState.message}`
            : assetPackState?.status === 'error'
              ? `❌ ${assetPackState.message}`
              : assetPackState?.status === 'loading'
                ? '⏳ 正在检测 public/local-assets/manifest.json'
                : '未启用。复制 public/local-assets.example.json 到 public/local-assets/manifest.json 后刷新。'}
        </p>
        {assetPackState?.pack?.description && <p className="body-text">{assetPackState.pack.description}</p>}
      </div>
      <div className="panel-actions">
        <PixelButton onClick={clear}>清除</PixelButton>
        <PixelButton onClick={test}>测试连接</PixelButton>
        <PixelButton onClick={save}>保存</PixelButton>
        <PixelButton onClick={onClose}>关闭</PixelButton>
      </div>
      {status && <p className="body-text">{status}</p>}
    </PixelDialog>
  )
}
