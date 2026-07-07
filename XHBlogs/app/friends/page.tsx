import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { friendsData } from '../../data/friends';

export const metadata = {
  title: 'Friends - CPZD',
  description: 'CPZD friends and contact links.',
};

function normalizeFriendUrl(url: string) {
  const value = url.trim();
  if (!value) return '#';
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  return `https://${value.replace(/^\/+/, '')}`;
}

export default function FriendsPage() {
  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <PageTransition>
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-28">
          <section className="rounded-3xl bg-white/40 md:bg-white/[0.28] dark:bg-slate-800/50 md:dark:bg-slate-800/40 backdrop-blur-md md:backdrop-blur-[10px] border border-white/40 dark:border-white/10 shadow-xl p-6 sm:p-8 md:p-10 overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-400/20 blur-[70px]" />
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400 mb-3">
                Friends
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
                CPZD's Links
              </h1>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                这里先放 CPZD 的联系入口，评论系统不恢复。之后如果需要，可以继续添加真正的友链卡片。
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                {friendsData.map((friend) => (
                  <a
                    key={friend.id}
                    href={normalizeFriendUrl(friend.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-2xl bg-white/45 md:bg-white/[0.30] dark:bg-slate-900/40 border border-white/50 dark:border-white/10 shadow-lg p-5 flex items-center justify-between gap-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-indigo-500/20"
                  >
                    <div className="min-w-0">
                      <div className="text-lg font-black text-slate-900 dark:text-white">{friend.name}</div>
                      <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 truncate">{friend.description || friend.url}</div>
                    </div>
                    <span
                      className="w-11 h-11 rounded-xl text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden"
                      style={{ backgroundColor: friend.themeColor || '#6366f1' }}
                    >
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.name} className="h-full w-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H8M17 7v9" />
                        </svg>
                      )}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </main>
      </PageTransition>
    </div>
  );
}
