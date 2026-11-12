import { describe, expect, it } from 'vitest';
import { InputError } from './parse';

// Placeholder for basic CI and npm test run
describe('placeholder', () => {
  it('tests are run', () => {
    expect(true).toBe(true);
  });

  it('InputError has name and message', () => {
    const error = new InputError('corrupt file');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('InputError');
    expect(error.message).toBe('corrupt file');
  });
});
