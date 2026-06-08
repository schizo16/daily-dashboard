# Atlas Architecture Patterns — Skill

Captures the core architecture patterns of the Atlas daily dashboard project:
page objects, hash router, i18n, storage wrapper, CSS theming, and API
integration.

## Installation

Place under `.opencode/skills/`:

```
.opencode/
└── skills/
    └── atlas-architecture-patterns/
        ├── SKILL.md
        └── README.md
```

The skill activates automatically when working on Atlas code.

## Usage

When adding a new feature or fixing a bug in Atlas, the skill guides you
to follow established conventions: use page objects with `load(container)`,
wrap text in `esc()`, use `_()` for i18n, `Storage` for persistence,
`data-` attributes for dynamic CSS, and `fetch`/try/catch for APIs.

## Reference

See `SKILL.md` for the full pattern reference with code examples and
common mistakes.
