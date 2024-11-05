// API base URL
const API_URL = 'https://restcountries.com/v3.1/';

// Elements
const countryList = document.getElementById('countryList');
const searchInput = document.getElementById('search');
const suggestions = document.getElementById('suggestions');
const favoriteList = document.getElementById('favoriteList');
const showMoreBtn = document.getElementById('showMore');
const viewFavoritesBtn = document.getElementById('viewFavorites');
const languageFilter = document.getElementById("languageFilter");
const regionFilter = document.getElementById("regionFilter");
const noFavoritesMessage = document.getElementById('noFavoritesMessage'); // Ensure this element exists in HTML
const backBtn = document.getElementById('backBtn');

// State variables
let countries = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let page = 1;
const countriesPerPage = 10;

// Fetch and display countries
async function fetchCountries() {
    try {
        const res = await fetch(`${API_URL}all`);
        const data = await res.json();
        countries = data;
        displayCountries(countries.slice(0, countriesPerPage * page)); // Display initial set of countries
        renderFavorites(); // Render favorites on load
    } catch (error) {
        console.error('Error fetching countries:', error);
    }
}

function displayCountries(countriesToShow) {
    countryList.innerHTML = ''; // Clear the country list
    countriesToShow.forEach(country => {
        const countryCard = document.createElement('div');
        countryCard.classList.add('country-card');
        countryCard.innerHTML = `
            <img src="${country.flags.svg}" alt="${country.name.common} flag" style="width:100px;">
            <h3>${country.name.common}</h3>
            <button class="favorite-btn">
                ${favorites.some(fav => fav.name.common === country.name.common) ? '🩷' : '❤️‍🩹'}
            </button>
        `;

        // Set up click event for the favorite button
        const favoriteBtn = countryCard.querySelector('.favorite-btn');
        favoriteBtn.onclick = (event) => {
            event.stopPropagation(); // Prevent triggering country details
            toggleFavorite(country); // Toggle the favorite status
        };

        // Set up click event for the country card to view details
        countryCard.onclick = () => viewCountryDetails(country.name.common);
        countryList.appendChild(countryCard); // Append the country card to the country list
    });
}

function viewCountryDetails(countryName) {
    // Navigate to details page with the country name in the query string
    window.location.href = `details.html?country=${encodeURIComponent(countryName)}`;
}
searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    // Clear suggestions and show all countries if input is empty
    if (!query) {
        suggestions.innerHTML = '';
        displayCountries(countries.slice(0, countriesPerPage * page));
        return;
    }

    try {
        const res = await fetch(`${API_URL}name/${query}`);
        if (!res.ok) throw new Error('Network response was not ok'); // Check if the response is ok
        const data = await res.json();
        
        if (data && data.length > 0) {
            showSuggestions(data.slice(0, 5)); // Show the first 5 suggestions
        } else {
            suggestions.innerHTML = ''; // Clear suggestions if no results
        }
    } catch (error) {
        console.error('Error fetching search suggestions:', error);
        suggestions.innerHTML = ''; // Clear suggestions on error
    }
});



function showSuggestions(results) {
    suggestions.innerHTML = ''; // Clear previous suggestions
    results.forEach(country => {
        const suggestion = document.createElement('div');
        suggestion.classList.add('suggestion');
        suggestion.innerText = country.name.common; // Display country name
        suggestion.onclick = () => {
            // View country details only when clicking on the suggestion
            viewCountryDetails(country.name.common);
            suggestions.innerHTML = ''; // Clear suggestions after selecting one
        };
        suggestions.appendChild(suggestion); // Append suggestion to the suggestions container
    });
}

// Show more countries on "Show More" button click
showMoreBtn.addEventListener('click', () => {
    page++;
    const countriesToShow = countries.slice(0, countriesPerPage * page);
    displayCountries(countriesToShow);
});

