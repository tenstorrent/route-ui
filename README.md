# Route UI

## Pre-requisites

- [Node.js](https://nodejs.org/en/download/) (v20.11.1)
- [npm](https://www.npmjs.com/get-npm)
- One of the node versioning tool below:
  - [nvm](http://nvm.sh)
  - [volta](https://volta.sh)

## Install

Clone the repo and install dependencies:

```bash
git clone --depth 1 --branch main https://github.com/tenstorrent/route-ui.git
cd route-ui
npm install
```

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```


## required and expected files and folders

Inside the folder containing a test you want to visualize, the following files and folders are expected:

- `runtime_data.yaml`
- `cluster_desc.yaml`
- `/device_desc_runtime/`
- `/netlist_analyzer/`
- `/reports/`
- `/perf_results/`
- `/perf_results/metadata/`
- `/perf_results/graph_descriptor/`
- `/perf_results/queue_descriptor/`
- `/perf_results/analyzer_results/`
