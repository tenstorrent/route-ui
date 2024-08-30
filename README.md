# Route UI

Tool for visualizing test data for Tenstorrent hardware, with support for displaying multiple chips, analyzing operation performance, and link congestion.

## Videos and Screenshots

https://github.com/user-attachments/assets/7ced6517-72c2-45bb-9ec3-f1b7a90ccfcf

https://github.com/user-attachments/assets/3d4174ac-e83f-4324-8c4d-f1fa6413be08

<img width="400" alt="Screenshot 2024-08-30 at 2 32 55 PM" src="https://github.com/user-attachments/assets/8bdca077-fe3d-4a45-9bce-5fb77b65a2de">

<img width="400" alt="Screenshot 2024-08-30 at 2 34 25 PM" src="https://github.com/user-attachments/assets/c3174f8a-3c1e-4f31-b066-69df187ec824">

<img width="400" alt="Screenshot 2024-08-30 at 2 34 50 PM" src="https://github.com/user-attachments/assets/3bd879d7-c6ef-4d31-8c07-e330ffeeba83">

<img width="400" alt="Screenshot 2024-08-30 at 2 35 21 PM" src="https://github.com/user-attachments/assets/3d5b6df8-e5ff-4043-b2e0-41e2fd8b43b1">

<img width="400" alt="Screenshot 2024-08-30 at 2 35 41 PM" src="https://github.com/user-attachments/assets/3dd66c21-ea70-49cf-a665-59f6801ff0be">

<img width="400" alt="Screenshot 2024-08-30 at 2 36 09 PM" src="https://github.com/user-attachments/assets/3b87c52a-b316-42a0-b9a6-80703757ed74">

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
```bash
npm run package-linux
```

#### Post Installation (mac only)
run `xattr -d com.apple.quarantine /Applications/Route\ UI.app` in terminal after installation to bypass Apple security settings



### required and expected files and folders in run folder

Inside the folder containing a run you want to visualize, the following files and folders are expected:

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
