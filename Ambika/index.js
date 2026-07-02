const API_KEY = `5929a630a3bf853b93f1aab28428c2d1`;
const imgPath = `https://image.tmdb.org/t/p/w1280`;

const input = document.querySelector(`#searchBar`);
const searchBtn = document.querySelector(`#searchButton`);
const mainGridTitle = document.querySelector(`.favoriteMovieBox h1`);
const mainGrid = document.querySelector(`.movieGrid`);

const trendingMovies = document.querySelector(`.trending .movieGrid`);

const popupContainer = document.querySelector(`.popupBox`);

function moreDetails(cards){
    cards.forEach (card => {
        card.addEventListener('click', ()=> show_moreDetails(card))
    })
}

async function getMovieBySearch(searchTerm){
    const resp = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchTerm}`);
    const respdata = await resp.json();
    console.log(respdata.results);
    return respdata.results;
}

searchBtn.addEventListener('click', addSerchedMoviesToDom);

async function addSerchedMoviesToDom() {
    const data = await getMovieBySearch(input.value);
    console.log(data);
    
    mainGridTitle.innerText = `Search Results`;
    mainGrid.innerHTML = data.map(e =>{
        return `
            <div class="movieCard" data_id="${e.id}">
                    <div class="img">
                        <img src="${imgPath + e.poster_path}" alt="poster">
                    </div>          
                    <div class="movieDetails">
                        <h3 class="movieTitle">${e.title}</h3>
                        <div class="statsinfo">
                            <span>Rate: </span>
                            <span>${Math.floor(e.vote_average)}/10</span>
                        </div>
                        <div class="statsinfo">
                            <span>Release date: </span>
                            <span>${e.release_date}</span>
                        </div>
                    </div>         
                </div>
        `;
    }).join(''); 

    const cards = document.querySelectorAll(`.movieCard`);
    moreDetails(cards);
}


async function getMovieByID(id) {   
    const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
    const respdata = await resp.json();
    return respdata;
}

getMovieByTrailer(414906);

async function getMovieByTrailer(id) {   
    const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`);
    const respdata = await resp.json();
    return respdata.results[0].key;
}

async function show_moreDetails (card){
    popupContainer.classList.add(`show_moreDetails`);

    const movie_id = card.getAttribute('data_id');
    const movie =  await getMovieByID(movie_id);
    const movie_trailer = await getMovieByTrailer(movie_id);
    
    popupContainer.innerHTML = `
        <span class="exitX">&#10006</span>
                <div class="content">
                    <div class="left">
                        <div class="posterImg">
                            <img src="${imgPath + movie.poster_path}" alt="picture">
                        </div>
                    </div>

                    <div class="right">
                        <h1>${movie.title}</h1>
                        <h3>${movie.tagline}</h3>
                        
                        <div class="lengthDurationetc">
                            <div class="information">
                                <span>Language:</span>
                                <span>${movie.spoken_languages[0].name}</span>
                            </div>

                            <div class="information">
                                <span>Length:</span>
                                <span>${movie.runtime} minutes</span>
                            </div>

                            <div class="information">
                                <span>Rate:</span>
                                <span>${Math.floor(movie.vote_average)}/10</span>
                            </div>

                            <div class="information">
                                <span>Release Date:</span>
                                <span>${movie.release_date}</span>
                            </div>
                        </div>

                        <div class="genres">
                            <h2>Genres</h2>
                            <ul>
                                <li>Drama</li>
                                <li>Romance</li>
                                <li>Young Adult</li>
                            </ul>
                        </div>

                        <div class="overview">
                            <h2>Overview</h2>
                            <p>${movie.overview}</p>
                        </div>

                        <div class="trailer">
                            <h2>Trailer</h2>
                            <iframe width="560" height="315" src="https://www.youtube.com/embed/${movie_trailer}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    </div>
                </div>
    `

    const xIcon = document.querySelector('.exitX')
    xIcon.addEventListener('click', () => popupContainer.classList.remove('show_moreDetails'))
}

async function getTrendingMovies(){
    const resp = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`);
    const respdata = await resp.json();
    return respdata.results;
}

addToTrending();

async function addToTrending() {
    const data = await getTrendingMovies();
    console.log(data);

    trendingMovies.innerHTML = data.slice(0, 5).map(e=>{
        return `
                    <div class="movieCard" data_id="${e.id}">
                        <div class="img">
                            <img src="${imgPath + e.poster_path}" alt="poster">
                        </div>          
                        <div class="movieDetails">
                            <h3 class="movieTitle">${e.title}</h3>
                            <div class="statsinfo">
                                <span>Rate: </span>
                                <span>${Math.floor(e.vote_average)}/10</span>
                            </div>
                            <div class="statsinfo">
                                <span>Release date: </span>
                                <span>${e.release_date}</span>
                            </div>
                        </div>
                    </div>
        `;
    }).join('')

    const cards = document.querySelectorAll(`.movieCard`);
    moreDetails(cards);
}