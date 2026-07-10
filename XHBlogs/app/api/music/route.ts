import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NET_EASE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  Referer: 'https://music.163.com/',
}

type SongResult = {
  id: string
  name?: string
  artist?: string
  author?: string
  cover?: string
  pic?: string
  url?: string
  lrc?: string
  error?: string
}

type PlaylistTrack = {
  id?: string | number
}

const MAX_PLAYLIST_SONGS = 100

function getNeteaseHeaders() {
  const cookie =
    process.env.NETEASE_COOKIE ||
    (process.env.MUSIC_U ? `MUSIC_U=${process.env.MUSIC_U}` : '')

  return cookie
    ? { ...NET_EASE_HEADERS, Cookie: cookie }
    : NET_EASE_HEADERS
}

async function getPlaylistSongIds(playlistId: string) {
  const res = await fetch(
    `https://music.163.com/api/playlist/detail?id=${playlistId}`,
    { headers: getNeteaseHeaders(), signal: AbortSignal.timeout(8000), cache: 'no-store' },
  )
  const data = await res.json()
  const tracks = data.result?.tracks || data.playlist?.tracks || []
  return tracks.map((track: PlaylistTrack) => String(track.id || '')).filter(Boolean)
}

async function getPlayableUrl(songId: string) {
  const res = await fetch(
    `https://music.163.com/api/song/enhance/player/url?id=${songId}&ids=[${songId}]&br=320000`,
    { headers: getNeteaseHeaders(), signal: AbortSignal.timeout(6000), cache: 'no-store' },
  )
  const data = await res.json()
  const url = data.data?.[0]?.url

  return typeof url === 'string' && /^https?:\/\//.test(url)
    ? url.replace(/^http:/, 'https:')
    : ''
}

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get('ids')
  const playlistId = request.nextUrl.searchParams.get('playlistId')

  if (!ids && !playlistId) {
    return NextResponse.json({ error: 'Missing ids or playlistId parameter' }, { status: 400 })
  }

  let playlistSongIds: string[] = []
  if (playlistId) {
    try {
      playlistSongIds = await getPlaylistSongIds(playlistId)
    } catch (error) {
      console.error(`[api/music] 获取歌单 ${playlistId} 失败:`, error)
      return NextResponse.json({ error: 'playlist_fetch_failed' }, { status: 502 })
    }
  }

  const songIds = [
    ...playlistSongIds,
    ...(ids ? ids.split(',').map((id) => id.trim()).filter(Boolean) : []),
  ]
    .filter((id, index, array) => array.indexOf(id) === index)
    .slice(0, MAX_PLAYLIST_SONGS)

  const results: SongResult[] = await Promise.all(
    songIds.map(async (songId): Promise<SongResult> => {
      try {
        const [detailRes, lrcRes, playableUrl] = await Promise.all([
          fetch(
            `https://music.163.com/api/song/detail/?id=${songId}&ids=[${songId}]`,
            { headers: getNeteaseHeaders(), signal: AbortSignal.timeout(6000), cache: 'no-store' },
          ),
          fetch(
            `https://music.163.com/api/song/lyric?id=${songId}&lv=-1&kv=-1&tv=-1`,
            { headers: getNeteaseHeaders(), signal: AbortSignal.timeout(6000), cache: 'no-store' },
          ).catch(() => null),
          getPlayableUrl(songId).catch(() => ''),
        ])

        const detail = await detailRes.json()
        const song = detail.songs?.[0]

        if (!song) {
          return { id: songId, error: 'not_found' }
        }

        if (!playableUrl) {
          return { id: songId, name: song.name, error: 'unplayable' }
        }

        let lrcText = ''
        if (lrcRes && lrcRes.ok) {
          try {
            const lrcData = await lrcRes.json()
            lrcText = lrcData.lrc?.lyric || ''
          } catch {
            /* 歌词可选，失败不影响主流程 */
          }
        }

        const artistName = song.artists?.[0]?.name || '未知歌手'

        return {
          id: songId,
          name: song.name,
          artist: artistName,
          author: artistName,
          cover: song.album?.picUrl || '',
          pic: song.album?.picUrl || '',
          url: playableUrl,
          lrc: lrcText,
        }
      } catch (error) {
        console.error(`[api/music] 获取歌曲 ${songId} 失败:`, error)
        return { id: songId, error: String(error) }
      }
    }),
  )

  return NextResponse.json(results)
}
