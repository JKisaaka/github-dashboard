import { useState, useEffect } from 'react'
import './App.css'

const CACHE_KEY = 'github-dashboard-cache'
const ONE_HOUR = 60 * 60 * 1000

function readCache() {
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY))
    if (saved && Date.now() - saved.time < ONE_HOUR) {
      return saved
    }
  } catch (e) {
    // ignore a broken cache
  }
  return null
}

function App() {
  const [user, setUser] = useState(null)
  const [repos, setRepos] = useState([])
  const [error, setError] = useState(null)
  const [languageBytes, setLanguageBytes] = useState({})

  useEffect(() => {
    const cached = readCache()
    if (cached) {
      setUser(cached.user)
      setRepos(cached.repos)
      setLanguageBytes(cached.languageBytes)
      return
    }

    let userData = null

    fetch('https://api.github.com/users/JKisaaka')
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setError(data.message)
        } else {
          userData = data
          setUser(data)
        }
      })
      .catch((err) => setError(err.message))

    fetch('https://api.github.com/users/JKisaaka/repos?sort=updated')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data)
          Promise.all(
            data.map((repo) =>
              fetch(repo.languages_url).then((res) => res.json())
            )
          ).then((results) => {
            const totals = {}
            results.forEach((langs) => {
              Object.entries(langs).forEach(([lang, bytes]) => {
                totals[lang] = (totals[lang] || 0) + bytes
              })
            })
            setLanguageBytes(totals)
            if (userData) {
              localStorage.setItem(
                CACHE_KEY,
                JSON.stringify({
                  time: Date.now(),
                  user: userData,
                  repos: data,
                  languageBytes: totals,
                })
              )
            }
          })
        }
      })
      .catch((err) => setError(err.message))
  }, [])

  const maxBytes = Math.max(1, ...Object.values(languageBytes))
  const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0)
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
  const languageCount = Object.keys(languageBytes).length
  const memberSince = user ? new Date(user.created_at).getFullYear() : ''

  if (error) {
    return <p>Error: {error}</p>
  }

  if (!user) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <div className="profile-card">
        <img src={user.avatar_url} alt="avatar" width="120" />
        <div>
          <h1>{user.name || user.login}</h1>
          <p className="muted">@{user.login}</p>
          <p>{user.bio || 'No bio yet'}</p>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="stat-number">{user.public_repos}</span>
          <span className="muted">Repos</span>
        </div>
        <div className="stat">
          <span className="stat-number">{languageCount}</span>
          <span className="muted">Languages</span>
        </div>
        <div className="stat">
          <span className="stat-number">{totalStars}</span>
          <span className="muted">Stars</span>
        </div>
        <div className="stat">
          <span className="stat-number">{memberSince}</span>
          <span className="muted">On GitHub since</span>
        </div>
      </div>

      <h2>Languages</h2>
      {Object.entries(languageBytes)
        .sort((a, b) => b[1] - a[1])
        .map(([language, bytes]) => (
          <div key={language} className="bar-row">
            <span className="bar-label">{language}</span>
            <div
              className="bar"
              style={{ width: `${(bytes / maxBytes) * 100}%` }}
            ></div>
            <span>{Math.round((bytes / totalBytes) * 100)}%</span>
          </div>
        ))}

      <h2>My Repositories</h2>
      <div className="repo-grid">
        {repos.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            className="repo-card"
            target="_blank"
            rel="noreferrer"
          >
            <h3>{repo.name}</h3>
            <p className="muted">
              {repo.description || 'No description yet'}
            </p>
            {repo.language && <span className="tag">{repo.language}</span>}
          </a>
        ))}
      </div>
    </div>
  )
}

export default App