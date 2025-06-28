# Lotus Bridge Monorepo

This monorepo contains the following projects:

- `bridge-token-custom/` - Bridge token custom implementation
- `lotus-bridge-oft/` - Lotus bridge OFT contracts
- `lotus-landing-page/` - Lotus landing page
- `lotus-ui/` - Lotus UI components

## Getting Started

Each project has its own README and setup instructions in their respective directories.

## Project Structure

```
1matrix-monorepo/
├── bridge-token-custom/     # Bridge token custom implementation
├── lotus-bridge-oft/        # Lotus bridge OFT contracts
├── lotus-landing-page/      # Lotus landing page
├── lotus-ui/               # Lotus UI components
└── README.md               # This file
```

## Working with Subtrees

This monorepo uses git subtrees to manage the individual repositories. To update a subtree:

```bash
# Update bridge-token-custom
git subtree pull --prefix=bridge-token-custom origin master --squash

# Update lotus-bridge-oft
git subtree pull --prefix=lotus-bridge-oft origin main --squash

# Update lotus-landing-page
git subtree pull --prefix=lotus-landing-page origin main --squash

# Update lotus-ui
git subtree pull --prefix=lotus-ui origin main --squash
```

