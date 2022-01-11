module.exports = (app) => {
    // We'll act on any newly opened issues
    app.on("issues.opened", newIssueHandler);
};

const newIssueHandler = async (ctx) => {
    // Get the parameters for this issue so that we can add labels to it and comment on it
    const params = ctx.issue();
    try {
        // Get the body of the issue so that we can parse it
        const { data } = await ctx.octokit.issues.get(params);
        // Get the labels out of that
        let { labels, assignees } = getData(data.body);
        // If we didn't find the appropriate formatting, we'll get `undefined`, in which case this issue wasn't created with Tribble and we should shut up
        if (labels === undefined || assignees == undefined) {
            return;
        }
        // Add the labels and assignees to that issue
        await ctx.octokit.issues.addLabels({ labels, ...params });
        await ctx.octokit.issues.addAssignees({ assignees, ...params });
    } catch(err) {
        console.error(err);
        // We have an error, but we have the details of the issue, so comment on it
        let errBody = "This repo is set up to triage issues with [Tribble](https://github.com/arctic-hen7/tribble), but this issue couldn't be processed. If you deliberately didn't use Tribble to report this issue, you can safely ignore this warning. If you did, something's gone wrong here.";
        await ctx.octokit.issues.createComment({ body: errBody, ...params });
    }
};

// If Tribble's data format ever changes, we need to update this
const getData = (issueBody) => {
    // The relevant `<details>` block in a Tribble-formatted issue will always come at the end
    // We add to this because we need to get the actual contained text
    const detailsOpenIdx = issueBody.lastIndexOf("</summary>") + 10;
    const detailsCloseIdx = issueBody.lastIndexOf("</details>");
    // The indexing will return `-1` if it found nothing (but one had 10 added)
    if (detailsOpenIdx === 9 || detailsCloseIdx === -1) {
        return undefined;
    }
    const encoded = issueBody.substring(detailsOpenIdx, detailsCloseIdx).trim();
    // Now decode that
    const labelsString = Buffer.from(encoded, "base64").toString("utf-8");
    // We now have a list of tags delimited by ','
    let labels = labelsString.split(",");

    // Check any of the labels for beign assignees (they'd start with an `@`)
    let assignees = [];
    for (let i in labels) {
        let label = labels[i];
        if (label[0] == "@") {
            assignees.push(label);
            delete labels[i];
        } else if (label[0] == "\\" && label[1] == "@") {
            // The user has escaped an assignee, so remove the `\`
            labels[i] = label.substr(1);
        }
    }
    // We may have removed from elements from the labels, so clear out the empty ones
    labels = labels.filter(label => label !== undefined);

    return { labels, assignees };
};
