import { describe, it, expect } from 'vitest';
import * as storage from './storage';

interface Row {
  id: string;
  name: string;
  done?: boolean;
}

describe('storage service', () => {
  it('returns an empty collection before anything is written', () => {
    expect(storage.getAll<Row>('rows')).toEqual([]);
  });

  it('round-trips create / getById / update / remove', () => {
    storage.create<Row>('rows', { id: 'a', name: 'first' });
    storage.create<Row>('rows', { id: 'b', name: 'second' });

    expect(storage.getAll<Row>('rows')).toHaveLength(2);
    expect(storage.getById<Row>('rows', 'b')?.name).toBe('second');

    storage.update<Row>('rows', 'a', { name: 'renamed', done: true });
    expect(storage.getById<Row>('rows', 'a')).toMatchObject({ name: 'renamed', done: true });

    expect(storage.remove<Row>('rows', 'a')).toBe(true);
    expect(storage.remove<Row>('rows', 'missing')).toBe(false);
    expect(storage.getAll<Row>('rows')).toHaveLength(1);
  });

  it('reports a miss when updating an unknown id', () => {
    expect(storage.update<Row>('rows', 'nope', { name: 'x' })).toBeUndefined();
  });

  it('survives corrupted JSON instead of throwing', () => {
    localStorage.setItem('lifeos_rows', '{not json');
    expect(storage.getAll<Row>('rows')).toEqual([]);
  });

  it('scopes exports to the lifeos_ prefix', () => {
    localStorage.setItem('unrelated_key', 'ignore me');
    storage.setAll<Row>('rows', [{ id: 'a', name: 'kept' }]);

    const exported = JSON.parse(storage.exportAllData());
    expect(exported.rows).toEqual([{ id: 'a', name: 'kept' }]);
    expect(exported).not.toHaveProperty('unrelated_key');
  });

  it('clears only its own keys', () => {
    localStorage.setItem('unrelated_key', 'keep me');
    storage.setAll<Row>('rows', [{ id: 'a', name: 'x' }]);

    storage.clearAllData();

    expect(storage.getAll<Row>('rows')).toEqual([]);
    expect(localStorage.getItem('unrelated_key')).toBe('keep me');
  });

  it('reads and writes scalar values with a default', () => {
    expect(storage.getValue('missing', { fallback: true })).toEqual({ fallback: true });
    storage.setValue('missing', { fallback: false });
    expect(storage.getValue('missing', { fallback: true })).toEqual({ fallback: false });
  });
});
