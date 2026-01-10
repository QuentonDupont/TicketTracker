# GitHub MCP Setup Guide

This guide will help you set up the GitHub MCP server for automated code deployments to GitHub.

## What is GitHub MCP?

The GitHub MCP (Model Context Protocol) server enables AI-powered automation for GitHub operations, including:
- Automated commits and pushes
- Pull request creation and management
- Branch management
- Issue tracking
- Repository operations

## Prerequisites

- Git installed and configured
- A GitHub account
- Node.js and npm installed

## Step-by-Step Setup

### 1. Create a GitHub Personal Access Token

1. **Navigate to GitHub Settings**:
   - Go to https://github.com/settings/tokens
   - Or: Click your profile picture → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**:
   - Click "Generate new token (classic)"
   - Give your token a descriptive name: `TicketTracker MCP Token`
   - Set expiration (recommended: 90 days, then rotate)

3. **Select Required Scopes**:

   **Essential Scopes** (Required):
   - ✅ **repo** - Full control of private repositories
     - Includes: repo:status, repo_deployment, public_repo, repo:invite, security_events

   - ✅ **workflow** - Update GitHub Action workflows
     - Required if you want to manage CI/CD pipelines

   **Optional Scopes** (Based on needs):
   - ✅ **write:packages** - Upload packages to GitHub Package Registry
   - ✅ **delete_repo** - Delete repositories (use with caution!)
   - ✅ **admin:org** - Full control of organizations (only if managing org repos)

4. **Generate and Copy Token**:
   - Click "Generate token"
   - **IMPORTANT**: Copy the token immediately - you won't see it again!
   - Store it temporarily in a secure location (password manager recommended)

### 2. Configure Your Local Environment

1. **Copy the environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file**:
   ```bash
   # Use your preferred text editor
   nano .env
   # or
   code .env
   ```

3. **Add your GitHub token**:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token_here
   ```

4. **Save and close** the file

### 3. Verify MCP Configuration

The `.mcp.json` file already includes the GitHub MCP server configuration:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
    // ... other MCP servers
  }
}
```

### 4. Initialize Git Repository (if not already done)

1. **Check if git is initialized**:
   ```bash
   git status
   ```

2. **If not initialized, set up git**:
   ```bash
   git init
   git branch -M main
   ```

3. **Create a GitHub repository**:
   - Go to https://github.com/new
   - Create a new repository named `TicketTracker` (or your preferred name)
   - Do NOT initialize with README, .gitignore, or license (we already have these)

4. **Add the remote**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/TicketTracker.git
   ```

5. **Verify the remote**:
   ```bash
   git remote -v
   ```

### 5. Test the Setup

Once configured, you can ask me to perform GitHub operations such as:

- **"Create a commit with all current changes"**
- **"Push the code to GitHub"**
- **"Create a new branch called 'feature/new-dashboard'"**
- **"Create a pull request for the latest changes"**
- **"Create an issue for bug tracking"**

## Security Best Practices

### ✅ DO:
- Keep your `.env` file private and never commit it
- Use scoped tokens with minimal required permissions
- Rotate tokens regularly (every 90 days recommended)
- Use a password manager to store tokens securely
- Review token permissions before granting

### ❌ DON'T:
- Never commit `.env` to version control
- Don't share your personal access token
- Don't grant more permissions than needed
- Don't use tokens in public repositories or CI/CD without secrets management
- Don't reuse tokens across multiple projects

## Troubleshooting

### Token Not Found Error
**Problem**: `Error: GITHUB_PERSONAL_ACCESS_TOKEN not found`

**Solution**:
1. Verify `.env` file exists in project root
2. Check that `GITHUB_TOKEN=` line is present and correct
3. Restart your terminal/IDE to reload environment variables

### Permission Denied Error
**Problem**: `Error: Resource not accessible by integration`

**Solution**:
1. Verify token has the required scopes
2. Check that the repository exists and you have access
3. Regenerate token with correct permissions

### Token Expired
**Problem**: `Error: Bad credentials`

**Solution**:
1. Generate a new token following the steps above
2. Update the token in your `.env` file
3. Consider setting a longer expiration period

## What Can I Automate?

With GitHub MCP configured, I can help you with:

### Repository Operations
- ✅ Create, update, and delete files
- ✅ Manage branches and tags
- ✅ View commit history
- ✅ Search repository contents

### Collaboration
- ✅ Create and manage pull requests
- ✅ Create and manage issues
- ✅ Add labels and milestones
- ✅ Review and comment on PRs

### Automation
- ✅ Automated deployments on feature completion
- ✅ Batch commit and push operations
- ✅ Automated PR creation for features
- ✅ Issue creation from error logs

### CI/CD
- ✅ Monitor GitHub Actions workflows
- ✅ Trigger workflow runs
- ✅ View workflow logs
- ✅ Manage workflow files

## Example Workflows

### Workflow 1: Feature Development
```
You: "Create a new branch called feature/user-dashboard"
Me: [Creates branch]

You: "Make updates to the dashboard"
Me: [Makes code changes]

You: "Commit these changes with a descriptive message"
Me: [Creates commit]

You: "Push to GitHub and create a PR"
Me: [Pushes code and creates pull request]
```

### Workflow 2: Quick Fixes
```
You: "Fix the logout button bug"
Me: [Makes the fix]

You: "Commit and push this fix directly to main"
Me: [Commits, pushes to main branch]
```

### Workflow 3: Issue Management
```
You: "Create an issue for the mobile responsiveness problems we discussed"
Me: [Creates detailed issue with labels]

You: "Create a branch to address this issue"
Me: [Creates feature branch linked to issue]
```

## Additional Resources

- [GitHub Personal Access Tokens Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub MCP Server Repository](https://github.com/github/github-mcp-server)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)

## Need Help?

If you encounter any issues with the setup, ask me:
- "Help me troubleshoot my GitHub MCP setup"
- "Check if my GitHub token is configured correctly"
- "Show me the current git status"

I'm here to help make your GitHub workflows seamless! 🚀
