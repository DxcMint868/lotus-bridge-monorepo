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
lotus-bridge-monorepo/
├── bridge-token-custom/     # Bridge token custom implementation
├── lotus-bridge-oft/        # Lotus bridge OFT contracts
├── lotus-landing-page/      # Lotus landing page
├── lotus-ui/               # Lotus UI components (main branch)
└── README.md               # This file
```

## Branches

This monorepo includes special branches for different versions of lotus-ui:

- `main` - Default branch with all projects
- `lotus-ui-map` - Contains lotus-ui with mapping functionality
- `lotus-ui-relay` - Contains lotus-ui with relay functionality

### Switching between lotus-ui versions:

```bash
# Switch to map version
git checkout lotus-ui-map

# Switch to relay version
git checkout lotus-ui-relay

# Back to main
git checkout main
```

## Working with Subtrees

This monorepo uses git subtrees to manage the individual repositories. To update a subtree:

```bash
# Update bridge-token-custom
git subtree pull --prefix=bridge-token-custom temp-bridge-token-custom master --squash

# Update lotus-bridge-oft
git subtree pull --prefix=lotus-bridge-oft temp-lotus-bridge-oft main --squash

# Update lotus-landing-page
git subtree pull --prefix=lotus-landing-page temp-lotus-landing-page main --squash

# Update lotus-ui (main branch)
git subtree pull --prefix=lotus-ui temp-lotus-ui main --squash

# Update lotus-ui map branch
git checkout lotus-ui-map
git subtree pull --prefix=lotus-ui temp-lotus-ui map --squash

# Update lotus-ui relay branch
git checkout lotus-ui-relay
git subtree pull --prefix=lotus-ui temp-lotus-ui relay --squash
```

