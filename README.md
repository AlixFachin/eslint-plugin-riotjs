# eslint-plugin-riotjs

## Overview 🤓

This package contains a eslint plugin for riot.js files.
There are already pretty good plugins out there, but for work I needed
one plugin parsing the javascript outside of `<script>` `</script>` tags.
(In riot.js anything after the `</style>` tag is considered as JavaScript)

## Thanks to... 🎉

Special thanks to:

- Creators of [riot.js](https://riot.js.org)
- [txchen](https://github.com/txchen) who made the original [eslint riot plugin](https://github.com/txchen/eslint-plugin-riot)

## How does this work ( as a user) 🤔

- You need to install _eslint_ first, for this see [Getting Started with eslint](https://eslint.org/docs/user-guide/getting-started)
- Then you need to install this plugin: `npm install --save-dev @alixfachin/eslint-plugin-riotjs`
- Then in your `.eslintrc` config (`.js` file, or `.json`, or `yaml`) add the plugin in the plugin section.
  For example, with a `.eslintrc.js` file, you need to add:

```
module.exports = {
    ...
    // some stuff

    // here is the part you need to add:
     "plugins": [
        "eslint-plugin-riotjs",
    ],

}
```

## How does this work (as a code) 👨‍💻

### The general idea

- The plugin contains a `processor`, which must have two methods:

  - `preprocess`: which reads a source file and extracts the javascript which should be read, potentially in multiple blocks
  - `postprocess`: which is given a list of errors found by `eslint` and which should correctly re-attribute them (right line number/column)
    with the original file scope.

- For the `preprocess`, we use a simple HTML parser, and according to tag openings/closing we extract corresponding JavaScript source to be linted.

- The official documentation for es-lint plugins is at the following link:
  <https://eslint.org/docs/developer-guide/working-with-plugins>

### Some detailed explanations 👨🏻‍🏫

- The `extract.js` script returns an array of "codeBlock" objects, which store the JS code (`codeBlock.source`) and other informations (start and end line, etc...)
- The pre-processor will concatenate all the `source` properties, but keep the other information afterwards to reconstitute the proper original number

- One issue was that we were using a lot of HTML strings into our JS code, which confuses the hell out of the HTML parser.

```
  const message = '<p>This is a paragraph</p>';
```

So I had to add a routine during the pre-processor which adds the `<script> ... </script>` tags around the JS bit at the bottom.
(And then remove the corresponding offset in line number to make as if the `<script>` was never added). 😓

# How to Contribute 😎

This plugin is my first! So I guess there are tons of stuff wrongs with it and ways to make it better.
(And some hacky stuff because I'd prefer taking a shortcut sometimes).
I am not sure if I will have the time to take care of this - so if I don't reply too fast feel free to fork the project and tweak it to fit your own needs!
