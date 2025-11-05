# Release Guide

## Current Version: 1.0.0

**Release Date:** 2025-11-06  
**Milestone:** 0 - Project Scaffold  
**Status:** ✅ Complete

---

## Version Tagging

### Creating a Release

When completing a milestone, follow these steps:

1. **Update Version Files**
   ```bash
   # Update VERSION file
   echo "1.0.0" > VERSION
   
   # Update package.json versions
   npm version 1.0.0 --workspaces
   ```

2. **Update CHANGELOG.md**
   - Move items from `[Unreleased]` to new version section
   - Add release date
   - Document all changes, additions, and fixes
   - Include technical specifications
   - List acceptance criteria met

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "chore: release v1.0.0 - Milestone 0 complete"
   ```

4. **Create Git Tag**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0 - Milestone 0: Project Scaffold
   
   - Complete monorepo setup
   - Backend API server with Express, Prisma, WebSocket
   - Mobile app scaffold with React Native
   - Admin panel with React + Vite
   - Docker Compose infrastructure
   - CI/CD pipelines
   - Comprehensive documentation
   
   All acceptance criteria met (7/7)
   "
   ```

5. **Push Tag**
   ```bash
   git push origin main
   git push origin v1.0.0
   ```

---

## Version History

### v1.0.0 (2025-11-06) - Milestone 0
**Project Scaffold Complete**
- Initial monorepo structure
- All three packages initialized
- Infrastructure ready for development
- Documentation complete
- CI/CD pipelines active

**Acceptance:** 7/7 Passed  
**Branch:** `main`  
**Commit:** TBD

---

## Semantic Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes, major milestones
- **MINOR** (1.X.0): New features, backwards-compatible
- **PATCH** (1.0.X): Bug fixes, minor improvements

### Milestone Versioning Strategy

- **Milestone 0:** v1.0.0 (Project Scaffold)
- **Milestone 1:** v1.1.0 (Authentication & Users)
- **Milestone 2:** v1.2.0 (Video Calling)
- **Milestone 3:** v1.3.0 (Chat & Messaging)
- **Milestone 4:** v1.4.0 (Virtual Economy)
- **Milestone 5:** v1.5.0 (Gamification & Games)
- **Milestone 6:** v1.6.0 (Admin & Analytics)

**Major Version 2.0.0:** When core architecture changes or production launch

---

## Git Tag Format

### Annotated Tags (Recommended)
```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z - Description"
```

### Tag Message Template
```
Release vX.Y.Z - Milestone N: Title

- Major feature 1
- Major feature 2
- Major feature 3

Acceptance criteria: X/Y passed
Documentation: Updated
Tests: Passing
```

### Example
```bash
git tag -a v1.1.0 -m "Release v1.1.0 - Milestone 1: Authentication & Users

- Firebase Auth integration
- User registration and login
- JWT token management
- Profile CRUD operations
- Host profile system

Acceptance criteria: 8/8 passed
Documentation: Updated
Tests: 95% coverage
"
```

---

## Release Checklist

Before creating a release tag:

- [ ] All acceptance criteria met
- [ ] Tests passing (npm test)
- [ ] Linting passed (npm run lint)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] VERSION file updated
- [ ] README.md updated (if needed)
- [ ] Environment examples current
- [ ] No secrets in repository
- [ ] CI/CD pipeline green
- [ ] Manual testing completed
- [ ] Test results documented

---

## Viewing Releases

### List All Tags
```bash
git tag
```

### Show Tag Details
```bash
git show v1.0.0
```

### Checkout Specific Version
```bash
git checkout v1.0.0
```

### Compare Versions
```bash
git diff v1.0.0..v1.1.0
```

---

## Rollback

If you need to rollback a release:

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Or force delete remote tag
git push --delete origin v1.0.0
```

---

## Next Release: v1.1.0

**Target:** Milestone 1 - Authentication & Users  
**Expected:** TBD  
**Status:** Not started

**Planned Features:**
- Firebase Auth integration
- User authentication endpoints
- JWT token system
- Profile management
- Host profiles
- Role-based access control

---

## GitHub Releases

When pushing to GitHub, create a release from the tag:

1. Go to GitHub repository
2. Click "Releases" → "Draft a new release"
3. Select tag: `v1.0.0`
4. Release title: `v1.0.0 - Milestone 0: Project Scaffold`
5. Copy description from CHANGELOG.md
6. Attach any release assets (optional)
7. Check "Set as the latest release"
8. Publish release

---

**Maintained by:** Development Team  
**Last Updated:** 2025-11-06
