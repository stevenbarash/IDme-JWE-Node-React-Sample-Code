import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import './App.css'

// Custom component to render JSON
const JSONDisplay = ({ data }) => {
  const renderValue = (value, indent = 0, isLast = true) => {
    const spaces = '  '.repeat(indent);
    
    if (value === null) return <span>{spaces}<span className="json-null">null</span>{!isLast && ','}</span>;
    if (typeof value === 'boolean') return <span>{spaces}<span className="json-boolean">{value.toString()}</span>{!isLast && ','}</span>;
    if (typeof value === 'number') return <span>{spaces}<span className="json-number">{value}</span>{!isLast && ','}</span>;
    if (typeof value === 'string') return <span>{spaces}<span className="json-string">&quot;{value}&quot;</span>{!isLast && ','}</span>;
    
    if (Array.isArray(value)) {
      return (
        <span>
          {spaces}[
          {value.map((item, index) => (
            <div key={index}>
              {renderValue(item, indent + 1, index === value.length - 1)}
            </div>
          ))}
          {spaces}]{!isLast && ','}
        </span>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <span>
          {spaces}{'{'}
          {Object.entries(value).map(([key, val], index, arr) => (
            <div key={key}>
              {spaces}  <span className="json-key">&quot;{key}&quot;</span>:{renderValue(val, 0, index === arr.length - 1)}
            </div>
          ))}
          {spaces}{'}'}{!isLast && ','}
        </span>
      );
    }
    
    return <span>{spaces}{value}{!isLast && ','}</span>;
  };

  return (
    <pre className="json-display">
      {renderValue(data)}
    </pre>
  );
};

JSONDisplay.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
};

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/user', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('login') === 'success') {
      fetchUser()
      window.history.replaceState({}, document.title, window.location.pathname)
    } else {
      fetchUser()
    }
  }, [])

  const handleLogin = () => {
    window.location.href = 'http://localhost:5001/auth/idme'
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="App">
      <h1>
        <div style={{ marginBottom: '0.5em' }}>
          <img 
            src="https://s3.amazonaws.com/idme-design/brand-assets/Primary-IDme-Logo-RGB-white.svg" 
            alt="ID.me"
            style={{ height: '1.5em' }}
          />
        </div>
        JWE (JSON Web Encryption) Sample App
      </h1>
      {user ? (
        <div>
          <h2>Welcome, {user.fname} {user.lname}!</h2>
          <h3>Decoded JWT:</h3>
          <JSONDisplay data={user} />
        </div>
      ) : (
        <div onClick={handleLogin} style={{ cursor: 'pointer' }}>
          <img 
            src="https://s3.amazonaws.com/idme/developer/idme-buttons/assets/img/signin.svg" 
            alt="Sign in with ID.me" 
            style={{ width: '200px', height: 'auto' }}
          />
        </div>
      )}
    </div>
  )
}

export default App
