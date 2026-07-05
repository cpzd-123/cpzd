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

type ProjectItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  githubUrl: string;
  tags: string[];
};

type MomentItem = {
  id: string;
  date: string;
  location?: string;
  images?: string[];
  content: string;
};

type FriendItem = {
  id: string;
  name: string;
  url: string;
  description: string;
  avatar: string;
  themeColor: string;
};

type AlbumItem = {
  id: string;
  title: string;
  description: string;
  cover: string;
  date: string;
  photos: { url: string; caption?: string }[];
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

const defaultProjectForm = {
  id: "",
  name: "",
  description: "",
  icon: "✨",
  githubUrl: "",
  tags: "CPZD",
};

const defaultMomentForm = {
  id: "",
  date: new Date().toISOString().slice(0, 16),
  location: "",
  images: "",
  content: "这里写动态内容。",
};

const defaultFriendForm = {
  id: "",
  name: "",
  url: "",
  description: "",
  avatar: "",
  themeColor: "#6366f1",
};

const defaultAlbumForm = {
  id: "",
  title: "",
  description: "",
  cover: "",
  date: new Date().toISOString().slice(0, 7).replace("-", "."),
  photos: "",
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
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [moments, setMoments] = useState<MomentItem[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [postForm, setPostForm] = useState(defaultPostForm);
  const [projectForm, setProjectForm] = useState(defaultProjectForm);
  const [momentForm, setMomentForm] = useState(defaultMomentForm);
  const [friendForm, setFriendForm] = useState(defaultFriendForm);
  const [albumForm, setAlbumForm] = useState(defaultAlbumForm);
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

      const [overviewRes, postsRes, assetsRes, projectsRes, momentsRes, friendsRes, albumsRes] = await Promise.all([
        fetch(`${base}/overview`, { cache: "no-store" }),
        fetch(`${base}/posts`, { cache: "no-store" }),
        fetch(`${base}/assets`, { cache: "no-store" }),
        fetch(`${base}/projects`, { cache: "no-store" }),
        fetch(`${base}/moments`, { cache: "no-store" }),
        fetch(`${base}/friends`, { cache: "no-store" }),
        fetch(`${base}/albums`, { cache: "no-store" }),
      ]);
      const overviewData = await overviewRes.json();
      const postsData = await postsRes.json();
      const assetsData = await assetsRes.json();
      const projectsData = await projectsRes.json();
      const momentsData = await momentsRes.json();
      const friendsData = await friendsRes.json();
      const albumsData = await albumsRes.json();

      if (overviewData.success) setOverview(overviewData);
      if (postsData.success) setPosts(postsData.posts);
      if (assetsData.success) setAssets(assetsData.assets);
      if (projectsData.success) setProjects(projectsData.projects);
      if (momentsData.success) setMoments(momentsData.moments);
      if (friendsData.success) setFriends(friendsData.friends);
      if (albumsData.success) setAlbums(albumsData.albums);
      setMessage("CPZD 后台服务已连接。");
    } catch (error) {
      setMessage("无法连接后端。请通过 update.bat 第 2 项或 my-blog-manager\\Start.bat 启动后台。");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const editPost = async (slug: string) => {
    if (!apiBase) return;
    setIsBusy(true);
    try {
      const response = await fetch(`${apiBase}/posts/${slug}`, { cache: "no-store" });
      const data = await response.json();
      if (!data.success) throw new Error("读取失败");
      const post = data.post;
      setPostForm({
        slug: post.slug || slug,
        title: post.title || "",
        date: String(post.date || new Date().toISOString().slice(0, 10)),
        category: post.category || "Records",
        tags: Array.isArray(post.tags) ? post.tags.join(", ") : String(post.tags || ""),
        description: post.description || "",
        cover: post.cover || "",
        content: post.content || "",
      });
      setMessage(`正在编辑文章：${post.title || slug}`);
    } catch (error) {
      setMessage("读取文章失败，请确认后台服务正常运行。");
    } finally {
      setIsBusy(false);
    }
  };

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

  const editProject = (project: ProjectItem) => {
    setProjectForm({
      id: project.id,
      name: project.name,
      description: project.description || "",
      icon: project.icon || "✨",
      githubUrl: project.githubUrl || "",
      tags: Array.isArray(project.tags) ? project.tags.join(", ") : "",
    });
    setMessage(`正在编辑项目：${project.name}`);
  };

  const saveProject = async () => {
    if (!apiBase || !projectForm.name.trim()) {
      setMessage("请先填写项目名称。");
      return;
    }

    setIsBusy(true);
    try {
      const response = await fetch(`${apiBase}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...projectForm,
          tags: projectForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      setMessage(data.message || "项目已保存。");
      setProjectForm(defaultProjectForm);
      await loadData();
    } catch (error) {
      setMessage("项目保存失败。");
    } finally {
      setIsBusy(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!apiBase || !confirm(`确认删除项目 ${id}？`)) return;
    setIsBusy(true);
    try {
      const response = await fetch(`${apiBase}/projects/${id}`, { method: "DELETE" });
      const data = await response.json();
      setMessage(data.message || "项目已删除。");
      await loadData();
    } catch (error) {
      setMessage("项目删除失败。");
    } finally {
      setIsBusy(false);
    }
  };

  const editMoment = (moment: MomentItem) => {
    setMomentForm({
      id: moment.id,
      date: String(moment.date || new Date().toISOString().slice(0, 16)).slice(0, 16),
      location: moment.location || "",
      images: Array.isArray(moment.images) ? moment.images.join(", ") : "",
      content: moment.content || "",
    });
    setMessage(`正在编辑动态：${moment.id}`);
  };

  const saveMoment = async () => {
    if (!apiBase || !momentForm.content.trim()) {
      setMessage("请先填写动态内容。");
      return;
    }

    setIsBusy(true);
    try {
      const response = await fetch(`${apiBase}/moments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...momentForm,
          images: momentForm.images.split(",").map((image) => image.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      setMessage(data.message || "动态已保存。");
      setMomentForm(defaultMomentForm);
      await loadData();
    } catch (error) {
      setMessage("动态保存失败。");
    } finally {
      setIsBusy(false);
    }
  };

  const deleteMoment = async (id: string) => {
    if (!apiBase || !confirm(`确认删除动态 ${id}？`)) return;
    setIsBusy(true);
    try {
      const response = await fetch(`${apiBase}/moments/${id}`, { method: "DELETE" });
      const data = await response.json();
      setMessage(data.message || "动态已删除。");
      await loadData();
    } catch (error) {
      setMessage("动态删除失败。");
    } finally {
      setIsBusy(false);
    }
  };

  const editFriend = (friend: FriendItem) => {
    setFriendForm({
      id: friend.id,
      name: friend.name,
      url: friend.url || "",
      description: friend.description || "",
      avatar: friend.avatar || "",
      themeColor: friend.themeColor || "#6366f1",
    });
    setMessage(`正在编辑友链：${friend.name}`);
  };

  const saveFriend = async () => {
    if (!apiBase || !friendForm.name.trim()) {
      setMessage("请先填写友链名称。");
      return;
    }
    setIsBusy(true);
    try {
      const response = await fetch(`${apiBase}/friends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(friendForm),
      });
      const data = await response.json();
      setMessage(data.message || "友链已保存。");
      setFriendForm(defaultFriendForm);
      await loadData();
    } catch (error) {
      setMessage("友链保存失败。");
    } finally {
      setIsBusy(false);
    }
  };

  const deleteFriend = async (id: string) => {
    if (!apiBase || !confirm(`确认删除友链 ${id}？`)) return;
    setIsBusy(true);
    try {
      const response = await fetch(`${apiBase}/friends/${id}`, { method: "DELETE" });
      const data = await response.json();
      setMessage(data.message || "友链已删除。");
      await loadData();
    } catch (error) {
      setMessage("友链删除失败。");
    } finally {
      setIsBusy(false);
    }
  };

  const editAlbum = (album: AlbumItem) => {
    setAlbumForm({
      id: album.id,
      title: album.title,
      description: album.description || "",
      cover: album.cover || "",
      date: album.date || "",
      photos: Array.isArray(album.photos) ? album.photos.map((photo) => photo.url).join(", ") : "",
    });
    setMessage(`正在编辑相册：${album.title}`);
  };

  const saveAlbum = async () => {
    if (!apiBase || !albumForm.title.trim()) {
      setMessage("请先填写相册标题。");
      return;
    }
    setIsBusy(true);
    try {
      const response = await fetch(`${apiBase}/albums`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...albumForm,
          photos: albumForm.photos.split(",").map((photo) => photo.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      setMessage(data.message || "相册已保存。");
      setAlbumForm(defaultAlbumForm);
      await loadData();
    } catch (error) {
      setMessage("相册保存失败。");
    } finally {
      setIsBusy(false);
    }
  };

  const deleteAlbum = async (id: string) => {
    if (!apiBase || !confirm(`确认删除相册 ${id}？`)) return;
    setIsBusy(true);
    try {
      const response = await fetch(`${apiBase}/albums/${id}`, { method: "DELETE" });
      const data = await response.json();
      setMessage(data.message || "相册已删除。");
      await loadData();
    } catch (error) {
      setMessage("相册删除失败。");
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
                      <div
                        key={post.slug}
                        onClick={() => editPost(post.slug)}
                        className="cursor-pointer rounded-2xl border border-white/40 bg-white/45 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400/50 hover:shadow-indigo-500/15 dark:border-white/10 dark:bg-slate-800/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-black">{post.title}</h3>
                            <p className="mt-1 text-xs font-bold text-slate-500">{post.slug}.md · {post.date || "无日期"}</p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{post.description}</p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button onClick={(event) => { event.stopPropagation(); editPost(post.slug); }} className="rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-500 hover:text-white">
                              编辑
                            </button>
                            <button onClick={(event) => { event.stopPropagation(); deletePost(post.slug); }} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-black text-red-500 hover:bg-red-500 hover:text-white">
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/40 bg-white/45 p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-black">{postForm.slug ? "编辑 Markdown 文章" : "新增 Markdown 文章"}</h3>
                      <button onClick={() => setPostForm(defaultPostForm)} className="rounded-lg bg-white/60 px-3 py-2 text-xs font-black text-slate-600 hover:bg-white dark:bg-slate-900/60 dark:text-slate-300">
                        新建
                      </button>
                    </div>
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
                        {postForm.slug ? "保存文章修改" : "生成到 XHBlogs/posts"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "projects" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => editProject(project)}
                        className="cursor-pointer rounded-2xl border border-white/40 bg-white/45 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400/50 hover:shadow-indigo-500/15 dark:border-white/10 dark:bg-slate-800/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-lg font-black">{project.icon} {project.name}</h3>
                            <p className="mt-1 truncate text-xs font-bold text-slate-500">{project.githubUrl || "无链接"}</p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{project.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {(project.tags || []).map((tag) => (
                                <span key={tag} className="rounded-md bg-indigo-500/10 px-2 py-1 text-[10px] font-black text-indigo-600 dark:text-indigo-300">{tag}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button onClick={(event) => { event.stopPropagation(); editProject(project); }} className="rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-500 hover:text-white">
                              编辑
                            </button>
                            <button onClick={(event) => { event.stopPropagation(); deleteProject(project.id); }} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-black text-red-500 hover:bg-red-500 hover:text-white">
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/40 bg-white/45 p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-black">{projectForm.id ? "编辑项目" : "新增项目"}</h3>
                      <button onClick={() => setProjectForm(defaultProjectForm)} className="rounded-lg bg-white/60 px-3 py-2 text-xs font-black text-slate-600 hover:bg-white dark:bg-slate-900/60 dark:text-slate-300">
                        新建
                      </button>
                    </div>
                    <div className="space-y-3">
                      <Field label="项目 ID，可留空自动生成" value={projectForm.id} onChange={(value) => setProjectForm({ ...projectForm, id: value })} />
                      <Field label="项目名称" value={projectForm.name} onChange={(value) => setProjectForm({ ...projectForm, name: value })} />
                      <Field label="项目链接" value={projectForm.githubUrl} onChange={(value) => setProjectForm({ ...projectForm, githubUrl: value })} />
                      <Field label="图标" value={projectForm.icon} onChange={(value) => setProjectForm({ ...projectForm, icon: value })} />
                      <Field label="标签，逗号分隔" value={projectForm.tags} onChange={(value) => setProjectForm({ ...projectForm, tags: value })} />
                      <label className="block">
                        <span className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">项目描述</span>
                        <textarea
                          value={projectForm.description}
                          onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })}
                          className="min-h-28 w-full rounded-xl border border-white/50 bg-white/70 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-white/10 dark:bg-slate-900/60"
                        />
                      </label>
                      <button onClick={saveProject} disabled={isBusy} className="w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/30 disabled:opacity-60">
                        {projectForm.id ? "保存项目修改" : "新增项目"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "moments" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
                  <div className="space-y-3">
                    {moments.map((moment) => (
                      <div
                        key={moment.id}
                        onClick={() => editMoment(moment)}
                        className="cursor-pointer rounded-2xl border border-white/40 bg-white/45 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400/50 hover:shadow-indigo-500/15 dark:border-white/10 dark:bg-slate-800/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-lg font-black">{moment.id}</h3>
                            <p className="mt-1 text-xs font-bold text-slate-500">{moment.date || "无日期"} · {moment.location || "无地点"}</p>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 line-clamp-3 dark:text-slate-300">{moment.content}</p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button onClick={(event) => { event.stopPropagation(); editMoment(moment); }} className="rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-500 hover:text-white">
                              编辑
                            </button>
                            <button onClick={(event) => { event.stopPropagation(); deleteMoment(moment.id); }} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-black text-red-500 hover:bg-red-500 hover:text-white">
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/40 bg-white/45 p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-black">{momentForm.id ? "编辑动态" : "新增动态"}</h3>
                      <button onClick={() => setMomentForm(defaultMomentForm)} className="rounded-lg bg-white/60 px-3 py-2 text-xs font-black text-slate-600 hover:bg-white dark:bg-slate-900/60 dark:text-slate-300">
                        新建
                      </button>
                    </div>
                    <div className="space-y-3">
                      <Field label="动态 ID，可留空自动生成" value={momentForm.id} onChange={(value) => setMomentForm({ ...momentForm, id: value })} />
                      <Field label="日期时间" value={momentForm.date} onChange={(value) => setMomentForm({ ...momentForm, date: value })} />
                      <Field label="地点" value={momentForm.location} onChange={(value) => setMomentForm({ ...momentForm, location: value })} />
                      <Field label="图片路径，逗号分隔" value={momentForm.images} onChange={(value) => setMomentForm({ ...momentForm, images: value })} />
                      <label className="block">
                        <span className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">动态内容</span>
                        <textarea
                          value={momentForm.content}
                          onChange={(event) => setMomentForm({ ...momentForm, content: event.target.value })}
                          className="min-h-40 w-full rounded-xl border border-white/50 bg-white/70 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-white/10 dark:bg-slate-900/60"
                        />
                      </label>
                      <button onClick={saveMoment} disabled={isBusy} className="w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/30 disabled:opacity-60">
                        {momentForm.id ? "保存动态修改" : "新增动态"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "gallery" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
                  <div className="space-y-3">
                    {albums.map((album) => (
                      <div
                        key={album.id}
                        onClick={() => editAlbum(album)}
                        className="cursor-pointer overflow-hidden rounded-2xl border border-white/40 bg-white/45 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400/50 hover:shadow-indigo-500/15 dark:border-white/10 dark:bg-slate-800/50"
                      >
                        <div className="grid gap-4 p-4 md:grid-cols-[160px_1fr_auto]">
                          <div className="aspect-video overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-950">
                            {album.cover ? <img src={album.cover} alt={album.title} className="h-full w-full object-cover" /> : null}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-black">{album.title}</h3>
                            <p className="mt-1 text-xs font-bold text-slate-500">{album.id} · {album.date || "无日期"} · {album.photos?.length || 0} 张</p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{album.description}</p>
                          </div>
                          <div className="flex shrink-0 gap-2 md:flex-col">
                            <button onClick={(event) => { event.stopPropagation(); editAlbum(album); }} className="rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-500 hover:text-white">
                              编辑
                            </button>
                            <button onClick={(event) => { event.stopPropagation(); deleteAlbum(album.id); }} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-black text-red-500 hover:bg-red-500 hover:text-white">
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/40 bg-white/45 p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-black">{albumForm.id ? "编辑相册" : "新增相册"}</h3>
                      <button onClick={() => setAlbumForm(defaultAlbumForm)} className="rounded-lg bg-white/60 px-3 py-2 text-xs font-black text-slate-600 hover:bg-white dark:bg-slate-900/60 dark:text-slate-300">
                        新建
                      </button>
                    </div>
                    <div className="space-y-3">
                      <Field label="相册 ID，可留空自动生成" value={albumForm.id} onChange={(value) => setAlbumForm({ ...albumForm, id: value })} />
                      <Field label="相册标题" value={albumForm.title} onChange={(value) => setAlbumForm({ ...albumForm, title: value })} />
                      <Field label="日期" value={albumForm.date} onChange={(value) => setAlbumForm({ ...albumForm, date: value })} />
                      <Field label="封面路径" value={albumForm.cover} onChange={(value) => setAlbumForm({ ...albumForm, cover: value })} />
                      <Field label="图片路径，逗号分隔" value={albumForm.photos} onChange={(value) => setAlbumForm({ ...albumForm, photos: value })} />
                      <label className="block">
                        <span className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">相册描述</span>
                        <textarea
                          value={albumForm.description}
                          onChange={(event) => setAlbumForm({ ...albumForm, description: event.target.value })}
                          className="min-h-28 w-full rounded-xl border border-white/50 bg-white/70 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-white/10 dark:bg-slate-900/60"
                        />
                      </label>
                      <button onClick={saveAlbum} disabled={isBusy} className="w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/30 disabled:opacity-60">
                        {albumForm.id ? "保存相册修改" : "新增相册"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "friends" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
                  <div className="space-y-3">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        onClick={() => editFriend(friend)}
                        className="cursor-pointer rounded-2xl border border-white/40 bg-white/45 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400/50 hover:shadow-indigo-500/15 dark:border-white/10 dark:bg-slate-800/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-lg font-black">{friend.name}</h3>
                            <p className="mt-1 truncate text-xs font-bold text-slate-500">{friend.url || "无链接"}</p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{friend.description}</p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button onClick={(event) => { event.stopPropagation(); editFriend(friend); }} className="rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-500 hover:text-white">
                              编辑
                            </button>
                            <button onClick={(event) => { event.stopPropagation(); deleteFriend(friend.id); }} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-black text-red-500 hover:bg-red-500 hover:text-white">
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/40 bg-white/45 p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-black">{friendForm.id ? "编辑友链" : "新增友链"}</h3>
                      <button onClick={() => setFriendForm(defaultFriendForm)} className="rounded-lg bg-white/60 px-3 py-2 text-xs font-black text-slate-600 hover:bg-white dark:bg-slate-900/60 dark:text-slate-300">
                        新建
                      </button>
                    </div>
                    <div className="space-y-3">
                      <Field label="友链 ID，可留空自动生成" value={friendForm.id} onChange={(value) => setFriendForm({ ...friendForm, id: value })} />
                      <Field label="名称" value={friendForm.name} onChange={(value) => setFriendForm({ ...friendForm, name: value })} />
                      <Field label="链接" value={friendForm.url} onChange={(value) => setFriendForm({ ...friendForm, url: value })} />
                      <Field label="头像路径" value={friendForm.avatar} onChange={(value) => setFriendForm({ ...friendForm, avatar: value })} />
                      <Field label="主题色" value={friendForm.themeColor} onChange={(value) => setFriendForm({ ...friendForm, themeColor: value })} />
                      <label className="block">
                        <span className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">简介</span>
                        <textarea
                          value={friendForm.description}
                          onChange={(event) => setFriendForm({ ...friendForm, description: event.target.value })}
                          className="min-h-28 w-full rounded-xl border border-white/50 bg-white/70 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-white/10 dark:bg-slate-900/60"
                        />
                      </label>
                      <button onClick={saveFriend} disabled={isBusy} className="w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/30 disabled:opacity-60">
                        {friendForm.id ? "保存友链修改" : "新增友链"}
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