// Toggle favorite functionality
function toggleFavorite(country) {
    const existingFavorite = favorites.find(fav => fav.name.common === country.name.common);
    
    if (existingFavorite) {
        favorites = favorites.filter(fav => fav.name.common !== country.name.common);
        alert(`${country.name.common} has been removed from favorites.`);
    } else {
        favorites.push(country);
        alert(`${country.name.common} has been added to favorites.`);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayCountries(countries.slice(0, countriesPerPage * page)); // Refresh the displayed countries
    renderFavorites(); // Update the favorite list display
}

// Render favorites on the favorites page
function renderFavorites() {
    if (!favoriteList || !noFavoritesMessage) {
        console.error("Favorite list or noFavoritesMessage element not found in DOM.");
        return; // Exit function if elements are missing
    }
    favoriteList.innerHTML = ''; // Clear the list

    if (favorites.length === 0) {
        noFavoritesMessage.style.display = 'block'; // Show no favorites message
    } else {
        noFavoritesMessage.style.display = 'none'; // Hide the message
        favorites.forEach(country => {
            const favItem = document.createElement('li');
            favItem.classList.add('favorite-item'); // Optional: add a class for styling

            // Create the flag image element
            const flagImg = document.createElement('img');
            flagImg.src = country.flags.svg;
            flagImg.alt = `${country.name.common} flag`;
            flagImg.style.width = '50px'; // Adjust the size as needed

            // Create a text node for the country name
            const countryName = document.createElement('span');
            countryName.innerText = country.name.common;

            // Create the remove button
            const removeBtn = document.createElement('button');
            removeBtn.innerText = 'Remove';
            removeBtn.onclick = (event) => {
                event.stopPropagation(); // Prevent navigating to details
                toggleFavorite(country); // Call toggleFavorite to remove it
                renderFavorites(); // Refresh favorites display
            };

            // Append the elements to the favorite item
            favItem.appendChild(flagImg); // Add flag image
            favItem.appendChild(countryName); // Add country name
            favItem.appendChild(removeBtn); // Add remove button

            favItem.onclick = () => viewCountryDetails(country.name.common); // Link to country details
            favoriteList.appendChild(favItem); // Add the favorite item to the list
        });
    }
}

// View Favorites functionality
viewFavoritesBtn.addEventListener('click', () => {
    if (favorites.length === 0) {
        alert('No favorite countries yet!');
    }
    else {
    countryList.style.display = 'none'; // Clear the main country list
    showMoreBtn.style.display = 'none'; // Hide "Show More" in favorites view
    document.getElementById('favorites').style.display = 'block';
    renderFavorites(); // Render the favorites directly
    }
});

// Back button functionality
backBtn.addEventListener('click', () => {
    document.getElementById('favorites').style.display = 'none'; // Hide favorites section
    countryList.style.display = 'block'; // Show main country list
    showMoreBtn.style.display = 'block'; // Show "Show More" button
    
});

// Filtering functionality
// Filtering functionality
languageFilter.addEventListener('change', () => {
    const selectedLanguage = languageFilter.value;
    const filteredCountries = countries.filter(country => {
        // If "All" is selected, return all countries
        if (selectedLanguage === 'All') return true;
        
        // Check if the country includes the selected language
        return country.languages && Object.values(country.languages).includes(selectedLanguage);
    });
    displayCountries(filteredCountries);
});

regionFilter.addEventListener('change', () => {
    const selectedRegion = regionFilter.value;
    const filteredCountries = countries.filter(country => {
        // If "All" is selected, return all countries
        if (selectedRegion === 'All') return true;

        // Filter countries based on the selected region
        return country.region === selectedRegion;
    });
    displayCountries(filteredCountries);
});

// Assuming you have existing code here...

document.getElementById('aboutBtn').addEventListener('click', function() {
    // Hide country list and favorites, then show the About section
    document.getElementById('countryList').style.display = 'none';
    showMoreBtn.style.display = 'none';
    document.getElementById('favorites').style.display = 'none';
    document.getElementById('about').style.display = 'block'; // Show the About section
});

document.getElementById('backFromAbout').addEventListener('click', function() {
    // Hide the About section and show the country list again
    document.getElementById('about').style.display = 'none'; // Hide About section
    showMoreBtn.style.display = 'block';
    document.getElementById('countryList').style.display = 'block'; // Show country list
});


// Initialize the application
fetchCountries();
