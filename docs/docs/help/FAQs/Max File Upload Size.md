## 📂 Max File Upload Size FAQ

### ❓ What is the default validation size if nothing is set?
- For Selfhost User the maximum allowed file size is **80 MB**.
- For Cloud User the maximum allowed file size is **10 MB**.
*(Note: There is an extra +10 MB added in limit to prevent unexpected signing failures)*

---

### ❓ Can the file size limit be increased for specific users?
Yes. On demand, the maximum upload size can be increased **up to 90 MB**.  
*(Note: There is a hard restriction of **100 MB** at the server level.)*

---

### ❓ What happens if a file exceeds the max size?
If a file exceeds the allowed size:
- The upload is rejected.
- An appropriate validation error is returned to the user.

---
