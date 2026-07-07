import { motion, AnimatePresence } from 'framer-motion';

export default function MusicSection({ formData, handleUpdate, pushToQueue, musicDetails, queryMusic, queryLoading, queryResult, confirmAddMusic, removeSong }: any) {
  const saveMusicConfig = () => {
    pushToQueue('音乐播放器开关', 'enableMusicPlayer', formData.enableMusicPlayer);
    pushToQueue('网易云歌单 ID', 'cloudMusicPlaylistId', formData.cloudMusicPlaylistId || '');
    pushToQueue('网易云单曲列表', 'cloudMusicIds', formData.cloudMusicIds);
  };

  return (
    <motion.section initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 rounded-[40px] p-8 shadow-2xl">
      <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8">🎵 歌单管理与查询</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-3">
          <div className="rounded-3xl bg-white/45 dark:bg-slate-800/45 border border-white/30 p-5 mb-6 space-y-4">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">启用音乐播放器</span>
              <button
                type="button"
                onClick={() => handleUpdate('enableMusicPlayer', !formData.enableMusicPlayer)}
                className={`h-8 w-16 rounded-full p-1 transition-colors ${formData.enableMusicPlayer ? 'bg-pink-500' : 'bg-slate-400'}`}
                aria-label="切换音乐播放器"
              >
                <span className={`block h-6 w-6 rounded-full bg-white shadow transition-transform ${formData.enableMusicPlayer ? 'translate-x-8' : 'translate-x-0'}`} />
              </button>
            </label>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">网易云歌单 ID</p>
              <input
                type="text"
                placeholder="例如 1234567890"
                value={formData.cloudMusicPlaylistId || ''}
                onChange={e => handleUpdate('cloudMusicPlaylistId', e.target.value.trim())}
                className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm outline-none shadow-sm"
              />
            </div>
          </div>

          <p className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-4">当前绑定的网易云 ID ({formData.cloudMusicIds.length})</p>
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {formData.cloudMusicIds.map((id: string, index: number) => {
              const detail = musicDetails[id];
              return (
                <div key={index} className="flex justify-between items-center p-3 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-white/20 group">
                  <div className="flex items-center gap-3">
                    {detail?.cover ? (
                      <img src={detail.cover} alt="cover" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center text-xs">💿</div>
                    )}
                    <div className="flex flex-col">
                      {detail ? (
                        <>
                          <span className={`text-sm font-bold line-clamp-1 ${detail.error ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{detail.name}</span>
                          {!detail.error && <span className="text-[10px] text-slate-500 font-medium">{detail.artist}</span>}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">正在解析...</span>
                      )}
                      <span className="text-[10px] font-mono text-pink-500 mt-0.5">#{id}</span>
                    </div>
                  </div>
                  <button onClick={() => removeSong(index)} className="w-8 h-8 shrink-0 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white flex items-center justify-center">✕</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl p-6 space-y-6">
          <p className="text-[10px] font-black text-slate-400 uppercase">校验并添加新 ID</p>
          <div className="flex gap-2">
            <input type="text" placeholder="输入歌曲 ID" value={formData.newMusicId} onChange={e => handleUpdate('newMusicId', e.target.value)} className="flex-1 bg-white dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm outline-none shadow-sm" />
            <button onClick={queryMusic} disabled={queryLoading} className="px-6 py-3 bg-pink-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-pink-500/20 disabled:opacity-50">
              {queryLoading ? "请求中..." : "真实查询"}
            </button>
          </div>

          <AnimatePresence>
            {queryResult && !queryResult.error && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border-2 border-green-500/30 flex justify-between items-center shadow-xl">
                <div className="flex items-center gap-3">
                  <img src={queryResult.cover} alt="cover" className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="text-[10px] font-black text-green-600">获取成功</p>
                    <p className="text-xs font-bold line-clamp-1">{queryResult.name}</p>
                  </div>
                </div>
                <button onClick={confirmAddMusic} className="px-3 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black shrink-0 hover:bg-green-600 transition-colors">存入列表</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 【核心修复】：加上了真正的更新 key (cloudMusicIds) 和新数组 */}
          <button
            onClick={saveMusicConfig}
            className="w-full py-4 bg-indigo-500 text-white rounded-2xl text-sm font-black shadow-xl mt-4 active:scale-95 transition-all"
          >
            暂存音乐修改
          </button>
        </div>
      </div>
    </motion.section>
  );
}
