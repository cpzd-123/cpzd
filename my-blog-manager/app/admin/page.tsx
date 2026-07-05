"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Overview = {
  siteRoot: string;
  repoRoot: string;
  site: { name: string; title: string; url: string; blogUrl: string; repo: string };
  counts: { posts: number; assets: number; projectsFile: boolean };
  plugins: Record<string, boolean>;
};

type PostItem = {
  slug: string;
  title: string;
  date: string;
  category?: string;
  tags?: string[];
  description?: string;
  cover?: string;
};

type AssetItem = {
  name: string;
  path: string;
  size: number;
};

const menuItems = [
  { id: "dashboard", name: "仪表盘" },
  { id: "config", name: "站点配置" },
  { id: "posts", name: "文章管理" },
  { id: "moments", name: "动态管理" },
  { id: "projects", name: "项目管理" },
  { id: "gallery", name: "相册管理" },
  { id: "friends", name: "友链管理" },
  { id: "assets", name: "资源管理" },
  { id: "plugins", name: "插件管理" },
  { id: "deploy", name: "发布部署" },
];

const defaultPostForm = {
  slug: "",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  category: "Records",
  tags: "CPZD",
  description: "",
  cover: "",
  content: "这里写正文。",
};

async function getApiBase() {
  const response = await fetch(`/backend_config.json?t=${Date.now()}`);
  if (!response.ok) throw new Error("backend_config.json not found");
  const config = await response.json();
  return `http://127.0.0.1:${config.api_port}/api/cpzd`;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [apiBase, setApiBase] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [postForm, setPostForm] = useState(defaultPostForm);
  const [message, setMessage] = useState("正在连接 CPZD 后台服务...");
  const [isBusy, setIsBusy] = useState(false);

  const currentTitle = useMemo(
    () => menuItems.find((item) => item.id === activeTab)?.name || "仪表盘",
    [activeTab]
  );

  const loadData = async () => {
    try {
      const base = apiBase || await getApiBase();
      setApiBase(base);

      const [overviewRes, postsRes, assetsRes] = await Promise.all([
        fetch(`${base}/overview`, { cache: "no-store" }),
        fetch(`${base}/posts`, { cache: "no-store" }),
        fetch(`${base}/assets`, { cache: "no-store" }),
      ]);
      const overviewData = await overviewRes.json();
      const postsData = await postsRes.json();
      const assetsData = await assetsRes.json();

      if (overviewData.success) setOverview(overviewData);
      if (postsData.success) setPosts(postsData.posts);
      if (assetsData.success) setAssets(assetsData.assets);
      setMessage("CPZD 后台服务已连接。");
    } catch (error) {
      setMessage("无法连接后端。请通过 update.bat 第 2 项或 my-blog-manager\\Start.bat 启动后台。");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const savePost = async () => {
    if (!apiBase || !postForm.title.trim()) {
      setMessage("请先填写文章标题。");
      return;
    }

    setIsBusy(true);
    try {
      const response = await fetch(`${apiBase}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...postForm,
          tags: postForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      setMessage(data.message || "文章已保存。");
      setPostForm(defaultPostForm);
      await loadData();
    } catch (error) {
      setMessage("文章保存失败，请检查后台是否正常运行。");
    } finally {
      setIsBusy(false);
    }
  };

  const deletePost = async (slug: string) => {
    if (!apiBase || !confirm(`确认删除文章 ${slug}？`)) return;

    setIsBusy(true);
    try {
      const response = await fetch(`${apiBase}/posts/${slug}`, { method: "DELETE" });
      const data = await response.json();
      setMessage(data.message || "文章已删除。");
      await loadData();
    } catch (error) {
      setMessage("删除失败。");
    } finally {
      setIsBusy(false);
    }
  };

  const saveConfig = async () => {
    if (!apiBase || !overview) return;

    setIsBusy(true);
    try {
      const response = await fetch(`${apiBase}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: overview.site.title,
          bio: "记录开发、学习、生活与分享。",
          blogUrl: overview.site.blogUrl,
        }),
      });
      const data = await response.json();
      setMessage(data.message || "配置已保存。");
    } catch (error) {
      setMessage("配置保存失败。");
    } finally {
      setIsBusy(false);
    }
  };

  const deploy = async () => {
    if (!apiBase) return;

    setIsBusy(true);
    setMessage("正在执行固定发布流程...");
    try {
      const response = await fetch(`${apiBase}/deploy/run`, { method: "POST" });
      const data = await response.json();
      setMessage(data.message || "发布流程结束。");
    } catch (error) {
      setMessage("发布失败，请检查 Git 登录状态。");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 text-slate-800 dark:text-slate-100">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-72">
          <div className="rounded-3xl border border-white/50 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-indigo-500">CPZD 后台</p>
            <h1 className="mt-3 text-2xl font-black">控制台</h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              管理 XHBlogs 本地文件，不连接数据库。
            </p>
          </div>

          <nav className="mt-5 flex flex-col gap-2 rounded-3xl border border-white/50 bg-white/40 p-3 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-black transition-all ${
                  activeTab === item.id
                    ? "translate-x-1 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/70"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/50 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 md:p-7"
          >
            <div className="flex flex-col gap-4 border-b border-white/40 pb-5 dark:border-white/10 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">本地控制台</p>
                <h2 className="mt-2 text-3xl font-black">{currentTitle}</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={loadData}
                  disabled={isBusy}
                  className="rounded-xl border border-white/50 bg-white/60 px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                >
                  刷新
                </button>
                <button
                  onClick={deploy}
                  disabled={isBusy}
                  className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-black text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-600 disabled:opacity-60"
                >
                  一键发布
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm font-bold text-indigo-700 dark:text-indigo-300">
              {message}
            </div>

            <div className="mt-6">
              {activeTab === "dashboard" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <InfoCard label="前台目录" value={overview?.siteRoot || "XHBlogs"} />
                  <InfoCard label="文章数量" value={overview?.counts.posts ?? 0} />
                  <InfoCard label="图片资源" value={overview?.counts.assets ?? 0} />
                  <InfoCard label="主站" value={overview?.site.url || "https://cpzd.top"} />
                  <InfoCard label="博客" value={overview?.site.blogUrl || "https://blog.cpzd.top"} />
                  <InfoCard label="仓库" value={overview?.site.repo || "cpzd-123/cpzd"} />
                </div>
              )}

              {activeTab === "config" && overview && (
                <div className="grid gap-4">
                  <Field label="网站标题" value={overview.site.title} onChange={(value) => setOverview({ ...overview, site: { ...overview.site, title: value } })} />
                  <Field label="博客地址" value={overview.site.blogUrl} onChange={(value) => setOverview({ ...overview, site: { ...overview.site, blogUrl: value } })} />
                  <button onClick={saveConfig} className="w-fit rounded-xl bg-indigo-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/30">
                    保存基础配置
                  </button>
                </div>
              )}

              {activeTab === "posts" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div key={post.slug} className="rounded-2xl border border-white/40 bg-white/45 p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-black">{post.title}</h3>
                            <p className="mt-1 text-xs font-bold text-slate-500">{post.slug}.md · {post.date || "无日期"}</p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{post.description}</p>
                          </div>
                          <button onClick={() => deletePost(post.slug)} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-black text-red-500 hover:bg-red-500 hover:text-white">
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/40 bg-white/45 p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50">
                    <h3 className="mb-4 text-lg font-black">新增 Markdown 文章</h3>
                    <div className="space-y-3">
                      <Field label="标题" value={postForm.title} onChange={(value) => setPostForm({ ...postForm, title: value })} />
                      <Field label="文件名，可留空自动生成" value={postForm.slug} onChange={(value) => setPostForm({ ...postForm, slug: value })} />
                      <Field label="日期" value={postForm.date} onChange={(value) => setPostForm({ ...postForm, date: value })} />
                      <Field label="分类" value={postForm.category} onChange={(value) => setPostForm({ ...postForm, category: value })} />
                      <Field label="标签，逗号分隔" value={postForm.tags} onChange={(value) => setPostForm({ ...postForm, tags: value })} />
                      <Field label="摘要" value={postForm.description} onChange={(value) => setPostForm({ ...postForm, description: value })} />
                      <Field label="封面路径" value={postForm.cover} onChange={(value) => setPostForm({ ...postForm, cover: value })} />
                      <label className="block">
                        <span className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">正文</span>
                        <textarea
                          value={postForm.content}
                          onChange={(event) => setPostForm({ ...postForm, content: event.target.value })}
                          className="min-h-40 w-full rounded-xl border border-white/50 bg-white/70 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-white/10 dark:bg-slate-900/60"
                        />
                      </label>
                      <button onClick={savePost} disabled={isBusy} className="w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/30 disabled:opacity-60">
                        生成到 XHBlogs/posts
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "assets" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {assets.map((asset) => (
                    <div key={asset.path} className="overflow-hidden rounded-2xl border border-white/40 bg-white/45 shadow-sm dark:border-white/10 dark:bg-slate-800/50">
                      <div className="aspect-video bg-slate-200 dark:bg-slate-950">
                        <img src={asset.path} alt={asset.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-4">
                        <div className="truncate text-sm font-black">{asset.name}</div>
                        <button
                          onClick={() => navigator.clipboard.writeText(asset.path)}
                          className="mt-2 rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-500 hover:text-white"
                        >
                          复制路径：{asset.path}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "plugins" && overview && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(overview.plugins).map(([name, enabled]) => (
                    <InfoCard key={name} label={name} value={enabled ? "开启" : "关闭"} />
                  ))}
                </div>
              )}

              {activeTab === "deploy" && (
                <div className="rounded-2xl border border-white/40 bg-white/45 p-5 dark:border-white/10 dark:bg-slate-800/50">
                  <h3 className="text-xl font-black">一键发布到 GitHub / Vercel</h3>
                  <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                    后台只执行固定流程：检查 origin、git status、git add、git commit、git push origin main。不保存 Token，不执行任意命令。
                  </p>
                  <button onClick={deploy} disabled={isBusy} className="mt-5 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/30 disabled:opacity-60">
                    开始发布
                  </button>
                </div>
              )}

              {["moments", "projects", "gallery", "friends"].includes(activeTab) && (
                <div className="rounded-2xl border border-white/40 bg-white/45 p-8 text-center dark:border-white/10 dark:bg-slate-800/50">
                  <h3 className="text-xl font-black">{currentTitle}</h3>
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    第一阶段保留入口和布局。完整编辑功能放到第二阶段继续接入。
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/45 p-5 shadow-sm dark:border-white/10 dark:bg-slate-800/50">
      <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">{label}</div>
      <div className="mt-3 break-words text-lg font-black text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/50 bg-white/70 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-white/10 dark:bg-slate-900/60"
      />
    </label>
  );
}
