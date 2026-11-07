import Parse from 'parse/node';
import updatePreferences from '../cloud/parsefunction/updatePreferences.js';

describe('updatePreferences theme', () => {
  const user = { id: 'user1' };
  let savedObjects;

  beforeEach(() => {
    globalThis.Parse = Parse;
    savedObjects = [];
    spyOn(console, 'log');
    spyOn(Parse.Query.prototype, 'first').and.resolveTo({ id: 'extUser1' });
    spyOn(Parse.Object.prototype, 'save').and.callFake(function () {
      savedObjects.push(this);
      return Promise.resolve(this);
    });
  });

  afterEach(() => {
    delete globalThis.Parse;
  });

  ['dark', 'light'].forEach(theme => {
    it(`saves ${theme} when it is the only preference sent`, async () => {
      await updatePreferences({ user, params: { Theme: theme } });

      expect(savedObjects.length).toBe(1);
      expect(savedObjects[0].get('Theme')).toBe(theme);
    });
  });

  it('leaves the other preferences untouched', async () => {
    await updatePreferences({ user, params: { Theme: 'dark' } });

    expect(savedObjects[0].dirtyKeys()).toEqual(['Theme']);
  });

  it('does not change the theme when other preferences are saved', async () => {
    await updatePreferences({ user, params: { Timezone: 'UTC' } });

    expect(savedObjects[0].dirty('Theme')).toBeFalse();
  });

  [{ Theme: 'solarized' }, { Theme: 1 }, { Theme: ['dark'] }, { Theme: {} }].forEach(params => {
    it(`rejects the invalid theme ${JSON.stringify(params.Theme)}`, async () => {
      await expectAsync(updatePreferences({ user, params })).toBeRejectedWith(
        jasmine.objectContaining({ code: Parse.Error.INVALID_QUERY, message: 'Invalid theme.' })
      );
      expect(savedObjects).toEqual([]);
    });
  });

  it('still rejects a request without any preference', async () => {
    await expectAsync(updatePreferences({ user, params: {} })).toBeRejectedWith(
      jasmine.objectContaining({ message: 'Please provide parameters.' })
    );
  });

  it('rejects a request without a user', async () => {
    await expectAsync(updatePreferences({ params: { Theme: 'dark' } })).toBeRejectedWith(
      jasmine.objectContaining({ code: Parse.Error.INVALID_SESSION_TOKEN })
    );
  });
});
