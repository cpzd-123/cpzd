import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';

const qqUrl = 'tencent://message/?uin=2720168105&Site=CPZD&Menu=yes';

export const metadata = {
  title: 'Friends - CPZD',
  description: 'CPZD friends and contact links.',
};

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
                <a
                  href={qqUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl bg-white/45 md:bg-white/[0.30] dark:bg-slate-900/40 border border-white/50 dark:border-white/10 shadow-lg p-5 flex items-center justify-between gap-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-indigo-500/20"
                >
                  <div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">QQ</div>
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">2720168105</div>
                  </div>
                  <span className="w-11 h-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2c-4.418 0-8 3.582-8 8 0 1.25.289 2.433.805 3.49-1.024 1.708-1.53 3.843-1.021 5.308.203.585.806.84 1.341.57.828-.418 1.625-1.025 2.296-1.722 1.335.539 2.862.854 4.579.854 1.716 0 3.243-.315 4.578-.854.671.697 1.468 1.304 2.296 1.722.535.27 1.138.015 1.341-.57.509-1.465.003-3.6-1.021-5.308C19.71 12.433 20 11.25 20 10c0-4.418-3.582-8-8-8zm-2.5 8c-.828 0-1.5-.895-1.5-2s.672-2 1.5-2 1.5.895 1.5 2-.672 2-1.5 2zm5 0c-.828 0-1.5-.895-1.5-2s.672-2 1.5-2 1.5.895 1.5 2-.672 2-1.5 2z" />
                    </svg>
                  </span>
                </a>

                <a
                  href="https://blog.cpzd.top"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl bg-white/45 md:bg-white/[0.30] dark:bg-slate-900/40 border border-white/50 dark:border-white/10 shadow-lg p-5 flex items-center justify-between gap-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-indigo-500/20"
                >
                  <div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">Blog</div>
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">blog.cpzd.top</div>
                  </div>
                  <span className="w-11 h-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H8M17 7v9" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </section>
        </main>
      </PageTransition>
    </div>
  );
}
