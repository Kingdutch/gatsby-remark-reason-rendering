const STATE_FIND = 'find';
const STATE_PARSE = 'parse';

function parser(snippet) {
  let directives = {};

  const addDirective = (name, value) => {
    if (!directives[name]) {
      directives[name] = [];
    }
    directives[name].push(value);
  };

  const lines = snippet.split('\n');
  let state = STATE_FIND;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    switch (state) {
      // Find the start of a docblock
      case STATE_FIND:
        if (line.substr(0, 3) === '/**') {
          state = STATE_PARSE;
        }
        break;
      // Parse through a docblock
      case STATE_PARSE:
        // Only evaluate valid docblock lines but ignore others.
        if (line[0] === '*') {
          // Check if there's anything here.
          const subline = line.substr(1).trim();
          if (!subline.length) {
            break;
          }
          // Annotations start with an @
          if (subline[0] === '@') {
            const splitAt = subline.indexOf(' ');
            // Either a flag
            if (splitAt === -1) {
              addDirective(subline.substr(1), true)
            }
            // Or an annotation with a value
            else {
              addDirective(subline.substr(1, splitAt - 1), subline.substr(splitAt + 1));
            }
          }
          // A */ closes the docblock so we start searching again.
          else if (subline[0] === '/') {
            state = STATE_FIND;
          }
        }
        break;
    }
  }

  return directives;
}

module.exports = parser;