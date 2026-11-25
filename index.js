/**
 * Model-facing tool that renames the calling session.
 *
 * The Web GUI can rename a session (session menu, `Ctrl+Alt+G`), but no tool
 * reaches the same service, so an agent cannot carry out "rename this chat".
 * This plugin closes that gap with the smallest surface: one tool, no config,
 * no client code, and no dependencies — schemas are written as plain JSON so
 * the bundle resolves nothing from the Harness installation.
 *
 * @module dsh-session-rename
 */

/** Cordis plugin name used by Loader diagnostics. */
export const name = 'session-rename'

/** Services this plugin needs; it stays inactive where they are absent. */
export const inject = ['tools', 'sessionTitle']

/** Registered tool name; collides with an upstream tool of the same name. */
const TOOL_NAME = 'session_rename'

const PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: {
      type: 'string',
      description: 'New title: one line of visible text, in the language the user is writing in.',
    },
  },
  required: ['title'],
}

const OUTPUT = {
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      previous: { type: 'string', description: 'Title before the rename; empty when the session had none.' },
      title: { type: 'string', description: 'Accepted title, after whitespace normalization.' },
    },
    required: ['previous', 'title'],
  },
  render: (_args, value) => [{
    type: 'text',
    text: value.previous === ''
      ? `Renamed the session to "${value.title}".`
      : `Renamed the session from "${value.previous}" to "${value.title}".`,
  }],
}

/**
 * Register the rename tool.
 *
 * The capability is small enough that DSH may provide it natively later. A
 * duplicate or rejected registration degrades to one warning instead of
 * failing this profile entry, so an obsolete plugin never breaks the Web app.
 *
 * @param ctx - context providing the tool registry and the title service.
 */
export function apply(ctx) {
  try {
    if (ctx.tools.get(TOOL_NAME) !== undefined) {
      ctx.logger.warn(`session-rename: a tool named "${TOOL_NAME}" is already registered, so this plugin adds nothing; remove it with "dsh plugin --profile <name> remove dsh-session-rename"`)
      return
    }
    ctx.tools.register({
      name: TOOL_NAME,
      description: 'Rename the current session. The title replaces the automatically generated one and stays fixed until the next rename.',
      parameters: PARAMETERS,
      output: OUTPUT,
      execute(args, exec) {
        if (exec.agent === undefined) throw new Error('session_rename requires an agent Session')
        const title = typeof args?.title === 'string' ? args.title : ''
        if (title.trim() === '') throw new Error('title must contain visible characters')
        const session = exec.agent.session
        const previous = ctx.sessionTitle.get(session)?.title ?? ''
        let accepted
        try {
          accepted = ctx.sessionTitle.rename(session, title)
        } catch (error) {
          // The one rename failure that blames the input: text with no visible characters.
          if (error instanceof Error && error.name === 'SessionTitleInvalidError') {
            throw new Error('title must contain visible characters')
          }
          throw error
        }
        return { previous, title: accepted.title }
      },
    })
  } catch (error) {
    ctx.logger.warn(`session-rename: could not register "${TOOL_NAME}" (${String(error)}); if DSH now ships its own rename tool, remove this plugin`)
  }
}
