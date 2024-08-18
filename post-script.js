const API_KEY = 'AIzaSyBFBbH1SQkSZf1LJzammWAe2karh5mG9rQ';
const BLOG_ID = '2756493429384988662';

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/blogger/v3/rest'],
    }).then(() => {
        loadPost();
    });
}

function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        document.getElementById('post-container').innerHTML = '<p>Post no encontrado</p>';
        return;
    }

    gapi.client.blogger.posts.get({
        blogId: BLOG_ID,
        postId: postId
    }).then(response => {
        const post = response.result;
        displayPost(post);
        updateURL(post);
    });
}

function displayPost(post) {
    const container = document.getElementById('post-container');
    container.innerHTML = `
        <h1>${post.title}</h1>
        <div class="post-content">${post.content}</div>
    `;
}

function updateURL(post) {
    const friendlyURL = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    history.pushState(null, '', `${friendlyURL}`);
}

gapi.load('client', initClient);