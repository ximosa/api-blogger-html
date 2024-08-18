const API_KEY = 'AIzaSyBFBbH1SQkSZf1LJzammWAe2karh5mG9rQ';
const BLOG_ID = '2756493429384988662';
const postsPerPage = 5;
let currentPageToken = '';
let nextPageToken = '';

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/blogger/v3/rest'],
    }).then(() => {
        loadPosts();
    });
}

function loadPosts() {
    gapi.client.blogger.posts.list({
        blogId: BLOG_ID,
        maxResults: postsPerPage,
        pageToken: currentPageToken
    }).then(response => {
        const posts = response.result.items;
        const container = document.getElementById('posts-container');
        container.innerHTML = '';

        posts.forEach(post => {
            const postElement = createPostElement(post);
            container.appendChild(postElement);
        });

        nextPageToken = response.result.nextPageToken || '';
        updatePaginationButtons();
    });
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    const title = document.createElement('h2');
    const titleLink = document.createElement('a');
    titleLink.href = `post.html?id=${post.id}`;
    titleLink.textContent = post.title;
    titleLink.title = post.title;
    title.appendChild(titleLink);

    const content = document.createElement('p');
    content.innerHTML = getExcerpt(post.content);

    const image = getFirstImage(post.content);
    if (image) {
        const imgLink = document.createElement('a');
        imgLink.href = `post.html?id=${post.id}`;
        imgLink.title = post.title;
        imgLink.appendChild(image);
        postDiv.appendChild(imgLink);
    }

    postDiv.appendChild(title);
    postDiv.appendChild(content);

    return postDiv;
}

function getExcerpt(content) {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.textContent.slice(0, 150) + '...';
}

function getFirstImage(content) {
    const div = document.createElement('div');
    div.innerHTML = content;
    const img = div.querySelector('img');
    if (img) {
        img.style.maxWidth = '200px';
        img.style.height = 'auto';
        return img;
    }
    return null;
}

function updatePaginationButtons() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    prevButton.onclick = () => {
        if (currentPageToken !== '') {
            // Aquí deberíamos cargar la página anterior, pero la API de Blogger no proporciona
            // una forma directa de hacerlo. En una implementación más compleja, necesitaríamos
            // mantener un historial de tokens de página.
            alert('Funcionalidad de página anterior no implementada');
        }
    };

    nextButton.onclick = () => {
        if (nextPageToken !== '') {
            currentPageToken = nextPageToken;
            loadPosts();
        }
    };
}

gapi.load('client', initClient);

