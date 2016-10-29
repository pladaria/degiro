import test from 'ava';
import sum from '../src'

test('1 + 1 = 2', t => {
    t.is(sum(1, 1), 2);
});
