# Contributing Guide

Thank you for contributing to the Live Video App project!

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Write meaningful commit messages
   - Add tests for new features

3. **Test your changes**
   ```bash
   npm run lint
   npm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use the PR template
   - Link relevant issues
   - Request review from team members

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add video call feature
fix: resolve connection timeout issue
docs: update API documentation
```

## Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for code formatting
- Write self-documenting code with clear variable names

## Testing Guidelines

- Write unit tests for business logic
- Write integration tests for API endpoints
- Maintain test coverage above 80%
- Test edge cases and error scenarios

## Pull Request Guidelines

- Keep PRs focused and small
- Update documentation if needed
- Ensure all tests pass
- Get approval from at least one team member
- Resolve all review comments

## Need Help?

Feel free to ask questions in:
- Team chat
- GitHub issues
- Pull request comments
