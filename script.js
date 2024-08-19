const API_KEY = 'AIzaSyBFBbH1SQkSZf1LJzammWAe2karh5mG9rQ'; // Reemplaza con tu API Key
const BLOG_ID = '2756493429384988662'; // Reemplaza con tu Blog ID
const postsPerPage = 5;

let nextPageToken = null;
let prevPageToken = null;

// Función para desplazar al inicio de la página
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' 
  });
}

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/blogger/v3/rest'],
  }).then(() => {
    loadPosts();
  });
}

function loadPosts(token) {
  gapi.client.blogger.posts.list({
    blogId: BLOG_ID,
    maxResults: postsPerPage,
    pageToken: token // Usar el token proporcionado o null para la primera página
  }).then(response => {
    const posts = response.result.items;
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    if (posts && posts.length > 0) {
      posts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
      });
    } else {
      container.innerHTML = '<p>No se encontraron publicaciones.</p>';
    }

    // Actualizar los tokens de paginación
    nextPageToken = response.result.nextPageToken;
    prevPageToken = response.result.prevPageToken;

    updatePaginationButtons();

    // Desplazar hacia arriba después de cargar nuevos posts
    scrollToTop();
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

  // Habilitar/Deshabilitar botones DESPUÉS de cargar los posts
  prevButton.disabled = !prevPageToken;
  nextButton.disabled = !nextPageToken;

  prevButton.onclick = () => {
    loadPosts(prevPageToken); 
  };

  nextButton.onclick = () => {
    loadPosts(nextPageToken);
  };
}

gapi.load('client', initClient);
