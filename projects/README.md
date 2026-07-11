# Projects

Each portfolio project lives in its own folder with HTML, CSS, scripts, and assets.

| Folder | Description | Entry point | GitHub |
|--------|-------------|-------------|--------|
| `chrome-dino/` | Chrome offline dino replica | `index.html` | [Chrome-Dino](https://github.com/AshkanPazaj/Chrome-Dino) |
| `cafe-x/` | Fictional café site with order and reserve flows | `index.html` | [Cafe-X](https://github.com/AshkanPazaj/Cafe-X) |
| `armeh-gold-gallery/` | Persian RTL gold jewellery boutique (collections, cart, admin, live gold ticker) | `index.html` | [Armeh-Gold-Gallery](https://github.com/AshkanPazaj/Armeh-Gold-Gallery) |

The main portfolio site stays at the repo root (`index.html`, `styles.css`, `script.js`).

To publish these folders as standalone GitHub repos, run:

```powershell
gh auth login
powershell -ExecutionPolicy Bypass -File scripts/publish-github-repos.ps1
```
