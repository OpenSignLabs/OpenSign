import axios from 'axios';
describe('Parse Server example', () => {
  Parse.User.enableUnsafeCurrentUser();
  it('call function', async () => {
    const result = await Parse.Cloud.run('hello');
    expect(result).toBe('Hi');
  });
  it('call async function', async () => {
    const result = await Parse.Cloud.run('asyncFunction');
    expect(result).toBe('Hi async');
  });
  it('failing test', async () => {
    const obj = new Parse.Object('Test');
    try {
      await obj.save();
      fail('should not have been able to save test object.');
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.code).toBe(9001);
      expect(e.message).toBe('Saving test objects is not available.');
    }
  });
  it('coverage for /', async () => {
    const { data, headers } = await axios.get('http://localhost:30001/');
    expect(headers['content-type']).toContain('text/html');
    expect(data).toBe('I dream of being a website.  Please star the parse-server repo on GitHub!');
  });
  it('coverage for /test', async () => {
    const { data, headers } = await axios.get('http://localhost:30001/test');
    expect(headers['content-type']).toContain('text/html');
    expect(data).toContain('<title>Parse Server Example</title>');
  });
});
