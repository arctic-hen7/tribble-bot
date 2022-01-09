# 🤖 Tribble Bot

This is the repository for the [Tribble](https://github.com/arctic-hen7/tribble) bot, which can be added to your project as a [GitHub Action](https://github.com/features/actions), and it will then automatically triage all issues created through Tribble.

## Usage

You can add this action to your project by adding the following to `.github/workflows/tribble.yml` (which will be detected by GitHub as an action to parse):

```yaml
name: Tribble
on:
  issues:
    types:
      - opened

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: arctic-hen7/tribble-bot@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```

This creates a new workflow called *Tribble* that will run whenever a new issue is opened on your repository, and then it'll run the `triage` job, which just invokes the Tribble bot, providing an access token to it so it can add labels to issues.

## Explanation

Tribble is a system for generating website pages that guide users through contributing to an open-source project, like creating their first issue. In addition, Tribble lets you specify what tags should be accumulated by going through different pathways of the interface (think of Tribble as creating an interactive flow chart of all the ways of contributing to your project). When the user finishes the process, they can copy the text Tribble generates into a new GitHub issue on your project's repository, and then this bot can extract some encoded data to automatically add labels and assignees to the issue within seconds of its being opened.

For more information about Tribble, check out [its repository](https://github.com/arctic-hen7/tribble)!

## FAQs

If your question isn't answered by these, you can [open an issue](https://github.com/arctic-hen7/tribble/issues/new/choose) (for bugs and feature requests) or [start a discussion](https://github.com/arctic-hen7/tribble/discussions/new) (for questions) on the [main repository](https://github.com/arctic-hen7/tribble).

### What if I don't want to use Tribble for all the issues in my project?

No problem! If the bot can't find the usual markers in an issue's body that would indicate it's been created by Tribble, it'll silently terminate and let you get on with your business.

### The bot is saying it failed

That's usually because of a network error in GitHub Actions, you can re-run the bot for a certain issue by going to the *Actions* tab of your repository, selecting the appropriate workflow run of *Tribble* (or whatever you named your workflow), and then pressing *Re-run all jobs* (top right). That will make the bot try again on that issue, and it should work!

If you've re-run several times to no avail, you can see the bot's logs in the workflow logs. This is usually caused by a typo in your Tribble configuration that means the bot is trying to add a label that doesn't exist. You can check this by running the jibberish under *Tribble internal data* in the issue's body through a base64 decoder, and that will give you a list of issues that the bot is trying to add. If all else fails, you can add them manually.

If none of that seems to be causing the problem, please [report the issue to us](https://github.com/arctic-hen7/tribble-bot/issues/new/choose).

## License

See [`LICENSE`](./LICENSE).
