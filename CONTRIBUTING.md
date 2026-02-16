# Contributing to Time Tracker

Thank you for your interest in contributing to our Time Tracker project! We welcome contributions from the community and appreciate your effort to make this project better.

## Getting Started

Before you begin contributing, please review the README.md file for information on setting up the development environment and understanding the project structure.

## Branching Strategy

We follow the GitHub Flow branching strategy:

- **`master` branch**: This branch contains production-ready code. All changes are merged into master through pull requests.
- **Feature branches**: Create a new branch from `master` for each feature, bug fix, or improvement you're working on.
- **Merge process**: All changes must be merged back to `master` via pull requests after code review and approval.

This lightweight branching model ensures that the master branch is always in a deployable state and makes it easy to track and review changes.

## Branch Naming Conventions

Use descriptive branch names that indicate the type and purpose of your changes:

- **Features**: `feat/user-authentication` or `feature/time-entry-export`
- **Bug fixes**: `fix/timer-not-stopping` or `fix/timezone-calculation`
- **Documentation**: `docs/api-documentation` or `docs/update-readme`
- **Refactoring**: `refactor/database-queries` or `refactor/component-structure`

**Examples:**
- `feat/add-project-tagging`
- `fix/login-validation-error`
- `docs/contributing-guidelines`
- `refactor/simplify-auth-logic`

## Commit Message Guidelines

We follow the Conventional Commits specification for clear and consistent commit messages.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect the meaning of the code (formatting, missing semicolons, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

### Scope

The scope is optional and can be anything specifying the place of the commit change (e.g., auth, timer, api, database).

### Examples of Good Commit Messages

```
feat(timer): add pause and resume functionality

fix(auth): resolve token expiration issue

docs(readme): update installation instructions

refactor(database): optimize time entry queries for performance

test(timer): add unit tests for timer component

chore(deps): update react to version 18.2.0
```

### Guidelines

- Use the imperative mood in the subject line ("add feature" not "added feature")
- Keep the subject line under 50 characters
- Capitalize the subject line
- Do not end the subject line with a period
- Use the body to explain what and why, not how
- Separate the subject from the body with a blank line

## Pull Request Process

1. **Create a branch**: Branch off from `master` with an appropriate branch name
   ```bash
   git checkout master
   git pull origin master
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**: Implement your feature or fix, following the project's coding standards

3. **Commit your changes**: Use conventional commit messages
   ```bash
   git add .
   git commit -m "feat(scope): description of changes"
   ```

4. **Push to your branch**:
   ```bash
   git push origin feat/your-feature-name
   ```

5. **Create a pull request**: Open a PR against the `master` branch on GitHub
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots or examples if applicable

6. **Request review**: Tag relevant team members for review

7. **Address feedback**: Respond to comments and make requested changes
   - Push additional commits to the same branch
   - The PR will automatically update

8. **Merge**: Once approved, your PR will be merged into `master`
   - The branch will typically be deleted after merging

## Code Review Guidelines

When reviewing pull requests, please consider the following:

### Functionality
- Does the code work as intended?
- Are edge cases handled appropriately?
- Are there any potential bugs or security issues?

### Code Quality
- Is the code readable and maintainable?
- Are functions and variables named clearly?
- Is the code properly organized and structured?

### Testing
- Are there adequate tests for the changes?
- Do all existing tests still pass?
- Are test cases comprehensive?

### Documentation
- Is the code adequately commented where necessary?
- Are complex algorithms or business logic explained?
- Is user-facing documentation updated if needed?

### Best Practices
- Does the code follow the project's style guide?
- Are there any code smells or anti-patterns?
- Could the implementation be simplified?

### Performance
- Are there any performance concerns?
- Are database queries optimized?
- Are there any unnecessary computations or renders?

## Questions?

If you have any questions or need clarification on the contribution process, please feel free to open an issue or reach out to the maintainers.

Thank you for contributing!
