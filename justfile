# SITSHelp — task runner
# Run `just` (or `just --list`) to see available recipes.

# Show available recipes
default:
    @just --list

# Install the widget dependencies
install:
    cd widget && npm install

# Build the React widget
build:
    cd widget && npm run build

# Start the widget dev server
dev:
    cd widget && npm run dev

# Run the widget test suite
test:
    cd widget && npm run test

# Format the widget source with prettier
format:
    cd widget && npm run format

# Check widget formatting without writing
format-check:
    cd widget && npm run format:check

# Render Quarto example
example: build
    cp -r _extensions example/_extensions
    cd example && quarto render example.qmd
    rm -rf example/_extensions

# Remove build artifacts
clean:
    rm -rf example/_site example/_extensions

# Run the full pipeline locally (mirrors CI)
ci: format-check test build
