const movies = [

{
    title:"Interstellar",
    genre:"Sci-Fi",
    rating:"8.7",
    image:"https://picsum.photos/300/450?1"
},

{
    title:"Batman",
    genre:"Action",
    rating:"8.2",
    image:"https://picsum.photos/300/450?2"
},

{
    title:"Joker",
    genre:"Drama",
    rating:"8.4",
    image:"https://picsum.photos/300/450?3"
},

{
    title:"Inception",
    genre:"Sci-Fi",
    rating:"8.8",
    image:"https://picsum.photos/300/450?4"
},

{
    title:"Top Gun",
    genre:"Action",
    rating:"8.0",
    image:"https://picsum.photos/300/450?5"
},

{
    title:"Avatar",
    genre:"Adventure",
    rating:"7.9",
    image:"https://picsum.photos/300/450?6"
}

];

const movieContainer =
document.getElementById("movieContainer");

function displayMovies(movieList){

    movieContainer.innerHTML = "";

    movieList.forEach(movie => {

        movieContainer.innerHTML += `
        <div class="card">

            <img src="${movie.image}" alt="${movie.title}">

            <div class="card-content">

                <h3>${movie.title}</h3>

                <p>Genre: ${movie.genre}</p>

                <p>⭐ Rating: ${movie.rating}</p>

            </div>

        </div>
        `;
    });
}

displayMovies(movies);

function filterMovies(genre){

    if(genre === "All"){
        displayMovies(movies);
        return;
    }

    const filteredMovies =
    movies.filter(movie =>
    movie.genre === genre);

    displayMovies(filteredMovies);
}

document
.getElementById("searchBox")
.addEventListener("keyup", function(){

    const searchText =
    this.value.toLowerCase();

    const filteredMovies =
    movies.filter(movie =>
    movie.title.toLowerCase()
    .includes(searchText));

    displayMovies(filteredMovies);
});

function watchNow(){

    alert(
    "Welcome to CineFlix! Enjoy unlimited entertainment."
    );

}

