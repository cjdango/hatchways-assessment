const { URL } = require('url');
const dotenv = require('dotenv');
const makeGetPosts = require('./get-posts');
const pipe = require('../utils/pipe');

dotenv.config();

const getPosts = makeGetPosts({
  issueHTTPRequest: (url) => {
    const responses = {
      health: () => Promise.resolve({
        data: {
          posts: [
            { id: 95, likes: 985, popularity: 0.42, reads: 55875 },
            { id: 1, likes: 960, popularity: 0.13, reads: 50361 },
          ],
        },
      }),
      tech: () => Promise.resolve({
        data: {
          posts: [
            { id: 59, likes: 971, popularity: 0.21, reads: 36154 },
            { id: 35, likes: 868, popularity: 0.2, reads: 66926 },
            { id: 1, likes: 960, popularity: 0.13, reads: 50361 },
          ],
        },
      }),
    }

    const tag = new URL(url).searchParams.get('tag');

    return responses[tag]();
  },
  pipe,
})

function makeFakeQuery(overrides) {
  return {
    tags: 'health',
    sortBy: 'id',
    direction: 'asc',
    ...overrides,
  }
}

describe('getPosts route', () => {
  it('must have tags', () => {
    expect(getPosts({ query: makeFakeQuery({ tags: '' }) }))
      .rejects
      .toThrow('tags parameter is required');
  });

  it('must have valid sort', () => {
    expect(getPosts({ query: makeFakeQuery({ sortBy: 'invalid' }) }))
      .rejects
      .toThrow('sortBy parameter is invalid');
  });

  it('must have valid sort direction', () => {
    expect(getPosts({ query: makeFakeQuery({ direction: 'invalid' }) }))
      .rejects
      .toThrow('direction parameter is invalid');
  });

  it('can handle multiple tags', async () => {
    const actualPostsCount = (await getPosts({
      query: makeFakeQuery({ tags: 'tech,health' })
    })).length;

    const uniquePostsCount = 4;

    expect(actualPostsCount)
      .toBe(uniquePostsCount);
  });

  it('can sort posts in ascending order', async () => {
    const posts = await getPosts({ query: makeFakeQuery({ direction: 'asc' }) });
    const actual = posts.map(post => post.id);
    const expected = [1, 95];

    expect(actual).toStrictEqual(expected);
  });

  it('can sort posts in descending order', async () => {
    const posts = await getPosts({ query: makeFakeQuery({ direction: 'desc' }) });
    const actual = posts.map(post => post.id);
    const expected = [95, 1];

    expect(actual).toStrictEqual(expected);
  });

  it('can sort by id', async () => {
    const posts = await getPosts({ query: makeFakeQuery({ tags: 'tech', sortBy: 'id' }) });
    const actual = posts.map(post => post.id);
    const expected = [1, 35, 59];

    expect(actual).toStrictEqual(expected);
  });

  it('can sort by reads', async () => {
    const posts = await getPosts({ query: makeFakeQuery({ tags: 'tech', sortBy: 'reads' }) });
    const actual = posts.map(post => post.reads);
    const expected = [36154, 50361, 66926];

    expect(actual).toStrictEqual(expected);
  });

  it('can sort by likes', async () => {
    const posts = await getPosts({ query: makeFakeQuery({ tags: 'tech', sortBy: 'likes' }) });
    const actual = posts.map(post => post.likes);
    const expected = [868, 960, 971];

    expect(actual).toStrictEqual(expected);
  });

  it('can sort by popularity', async () => {
    const posts = await getPosts({ query: makeFakeQuery({ tags: 'tech', sortBy: 'popularity' }) });
    const actual = posts.map(post => post.popularity);
    const expected = [0.13, 0.2, 0.21];

    expect(actual).toStrictEqual(expected);
  });
});