import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearch, setLastSearch] = useState('');

  // Busca por nome
  const buscarFilmes = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setSelected(null);

    try {
      const url = `https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(searchTerm.trim())}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.ok && Array.isArray(data.description)) {
        setResults(data.description);
        setLastSearch(searchTerm.trim());
        localStorage.setItem('ultimoFilmePesquisado', searchTerm.trim());
      } else {
        setResults([]);
        setError('Nenhum resultado encontrado para esta busca.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar com a API. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  // Busca de detalhes por ID
  const buscarDetalhes = async (imdbId) => {
    setLoading(true);
    setError(null);

    try {
      const url = `https://imdb.iamidiotareyoutoo.com/search?tt=${imdbId}`;
      const response = await fetch(url);
      const data = await response.json();
      setSelected(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar detalhes do filme.');
    } finally {
      setLoading(false);
    }
  };

  // Limpar busca (Desafio 5)
  const limparBusca = () => {
    setSearchTerm('');
    setResults([]);
    setSelected(null);
    setError(null);
  };

  // Carregar último filme salvo (Desafio 3)
  useEffect(() => {
    const ultimo = localStorage.getItem('ultimoFilmePesquisado');
    if (ultimo) setLastSearch(ultimo);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') buscarFilmes();
  };

  const imagemPadrao = 'https://via.placeholder.com/300x420/222/fff?text=Sem+Pôster';

  return (
    <div className="app">
      {/* Header */}
      <header>
        <div className="logo">
          🎬 <span>REACTFILMES</span>
        </div>
        <p style={{ color: '#bbb', marginTop: '8px' }}>
          Busque filmes e séries usando a API IMDb
        </p>
      </header>

      {/* Barra de busca */}
      <div className="search-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Batman, Avatar, Spiderman, Harry Potter..."
          autoFocus
        />
        <button onClick={buscarFilmes} disabled={loading}>
          {loading ? '🔎 Buscando...' : '🔍 Buscar'}
        </button>
        <button className="btn-clear" onClick={limparBusca}>
          🗑️ Limpar
        </button>
      </div>

      {/* Status */}
      {loading && <div className="status">⏳ Carregando resultados...</div>}
      {error && <div className="status" style={{ color: '#ff4444' }}>{error}</div>}
      {!loading && results.length === 0 && searchTerm && (
        <div className="status">😕 Nenhum resultado encontrado</div>
      )}

      {/* Última busca salva */}
      {lastSearch && (
        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.95rem', marginBottom: '1rem' }}>
          Última busca salva: <strong>"{lastSearch}"</strong>
        </p>
      )}

      {/* Resultados */}
      <div className="results">
        {results.map((item, index) => {
          const poster = item['#IMG_POSTER'] || imagemPadrao;
          const titulo = item['#TITLE'] || 'Sem título';
          const ano = item['#YEAR'] || 'N/A';
          const atores = item['#ACTORS'] || 'Atores não informados';
          const id = item['#IMDB_ID'];

          return (
            <div
              key={id || index}
              className="card"
              onClick={() => buscarDetalhes(id)}
            >
              <img
                src={poster}
                alt={titulo}
                onError={(e) => { e.target.src = imagemPadrao; }}
              />
              <div className="card-info">
                <h3>{titulo}</h3>
                <p>📅 {ano}</p>
                <p style={{ marginTop: '6px' }}>🎭 {atores}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalhes (Desafio 4) */}
      {selected && (
        <div className="details-panel">
          <div className="details-image">
            <img
              src={selected.image || selected['#IMG_POSTER'] || imagemPadrao}
              alt={selected.name || selected['#TITLE']}
              onError={(e) => { e.target.src = imagemPadrao; }}
            />
          </div>

          <div className="details-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>{selected.name || selected['#TITLE'] || 'Detalhes'}</h2>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                ✕ Fechar
              </button>
            </div>

            <p><strong>Ano:</strong> {selected['#YEAR'] || 'N/A'}</p>

            {(selected.description || selected['#ACTORS']) && (
              <p style={{ marginTop: '1rem' }}>
                <strong>Sinopse / Descrição:</strong><br />
                {selected.description || selected['#ACTORS']}
              </p>
            )}

            {selected.review && (
              <div className="review" style={{ marginTop: '1.5rem' }}>
                <strong>⭐ Avaliação:</strong> {selected.review}
              </div>
            )}

            {(selected.url || selected['#IMDB_URL']) && (
              <a
                href={selected.url || selected['#IMDB_URL']}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '1.5rem',
                  color: '#e50914',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                🔗 Ver no IMDb oficial →
              </a>
            )}

            <details style={{ marginTop: '2rem', color: '#888' }}>
              <summary>Ver todos os dados da API</summary>
              <pre style={{
                background: '#111',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                {JSON.stringify(selected, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}

      <div className="footer">
        ✅ Atividade Prática concluída • API: imdb.iamidiotareyoutoo.com • Feito com React + Vite
      </div>
    </div>
  );
}

export default App;