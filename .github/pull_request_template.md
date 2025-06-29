name: Synchronize to forked repo

on:
  push:
    branches:
      - main

jobs:
  sync:
    name: Sync forked repo
    runs-on: ubuntu-latest

    steps:
      - name: Checkout main
        uses: actions/checkout@v4
        with: 
          token: ${{ secrets.REPO_TOKEN }}
          fetch-depth: 0
          ref: main

      - name: Add forked repo remote
        run: |
          git remote add forked-repo https://chan000518:${{ secrets.FORKED_REPO_TOKEN }}@github.com/chan000518/bubblog-FE.git
      
      - name: Force push to forked repo
        run: |
          git push -f forked-repo main
      
      - name: Clean up
        run: |
          git remote remove forked-repo