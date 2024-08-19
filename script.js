const API_KEY = 'AIzaSyBFBbH1SQkSZf1LJzammWAe2karh5mG9rQ'; // Reemplaza con tu API Key
const BLOG_ID = '2756493429384988662'; // Reemplaza con tu Blog ID
const postsPerPage = 5;

let currentPage = 0;
let loadedPostIds = []; // Array para almacenar los IDs de los posts cargados
let nextPageToken = null; 

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

function loadPosts() {
  const requestParams = {
    blogId: BLOG_ID,
    maxResults: postsPerPage
  };

  if (nextPageToken) {
    requestParams.pageToken = nextPageToken;
  }

  gapi.client.blogger.posts.list(requestParams)
    .then(response => {
      const posts = response.result.items;
      const container = document.getElementById('posts-container');
      container.innerHTML = '';

      if (posts && posts.length > 0) {
        const currentPostIds = []; 

        posts.forEach(post => {
          currentPostIds.push(post.id); 
          const postElement = createPostElement(post);
          container.appendChild(postElement);
        });

        loadedPostIds[currentPage] = currentPostIds; 

        nextPageToken = response.result.nextPageToken;
        updatePaginationButtons(); 
      } else {
        container.innerHTML = '<p>No se encontraron publicaciones.</p>';
      }

      scrollToTop();
    });
}

function updatePaginationButtons() {
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');

  prevButton.disabled = currentPage === 0;
  nextButton.disabled = !nextPageToken;

  prevButton.onclick = () => {
    currentPage--;
    loadPreviousPage(); 
  };

  nextButton.onclick = () => {
    currentPage++;
    loadPosts();
  };
}

function loadPreviousPage() {
  const prevPagePostIds = loadedPostIds[currentPage];
  const container = document.getElementById('posts-container');
  container.innerHTML = '';

  if (prevPagePostIds) {
    prevPagePostIds.forEach(postId => {
      getPostById(postId)
        .then(post => {
          const postElement = createPostElement(post);
          container.appendChild(postElement);
        })
        .catch(error => {
          console.error("Error al cargar el post:", error);
        });
    });

    scrollToTop();
  }
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

// Función para obtener un post por ID
function getPostById(postId) {
  return new Promise((resolve, reject) => {
    gapi.client.blogger.posts.get({ blogId: BLOG_ID, postId: postId }) // Usar posts.get
      .then(response => resolve(response.result))
      .catch(error => reject(error));
  });
}
gapi.load('client', initClient);
