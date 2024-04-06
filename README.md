# Reproduction sample

Sample that shows off <https://github.com/huntabyte/cmdk-sv/issues/72>

## Reproduction Steps

Main page is located src\routes\+page.svelte

1. Add status / date range filter (same base component), notice you can't use keyboard navigation on the Command.Items
2. Add keyword filter, notice you can't use keyboard or tab navigation from input (think form) to other command items for actions.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
