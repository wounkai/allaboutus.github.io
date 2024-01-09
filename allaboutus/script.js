const API_URL = 'https://jsonplaceholder.typicode.com';

let currentPage = 1;
const postsPerPage= 4;
const albumsPerPage= 6;

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});

async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
}

async function loadUsers() {
    const usersList = document.getElementById('users-list');
    const userDetailsMessage = document.getElementById('user-details-message');
    const userDetailsContainer = document.getElementById('user-details');
    const postsButton = document.getElementById('posts-button');
    const albumsButton = document.getElementById('albums-button');

    const users = await fetchData(`${API_URL}/users`);

    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.name}`;
        li.addEventListener('click', () => {
            userDetailsMessage.style.display = 'none';
            postsButton.style.display = 'inline-block';
            albumsButton.style.display = 'inline-block';
            displayUserDetails(userDetailsContainer, user);
            attachEventListeners(user, postsButton, albumsButton);
        });
        usersList.appendChild(li);
    });
}

//function to get photos
async function fetchPhotos(albumId) {
    try {
        const response = await fetch(`${API_URL}/photos?albumId=${albumId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const photos = await response.json();
        return photos;
    } catch (error) {
        console.error('Error fetching photos:', error);
        throw error;
    }
}

function attachEventListeners(user, postsButton, albumsButton) {
    postsButton.addEventListener('click', async () => {
        const posts = await fetchData(`${API_URL}/users/${user.id}/posts`);
        displayPosts(document.getElementById('user-details'), posts);
    });

    albumsButton.addEventListener('click', async () => {
        const albums = await fetchData(`${API_URL}/users/${user.id}/albums`);
        displayAlbums(document.getElementById('user-details'), albums);
    });

}

function displayUserDetails(container, user) {
    container.innerHTML = `
        <p class="info">CLICK ON POSTS OR ALBUMS TO VIEW USER CONTRIBUTIONS</p>
        <p><strong>User Details</strong><p>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Phone:</strong> ${user.phone}</p>
    `;
}

//function to shows the posts with comment with only shows the maximum of 4
function displayPosts(container, posts) {
    container.innerHTML = '';

    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = posts.slice(startIndex, endIndex);

    currentPosts.forEach(post => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${post.title}</strong><br>${post.body}`;
        container.appendChild(li);
    });

    // next and previous buttons
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
        const remainPosts = posts.length - endIndex;
        if (remainPosts > 0){
            currentPage++;
            displayPosts(container, posts);
        }
    });

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPosts(container, posts);
        }
    });

    // Search input and button
    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Type here to Search';

    const searchButton = document.createElement('button');
    searchButton.textContent = 'Search';
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredPosts = posts.filter(post =>
            post.title.toLowerCase().includes(searchTerm) || post.body.toLowerCase().includes(searchTerm)
        );
        currentPage = 1; // Reset to the first page after searching
        displayPosts(container, filteredPosts);
    });

    nextButton.style.marginLeft = 'auto';
    prevButton.style.marginLeft = 'auto';
    searchButton.style.marginLeft = 'auto';

    container.appendChild(searchInput);
    container.appendChild(searchButton);
    container.appendChild(prevButton);
    container.appendChild(nextButton);
}


//function to shows the albums with only shows the maximum of 6
async function displayAlbums(container, albums) {
    container.innerHTML = '';

    const startIndex = (currentPage - 1) * albumsPerPage;
    const endIndex = startIndex + albumsPerPage;
    const currentAlbums = albums.slice(startIndex, endIndex);

    for (const album of currentAlbums) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${album.title}</strong>`;
        container.appendChild(li);

        // Fetch photos for the current album
        const photos = await fetchPhotos(album.id);

        // Display only 2 photos
        if (photos.length > 0) {
            const ul = document.createElement('ul');
            ul.style.display = 'flex'; 
            ul.style.listStyle = 'none'; 
            ul.style.padding = '0';
            

            photos.slice(0, 2).forEach(photo => {
                const photoLi = document.createElement('li');
                const img = document.createElement('img');
                img.src = photo.thumbnailUrl;
                img.alt = photo.title;
                photoLi.appendChild(img);
                ul.appendChild(photoLi);
            });
            container.appendChild(ul);
        }
    }

    // next and previous buttons
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', async () => {
        const remainAlbums = albums.length - endIndex;
        if (remainAlbums > 0) {
            currentPage++;
            await displayAlbums(container, albums);
        }
    });

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.addEventListener('click', async () => {
        if (currentPage > 1) {
            currentPage--;
            await displayAlbums(container, albums);
        }
    });



    container.appendChild(prevButton);
    container.appendChild(nextButton);
}
