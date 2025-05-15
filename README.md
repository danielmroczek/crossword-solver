# Crossword Solver

A simple application for finding words matching specific patterns, useful for solving crossword puzzles.

## Demo

[See the demo](https://danielmroczek.github.io/crossword-solver/)

## Features

- Search for words by specifying known and unknown letters
- Adjust the length of the word pattern
- Fast results from a comprehensive Polish dictionary
- Works entirely in the browser - no server required

## How to Use

1. Use the "+" and "-" buttons to adjust the length of the word you're looking for
2. Enter the letters you know in the corresponding positions
3. Use spaces or "?" for unknown letters
4. Click "Szukaj" (Search) to find matching words

## Dictionary

The application uses a Polish dictionary that can be updated using the included downloader script:

```bash
./downloader/download-polish-dict.sh
```

## Development

To run this project locally:

1. Clone the repository
2. Run `make install;`
3. Open `public/index.html` in your browser

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
