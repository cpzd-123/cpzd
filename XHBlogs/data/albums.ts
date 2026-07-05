// 🛡️ 本文件由控制台自动生成，请勿手动修改
export interface Photo { url: string; caption?: string; }
export interface Album { id: string; title: string; description: string; cover: string; date: string; photos: Photo[]; }

const placeholderPhoto =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23a18cd1'/%3E%3Cstop offset='.5' stop-color='%23a1c4fd'/%3E%3Cstop offset='1' stop-color='%23fbc2eb'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='675' fill='url(%23g)'/%3E%3Ctext x='80' y='350' fill='white' font-size='64' font-family='Arial, sans-serif' font-weight='700'%3ECPZD Gallery%3C/text%3E%3Ctext x='84' y='410' fill='rgba(255,255,255,.82)' font-size='28' font-family='Arial, sans-serif'%3EPlaceholder%3C/text%3E%3C/svg%3E";

export const albums: Album[] = [
  {
    "id": "cpzd-placeholder",
    "title": "CPZD Gallery",
    "description": "暂时使用占位内容，后续替换为个人相册素材。",
    "cover": placeholderPhoto,
    "date": "2026.07",
    "photos": [
      {
        "url": placeholderPhoto,
        "caption": "Record"
      },
      {
        "url": placeholderPhoto,
        "caption": "Create"
      },
      {
        "url": placeholderPhoto,
        "caption": "Share"
      }
    ]
  }
];
