function buildGetPosts({ issueHTTPRequest, pipe }) {
  return async function getPosts(httpRequest) {
    const validSorts = ['id', 'reads', 'likes', 'popularity'];
    const validSortDirections = ['asc', 'desc'];

    const { query } = httpRequest;

    if (!query.tags) {
      throw new Error('tags parameter is required');
    }

    if (!validSorts.includes(query.sortBy)) {
      throw new Error('sortBy parameter is invalid');
    }

    if (!validSortDirections.includes(query.direction)) {
      throw new Error('direction parameter is invalid');
    }

    const getPostsByTags = pipe(
      makePostsAPIRequestURLs,
      issueConcurrentGetRequest,
      flattenResponseBody,
      mergePosts,
      sortBy(query.sortBy, query.direction),
    )

    return getPostsByTags(query.tags);
  }

  function issueConcurrentGetRequest(urls) {
    const requests = urls.map(url => issueHTTPRequest(url));
    return Promise.all(requests);
  }

  function flattenResponseBody(responses) {
    return responses.flatMap(({ data }) => data.posts);
  }

  function sortBy(field, direction) {
    return (posts) => posts.sort((prev, curr) => {
      if (direction === 'asc') {
        return prev[field] - curr[field]
      }

      return curr[field] - prev[field];
    });
  }

  function mergePosts(posts) {
    const seen = new Set();

    return posts.filter(
      post => (seen.has(post.id) ? false : seen.add(post.id))
    );
  }

  function makePostsAPIRequestURLs(tags) {
    return tags
      .split(',')
      .map(tag => `${process.env.HATCHWAYS_POSTS_API_URL}?tag=${tag}`);
  }
}

module.exports = buildGetPosts;
