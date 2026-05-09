# Security Policy

## Supported Versions

Currently, we maintain security updates for:
- Version 2.0.x (Current)

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please email `ghsjulian@outlook.com` with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if available)

**Please do not open public GitHub issues for security vulnerabilities.**

## Security Best Practices

### For Users

1. **Environment Variables**: Store sensitive data in `.env` files, never commit them
2. **CORS Configuration**: Configure `ALLOWED_ORIGINS` to only trusted domains
3. **File Path Validation**: The application validates all file paths to prevent directory traversal
4. **Rate Limiting**: API endpoints are rate-limited to prevent abuse
5. **HTTPS**: Use HTTPS in production environments

### For Developers

1. **Dependencies**: Keep npm dependencies updated
   ```bash
   npm audit
   npm audit fix
   ```

2. **Input Validation**: Always validate and sanitize user input
3. **Error Handling**: Avoid exposing sensitive information in error messages
4. **Logging**: Use secure logging practices; never log sensitive data
5. **CORS**: Configure CORS restrictively for production

### Implementation Details

- **Helmet.js**: Security headers configured via `helmet` middleware
- **Rate Limiting**: Express rate limiter protects against brute force attacks
- **Path Resolution**: All file paths are resolved to prevent directory traversal
- **File System**: Operations validate file/folder existence and type before proceeding
- **Process Isolation**: Shell processes are spawned with limited permissions

## Security Updates

We follow semantic versioning:
- **PATCH** (2.0.x): Security fixes and patches
- **MINOR** (2.x.0): Features and non-breaking changes
- **MAJOR** (x.0.0): Breaking changes

## Known Limitations

1. Terminal access is restricted to the local machine by default
2. File operations are limited to the specified project directory
3. This is designed for development environments, not production file serving

## Future Security Enhancements

- [ ] User authentication system
- [ ] File encryption support
- [ ] Audit logging
- [ ] Two-factor authentication
- [ ] API key management

## Contact

For security inquiries, contact: ghsjulian@outlook.com

---

Thank you for helping us keep Code Editor 2.0 secure!
