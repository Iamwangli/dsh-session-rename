# dsh-session-rename

Adds one tool, `session_rename`, to DeepSeek Harness (`dsh`). It renames the **current** session, so an agent can act on "把会话名改成 xxx" instead of telling you to open the menu.

The Web GUI can already rename a session (the session menu, or `Ctrl+Alt+G` / `⌘⌥G`). What was missing is the agent side: no tool reaches the same service, so the rename stayed a manual step.

## Install

```sh
dsh plugin --profile web add git+https://github.com/Iamwangli/dsh-session-rename.git
```

From a local checkout:

```sh
dsh plugin --profile web add /path/to/dsh-session-rename
```

Restart the `web` profile after installing; new sessions pick the tool up.

## Usage

Ask in the conversation — "rename this session to …" / "把会话名改成今天的调研" — and the agent calls:

```
session_rename(title: "…")
```

It returns the accepted title and the previous one. An explicit rename also **pins** the title: DSH stops generating an automatic title from later messages, so the name stays until you rename it again.

## Notes

- Text is normalized (control characters stripped, whitespace collapsed) and must contain visible characters.
- The tool only renames the session it is called from. Renaming another session is deliberately out of scope.
- Cost: one small tool definition in the prompt.

## Compatibility

Developed and tested against DSH `0.2.2-rc.5`. It uses the public `ctx.tools.register` API and the `sessionTitle` service, and declares `inject` so the plugin stays inactive in profiles without them.

## License

MIT — see [LICENSE](LICENSE).
