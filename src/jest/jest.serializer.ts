import prettyFormat from 'pretty-format';
import forEach from 'lodash.foreach';
import clone from 'lodash.clone';

/**
 * Snapshot serialized that have a fixed value on id, createdAt and updatedAt
 */
const iat = 1654112080;

const keyValues = { iat };
const keys = Object.keys(keyValues);

/**
 * Recursively replaces value given the object
 * @param object
 */
function deepReplacePropertyValue(object) {
  const newObject = clone(object);

  forEach(object, (val, key) => {
    if (keys.includes(key)) {
      newObject[key] = keyValues[key];
    } else if (typeof val === 'object') {
      newObject[key] = deepReplacePropertyValue(val);
    }
  });

  return newObject;
}

expect.addSnapshotSerializer({
  serialize(val) {
    return prettyFormat(deepReplacePropertyValue(val));
  },

  test(val) {
    return val;
  },
});
