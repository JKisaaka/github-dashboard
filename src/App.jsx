import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [repos, setRepos] = useState([])
  const [error, setError] = useState(null)
  const [languageBytes, setLanguageBytes] = useState({})

  useEffect(() => {
    fetch('https://api.github.com/users/JKisaaka')
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setError(data.message)
        } else {
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
          })
        }
      })
      .catch((err) => setError(err.message))
  }, [])

  const maxBytes = Math.max(1, ...Object.values(languageBytes))
  const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0)

  if (error) {
    return <p>Error: {error}</p>
  }

  if (!user) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <img src={user.avatar_url} alt="avatar" width="120" />
      <h1>{user.name || user.login}</h1>
      <p>{user.bio || 'No bio yet'}</p>
      <p>Public repos: {user.public_repos}</p>
      <p>Followers: {user.followers}</p>

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
      <ul>
        {repos.map((repo) => (
          <li key={repo.id}>
            <a href={repo.html_url}>{repo.name}</a>
            {repo.language && ` (${repo.language})`}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App