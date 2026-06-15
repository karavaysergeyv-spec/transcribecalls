# Git workflow for this project

Use this Git setup for this repository after restarts.

- Git executable: `C:\works\PortableGit\cmd\git.exe`
- Helper wrapper inside the repo: `tools\git.cmd`
- Remote: `https://github.com/karavaysergeyv-spec/transcribecalls.git`
- Proxy: `http://proxy:3128`

Do not use the system Git from `C:\Program Files\Git\cmd\git.exe`; it is old (`2.9.0.windows.1`) and its HTTPS helper fails silently against GitHub in this environment.

Recommended commands from the repository root:

```powershell
.\tools\git.cmd status --short
.\tools\git.cmd diff
.\tools\git.cmd add script.js
.\tools\git.cmd commit -m "Message"
.\tools\git.cmd push origin main
```

PowerShell absolute-path equivalent:

```powershell
& "C:\works\PortableGit\cmd\git.exe" status --short
& "C:\works\PortableGit\cmd\git.exe" push origin main
```
