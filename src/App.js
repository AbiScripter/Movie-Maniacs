import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import StarRating from "./StarRating";
import NaviagationBar from "./components/NavBar";

import { useState } from "react";

const key = "7d24b2fd";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [movieRating, setMovieRating] = useState(0);

  function handleAddToWatchList(movie) {
    if (movieRating == 0) {
      alert("give rating first");
      return;
    }
    console.log(movie.Runtime.slice(0, -4));

    const createWatchedMovie = {
      poster: movie.Poster,
      title: movie.Title,
      imdbRating: movie.imdbRating,
      userRating: movieRating,
      runtime: movie.Runtime.slice(0, -4),
      imdbID: movie.imdbID,
    };

    setWatched((movies) => [...movies, createWatchedMovie]);

    handleCLoseMovie();

    console.log(createWatchedMovie);
  }

  function removeFromWatched(id) {
    setWatched((movies) => movies.filter((movie) => movie.imdbID !== id));
  }

  function handleSelectedMovie(id) {
    setSelectedId(id);
  }

  function handleCLoseMovie() {
    setSelectedId(null);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&s=${query}`
        );

        if (!response.ok) {
          throw new Error("Something went wrong with fetching movies");
        }

        const data = await response.json();

        if (data.Response === "False") {
          throw new Error("Movie not found");
        }

        setMovies(data.Search);
        setError("");
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }

    fetchData();
  }, [query]);

  https: return (
    <>
      <NaviagationBar query={query} setQuery={setQuery} movies={movies} />
      <Main>
        <Box>
          {/*  if its loading*/}
          {isLoading && <Loader />}
          {/*  if its loading and there is no error*/}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectedMovie={handleSelectedMovie} />
          )}
          {/*  if there is an error*/}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <SelectedMovie
              selectedId={selectedId}
              onCloseMovie={handleCLoseMovie}
              onAddToWatchList={handleAddToWatchList}
              onMovieRating={setMovieRating}
              movieRating={movieRating}
              watched={watched}
            />
          ) : (
            <>
              <WatchedMovieBox>
                <Summary watched={watched} />
                <WatchedMovieList
                  watched={watched}
                  removeFromWatched={removeFromWatched}
                />
              </WatchedMovieBox>
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function SelectedMovie({
  selectedId,
  onCloseMovie,
  onAddToWatchList,
  onMovieRating,
  watched,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [movie, setMovie] = useState({});

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  function handleAdding() {
    onAddToWatchList(movie);
  }

  useEffect(
    function () {
      setIsLoading(true);
      async function getSelectedMovieDetails() {
        const response = await fetch(`
     http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`);
        const data = await response.json();
        setMovie(data);
        console.log(data);
        setIsLoading(false);
      }

      getSelectedMovieDetails();
    },
    [selectedId]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>{" "}
            <img src={movie.Poster} alt={movie.Title} />
            <div className="details-overview">
              <h2>{movie.Title}</h2>
              <p>
                {movie.Released} &bull; {movie.Runtime}
              </p>
              <p>{movie.Genre}</p>
              <p>
                <span>⭐</span>
                {movie.imdbRating}

                <span> IMDB Rating</span>
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {isWatched ? (
                "Already Rated"
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onMovieRating={onMovieRating}
                  />
                  <button onClick={handleAdding} className="btn-add">
                    Add To WatchList
                  </button>
                </>
              )}
            </div>
            <p>
              <em>{movie.Plot}</em>
            </p>
            <p>Starring {movie.Actors}</p>
            <p>Directed By {movie.Director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🔴</span>
      {message}
    </p>
  );
}

//!WatchBox Components------------------------------------
function WatchedMovieBox({ children }) {
  const [watched, setWatched] = useState();
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && <>{children}</>}
    </div>
  );
}

function WatchedMovieList({ watched, removeFromWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          removeFromWatched={removeFromWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, removeFromWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} </span>
        </p>
        <p>
          <button onClick={() => removeFromWatched(movie.imdbID)}>❌</button>
        </p>
      </div>
    </li>
  );
}

//!Main-----------------------------------------
function Main({ children }) {
  return <main className="main">{children}</main>;
}

//!Box-resuable------------------------------------------
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

//!MovieBox Components------------------------------------
function MovieList({ movies, onSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelectedMovie={onSelectedMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectedMovie }) {
  return (
    <li onClick={() => onSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Math.round(avgRuntime)} min</span>
        </p>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <App />
  </>
);
