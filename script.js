const API_KEY = 'AIzaSyBFBbH1SQkSZf1LJzammWAe2karh5mG9rQ'; // Reemplaza con tu API Key
const BLOG_ID = '2756493429384988662'; // Reemplaza con tu Blog ID
const postsPerPage = 5;

let currentPage = 0;
let loadedPostIds = []; 
let nextPageToken = null; 
let loadedPagesCount = 1; 
let categories = []; 

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
    loadCategories(); // Cargar categorías al inicio
    loadPosts(); 
  });
}

// Función para cargar las categorías
function loadCategories() {
  gapi.client.blogger.posts.list({
    blogId: BLOG_ID,
    fields: 'items(labels)' 
  }).then(response => {
    const allLabels = new Set();
    response.result.items.forEach(post => {
      post.labels.forEach(label => allLabels.add(label));
    });
    categories = Array.from(allLabels);
console.log(categories);
    populateCategoryDropdown(); 
  }).catch(error => {
    console.error('Error al obtener las categorías:', error);
  });
}


// Función para llenar el menú desplegable de categorías
function populateCategoryDropdown() {
  const categorySelect = document.getElementById('category-select');
  categorySelect.innerHTML = '<option value="">Todas las categorías</option>'; 

  categories.forEach(category => { // "category" ya es el nombre de la categoría
    const option = document.createElement('option');
    option.value = category; // Asignar directamente "category"
    option.text = category;  // Asignar directamente "category"
    categorySelect.add(option);
  });

  // Agregar evento al cambiar la selección
  categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;
    currentPage = 0; 
    nextPageToken = null;
    loadedPostIds = [];
    loadedPagesCount = 1;
    loadPosts(selectedCategory); 
  });
}

// Modificar loadPosts para aceptar una categoría opcional
function loadPosts(category = null) { 
  const requestParams = {
    blogId: BLOG_ID,
    maxResults: postsPerPage
  };

  if (nextPageToken) {
    requestParams.pageToken = nextPageToken;
  }

  // Agregar filtro por categoría si se proporciona
  if (category) {
    requestParams.labels = category;
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
        loadedPagesCount++; 
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

  // Deshabilitar "Anterior" si no hay páginas anteriores cargadas
  prevButton.disabled = loadedPagesCount <= 1; 
  nextButton.disabled = !nextPageToken;

  prevButton.onclick = () => {
    currentPage--;
    // Decrementar el contador al cargar una página anterior
    loadedPagesCount--; 
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
