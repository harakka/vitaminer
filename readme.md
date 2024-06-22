# Vitaminer

Adds vitamins to CDDA comestibles based on their materials.

Note that due how the code works, this also strips spurious .0 decimals from numbers. We have a handful of those in the repo.

## Requirements

Developed with Node.js 20 on Linux, not tested with anything else.

## Usage

Modify the `mapping` array in `main.ts` to change the materials and vitamins used.

```shell
npm install
npm run start /path/to/cdda/data/json/
```
