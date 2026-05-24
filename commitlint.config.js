module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "refactor",
        "docs",
        "test",
        "style",
        "perf",
        "ci",
        "build",
        "revert",
      ],
    ],
    "scope-empty": [1, "always"],
    "subject-empty": [2, "never"],
    "subject-max-length": [2, "always", 100],
  },
};
