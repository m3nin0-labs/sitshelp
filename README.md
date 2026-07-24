## sitshelp <img src=".github/logo.svg" align="right" height="220" alt="sitshelp logo" />

AI Assistant to support users on the [sitsbook](https://e-sensing.github.io/sitsbook/) page. Built of top of `sitsrag`.

### Requirements

To install and build the `sitshelp`, there are few tools you need to have installed in your machine:

- [Node.js](https://nodejs.org) 20+ and npm
- [Quarto](https://quarto.org) (only to render the `example/` site)
- [just](https://github.com/casey/just) (optional, task runner)
- A running [`sitsrag`](https://github.com/m3nin0-labs/sitsrag) backend for the assistant to answer

### Installation

To build and develop the `sitshelp`, you first need to install it. For this, start cloning the repository:

```bash
git clone https://github.com/m3nin0-labs/sitshelp.git
cd sitshelp
```

In the repository, you can use [just](https://just.systems/) to install the dependencies:

```bash
just install
```

### Example

If you want to see a live example of `sitshelp` running, you can use the [example](./example/). It is a Quarto project already configured with the `sitshelp`. To render it, you can use `just`:

```bash
just example
```

The rendered site lands in `example/_site`. Use `just clean` to remove build artifacts.

### Development

All tasks are exposed through the `justfile`. Run `just` to list them:

```bash
just            # list available recipes
just dev        # start the Vite dev server (widget/index.html)
just test       # run the test suite
just build      # build the widget into _extensions/sitshelp/assets
just format     # format the source with prettier
just ci         # format-check + test + build (mirrors CI)
```

The dev server serves `widget/index.html`, which points the widget at a local backend (`http://127.0.0.1:8000`) so you can iterate without Quarto.

### Testing

Component render tests and unit tests run with [Vitest](https://vitest.dev):

```bash
just test
```

Continuous integration (`.github/workflows/ci.yml`) runs the format check, the tests, and a production build on every push and pull request.

### Using the extension

To use the extension in the `sitsbook` project, there are three steps to follow:

**1**. Copy the `_extensions/sitshelp` into the `_extensions/` directory of the `sitstbook`

**2**. Then, you need to enable the `sitshelp` filter in `_quarto.yml`:

```yaml
format:
  html:
    filters:
      - sitshelp
```

**3**. Finally, you need to configure the widget to use the `sitsrag` server. For this, you can use the `sitshelp-api-url`. You can set it up in the root document of the quarto project:

```yaml
---
title: "SITS R Package"
sitshelp-api-url: "https://your-sitsrag-host"
---
```

### Contributing

Contributions are welcome. Please open an issue to discuss significant changes, and make sure `just ci` passes before submitting a pull request.

### License

`sitshelp` is distributed under the MIT License. See [LICENSE](./LICENSE) for the full text.
