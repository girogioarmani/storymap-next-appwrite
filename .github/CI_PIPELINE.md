# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration and deployment, with comprehensive testing, security scanning, and quality checks.

## Workflows

### 1. **CI Pipeline** (`.github/workflows/ci.yml`)

Main continuous integration workflow that runs on every push and pull request.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Jobs:**

#### Job 1: Code Quality & Security
- ESLint with detailed annotations
- npm security audit (moderate+ vulnerabilities)
- Check for outdated dependencies
- Dependency tree analysis

#### Job 2: TypeScript Type Check
- Full TypeScript compilation check
- Pretty error output for easy debugging
- Runs in parallel with other jobs

#### Job 3: Build & Test Matrix
- Tests on Node.js **20.x** and **22.x**
- Builds the application with environment variables
- Analyzes build output size
- Uploads build artifacts (Node 20.x only)
- **Ready for test integration** when tests are added

**Features:**
- Parallel job execution for faster CI
- Fail-fast disabled to see all errors
- Build artifacts retained for 7 days
- Detailed build size reporting

#### Job 4: Bundle Analysis
- Analyzes bundle size and composition
- Reports on largest files
- Identifies potential optimization opportunities

#### Job 5: CI Success Check
- Final status aggregation
- Ensures all jobs passed
- Clear success/failure messaging

### 2. **PR Checks** (`.github/workflows/pr-checks.yml`)

Specialized checks that run on pull requests.

**Features:**
- **PR Information Display**: Shows title, author, branches, changed files
- **Smart Change Detection**: Detects changes to code, docs, or config
- **Bundle Size Comparison**: 
  - Compares PR bundle size with base branch
  - Shows percentage change
  - Warns if increase > 100KB
- **Conditional Execution**: Only runs relevant checks based on changes

### 3. **Dependency & Security Check** (`.github/workflows/dependency-check.yml`)

Scheduled weekly security and dependency health checks.

**Schedule:**
- Every Monday at 9:00 AM UTC
- Can be triggered manually

**Jobs:**

#### Security Audit
- Runs `npm audit`
- Categorizes vulnerabilities (Critical, High, Moderate, Low)
- Uploads detailed JSON results
- Alerts on critical/high vulnerabilities

#### Outdated Dependencies
- Lists all outdated packages
- Shows current vs. available versions
- Helps plan updates

#### License Compliance
- Checks all dependency licenses
- Generates license summary
- Helps ensure compliance

#### Dependency Report
- Aggregates all checks
- Creates comprehensive health report
- Provides overall status

## Environment Variables

All workflows use dummy values for CI builds:

```yaml
NEXT_PUBLIC_APPWRITE_ENDPOINT: 'https://cloud.appwrite.io/v1'
NEXT_PUBLIC_APPWRITE_PROJECT_ID: 'ci-test-project'
NEXT_PUBLIC_APPWRITE_DATABASE_ID: 'ci-test-database'
NEXT_APPWRITE_KEY: 'ci-test-key'
```

To use real values, add them as GitHub Secrets:
1. Go to repository Settings → Secrets and variables → Actions
2. Add the secrets with the same names
3. The workflow will use secrets if available, fallback to dummy values

## Build Artifacts

Build artifacts are automatically uploaded for the main Node version (20.x):
- Location: `.next/` directory
- Retention: 7 days
- Use case: Debugging build issues, performance analysis

## Adding Tests

The CI pipeline is ready for tests. To enable:

1. Add test framework (e.g., Jest, Vitest)
2. Update `package.json`:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:coverage": "jest --coverage"
     }
   }
   ```
3. Uncomment test steps in `ci.yml`:
   ```yaml
   - name: Run tests
     run: npm test
   
   - name: Generate coverage report
     run: npm run test:coverage
   ```

## Monitoring CI Status

### Check Workflow Runs
```bash
# View all workflows
gh run list --repo girogioarmani/storymap-next-appwrite

# Watch a specific run
gh run watch <run-id>

# View logs
gh run view <run-id> --log
```

### Status Badge

Add to your README:
```markdown
![CI](https://github.com/girogioarmani/storymap-next-appwrite/workflows/CI%20Pipeline/badge.svg)
```

## Best Practices

1. **Keep dependencies updated**: Review the weekly dependency report
2. **Monitor bundle size**: Watch for unexpected increases in PRs
3. **Fix linting issues**: Address ESLint warnings promptly
4. **Security first**: Prioritize fixing high/critical vulnerabilities
5. **Add tests**: Aim for good code coverage as the project grows

## Troubleshooting

### Build Failures

1. Check the specific failing job in Actions tab
2. Review error logs and summaries
3. Download artifacts if needed for local debugging
4. Verify environment variables are set correctly

### Slow CI Times

- Jobs run in parallel where possible
- Node modules are cached between runs
- Consider reducing matrix if needed
- Bundle analysis runs only after successful builds

### Security Audit Failures

- Review the detailed audit report (downloadable artifact)
- Update vulnerable dependencies: `npm audit fix`
- For breaking changes, plan updates carefully
- Use `npm audit fix --force` only when safe

## Manual Workflow Triggers

All workflows can be manually triggered:

```bash
# Trigger CI pipeline
gh workflow run ci.yml

# Trigger dependency check
gh workflow run dependency-check.yml
```

## Future Enhancements

Planned improvements:
- [ ] Integration tests with Appwrite test instance
- [ ] E2E testing with Playwright/Cypress
- [ ] Visual regression testing
- [ ] Performance benchmarking
- [ ] Automated dependency updates (Dependabot/Renovate)
- [ ] Deploy previews for PRs
- [ ] Code coverage tracking with Codecov
